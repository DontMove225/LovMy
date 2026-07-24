<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use App\Models\Setting;
use App\Services\TlsSigApiV2;
use Illuminate\Http\Request;

class CallController extends Controller
{
    private function credentials(): ?array
    {
        $setting = Setting::current();
        $sdkAppId = $setting->trtc_sdk_app_id;
        $secretKey = $setting->trtc_secret_key;

        if (! $sdkAppId || ! $secretKey) {
            return null;
        }

        return ['sdkAppId' => (int) $sdkAppId, 'secretKey' => $secretKey];
    }

    private function userSig(int $userId): array
    {
        $creds = $this->credentials();

        if (! $creds) {
            return ['sdk_app_id' => null, 'user_sig' => null, 'configured' => false];
        }

        $signer = new TlsSigApiV2($creds['sdkAppId'], $creds['secretKey']);

        return [
            'sdk_app_id' => $creds['sdkAppId'],
            'user_sig'   => $signer->genUserSig((string) $userId),
            'configured' => true,
        ];
    }

    public function initiate(Request $request)
    {
        $request->validate([
            'caller_id'   => 'required|integer',
            'receiver_id' => 'required|integer|different:caller_id',
            'type'        => 'required|in:AUDIO,VIDEO',
        ]);

        $channelName = 'call_' . min($request->caller_id, $request->receiver_id)
            . '_' . max($request->caller_id, $request->receiver_id)
            . '_' . time();

        $call = Call::create([
            'caller_id'    => $request->caller_id,
            'receiver_id'  => $request->receiver_id,
            'channel_name' => $channelName,
            'type'         => $request->type,
            'status'       => 'RINGING',
            'started_at'   => now(),
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Appel en cours',
            'data'         => array_merge([
                'call_id'      => $call->id,
                'channel_name' => $channelName,
                'type'         => $call->type,
            ], $this->userSig($request->caller_id)),
        ]);
    }

    public function pending(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $call = Call::where('receiver_id', $request->uid)
            ->where('status', 'RINGING')
            ->with('caller:id,name,profile_pic')
            ->orderByDesc('id')
            ->first();

        if (! $call) {
            return response()->json([
                'ResponseCode' => '200',
                'Result'       => 'false',
                'ResponseMsg'  => 'Aucun appel entrant',
            ]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Appel entrant',
            'data'         => $call,
        ]);
    }

    public function respond(Request $request)
    {
        $request->validate([
            'call_id' => 'required|integer',
            'uid'     => 'required|integer',
            'action'  => 'required|in:ACCEPT,REJECT',
        ]);

        $call = Call::find($request->call_id);

        if (! $call || (int) $call->receiver_id !== (int) $request->uid) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Appel introuvable',
            ]);
        }

        if ($request->action === 'REJECT') {
            $call->update(['status' => 'REJECTED', 'ended_at' => now()]);

            return response()->json([
                'ResponseCode' => '200',
                'Result'       => 'true',
                'ResponseMsg'  => 'Appel refusé',
            ]);
        }

        $call->update(['status' => 'ACCEPTED']);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Appel accepté',
            'data'         => array_merge([
                'call_id'      => $call->id,
                'channel_name' => $call->channel_name,
                'type'         => $call->type,
            ], $this->userSig($request->uid)),
        ]);
    }

    public function status(Request $request)
    {
        $request->validate(['call_id' => 'required|integer']);

        $call = Call::find($request->call_id);

        if (! $call) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Appel introuvable']);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Statut de l\'appel',
            'data'         => ['status' => $call->status],
        ]);
    }

    public function end(Request $request)
    {
        $request->validate(['call_id' => 'required|integer']);

        $call = Call::find($request->call_id);
        if (! $call) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Appel introuvable']);
        }

        if ($call->status !== 'ENDED' && $call->status !== 'REJECTED' && $call->status !== 'MISSED') {
            $endedAt = now();
            $wasAccepted = $call->status === 'ACCEPTED';

            $call->update([
                'status'   => $wasAccepted ? 'ENDED' : 'MISSED',
                'ended_at' => $endedAt,
                'duration' => $wasAccepted ? abs($endedAt->diffInSeconds($call->started_at)) : null,
            ]);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Appel terminé',
        ]);
    }

    public function history(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $calls = Call::where('caller_id', $request->uid)
            ->orWhere('receiver_id', $request->uid)
            ->with(['caller:id,name,profile_pic', 'receiver:id,name,profile_pic'])
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Historique des appels',
            'data'         => $calls->items(),
            'total'        => $calls->total(),
        ]);
    }
}

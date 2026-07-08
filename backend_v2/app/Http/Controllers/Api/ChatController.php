<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function conversations(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);
        $uid = (int) $request->uid;

        $messages = Message::where('sender_id', $uid)
            ->orWhere('receiver_id', $uid)
            ->orderByDesc('datetime')
            ->get(['sender_id', 'receiver_id', 'message', 'datetime']);

        $seen = [];
        $conversations = [];

        foreach ($messages as $msg) {
            $partnerId = $msg->sender_id == $uid ? $msg->receiver_id : $msg->sender_id;
            if (isset($seen[$partnerId])) {
                continue;
            }
            $seen[$partnerId] = true;

            $partner = User::find($partnerId);
            if (! $partner) {
                continue;
            }

            $unread = Message::where('sender_id', $partnerId)
                ->where('receiver_id', $uid)
                ->where('is_read', 0)
                ->count();

            $conversations[] = [
                'partner_id'   => $partner->id,
                'name'         => $partner->name,
                'profile_pic'  => $partner->profile_pic,
                'last_message' => $msg->message,
                'datetime'     => $msg->datetime,
                'unread_count' => $unread,
            ];
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Conversations',
            'data'         => $conversations,
        ]);
    }

    public function messages(Request $request)
    {
        $request->validate([
            'uid'        => 'required|integer',
            'partner_id' => 'required|integer',
        ]);

        $uid = (int) $request->uid;
        $partnerId = (int) $request->partner_id;

        Message::where('sender_id', $partnerId)
            ->where('receiver_id', $uid)
            ->where('is_read', 0)
            ->update(['is_read' => 1]);

        $messages = Message::where(function ($q) use ($uid, $partnerId) {
            $q->where('sender_id', $uid)->where('receiver_id', $partnerId);
        })->orWhere(function ($q) use ($uid, $partnerId) {
            $q->where('sender_id', $partnerId)->where('receiver_id', $uid);
        })
            ->orderBy('datetime')
            ->get(['id', 'sender_id', 'receiver_id', 'message', 'datetime']);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Messages',
            'data'         => $messages,
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'sender_id'   => 'required|integer',
            'receiver_id' => 'required|integer|different:sender_id',
            'message'     => 'required|string',
        ]);

        $message = Message::create([
            'sender_id'   => $request->sender_id,
            'receiver_id' => $request->receiver_id,
            'message'     => $request->message,
            'datetime'    => now(),
            'is_read'     => 0,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Message envoyé',
            'data'         => $message,
        ]);
    }
}

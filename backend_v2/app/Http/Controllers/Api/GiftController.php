<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gift;
use App\Models\GiftCollect;
use App\Models\User;
use App\Models\CoinReport;
use Illuminate\Http\Request;

class GiftController extends Controller
{
    public function giftList(Request $request)
    {
        $gifts = Gift::where('status', 1)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Gift list',
            'data'         => $gifts,
        ]);
    }

    public function buyGift(Request $request)
    {
        $request->validate([
            // Flutter envoie soit uid soit sender_id
            'receiver_id' => 'required|integer',
        ]);

        // Accepter uid ou sender_id (homeProvider envoie sender_id)
        $senderId = $request->uid ?? $request->sender_id;
        if (! $senderId) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Sender ID required']);
        }

        $sender = User::find($senderId);

        if (! $sender) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid user',
            ]);
        }

        // ── Mode "home screen" : Flutter envoie gift_img (virgule-séparée) + coin ──
        if ($request->has('gift_img')) {
            $coinCost = (int) ($request->coin ?? 0);

            if ($coinCost > 0 && $sender->coin < $coinCost) {
                return response()->json([
                    'ResponseCode' => '401',
                    'Result'       => 'false',
                    'ResponseMsg'  => 'Insufficient coins',
                ]);
            }

            if ($coinCost > 0) {
                $sender->decrement('coin', $coinCost);
                CoinReport::create([
                    'uid'     => $sender->id,
                    'message' => 'Gift sent',
                    'status'  => 'Debit',
                    'amt'     => $coinCost,
                    'tdate'   => now()->toDateString(),
                ]);

                $receiver = User::find($request->receiver_id);
                if ($receiver) {
                    $receiver->increment('coin', $coinCost);
                    CoinReport::create([
                        'uid'     => $receiver->id,
                        'message' => 'Gift received',
                        'status'  => 'Credit',
                        'amt'     => $coinCost,
                        'tdate'   => now()->toDateString(),
                    ]);
                }
            }

            GiftCollect::create([
                'sender_id'   => $senderId,
                'receiver_id' => $request->receiver_id,
                'gift_img'    => $request->gift_img,
            ]);

            return response()->json([
                'ResponseCode' => '200',
                'Result'       => 'true',
                'ResponseMsg'  => 'Gift sent successfully!',
                'coin'         => (string) ($sender->fresh()->coin ?? 0),
            ]);
        }

        // ── Mode "gift_id" classique ───────────────────────────────────────────────
        $request->validate(['gift_id' => 'required|integer']);
        $gift = Gift::find($request->gift_id);

        if (! $gift) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid gift',
            ]);
        }

        if ($gift->price > 0 && $sender->coin < $gift->price) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Insufficient coins',
            ]);
        }

        if ($gift->price > 0) {
            $sender->decrement('coin', $gift->price);
            CoinReport::create([
                'uid'     => $sender->id,
                'message' => 'Gift sent',
                'status'  => 'Debit',
                'amt'     => $gift->price,
                'tdate'   => now()->toDateString(),
            ]);

            $receiver = User::find($request->receiver_id);
            if ($receiver) {
                $receiver->increment('coin', $gift->price);
                CoinReport::create([
                    'uid'     => $receiver->id,
                    'message' => 'Gift received',
                    'status'  => 'Credit',
                    'amt'     => $gift->price,
                    'tdate'   => now()->toDateString(),
                ]);
            }
        }

        GiftCollect::create([
            'sender_id'   => $senderId,
            'receiver_id' => $request->receiver_id,
            'gift_img'    => $gift->img,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Gift sent successfully!',
            'coin'         => (string) ($sender->fresh()->coin ?? 0),
        ]);
    }

    public function myGifts(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $gifts = GiftCollect::where('receiver_id', $request->uid)
            ->with('sender:id,name,profile_pic')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'My gifts',
            'data'         => $gifts->items(),
            'total'        => $gifts->total(),
        ]);
    }
}

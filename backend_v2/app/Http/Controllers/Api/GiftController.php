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
            'uid'         => 'required|integer',
            'receiver_id' => 'required|integer',
            'gift_id'     => 'required|integer',
        ]);

        $sender = User::find($request->uid);
        $gift   = Gift::find($request->gift_id);

        if (! $sender || ! $gift) {
            return response()->json([
                'ResponseCode' => '401',
                'Result'       => 'false',
                'ResponseMsg'  => 'Invalid user or gift',
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
            'sender_id'   => $request->uid,
            'receiver_id' => $request->receiver_id,
            'gift_img'    => $gift->img,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Gift sent successfully!',
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

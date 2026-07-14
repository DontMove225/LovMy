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

        // 1 query: every message involving this user, most recent first.
        $messages = Message::where('sender_id', $uid)
            ->orWhere('receiver_id', $uid)
            ->orderByDesc('datetime')
            ->get(['sender_id', 'receiver_id', 'message', 'datetime']);

        $partnerIds = [];
        $lastMessageByPartner = [];

        foreach ($messages as $msg) {
            $partnerId = $msg->sender_id == $uid ? $msg->receiver_id : $msg->sender_id;
            if (isset($lastMessageByPartner[$partnerId])) {
                continue;
            }
            $lastMessageByPartner[$partnerId] = $msg;
            $partnerIds[] = $partnerId;
        }

        // 1 query: all conversation partners at once (was 1 per partner).
        $partners = User::whereIn('id', $partnerIds)->get(['id', 'name', 'profile_pic'])->keyBy('id');

        // 1 query: unread counts for every partner at once (was 1 per partner).
        $unreadCounts = Message::where('receiver_id', $uid)
            ->whereIn('sender_id', $partnerIds)
            ->where('is_read', 0)
            ->selectRaw('sender_id, count(*) as cnt')
            ->groupBy('sender_id')
            ->pluck('cnt', 'sender_id');

        $conversations = [];
        foreach ($partnerIds as $partnerId) {
            $partner = $partners->get($partnerId);
            if (! $partner) {
                continue;
            }

            $conversations[] = [
                'partner_id'   => $partner->id,
                'name'         => $partner->name,
                'profile_pic'  => $partner->profile_pic,
                'last_message' => $lastMessageByPartner[$partnerId]->message,
                'datetime'     => $lastMessageByPartner[$partnerId]->datetime,
                'unread_count' => $unreadCounts->get($partnerId, 0),
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

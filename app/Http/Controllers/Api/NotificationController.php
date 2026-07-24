<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function list(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $notifications = Notification::where('uid', $request->uid)
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Notifications',
            'data'         => $notifications->items(),
            'total'        => $notifications->total(),
        ]);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('uid', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'count'        => $count,
        ]);
    }

    public function markRead(Request $request)
    {
        Notification::where('uid', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Notifications marquées comme lues',
        ]);
    }
}

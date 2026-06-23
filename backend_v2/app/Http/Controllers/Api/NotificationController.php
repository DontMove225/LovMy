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
}

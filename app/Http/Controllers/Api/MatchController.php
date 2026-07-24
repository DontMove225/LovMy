<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Action;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function likeDislike(Request $request)
    {
        $request->validate([
            'uid'        => 'required|integer',
            'profile_id' => 'required|integer',
            'action'     => 'required|in:LIKE,UNLIKE',
        ]);

        Action::updateOrCreate(
            ['uid' => $request->uid, 'profile_id' => $request->profile_id],
            ['action' => $request->action, 'created_at' => now()]
        );

        $isMatch = false;
        if ($request->action === 'LIKE') {
            $isMatch = Action::where('uid', $request->profile_id)
                ->where('profile_id', $request->uid)
                ->where('action', 'LIKE')
                ->exists();

            if ($isMatch) {
                $liker = User::find($request->uid);
                $liked = User::find($request->profile_id);

                if ($liker && $liked) {
                    Notification::create([
                        'uid'         => $request->profile_id,
                        'datetime'    => now(),
                        'title'       => 'New Match!',
                        'description' => "You matched with {$liker->name}! Start chatting now.",
                    ]);
                    Notification::create([
                        'uid'         => $request->uid,
                        'datetime'    => now(),
                        'title'       => 'New Match!',
                        'description' => "You matched with {$liked->name}! Start chatting now.",
                    ]);
                }
            }
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => $request->action === 'LIKE' ? 'Liked!' : 'Unliked!',
            'is_match'     => $isMatch,
        ]);
    }

    public function likeMe(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $likedMe = Action::where('profile_id', $request->uid)
            ->where('action', 'LIKE')
            ->with('user:id,name,profile_pic,birth_date,gender,is_verify')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'People who liked you',
            'data'         => $likedMe->items(),
            'total'        => $likedMe->total(),
        ]);
    }

    public function newMatch(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        // Users I liked who also liked me back
        $myLikes = Action::where('uid', $request->uid)->where('action', 'LIKE')->pluck('profile_id');

        $matches = Action::whereIn('uid', $myLikes)
            ->where('profile_id', $request->uid)
            ->where('action', 'LIKE')
            ->with('user:id,name,profile_pic,birth_date,gender,is_verify')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Your matches',
            'data'         => $matches->items(),
            'total'        => $matches->total(),
        ]);
    }

    public function favourite(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $favourites = Action::where('uid', $request->uid)
            ->where('action', 'LIKE')
            ->with('profile:id,name,profile_pic,birth_date,gender,is_verify')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Favourites',
            'data'         => $favourites->items(),
            'total'        => $favourites->total(),
        ]);
    }

    public function passed(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $passed = Action::where('uid', $request->uid)
            ->where('action', 'UNLIKE')
            ->with('profile:id,name,profile_pic,birth_date,gender,is_verify')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Passed profiles',
            'data'         => $passed->items(),
        ]);
    }

    public function delUnlike(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'profile_id' => 'required|integer']);

        Action::where('uid', $request->uid)
            ->where('profile_id', $request->profile_id)
            ->where('action', 'UNLIKE')
            ->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Removed from passed list',
        ]);
    }

    public function block(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'profile_id' => 'required|integer']);

        Action::updateOrCreate(
            ['uid' => $request->uid, 'profile_id' => $request->profile_id],
            ['action' => 'BLOCK', 'created_at' => now()]
        );

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'User blocked',
        ]);
    }

    public function unblock(Request $request)
    {
        $request->validate(['uid' => 'required|integer', 'profile_id' => 'required|integer']);

        Action::where('uid', $request->uid)
            ->where('profile_id', $request->profile_id)
            ->where('action', 'BLOCK')
            ->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'User unblocked',
        ]);
    }

    public function blockList(Request $request)
    {
        $request->validate(['uid' => 'required|integer']);

        $blocked = Action::where('uid', $request->uid)
            ->where('action', 'BLOCK')
            ->with('profile:id,name,profile_pic,gender')
            ->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Block list',
            'data'         => $blocked,
        ]);
    }

    public function getBlockList(Request $request)
    {
        return $this->blockList($request);
    }

    public function report(Request $request)
    {
        $request->validate([
            'uid'         => 'required|integer',
            'reporter_id' => 'required|integer',
            'comment'     => 'required|string',
        ]);

        \App\Models\Report::create([
            'reporter_id' => $request->reporter_id,
            'uid'         => $request->uid,
            'comment'     => $request->comment,
            'report_date' => now()->toDateString(),
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Report submitted successfully',
        ]);
    }
}

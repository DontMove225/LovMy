<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('status', 1)
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%"))
            ->select(['id', 'name', 'email', 'mobile', 'gender', 'profile_pic', 'is_verify', 'status', 'coin', 'wallet', 'is_subscribe'])
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $users->items(),
            'total'        => $users->total(),
        ]);
    }

    public function show(User $user)
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'   => 'nullable|string',
            'status' => 'nullable|boolean',
            'coin'   => 'nullable|numeric',
            'wallet' => 'nullable|numeric',
        ]);

        $user->update($request->only(['name', 'status', 'coin', 'wallet']));

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'User updated',
            'data'         => $user->fresh(),
        ]);
    }

    public function destroy(User $user)
    {
        $user->update(['status' => 0]);
        $user->tokens()->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'User deactivated',
        ]);
    }
}

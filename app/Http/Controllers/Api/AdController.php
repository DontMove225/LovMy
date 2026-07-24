<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdController extends Controller
{
    // ─── Admin ──────────────────────────────────────────────────────────────

    public function adminIndex()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => Ad::orderByDesc('id')->get(),
        ]);
    }

    public function adminStore(Request $request)
    {
        $request->validate([
            'title'      => 'required|string|max:255',
            'image'      => 'required|image|max:5120',
            'link_url'   => 'nullable|url|max:2048',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'required|in:0,1',
        ]);

        $path = $request->file('image')->store('images/ads', 'public');

        Ad::create([
            'title'      => $request->title,
            'image'      => 'storage/' . $path,
            'link_url'   => $request->link_url,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
            'status'     => $request->status,
        ]);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Publicité ajoutée',
        ]);
    }

    public function adminUpdate(Request $request, int $id)
    {
        $ad = Ad::findOrFail($id);

        $request->validate([
            'title'      => 'required|string|max:255',
            'image'      => 'nullable|image|max:5120',
            'link_url'   => 'nullable|url|max:2048',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'required|in:0,1',
        ]);

        $data = $request->only(['title', 'link_url', 'start_date', 'end_date', 'status']);

        if ($request->hasFile('image')) {
            if ($ad->image) {
                Storage::disk('public')->delete(str_replace('storage/', '', $ad->image));
            }
            $data['image'] = 'storage/' . $request->file('image')->store('images/ads', 'public');
        }

        $ad->update($data);

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Publicité mise à jour',
        ]);
    }

    public function adminDestroy(int $id)
    {
        $ad = Ad::findOrFail($id);

        if ($ad->image) {
            Storage::disk('public')->delete(str_replace('storage/', '', $ad->image));
        }
        $ad->delete();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Publicité supprimée',
        ]);
    }

    // ─── App-facing ─────────────────────────────────────────────────────────

    public function active()
    {
        $today = now()->toDateString();

        $ads = Ad::where('status', 1)
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->orderByDesc('id')
            ->get(['id', 'title', 'image', 'link_url']);

        Ad::whereIn('id', $ads->pluck('id'))->increment('view_count');

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $ads,
        ]);
    }

    public function click(Request $request)
    {
        $request->validate(['ad_id' => 'required|integer']);

        Ad::where('id', $request->ad_id)->increment('click_count');

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
        ]);
    }
}

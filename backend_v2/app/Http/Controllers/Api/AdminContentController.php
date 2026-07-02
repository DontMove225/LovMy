<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Gift;
use App\Models\Interest;
use App\Models\Language;
use App\Models\Package;
use App\Models\Page;
use App\Models\Plan;
use App\Models\RelationGoal;
use App\Models\Religion;
use Illuminate\Http\Request;

class AdminContentController extends Controller
{
    private function list(array $items): \Illuminate\Http\JsonResponse
    {
        return response()->json(['ResponseCode' => '200', 'Result' => 'true', 'data' => $items]);
    }

    private function ok(string $msg): \Illuminate\Http\JsonResponse
    {
        return response()->json(['ResponseCode' => '200', 'Result' => 'true', 'ResponseMsg' => $msg]);
    }

    // ─── Interests ──────────────────────────────────────────────────────────────

    public function interestIndex()  { return $this->list(Interest::orderByDesc('id')->get()->toArray()); }

    public function interestStore(Request $request)
    {
        $request->validate(['interest' => 'required|string', 'status' => 'required|in:0,1']);
        Interest::create(['interest' => $request->interest, 'status' => $request->status]);
        return $this->ok('Interest added');
    }

    public function interestDestroy(int $id)
    {
        Interest::findOrFail($id)->delete();
        return $this->ok('Interest deleted');
    }

    // ─── Languages ──────────────────────────────────────────────────────────────

    public function languageIndex()  { return $this->list(Language::orderByDesc('id')->get()->toArray()); }

    public function languageStore(Request $request)
    {
        $request->validate(['language' => 'required|string', 'status' => 'required|in:0,1']);
        Language::create(['language' => $request->language, 'status' => $request->status]);
        return $this->ok('Language added');
    }

    public function languageDestroy(int $id)
    {
        Language::findOrFail($id)->delete();
        return $this->ok('Language deleted');
    }

    // ─── Religions ──────────────────────────────────────────────────────────────

    public function religionIndex()  { return $this->list(Religion::orderByDesc('id')->get()->toArray()); }

    public function religionStore(Request $request)
    {
        $request->validate(['religion' => 'required|string', 'status' => 'required|in:0,1']);
        Religion::create(['religion' => $request->religion, 'status' => $request->status]);
        return $this->ok('Religion added');
    }

    public function religionDestroy(int $id)
    {
        Religion::findOrFail($id)->delete();
        return $this->ok('Religion deleted');
    }

    // ─── Goals ──────────────────────────────────────────────────────────────────

    public function goalIndex()  { return $this->list(RelationGoal::orderByDesc('id')->get()->toArray()); }

    public function goalStore(Request $request)
    {
        $request->validate(['goal' => 'required|string', 'status' => 'required|in:0,1']);
        RelationGoal::create(['goal' => $request->goal, 'status' => $request->status]);
        return $this->ok('Goal added');
    }

    public function goalDestroy(int $id)
    {
        RelationGoal::findOrFail($id)->delete();
        return $this->ok('Goal deleted');
    }

    // ─── Gifts ──────────────────────────────────────────────────────────────────

    public function giftIndex()  { return $this->list(Gift::orderByDesc('id')->get()->toArray()); }

    public function giftStore(Request $request)
    {
        $request->validate(['title' => 'required|string', 'price' => 'required|numeric', 'status' => 'required|in:0,1']);
        Gift::create(['title' => $request->title, 'price' => $request->price, 'status' => $request->status]);
        return $this->ok('Gift added');
    }

    public function giftDestroy(int $id)
    {
        Gift::findOrFail($id)->delete();
        return $this->ok('Gift deleted');
    }

    // ─── FAQs ───────────────────────────────────────────────────────────────────

    public function faqIndex()  { return $this->list(Faq::orderByDesc('id')->get()->toArray()); }

    public function faqStore(Request $request)
    {
        $request->validate(['question' => 'required|string', 'answer' => 'required|string', 'status' => 'required|in:0,1']);
        Faq::create(['question' => $request->question, 'answer' => $request->answer, 'status' => $request->status]);
        return $this->ok('FAQ added');
    }

    public function faqUpdate(Request $request, int $id)
    {
        $request->validate(['question' => 'required|string', 'answer' => 'required|string', 'status' => 'required|in:0,1']);
        Faq::findOrFail($id)->update(['question' => $request->question, 'answer' => $request->answer, 'status' => $request->status]);
        return $this->ok('FAQ updated');
    }

    public function faqDestroy(int $id)
    {
        Faq::findOrFail($id)->delete();
        return $this->ok('FAQ deleted');
    }

    // ─── Plans ──────────────────────────────────────────────────────────────────

    public function planIndex()  { return $this->list(Plan::orderByDesc('id')->get()->toArray()); }

    public function planStore(Request $request)
    {
        $request->validate(['title' => 'required|string', 'price' => 'required|numeric', 'status' => 'required|in:0,1']);
        Plan::create($request->only(['title', 'price', 'duration', 'description', 'status']));
        return $this->ok('Plan added');
    }

    public function planUpdate(Request $request, int $id)
    {
        $request->validate(['title' => 'required|string', 'price' => 'required|numeric', 'status' => 'required|in:0,1']);
        Plan::findOrFail($id)->update($request->only(['title', 'price', 'duration', 'description', 'status']));
        return $this->ok('Plan updated');
    }

    public function planDestroy(int $id)
    {
        Plan::findOrFail($id)->delete();
        return $this->ok('Plan deleted');
    }

    // ─── Packages ───────────────────────────────────────────────────────────────

    public function packageIndex()  { return $this->list(Package::orderByDesc('id')->get()->toArray()); }

    public function packageStore(Request $request)
    {
        $request->validate(['title' => 'required|string', 'price' => 'required|numeric', 'status' => 'required|in:0,1']);
        Package::create($request->only(['title', 'price', 'coin', 'description', 'status']));
        return $this->ok('Package added');
    }

    public function packageUpdate(Request $request, int $id)
    {
        $request->validate(['title' => 'required|string', 'price' => 'required|numeric', 'status' => 'required|in:0,1']);
        Package::findOrFail($id)->update($request->only(['title', 'price', 'coin', 'description', 'status']));
        return $this->ok('Package updated');
    }

    public function packageDestroy(int $id)
    {
        Package::findOrFail($id)->delete();
        return $this->ok('Package deleted');
    }

    // ─── Pages ──────────────────────────────────────────────────────────────────

    public function pageIndex()  { return $this->list(Page::orderByDesc('id')->get()->toArray()); }

    public function pageStore(Request $request)
    {
        $request->validate(['title' => 'required|string', 'description' => 'required|string', 'status' => 'required|in:0,1']);
        Page::create(['title' => $request->title, 'description' => $request->description, 'status' => $request->status]);
        return $this->ok('Page added');
    }

    public function pageUpdate(Request $request, int $id)
    {
        $request->validate(['title' => 'required|string', 'description' => 'required|string', 'status' => 'required|in:0,1']);
        Page::findOrFail($id)->update(['title' => $request->title, 'description' => $request->description, 'status' => $request->status]);
        return $this->ok('Page updated');
    }

    public function pageDestroy(int $id)
    {
        Page::findOrFail($id)->delete();
        return $this->ok('Page deleted');
    }
}

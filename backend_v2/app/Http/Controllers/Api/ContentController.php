<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Interest;
use App\Models\Language;
use App\Models\Page;
use App\Models\RelationGoal;
use App\Models\Religion;
use App\Models\Setting;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function faqs()
    {
        $faqs = Faq::where('status', 1)->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'FAQs',
            'data'         => $faqs,
        ]);
    }

    public function pages()
    {
        $pages = Page::where('status', 1)->select(['id', 'title', 'status'])->get();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Pages',
            'data'         => $pages,
        ]);
    }

    public function page(Request $request)
    {
        $request->validate(['id' => 'required|integer']);

        $page = Page::find($request->id);

        if (! $page) {
            return response()->json(['ResponseCode' => '401', 'Result' => 'false', 'ResponseMsg' => 'Page not found']);
        }

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Page',
            'data'         => $page,
        ]);
    }

    public function interests()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Interests',
            'data'         => Interest::where('status', 1)->get(),
        ]);
    }

    public function languages()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Languages',
            'data'         => Language::where('status', 1)->get(),
        ]);
    }

    public function religions()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Religions',
            'data'         => Religion::where('status', 1)->get(),
        ]);
    }

    public function relationGoals()
    {
        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Relation goals',
            'data'         => RelationGoal::where('status', 1)->get(),
        ]);
    }

    public function settings()
    {
        $setting = Setting::current();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'App settings',
            'data'         => [
                'webname'      => $setting->webname,
                'weblogo'      => $setting->weblogo,
                'currency'     => $setting->currency,
                'coin_amt'     => $setting->coin_amt,
                'coin_fun'     => $setting->coin_fun,
                'coin_limit'   => $setting->coin_limit,
                'agora_app_id' => $setting->agora_app_id,
                'map_key'      => $setting->map_key,
                'admob'        => $setting->admob,
                'banner_id'    => $setting->banner_id,
                'in_id'        => $setting->in_id,
                'ios_banner_id'=> $setting->ios_banner_id,
                'ios_in_id'    => $setting->ios_in_id,
                'fmode'        => $setting->fmode,
                'mode'         => $setting->mode,
                'show_dark'    => $setting->show_dark,
            ],
        ]);
    }

    public function smsType()
    {
        $setting = Setting::current();

        return response()->json([
            'ResponseCode'         => '200',
            'Result'               => 'true',
            'ResponseMsg'          => 'SMS settings',
            'SMS_TYPE'             => (string) ($setting->sms_type ?? ''),
            'Admob_Enabled'        => (string) ($setting->admob ?? 'No'),
            'maintainance_Enabled' => (string) ($setting->fmode ?? 'No'),
            'Social_login_enabled' => (string) ($setting->slogin ?? 'No'),
            'banner_id'            => (string) ($setting->banner_id ?? ''),
            'in_id'                => (string) ($setting->in_id ?? ''),
            'otp_auth'             => (string) ($setting->otp_auth ?? 'No'),
            'gift_fun'             => (string) ($setting->coin_fun ?? 'No'),
            'ios_in_id'            => (string) ($setting->ios_in_id ?? ''),
            'ios_banner_id'        => (string) ($setting->ios_banner_id ?? ''),
            'agora_app_id'         => (string) ($setting->agora_app_id ?? ''),
        ]);
    }

    public function referData(Request $request)
    {
        $request->validate(['refercode' => 'required']);

        $referrer = \App\Models\User::where('code', $request->refercode)->first();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => $referrer ? 'true' : 'false',
            'ResponseMsg'  => $referrer ? 'Referral code valid' : 'Invalid referral code',
            'data'         => $referrer ? ['name' => $referrer->name] : null,
        ]);
    }
}

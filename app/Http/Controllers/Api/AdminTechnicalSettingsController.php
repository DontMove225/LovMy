<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminTechnicalSettingsController extends Controller
{
    public function index()
    {
        $setting = Setting::current();

        $data = collect(Setting::TECHNICAL_FIELDS)->mapWithKeys(
            fn ($field) => [$field => ['is_set' => filled($setting->{$field})]]
        );

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'data'         => $data,
        ]);
    }

    public function update(Request $request)
    {
        $setting = Setting::current();

        $data = $request->only(Setting::TECHNICAL_FIELDS);
        $clearFields = array_values(array_intersect(
            (array) $request->input('clear_fields', []),
            Setting::TECHNICAL_FIELDS
        ));

        $updates = array_filter($data, fn ($value) => $value !== null);
        foreach ($clearFields as $field) {
            $updates[$field] = null;
        }

        $setting->fill($updates);
        $setting->save();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Paramètres techniques mis à jour !',
        ]);
    }

    public function verifyPassword(Request $request)
    {
        $request->validate(['password' => 'required|string']);

        $setting = Setting::current();
        $ok = (bool) $setting->tech_password && Hash::check($request->password, $setting->tech_password);

        return response()->json([
            'ResponseCode' => $ok ? '200' : '401',
            'Result'       => $ok ? 'true' : 'false',
            'ResponseMsg'  => $ok ? 'Mot de passe technique valide.' : 'Mot de passe technique invalide.',
        ], $ok ? 200 : 401);
    }

    public function changePassword(Request $request)
    {
        $request->validate(['new_password' => 'required|string|min:8']);

        $setting = Setting::current();
        $setting->tech_password = $request->new_password;
        $setting->save();

        return response()->json([
            'ResponseCode' => '200',
            'Result'       => 'true',
            'ResponseMsg'  => 'Mot de passe technique modifié !',
        ]);
    }
}

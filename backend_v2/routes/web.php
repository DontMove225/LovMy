<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name'    => 'LovMy API',
        'version' => '2.0',
        'status'  => 'running',
    ]);
});

Route::get('/up', function () {
    return response()->json(['status' => 'OK']);
});

Route::get('/stripe/success', function () {
    return response('Payment successful, you can close this window.', 200);
});

Route::get('/stripe/cancel', function () {
    return response('Payment cancelled.', 200);
});

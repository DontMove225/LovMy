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

<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\GiftController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WalletController;
use Illuminate\Support\Facades\Route;

// ─── Public routes ────────────────────────────────────────────────────────────

// Auth
Route::post('/user_login.php',      [AuthController::class, 'login']);
Route::post('/reg_user.php',        [AuthController::class, 'register']);
Route::post('/mobile_check.php',    [AuthController::class, 'mobileCheck']);
Route::post('/forget_password.php', [AuthController::class, 'forgetPassword']);
Route::post('/social_login.php',    [AuthController::class, 'login']);

// Admin auth
Route::post('/auth/admin/login', [AuthController::class, 'adminLogin']);

// Content (public)
Route::get('/goal.php',         [ContentController::class, 'relationGoals']);
Route::get('/interest.php',     [ContentController::class, 'interests']);
Route::get('/languagelist.php', [ContentController::class, 'languages']);
Route::get('/religionlist.php', [ContentController::class, 'religions']);
Route::get('/faq.php',          [ContentController::class, 'faqs']);
Route::get('/pagelist.php',     [ContentController::class, 'pages']);
Route::post('/pagelist.php',    [ContentController::class, 'pages']);
Route::get('/sms_type.php',     [ContentController::class, 'smsType']);
Route::post('/getdata.php',     [ContentController::class, 'referData']);
Route::post('/setting.php',     [ContentController::class, 'settings']);

// Payment gateways (public)
Route::match(['GET','POST'], '/paymentgateway.php', [PlanController::class, 'paymentGateway']);
Route::match(['GET','POST'], '/plan.php',           [PlanController::class, 'plans']);
Route::match(['GET','POST'], '/list_package.php',   [PlanController::class, 'packages']);

// Gifts (GET also supported)
Route::match(['GET','POST'], '/gift_list.php',   [GiftController::class, 'giftList']);

// ─── App routes (uid-based auth, no Sanctum token required) ──────────────────
// These match the original PHP backend behavior where uid is the identifier.

// Profile
Route::post('/profile_info.php',  [ProfileController::class, 'infoByUid']);
Route::post('/user_info.php',     [ProfileController::class, 'infoByUid']);
Route::post('/profile_view.php',  [ProfileController::class, 'view']);

// Home & Discovery
Route::post('/home_data.php', [HomeController::class, 'homeData']);
Route::post('/filter.php',    [HomeController::class, 'filter']);
Route::post('/map_info.php',  [HomeController::class, 'mapInfo']);

// Matching
Route::post('/like_dislike.php', [MatchController::class, 'likeDislike']);
Route::post('/like_me.php',      [MatchController::class, 'likeMe']);
Route::post('/new_match.php',    [MatchController::class, 'newMatch']);
Route::post('/favourite.php',    [MatchController::class, 'favourite']);
Route::post('/passed.php',       [MatchController::class, 'passed']);
Route::post('/del_unlike.php',   [MatchController::class, 'delUnlike']);

// Blocking & Reporting
Route::post('/profile_block.php', [MatchController::class, 'block']);
Route::post('/unblock.php',       [MatchController::class, 'unblock']);
Route::post('/blocklist.php',     [MatchController::class, 'blockList']);
Route::post('/getblocklist.php',  [MatchController::class, 'getBlockList']);
Route::post('/report.php',        [MatchController::class, 'report']);

// Gifts
Route::post('/giftbuy.php',     [GiftController::class, 'buyGift']);
Route::post('/my_gift.php',     [GiftController::class, 'myGifts']);

// Plans & Subscriptions
Route::post('/plan_purchase.php',    [PlanController::class, 'purchasePlan']);
Route::post('/package_purchase.php', [PlanController::class, 'purchasePackage']);
Route::post('/coin_report.php',      [PlanController::class, 'coinReport']);

// Wallet
Route::post('/wallet_up.php',        [WalletController::class, 'walletUp']);
Route::post('/wallet_report.php',    [WalletController::class, 'walletReport']);
Route::post('/request_withdraw.php', [WalletController::class, 'requestWithdraw']);
Route::post('/payout_list.php',      [WalletController::class, 'payoutList']);

// Notifications
Route::post('/u_notification_list.php', [NotificationController::class, 'list']);

// Profile edit (needs uid verification but no token)
Route::post('/edit_profile.php',  [ProfileController::class, 'editByUid']);
Route::post('/pro_image.php',     [ProfileController::class, 'uploadPhotoByUid']);
Route::post('/other_image.php',   [ProfileController::class, 'uploadOtherPhotoByUid']);
Route::post('/identity_doc.php',  [ProfileController::class, 'uploadIdentityByUid']);
Route::post('/acc_delete.php',    [ProfileController::class, 'deleteByUid']);

// OTP
Route::post('/msg_otp.php',    [AuthController::class, 'mobileCheck']);
Route::post('/twilio_otp.php', [AuthController::class, 'mobileCheck']);

// ─── Sanctum-protected routes (admin panel & REST API) ───────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Users CRUD (admin use)
    Route::apiResource('users', UserController::class);

    // ─── Admin routes ──────────────────────────────────────────────────────────
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard',         [AdminController::class, 'dashboard']);
        Route::get('/settings',          [AdminController::class, 'settings']);
        Route::put('/settings',          [AdminController::class, 'updateSettings']);
        Route::get('/users',             [AdminController::class, 'userList']);
        Route::post('/users/ban',        [AdminController::class, 'banUser']);
        Route::post('/users/verify',     [AdminController::class, 'verifyUser']);
        Route::get('/reports',           [AdminController::class, 'reportList']);
        Route::get('/payouts',           [AdminController::class, 'payoutList']);
        Route::post('/payouts/approve',  [AdminController::class, 'approvePayout']);
        Route::get('/payments',          [AdminController::class, 'paymentList']);
        Route::post('/notifications',    [AdminController::class, 'sendNotification']);
    });
});

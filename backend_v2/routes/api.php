<?php

use App\Http\Controllers\Api\AdminContentController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
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

// ─── Public routes ───────────────────────────────────────────────────────────

// Auth
Route::post('/user_login.php',    [AuthController::class, 'login']);
Route::post('/reg_user.php',      [AuthController::class, 'register']);
Route::post('/mobile_check.php',  [AuthController::class, 'mobileCheck']);
Route::post('/email_check.php',   [AuthController::class, 'emailCheck']);
Route::post('/forget_password.php', [AuthController::class, 'forgetPassword']);

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

// Payment gateways (public)
Route::post('/paymentgateway.php', [PlanController::class, 'paymentGateway']);
Route::post('/plan.php',           [PlanController::class, 'plans']);
Route::post('/list_package.php',   [PlanController::class, 'packages']);

// ─── Authenticated User routes ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::post('/profile_info.php',  [ProfileController::class, 'info']);
    Route::post('/user_info.php',     [ProfileController::class, 'info']);
    Route::post('/edit_profile.php',  [ProfileController::class, 'edit']);
    Route::post('/pro_image.php',     [ProfileController::class, 'uploadPhoto']);
    Route::post('/other_image.php',   [ProfileController::class, 'uploadOtherPhoto']);
    Route::post('/identity_doc.php',  [ProfileController::class, 'uploadIdentity']);
    Route::post('/profile_view.php',  [ProfileController::class, 'view']);
    Route::post('/acc_delete.php',    [ProfileController::class, 'delete']);

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
    Route::post('/gift_list.php',   [GiftController::class, 'giftList']);
    Route::post('/giftbuy.php',     [GiftController::class, 'buyGift']);
    Route::post('/my_gift.php',     [GiftController::class, 'myGifts']);

    // Plans & Subscriptions
    Route::post('/plan_purchase.php',    [PlanController::class, 'purchasePlan']);
    Route::post('/package_purchase.php', [PlanController::class, 'purchasePackage']);
    Route::post('/coin_report.php',      [PlanController::class, 'coinReport']);
    Route::post('/plan_history.php',     [PlanController::class, 'planHistory']);

    // Wallet
    Route::post('/wallet_up.php',         [WalletController::class, 'walletUp']);
    Route::post('/wallet_report.php',     [WalletController::class, 'walletReport']);
    Route::post('/request_withdraw.php',  [WalletController::class, 'requestWithdraw']);
    Route::post('/payout_list.php',       [WalletController::class, 'payoutList']);

    // Notifications
    Route::post('/u_notification_list.php', [NotificationController::class, 'list']);

    // Messagerie
    Route::post('/conversations.php', [ChatController::class, 'conversations']);
    Route::post('/messages_list.php', [ChatController::class, 'messages']);
    Route::post('/send_message.php',  [ChatController::class, 'send']);

    // Settings (public-ish)
    Route::post('/setting.php', [ContentController::class, 'settings']);

    // Users CRUD (admin use)
    Route::apiResource('users', UserController::class);

    // ─── Admin routes ─────────────────────────────────────────────────────────
    Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
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

        // Staff
        Route::get('/staff',             [AdminController::class, 'staffList']);
        Route::post('/staff',            [AdminController::class, 'staffStore']);
        Route::delete('/staff/{id}',     [AdminController::class, 'staffDestroy']);

        // Fake users
        Route::post('/fake-users',       [AdminController::class, 'generateFakeUser']);

        // Content CRUD
        Route::get('/interests',                    [AdminContentController::class, 'interestIndex']);
        Route::post('/interests',                   [AdminContentController::class, 'interestStore']);
        Route::delete('/interests/{id}',            [AdminContentController::class, 'interestDestroy']);

        Route::get('/languages',                    [AdminContentController::class, 'languageIndex']);
        Route::post('/languages',                   [AdminContentController::class, 'languageStore']);
        Route::delete('/languages/{id}',            [AdminContentController::class, 'languageDestroy']);

        Route::get('/religions',                    [AdminContentController::class, 'religionIndex']);
        Route::post('/religions',                   [AdminContentController::class, 'religionStore']);
        Route::delete('/religions/{id}',            [AdminContentController::class, 'religionDestroy']);

        Route::get('/goals',                        [AdminContentController::class, 'goalIndex']);
        Route::post('/goals',                       [AdminContentController::class, 'goalStore']);
        Route::delete('/goals/{id}',                [AdminContentController::class, 'goalDestroy']);

        Route::get('/gifts',                        [AdminContentController::class, 'giftIndex']);
        Route::post('/gifts',                       [AdminContentController::class, 'giftStore']);
        Route::delete('/gifts/{id}',                [AdminContentController::class, 'giftDestroy']);

        Route::get('/faqs',                         [AdminContentController::class, 'faqIndex']);
        Route::post('/faqs',                        [AdminContentController::class, 'faqStore']);
        Route::put('/faqs/{id}',                    [AdminContentController::class, 'faqUpdate']);
        Route::delete('/faqs/{id}',                 [AdminContentController::class, 'faqDestroy']);

        Route::get('/plans',                        [AdminContentController::class, 'planIndex']);
        Route::post('/plans',                       [AdminContentController::class, 'planStore']);
        Route::put('/plans/{id}',                   [AdminContentController::class, 'planUpdate']);
        Route::delete('/plans/{id}',                [AdminContentController::class, 'planDestroy']);

        Route::get('/packages',                     [AdminContentController::class, 'packageIndex']);
        Route::post('/packages',                    [AdminContentController::class, 'packageStore']);
        Route::put('/packages/{id}',                [AdminContentController::class, 'packageUpdate']);
        Route::delete('/packages/{id}',             [AdminContentController::class, 'packageDestroy']);

        Route::get('/pages',                        [AdminContentController::class, 'pageIndex']);
        Route::post('/pages',                       [AdminContentController::class, 'pageStore']);
        Route::put('/pages/{id}',                   [AdminContentController::class, 'pageUpdate']);
        Route::delete('/pages/{id}',                [AdminContentController::class, 'pageDestroy']);
    });
});

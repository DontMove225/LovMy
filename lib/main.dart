import 'dart:convert';

import 'package:camera/camera.dart';
import 'package:lovmy/Logic/cubits/Home_cubit/home_cubit.dart';
import 'package:lovmy/Logic/cubits/auth_cubit/auth_cubit.dart';
import 'package:lovmy/Logic/cubits/editProfile_cubit/editprofile_cubit.dart';
import 'package:lovmy/Logic/cubits/language_cubit/language_bloc.dart';
import 'package:lovmy/Logic/cubits/match_cubit/match_cubit.dart';
import 'package:lovmy/Logic/cubits/onBording_cubit/onbording_cubit.dart';
import 'package:lovmy/Logic/cubits/litedark/lite_dark_cubit.dart';
import 'package:lovmy/core/notifications.dart';
import 'package:lovmy/core/routes.dart';
import 'package:lovmy/core/ui.dart';
import 'package:lovmy/firebase_options.dart';
import 'package:lovmy/language/localization/app_localization_setup.dart';
import 'package:lovmy/presentation/firebase/auth_firebase.dart';
import 'package:lovmy/presentation/firebase/chat_service.dart';
import 'package:lovmy/presentation/firebase/chatting_provider.dart';
import 'package:lovmy/presentation/firebase/pickup_callpage.dart';
import 'package:lovmy/presentation/firebase/vc_provider.dart';
import 'package:lovmy/presentation/screens/AudioCall/audiocall_provider.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/homeProvider/homeprovier.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/match/matchprovider.dart';
import 'package:lovmy/presentation/screens/other/editProfile/editprofile_provider.dart';
import 'package:lovmy/presentation/screens/other/likeMatch/likematch_provider.dart';
import 'package:lovmy/presentation/screens/other/premium/premium_provider.dart';
import 'package:lovmy/presentation/screens/other/profileAbout/detailprovider.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/profile_page.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/profile_provider.dart';
import 'package:lovmy/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:lovmy/presentation/screens/splash_bording/splash_screen.dart';
import 'package:lovmy/wallete_code/wallet_provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'Logic/cubits/litedark/lite_dark_state.dart';
import 'Logic/cubits/premium_cubit/premium_bloc.dart';
import 'by_coin_screen/coin_provider.dart';


Future<void> main() async {

  WidgetsFlutterBinding.ensureInitialized();
  cameras = await availableCameras();
  MobileAds.instance.initialize();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  FirebaseMessaging.onMessage.listen((event) {

    if(event.data["vcId"] != null) {

      navigatorKey.currentState?.push(MaterialPageRoute(builder: (context) => PickUpCall(userData: event.data,isAudio: false)));

    }else if(event.data["Audio"] != null){

      navigatorKey.currentState?.push(MaterialPageRoute(builder: (context) => PickUpCall(userData: event.data,isAudio: true)));

    }

  });
  // loadFCM doit être appelé EN PREMIER pour instancier flutterLocalNotificationsPlugin
  await loadFCM();
  await initializeNotifications();
  listenFCM();
  runApp(MyApp());
  SharedPreferences prefs = await SharedPreferences.getInstance();
  prefs.setDouble("rediuse", 0);
}

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => ThemeBloc()),
        BlocProvider(create: (context) => AuthCubit()),
        BlocProvider(create: (context) => OnbordingCubit()),
        BlocProvider(create: (context) => HomePageCubit()),
        BlocProvider(create: (context) => EditProfileCubit()),
        BlocProvider(create: (context) => MatchCubit()),
        BlocProvider(create: (context) => LanguageCubit()),
        BlocProvider(create: (context) => PremiumBloc()),
      ],
      child: BlocBuilder<ThemeBloc, ThemeState>(
        builder: (context, theme) {
          return BlocBuilder<LanguageCubit,LanguageState>(
            buildWhen: (previous, current) => previous != current, builder: (context, languageState){
              return MultiProvider(
                providers: [
                  ChangeNotifierProvider(create: (context) => OnBordingProvider()),
                  ChangeNotifierProvider(create: (context) => DetailProvider()),
                  ChangeNotifierProvider(create: (context) => HomeProvider()),
                  ChangeNotifierProvider(create: (context) => ProfileProvider()),
                  ChangeNotifierProvider(create: (context) => EditProfileProvider()),
                  ChangeNotifierProvider(create: (context) => MatchProvider()),
                  ChangeNotifierProvider(create: (context) => LikeMatchProvider()),
                  ChangeNotifierProvider(create: (context) => FirebaseAuthService()),
                  ChangeNotifierProvider(create: (context) => ChattingProvider()),
                  ChangeNotifierProvider(create: (context) => VcProvider()),
                  ChangeNotifierProvider(create: (context) => AudioCallProvider()),
                  ChangeNotifierProvider(create: (context) => PremiumProvider()),
                  ChangeNotifierProvider(create: (context) => WalleteProvider()),
                  ChangeNotifierProvider(create: (context) => ByCoinProvider()),
                  ChangeNotifierProvider(create: (context) => ChatServices()),
                ],
                child: MaterialApp(
                  builder: (context, child) {
                    return SafeArea(
                      top: false,
                      child: child!,
                    );
                  },
                  debugShowCheckedModeBanner: false,
                  initialRoute: SplashScreen.splashScreenRoute,
                  // home: VideoCallPage(),
                  theme: Themes.defaultTheme,
                  darkTheme: Themes.darkTheme,
                  themeMode: theme.themeMode,
                  navigatorKey: navigatorKey,
                  onGenerateRoute: Routes.onGenerateRoute,
                  supportedLocales: AppLocalizationSetup.supportedLanguage,
                  localizationsDelegates: AppLocalizationSetup.localizationsDelegates,
                  localeResolutionCallback: AppLocalizationSetup.localeResolutionCallback,
                  locale: languageState.locale,
                ),
              );
            }
          );
        },
      ),
    );
  }
}

/// Runs in its own background isolate (app backgrounded/terminated), so it
/// can't rely on the plugin instances initialized in main() — it has to set
/// up its own Firebase app + local-notifications plugin from scratch, then
/// show the incoming call/chat message as a system notification. Tapping
/// that notification is handled separately by onDidReceiveNotificationResponse
/// in core/notifications.dart, which already knows how to route vcId/Audio
/// payloads to the call screen and chat payloads to the chat screen.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  const AndroidNotificationChannel bgChannel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    importance: Importance.high,
    enableVibration: true,
  );

  final FlutterLocalNotificationsPlugin plugin = FlutterLocalNotificationsPlugin();
  await plugin.initialize(
    const InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
    ),
  );
  await plugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(bgChannel);

  final bool isVideoCall = message.data["vcId"] != null;
  final bool isAudioCall = message.data["Audio"] != null;

  final String title = isVideoCall
      ? "Appel vidéo entrant"
      : isAudioCall
          ? "Appel audio entrant"
          : message.notification?.title ?? message.data["name"] ?? "";
  final String body = isVideoCall || isAudioCall
      ? (message.data["name"] ?? "")
      : message.notification?.body ?? "";

  await plugin.show(
    message.hashCode,
    title,
    body,
    NotificationDetails(
      android: AndroidNotificationDetails(
        bgChannel.id,
        bgChannel.name,
        icon: '@mipmap/ic_launcher',
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentSound: true,
        presentBadge: true,
      ),
    ),
    payload: jsonEncode({
      "name": message.data["name"],
      "id": message.data["id"],
      "propic": message.data["propic"]?.toString(),
      "vcId": message.data["vcId"]?.toString() ?? "null",
      "Audio": message.data["Audio"]?.toString() ?? "null",
    }),
  );
}

 

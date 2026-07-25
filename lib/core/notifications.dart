// ignore_for_file: avoid_print

import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:lovmy/presentation/firebase/chat_page.dart';
import 'package:lovmy/presentation/firebase/pickup_callpage.dart';

import '../main.dart';

late AndroidNotificationChannel channel;
late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;

void listenFCM() async {
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    RemoteNotification? notification = message.notification;
    AndroidNotification? android = message.notification?.android;
    if (notification != null && android != null && !kIsWeb) {
      flutterLocalNotificationsPlugin.show(
          notification.hashCode,
          notification.title,
          notification.body,
          NotificationDetails(
            android: AndroidNotificationDetails(
              channel.id,
              channel.name,
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
            "propic": message.data["propic"].toString(),
            "vcId": message.data["vcId"].toString(),
            "Audio": message.data["Audio"].toString(),
          }));
    }
  });
}

/// Affiche une notification locale directement depuis l'app (sans passer par
/// un push serveur Firebase) — utilisé pour les matchs et les nouveaux
/// messages, détectés via Firestore côté client.
Future<void> showLocalNotification({
  required String title,
  required String body,
  Map<String, dynamic>? data,
}) async {
  if (kIsWeb) return;
  await flutterLocalNotificationsPlugin.show(
    DateTime.now().millisecondsSinceEpoch ~/ 1000,
    title,
    body,
    NotificationDetails(
      android: AndroidNotificationDetails(
        channel.id,
        channel.name,
        icon: '@mipmap/ic_launcher',
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentSound: true,
        presentBadge: true,
      ),
    ),
    payload: jsonEncode({
      "name": data?["name"],
      "id": data?["id"],
      "propic": data?["propic"],
      "vcId": "null",
      "Audio": "null",
    }),
  );
}

void requestPermission() async {
  FirebaseMessaging messaging = FirebaseMessaging.instance;

  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    announcement: false,
    badge: true,
    carPlay: false,
    criticalAlert: false,
    provisional: false,
    sound: true,
  );

  if (settings.authorizationStatus == AuthorizationStatus.authorized) {
  } else if (settings.authorizationStatus == AuthorizationStatus.provisional) {
  } else {}
}

Future<void> initializeNotifications() async {
  const AndroidInitializationSettings initializationSettingsAndroid =
  AndroidInitializationSettings('@mipmap/ic_launcher');

  const InitializationSettings initializationSettings =
  InitializationSettings(android: initializationSettingsAndroid);

  // Initialization
  await flutterLocalNotificationsPlugin.initialize(
    initializationSettings,
    onDidReceiveNotificationResponse: (NotificationResponse response) {
      // Handle notification response
      final String? payload = response.payload;

      if (payload != null) {
        Map<String, dynamic> data = jsonDecode(payload);

        if (data["vcId"] == "null" && data["Audio"] == "null") {
          navigatorKey.currentState?.push(MaterialPageRoute(
            builder: (context) => ChattingPage(
              resiverUserId: data["id"],
              resiverUseremail: data["name"],
              proPic: data["propic"],
              userData: data,
            ),
          ));
        } else if (data["vcId"] != null && data["Audio"] == "null") {
          navigatorKey.currentState?.push(MaterialPageRoute(
            builder: (context) => PickUpCall(userData: data, isAudio: false),
          ));
        } else if (data["Audio"] != null) {
          navigatorKey.currentState?.push(MaterialPageRoute(
            builder: (context) => PickUpCall(userData: data, isAudio: true),
          ));
        }
      }
    },
  );
}

Future<void> loadFCM() async {
  if (!kIsWeb) {
    channel = const AndroidNotificationChannel(
      'high_importance_channel', // id
      'High Importance Notifications', // title
      importance: Importance.high,
      enableVibration: true,
    );

    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    /// Create an Android Notification Channel.
    ///
    /// We use this channel in the `AndroidManifest.xml` file to override the
    /// default FCM channel to enable heads up notifications.

    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    /// Update the iOS foreground notification presentation options to allow
    /// heads up notifications.

    await FirebaseMessaging.instance
        .setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );
  }
}

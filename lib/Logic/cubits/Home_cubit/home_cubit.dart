import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lovmy/Logic/cubits/Home_cubit/homestate.dart';
import 'package:lovmy/core/api.dart';
import 'package:lovmy/core/config.dart';
import 'package:lovmy/data/localdatabase.dart';
import 'package:lovmy/data/models/homemodel.dart';
import 'package:lovmy/core/notifications.dart';
import 'package:lovmy/presentation/firebase/fake_chat_helper.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/homeProvider/homeprovier.dart';
import 'package:lovmy/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:flutter/material.dart';

import '../../../presentation/screens/other/premium/premium_provider.dart';

class HomePageCubit extends Cubit<HomePageStates> {
  HomePageCubit() : super(HomeInitState());

  final Api _api = Api();

  initforHome(context) {
    // Ne pas émettre HomeLoadingState si on est déjà en HomeCompleteState
    // (évite de casser l'affichage du profil qui dépend de cet état)
    if (state is! HomeCompleteState) {
      emit(HomeLoadingState());
    }
    try {
      double? lat = Provider.of<OnBordingProvider>(context, listen: false).lat;
      double? long = Provider.of<OnBordingProvider>(context, listen: false).long;
      Preferences.fetchUserDetails().then((value) {
        try {
          if (value == null || value.toString().isEmpty) {
            emit(HomeErrorState("Session expirée. Veuillez vous reconnecter."));
            return;
          }
          final decoded = jsonDecode(value);
          // Support les deux structures possibles :
          // 1. {"UserLogin": {"id": "1", ...}}  ← login response directe
          // 2. {"id": "1", ...}                 ← objet user direct (ancien format)
          final userLogin = decoded["UserLogin"] ?? decoded;
          final uid = userLogin?["id"];
          if (uid == null) {
            emit(HomeErrorState("Session expirée. Veuillez vous reconnecter."));
            return;
          }
          getHomeData(
            uid: uid.toString(),
            lat: (lat ?? 0.0).toString(),
            long: (long ?? 0.0).toString(),
            context: context,
          );
        } catch (e) {
          emit(HomeErrorState("Erreur lecture données: ${e.toString()}"));
        }
      }).catchError((e) {
        emit(HomeErrorState(e.toString()));
      });
    } catch (e) {
      emit(HomeErrorState(e.toString()));
    }
  }

  Future<HomeModel> getHomeData({required String uid, required String lat, required String long,required context}) async {
    try {
      Map data = {
        "uid": uid,
        "lats": lat,
        "longs": long
      };

      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.homeData}", data: data);

      if (response.statusCode == 200) {
        HomeModel homeData = HomeModel.fromJson(response.data);

        ensureFakeDatingUserDocs(homeData.profilelist ?? []);

        Preferences.setDatawithKeyFromLocal(key: "currency", data: response.data["currency"]);

        print(homeData.plandata?.amount ?? "0");
        emit(HomeCompleteState(homeData));
        try{
          Provider.of<PremiumProvider>(context,listen: false).selectedPlan = int.parse(homeData.planId.toString());
          Provider.of<HomeProvider>(context,listen: false).currency = homeData.currency;
        } catch(e){
          // emit(HomeErrorState("e.toString()"));
          print("***:- ${e.toString()}");
        }

        return HomeModel.fromJson(response.data);
      } else {
        emit(HomeErrorState(response.data["ResponseMsg"]));
        return HomeModel.fromJson(response.data);
      }
    } catch (e) {
      emit(HomeErrorState(e.toString()));
      rethrow;
    }
  }

  Future delUnlikeApi(context) async {
    try{
      Map data = {
        "uid" : Provider.of<HomeProvider>(context,listen: false).uid,
      };
      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.delUnlike}",data: data);
      if(response.statusCode == 200){
        initforHome(context);
        // Navigator.of(context).pushNamedAndRemoveUntil("/bottomBar", (route) => false,);
        Navigator.pop(context);
      }
    }catch(e){
      emit(HomeErrorState(e.toString()));
      rethrow;
    }
  }

  // Future<void> delUnlikeApi(BuildContext context) async {
  //   try {
  //
  //     final homeProvider = Provider.of<HomeProvider>(context, listen: false);
  //     String uid = homeProvider.uid;
  //
  //     Map<String, dynamic> data = {
  //       "uid": uid,
  //     };
  //
  //     Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.delUnlike}", data: data);
  //
  //     if (response.statusCode == 200) {
  //       initforHome(context);
  //       Navigator.pop(context);
  //     }
  //   } catch (e) {
  //     emit(HomeErrorState(e.toString()));
  //     rethrow;
  //   }
  // }

  Future profileLikeDislikeApi({required String uid, required String proId, required String action, lat, long,}) async {
    try {
      Map data = {"uid": uid, "profile_id": proId, "action": action};

      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.likeDislike}", data: data);

      if (response.statusCode == 200) {
        if (response.data["Result"] == "true") {
          if (action == "LIKE" && response.data["is_match"] == true) {
            _sendMatchIcebreaker(partnerId: proId, currentUserId: uid);
          }
        } else {
          Fluttertoast.showToast(msg: response.data["ResponseMsg"]);
        }
      }
    } catch (e) {
      emit(HomeErrorState(e.toString()));
      rethrow;
    }
  }

  /// Writes a first "match" message into the shared chat room so the
  /// conversation shows up immediately in both users' chat tab — without
  /// this, chats.dart only lists threads that already have a message, so a
  /// real-real match would otherwise stay invisible until someone opens the
  /// chat manually. Works the same for a real or a FAKE_USER partner.
  Future<void> _sendMatchIcebreaker({required String partnerId, required String currentUserId}) async {
    try {
      final doc = await FirebaseFirestore.instance.collection('datingUser').doc(partnerId).get();
      final fields = doc.data();
      final isFake = fields?['isFake'] == true;
      if (isFake) {
        await Future.delayed(Duration(seconds: 1 + Random().nextInt(2)));
      }
      await sendFakeMessage(
        fakeUserId: partnerId,
        realUserId: currentUserId,
        fakeUserName: fields?['name'] ?? 'Utilisateur',
        text: "C'est un match ! 🎉 Envoie-moi un message.",
      );
      await showLocalNotification(
        title: 'Nouveau match ! 🎉',
        body: "Tu as matché avec ${fields?['name'] ?? 'quelqu\'un'}",
        data: {'id': partnerId, 'name': fields?['name'], 'propic': fields?['pro_pic']},
      );
    } catch (_) {
      // Best-effort — a failed icebreaker shouldn't disrupt the like flow.
    }
  }

  Future filterHome({required String uid, required String lat, required String long, required String radiusSearch, required String searchPreference, required String minage, required String maxage, required String relationGoal, required String interest, required String religion, required String language, required String isverify,}) async {
    try {
      Map data = {
        "uid": uid,
        "radius_search": radiusSearch,
        "search_preference": searchPreference,
        "lats": lat,
        "longs": long,
        "minage":minage,
        "maxage":maxage,
        "relation_goal":relationGoal,
        "interest":interest,
        "religion":religion,
        "language":language,
        "is_verify":isverify
      };

      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.filter}", data: data);

      if (response.statusCode == 200) {
        if (response.data["Result"] == "true") {
          HomeModel homeData = HomeModel.fromJson(response.data);
          emit(HomeCompleteState(homeData));
        } else {
          Fluttertoast.showToast(msg: response.data["ResponseMsg"]);
        }
      }
    } catch (e) {
      emit(HomeErrorState(e.toString()));
      rethrow;
    }
  }

  Future planDataApi(context,uid) async {
    Map data = {
      "uid": uid
    };
    try{
      Response  response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.userInfo}",data: data);
      if(response.statusCode == 200){
        if(response.data["Result"] == "true"){
         return response.data["direct_chat"];
        }
      }
    }catch(e){
      print(e);
    }
  }

}

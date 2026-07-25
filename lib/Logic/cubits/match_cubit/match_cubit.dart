import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lovmy/Logic/cubits/match_cubit/match_states.dart';
import 'package:lovmy/core/config.dart';
import 'package:lovmy/core/notifications.dart';
import 'package:lovmy/presentation/firebase/fake_chat_helper.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/homeProvider/homeprovier.dart';
import 'package:dio/dio.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import '../../../core/api.dart';
import '../../../data/models/favoritelistmodel.dart';
import '../../../data/models/likememodel.dart';
import '../../../data/models/newmatchmodel.dart';
import '../../../data/models/passedmodel.dart';

class MatchCubit extends Cubit<MatchStates> {
  MatchCubit() : super(MatchInitState());

  final Api _api = Api();

  Future<LikeMeModel> likeMeApi(context) async{
    try{
      Map data = {
        "uid": Provider.of<HomeProvider>(context,listen: false).uid,
        "lats": Provider.of<HomeProvider>(context,listen: false).lat,
        "longs": Provider.of<HomeProvider>(context,listen: false).long
      };
      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.likeMe}",data: data);

      if(response.statusCode == 200){
        if(response.data["Result"] == "true"){
          return LikeMeModel.fromJson(response.data);
        }else{
          return LikeMeModel.fromJson(response.data);
        }
      }else{
        emit(MatchErrorState(response.data["Result"]));
        return LikeMeModel.fromJson(response.data);
      }
    }catch(e){
      emit(MatchErrorState(e.toString()));
      rethrow;
    }
  }

  Future<FavlistModel> favouriteApi(context) async {
    try{

      Map data = {
        "uid": Provider.of<HomeProvider>(context,listen: false).uid,
        "lats": Provider.of<HomeProvider>(context,listen: false).lat,
        "longs": Provider.of<HomeProvider>(context,listen: false).long
      };

      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.favourite}",data: data);

      print("ttttttttttttt${response.data}");
      if(response.statusCode == 200){

        if(response.data["Result"] == "true"){
          return FavlistModel.fromJson(response.data);
        }else{
          return FavlistModel.fromJson(response.data);
        }

      }else{

        emit(MatchErrorState(response.data["ResponseMsg"]));
        return FavlistModel.fromJson(response.data);

      }

    }catch(e){

      emit(MatchErrorState(e.toString()));
      rethrow;

    }
  }

  Future<bool> toggleFavoriteApi({required String uid, required String profileId}) async {
    try {
      Map data = {"uid": uid, "profile_id": profileId};
      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.favoriteToggle}", data: data);
      if (response.statusCode == 200 && response.data["Result"] == "true") {
        return response.data["is_favorite"] == true;
      }
    } catch (e) {
      Fluttertoast.showToast(msg: e.toString());
    }
    return false;
  }


  Future<PassedModel> passedApi(context) async{
    try{
      Map data = {
        "uid": Provider.of<HomeProvider>(context,listen: false).uid,
        "lats": Provider.of<HomeProvider>(context,listen: false).lat,
        "longs": Provider.of<HomeProvider>(context,listen: false).long
      };
      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.passed}",data: data);

      print("ddddddddddd${response.data}");
      if(response.statusCode == 200){
        if(response.data["Result"] == "true"){
          return PassedModel.fromJson(response.data);
        }else{
          return PassedModel.fromJson(response.data);
        }
      }else{
        emit(MatchErrorState(response.data["Result"]));
        return PassedModel.fromJson(response.data);
      }
    }catch(e){
      emit(MatchErrorState(e.toString()));
      rethrow;
    }
  }

  Future<NewMatchModel> newMatchApi(context) async{
    try{
      Map data = {
        "uid": Provider.of<HomeProvider>(context,listen: false).uid,
        "lats": Provider.of<HomeProvider>(context,listen: false).lat,
        "longs": Provider.of<HomeProvider>(context,listen: false).long
      };
      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.newMatch}",data: data);

      if(response.statusCode == 200){
        if(response.data["Result"] == "true"){
          return NewMatchModel.fromJson(response.data);
        }else{
          return NewMatchModel.fromJson(response.data);
        }
      }else{
        emit(MatchErrorState(response.data["Result"]));
        return NewMatchModel.fromJson(response.data);
      }
    }catch(e){
      emit(MatchErrorState(e.toString()));
      rethrow;
    }
  }

  Future profileLikeDislikeApi(
      {required String uid,
        required String proId,
        required String action,
      }) async {
    try {
      Map data = {"uid": uid, "profile_id": proId, "action": action};

      Response response = await _api.sendRequest.post("${Config.baseUrlApi}${Config.likeDislike}", data: data);

      if (response.statusCode == 200) {
        if (response.data["Result"] == "true") {
          if (action == "LIKE" && response.data["is_match"] == true) {
            _sendMatchIcebreaker(partnerId: proId, currentUserId: uid);
          }
          return response.data["Result"];
        } else {
          Fluttertoast.showToast(msg: response.data["ResponseMsg"]);
        }
      }
    } catch (e) {
      emit(MatchErrorState(e.toString()));
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

  loadingState(){
    emit(MatchLoadingState());
  }

  completeState(passedModel,likeMeModel,newMatchModel,favListModel){
    emit(MatchCompleteState(passedModel,likeMeModel,newMatchModel,favListModel));
  }

}
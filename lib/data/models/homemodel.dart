import 'dart:convert';

HomeModel homeModelFromJson(String str) => HomeModel.fromJson(json.decode(str));
String homeModelToJson(HomeModel data) => json.encode(data.toJson());

class HomeModel {
  String? responseCode;
  String? result;
  String? responseMsg;
  List<Profilelist>? profilelist;
  String? currency;
  List<Profilelist>? totalliked;
  String? directChat;
  String? likeMenu;
  String? audioVideo;
  String? filterInclude;
  String? planName;
  String? planId;
  String? planDescription;
  String? isSubscribe;
  Plandata? plandata;
  String? chat;
  String? isVerify;
  String? coin;

  HomeModel({
    this.responseCode,
    this.result,
    this.responseMsg,
    this.profilelist,
    this.currency,
    this.totalliked,
    this.directChat,
    this.likeMenu,
    this.audioVideo,
    this.filterInclude,
    this.planName,
    this.planId,
    this.planDescription,
    this.isSubscribe,
    this.plandata,
    this.chat,
    this.isVerify,
    this.coin,
  });

  factory HomeModel.fromJson(Map<String, dynamic> json) => HomeModel(
    responseCode: json["ResponseCode"],
    result: json["Result"],
    responseMsg: json["ResponseMsg"],
    // Support both "profilelist" (new backend) and "data" (old)
    profilelist: _parseProfilelist(json["profilelist"] ?? json["data"]),
    currency: json["currency"],
    totalliked: _parseProfilelist(json["totalliked"]),
    directChat: json["direct_chat"],
    likeMenu: json["Like_menu"],
    audioVideo: json["audio_video"],
    filterInclude: json["filter_include"],
    planName: json["plan_name"],
    planId: json["plan_id"]?.toString(),
    planDescription: json["plan_description"],
    isSubscribe: json["is_subscribe"]?.toString(),
    plandata: json["plandata"] == null ? null : Plandata.fromJson(json["plandata"]),
    chat: json["chat"],
    isVerify: json["is_verify"]?.toString(),
    coin: json["coin"]?.toString(),
  );

  static List<Profilelist>? _parseProfilelist(dynamic raw) {
    if (raw == null) return [];
    try {
      return List<Profilelist>.from((raw as List).map((x) => Profilelist.fromJson(x)));
    } catch (_) {
      return [];
    }
  }

  Map<String, dynamic> toJson() => {
    "ResponseCode": responseCode,
    "Result": result,
    "ResponseMsg": responseMsg,
    "profilelist": profilelist == null ? [] : List<dynamic>.from(profilelist!.map((x) => x.toJson())),
    "currency": currency,
    "totalliked": totalliked == null ? [] : List<dynamic>.from(totalliked!.map((x) => x.toJson())),
    "direct_chat": directChat,
    "Like_menu": likeMenu,
    "audio_video": audioVideo,
    "filter_include": filterInclude,
    "plan_name": planName,
    "plan_id": planId,
    "plan_description": planDescription,
    "is_subscribe": isSubscribe,
    "plandata": plandata?.toJson(),
    "chat": chat,
    "is_verify": isVerify,
    "coin": coin,
  };
}

class Plandata {
  String? planTitle;
  String? planStartDate;
  String? planEndDate;
  String? transId;
  String? pName;
  String? amount;
  String? planDescription;

  Plandata({this.planTitle, this.planStartDate, this.planEndDate,
    this.transId, this.pName, this.amount, this.planDescription});

  factory Plandata.fromJson(Map<String, dynamic> json) => Plandata(
    planTitle: json["plan_title"],
    planStartDate: json["plan_start_date"],
    planEndDate: json["plan_end_date"],
    transId: json["trans_id"],
    pName: json["p_name"],
    amount: json["amount"]?.toString(),
    planDescription: json["plan_description"],
  );

  Map<String, dynamic> toJson() => {
    "plan_title": planTitle, "plan_start_date": planStartDate,
    "plan_end_date": planEndDate, "trans_id": transId,
    "p_name": pName, "amount": amount, "plan_description": planDescription,
  };
}

class Profilelist {
  String? profileId;
  String? profileName;
  String? profileBio;
  int? profileAge;
  String? isSubscribe;
  String? profileDistance;
  String? isVerify;
  List<String>? profileImages;
  double? matchRatio;
  String? userType;

  Profilelist({
    this.profileId, this.profileName, this.profileBio, this.profileAge,
    this.isSubscribe, this.isVerify, this.profileDistance,
    this.profileImages, this.matchRatio, this.userType,
  });

  factory Profilelist.fromJson(Map<String, dynamic> json) {
    // Build images from profile_images array OR from profile_pic + other_pic
    List<String> images = [];
    if (json["profile_images"] != null) {
      try {
        images = List<String>.from((json["profile_images"] as List).map((x) => x.toString()));
      } catch (_) {}
    }
    if (images.isEmpty) {
      final pic = json["profile_pic"]?.toString();
      if (pic != null && pic.isNotEmpty && pic != 'null') images.add(pic);
      try {
        final other = json["other_pic"]?.toString() ?? '[]';
        if (other.isNotEmpty && other != '[]') {
          final clean = other.replaceAll('[', '').replaceAll(']', '').replaceAll('"', '');
          for (final p in clean.split(',')) {
            final t = p.trim();
            if (t.isNotEmpty && t != 'null') images.add(t);
          }
        }
      } catch (_) {}
    }

    // Parse age safely
    int? age;
    if (json["profile_age"] != null) {
      age = int.tryParse(json["profile_age"].toString());
    }

    // Parse matchRatio safely — default 80 to avoid null crashes
    double ratio = 80.0;
    if (json["match_ratio"] != null) {
      ratio = double.tryParse(json["match_ratio"].toString()) ?? 80.0;
    }

    return Profilelist(
      profileId: json["profile_id"]?.toString() ?? json["id"]?.toString(),
      profileName: json["profile_name"] ?? json["name"],
      profileBio: json["profile_bio"],
      profileAge: age,
      isSubscribe: json["is_subscribe"]?.toString(),
      isVerify: json["is_verify"]?.toString(),
      profileDistance: json["profile_distance"] ?? '0 km',
      profileImages: images.isEmpty ? null : images,
      matchRatio: ratio,
      userType: json["user_type"],
    );
  }

  /// Safe getter — retourne les images ou une liste vide
  List<String> get safeImages => (profileImages != null && profileImages!.isNotEmpty)
      ? profileImages!
      : [];

  /// Première image ou null — utiliser avec ?? pour le placeholder
  String? get firstImage => safeImages.isNotEmpty ? safeImages.first : null;

  Map<String, dynamic> toJson() => {
    "profile_id": profileId, "profile_name": profileName,
    "profile_bio": profileBio, "profile_age": profileAge,
    "is_subscribe": isSubscribe, "profile_distance": profileDistance,
    "is_verify": isVerify,
    "profile_images": profileImages ?? [],
    "match_ratio": matchRatio,
  };
}

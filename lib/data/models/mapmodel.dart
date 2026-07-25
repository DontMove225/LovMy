import 'dart:convert';

MapModel mapModelFromJson(String str) => MapModel.fromJson(json.decode(str));
String mapModelToJson(MapModel data) => json.encode(data.toJson());

class MapModel {
  String? responseCode;
  String? result;
  String? responseMsg;
  List<Profilelist>? profilelist;

  MapModel({this.responseCode, this.result, this.responseMsg, this.profilelist});

  factory MapModel.fromJson(Map<String, dynamic> json) => MapModel(
    responseCode: json["ResponseCode"],
    result: json["Result"],
    responseMsg: json["ResponseMsg"],
    profilelist: _parse(json["profilelist"] ?? json["data"]),
  );

  static List<Profilelist>? _parse(dynamic raw) {
    if (raw == null) return [];
    try {
      return List<Profilelist>.from((raw as List).map((x) => Profilelist.fromJson(x)));
    } catch (_) { return []; }
  }

  Map<String, dynamic> toJson() => {
    "ResponseCode": responseCode, "Result": result, "ResponseMsg": responseMsg,
    "profilelist": profilelist == null ? [] : List<dynamic>.from(profilelist!.map((x) => x.toJson())),
  };
}

class Profilelist {
  String? profileId;
  String? profileName;
  String? profileBio;
  int? profileAge;
  String? profileLat;
  String? profileLongs;
  String? profileDistance;
  List<String>? profileImages;
  num? matchRatio;
  String? userType;

  Profilelist({this.profileId, this.profileName, this.profileBio, this.profileAge,
    this.profileLat, this.profileLongs, this.profileDistance, this.profileImages, this.matchRatio, this.userType});

  factory Profilelist.fromJson(Map<String, dynamic> json) {
    List<String> images = [];
    if (json["profile_images"] != null) {
      try { images = List<String>.from((json["profile_images"] as List).map((x) => x.toString())); } catch (_) {}
    }
    if (images.isEmpty) {
      final pic = json["profile_pic"]?.toString();
      if (pic != null && pic.isNotEmpty && pic != 'null') images.add(pic);
    }
    return Profilelist(
      profileId:    json["profile_id"]?.toString() ?? json["id"]?.toString(),
      profileName:  json["profile_name"] ?? json["name"],
      profileBio:   json["profile_bio"],
      profileAge:   json["profile_age"] != null ? int.tryParse(json["profile_age"].toString()) : null,
      profileLat:   json["profile_lat"]?.toString() ?? json["lats"]?.toString(),
      profileLongs: json["profile_longs"]?.toString() ?? json["longs"]?.toString(),
      profileDistance: json["profile_distance"] ?? '0 km',
      profileImages: images.isEmpty ? null : images,
      matchRatio:   json["match_ratio"] ?? 80,
      userType:     json["user_type"],
    );
  }

  Map<String, dynamic> toJson() => {
    "profile_id": profileId, "profile_name": profileName, "profile_bio": profileBio,
    "profile_age": profileAge, "profile_lat": profileLat, "profile_longs": profileLongs,
    "profile_distance": profileDistance,
    "profile_images": profileImages ?? [],
    "match_ratio": matchRatio,
    "user_type": userType,
  };
}

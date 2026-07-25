import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../../data/models/homemodel.dart' as home_model;
import '../../data/models/mapmodel.dart' as map_model;

/// Canned replies for FAKE_USER (dev/test-only) chat accounts — generic enough
/// to plausibly answer almost any opener.
const List<String> fakeReplies = [
  "Haha, sympa ! Raconte-moi en plus 😊",
  "Ah trop bien, j'adore ! Et toi, tu fais quoi de beau en ce moment ?",
  "Héhé, t'as l'air marrant(e) toi !",
  "Ça me plaît bien tout ça 😄",
  "Sérieux ? Raconte-moi ça !",
  "Mdr, j'avoue totalement !",
  "Intéressant... dis-m'en plus !",
  "Ahah carrément, on est sur la même longueur d'onde je crois",
  "Trop cool, ça donne envie d'en savoir plus sur toi",
  "Haha oui, complètement d'accord avec toi",
  "Ça a l'air sympa ! Tu fais ça souvent ?",
  "Petit coup de cœur pour ta répartie 😉",
  "Pas mal du tout ! Sinon, plutôt sortie ou soirée cocooning ?",
  "Ahah j'aime bien ta façon de voir les choses",
  "Ça donne le sourire, merci !",
  "Tiens tiens, intrigant tout ça !",
  "J'avoue que ça m'intrigue, tu peux développer ?",
  "Cool cool, on se ressemble un peu je trouve 😄",
];

String fakeChatRoomId(String a, String b) {
  final ids = [a, b]..sort();
  return ids.join("_");
}

/// Ensures a `datingUser` Firestore doc exists for every FAKE_USER profile in
/// [profiles] (a list of HomeModel.Profilelist or MapModel.Profilelist), so
/// the chat send flow and Discussion list can find them. Must run at
/// discovery time (home/map load) — the send flow silently drops messages if
/// the doc doesn't exist yet.
Future<void> ensureFakeDatingUserDocs(List<dynamic> profiles) async {
  for (final p in profiles) {
    String? id;
    String? userType;
    String? name;
    String? photo;

    if (p is home_model.Profilelist) {
      id = p.profileId;
      userType = p.userType;
      name = p.profileName;
      photo = p.firstImage;
    } else if (p is map_model.Profilelist) {
      id = p.profileId;
      userType = p.userType;
      name = p.profileName;
      photo = (p.profileImages != null && p.profileImages!.isNotEmpty) ? p.profileImages!.first : null;
    } else {
      continue;
    }

    if (userType != 'FAKE_USER' || id == null) continue;

    try {
      await FirebaseFirestore.instance.collection('datingUser').doc(id).set({
        'uid': id,
        'name': name ?? 'Utilisateur',
        'pro_pic': photo ?? '',
        'isOnline': false,
        'token': '',
        'isFake': true,
      }, SetOptions(merge: true));
    } catch (_) {
      // Best-effort — a single failed doc shouldn't block the rest.
    }
  }
}

/// Writes one message from a fake account to the real user, used both for
/// the immediate match icebreaker and for delayed ongoing replies.
Future<void> sendFakeMessage({
  required String fakeUserId,
  required String realUserId,
  required String fakeUserName,
  String? text,
}) async {
  final message = text ?? fakeReplies[Random().nextInt(fakeReplies.length)];
  final roomId = fakeChatRoomId(fakeUserId, realUserId);

  await FirebaseFirestore.instance
      .collection('chat_rooms')
      .doc(roomId)
      .collection('message')
      .add({
    'senderid': fakeUserId,
    'reciverId': realUserId,
    'message': message,
    'senderName': fakeUserName,
    'timestamp': Timestamp.now(),
  });
}

/// Returns true if [uid] is a FAKE_USER dev/test account, per its `datingUser` doc.
Future<bool> isFakeDatingUser(String uid) async {
  try {
    final doc = await FirebaseFirestore.instance.collection('datingUser').doc(uid).get();
    return doc.data()?['isFake'] == true;
  } catch (_) {
    return false;
  }
}

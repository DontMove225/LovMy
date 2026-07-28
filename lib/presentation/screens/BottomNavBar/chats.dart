// ignore_for_file: avoid_print, unused_local_variable

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lovmy/presentation/firebase/chatting_provider.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/homeProvider/homeprovier.dart';
import 'package:lovmy/presentation/widgets/appbarr.dart';
import 'package:lovmy/presentation/widgets/other_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../../core/config.dart';
import '../../../core/ui.dart';
import '../../../language/localization/app_localization.dart';
import '../../firebase/chat_page.dart';
import '../../firebase/chat_service.dart';

class ChatScreen extends StatefulWidget {
  static const chatScreenRoute = "/chatScreen";

  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> with AutomaticKeepAliveClientMixin<ChatScreen>, SingleTickerProviderStateMixin {
  late ChattingProvider chattingProvider;
  late final AnimationController _entranceController;

  @override
  void initState() {
    super.initState();
    chattingProvider = Provider.of<ChattingProvider>(context, listen: false);
    chattingProvider.getblockklisttApi(context);
    chattingProvider.searchController.clear();
    chattingProvider.isSearch = false;
    _entranceController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _entranceController.forward();
  }

  bool get wantKeepAlive => true;
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  /// Entrée fade+slide-up échelonnée pour les lignes de conversation,
  /// plafonnée aux 8 premières pour ne pas sur-chorégraphier une longue liste.
  Widget _listEntrance(int index, Widget child) {
    final cappedIndex = index.clamp(0, 7);
    final start = (0.08 * cappedIndex).clamp(0.0, 1.0);
    final end = (start + 0.5).clamp(0.0, 1.0);
    final curved = CurvedAnimation(parent: _entranceController, curve: Interval(start, end, curve: Curves.easeOut));
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    chattingProvider = Provider.of<ChattingProvider>(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: appbarr(
        context,
        AppLocalizations.of(context)?.translate("Chats") ?? "Chats",
        traling: InkWell(
          onTap: () {
            chattingProvider.updateIsSearch();
          },
          child: SvgPicture.asset(
            "assets/icons/Search.svg",
            height: 22,
            width: 22,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    AnimatedSize(
                      duration: const Duration(milliseconds: 220),
                      curve: Curves.easeOut,
                      child: chattingProvider.isSearch
                        ? TextField(
                            style: Theme.of(context).textTheme.bodySmall!,
                            controller: chattingProvider.searchController,
                            decoration: InputDecoration(
                                contentPadding: const EdgeInsets.all(15),
                                isDense: true,
                                hintStyle:
                                    Theme.of(context).textTheme.bodySmall!,
                                hintText: AppLocalizations.of(context)
                                        ?.translate("Search..") ??
                                    "Search..",
                                suffixIcon: InkWell(
                                  onTap: () {
                                    chattingProvider.updateIsSearch();
                                  },
                                  child: SizedBox(
                                      height: 25,
                                      width: 25,
                                      child: Center(
                                          child: SvgPicture.asset(
                                              "assets/icons/times.svg",
                                              height: 22,
                                              width: 22,
                                              colorFilter: ColorFilter.mode(
                                                  Theme.of(context)
                                                      .indicatorColor,
                                                  BlendMode.srcIn)))),
                                ),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(
                                      color: Theme.of(context)
                                          .dividerTheme
                                          .color!),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(
                                      color: Theme.of(context)
                                          .dividerTheme
                                          .color!),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide:
                                      BorderSide(color: AppColors.appColor),
                                ),
                                disabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(
                                      color: Theme.of(context)
                                          .dividerTheme
                                          .color!),
                                ),
                                errorBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide(
                                      color: Theme.of(context)
                                          .dividerTheme
                                          .color!),
                                )),
                            onChanged: (s) {
                              chattingProvider.searchIteam(s);
                            })
                        : const SizedBox(),
                    ),
                    chattingProvider.searchController.text.isEmpty
                        ? Expanded(child: _buildUserList())
                        : chattingProvider.searchIndexList.isEmpty
                                ? Expanded(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Text(
                                            AppLocalizations.of(context)
                                                    ?.translate(
                                                        "User Not Found") ??
                                                "User Not Found",
                                            style: Theme.of(context)
                                                .textTheme
                                                .bodySmall),
                                      ],
                                    ),
                                  )
                                : Expanded(
                                    child: ListView.builder(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      itemCount: chattingProvider.searchIndexList.length,
                                      itemBuilder: (context, index) {
                                        var result = chattingProvider.searchIndexList[index];
                                        var itemData = Map<String,dynamic>.from(chattingProvider.searchiteams[result]);
                                        return ListTile(
                                            dense: true,
                                            onTap: () {
                                              print("result result:- ${result}");
                                              Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (context) =>
                                                        ChattingPage(userData: itemData, proPic: chattingProvider.searchiteams[result]["image"], resiverUserId: chattingProvider.searchiteams[result]["uid"], resiverUseremail: chattingProvider.searchiteams[result]["name"],),
                                                  )
                                              );
                                            },
                                            contentPadding: const EdgeInsets.symmetric(vertical: 5),
                                            leading: chattingProvider.searchiteams[result]["image"] == "null"
                                                ? const CircleAvatar(
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    radius: 25,
                                                    backgroundImage: AssetImage(
                                                      "assets/Image/05.png",
                                                    ))
                                                : CircleAvatar(
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    radius: 25,
                                                    backgroundImage: NetworkImage(
                                                        "${Config.baseUrl}${chattingProvider.searchiteams[result]["image"]}"),
                                                  ),
                                            title: Text(
                                              chattingProvider.searchiteams[result]["name"],
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodyMedium!,
                                            ),
                                            subtitle: Text(
                                                chattingProvider
                                                        .searchiteams[result]
                                                    ["message"],
                                                style: Theme.of(context)
                                                    .textTheme
                                                    .bodySmall),
                                            trailing: Text(
                                              DateFormat('hh:mm a')
                                                  .format(DateTime
                                                      .fromMicrosecondsSinceEpoch(
                                                          chattingProvider
                                                              .searchiteams[
                                                                  result]
                                                                  ["timestamp"]
                                                              .microsecondsSinceEpoch))
                                                  .toString(),
                                              style:
                                                  const TextStyle(fontSize: 10),
                                            ));
                                      },
                                    ),
                                  ),
                  ],
                ),
              ),
      ),
    );
  }



  // Widget _buildUserList() {
  //   return StreamBuilder(
  //       stream: FirebaseFirestore.instance.collection("datingUser").snapshots(),
  //       builder: (context, snapshot) {
  //         if (snapshot.hasError) {
  //           return const Text("Error");
  //         }
  //         if (snapshot.connectionState == ConnectionState.waiting) {
  //           return ListTile(
  //             contentPadding: const EdgeInsets.symmetric(vertical: 5),
  //             leading: commonSimmer(height: 50, width: 50, radius: 50),
  //             title: Row(
  //               children: [
  //                 commonSimmer(height: 10, width: 50, radius: 10),
  //               ],
  //             ),
  //             subtitle: Row(
  //               children: [
  //                 commonSimmer(height: 10, width: 30, radius: 10),
  //               ],
  //             ),
  //             trailing: commonSimmer(height: 10, width: 30, radius: 10),
  //           );
  //         } else {
  //           return ListView(
  //             // scrollDirection: Axis.vertical,
  //             // physics: NeverScrollableScrollPhysics(),
  //             // controller: _scrollController,
  //             shrinkWrap: true,
  //             children: snapshot.data!.docs.map<Widget>((doc) {
  //               return _buildUserListIteam(doc, snapshot.data!.docs.length);
  //             }
  //            ).toList(),
  //           );
  //           // return ListView.builder(
  //           //   controller: _scrollController,
  //           //   shrinkWrap: true,
  //           //   itemCount: snapshot.data!.docs.length,
  //           //   itemBuilder: (context, index) {
  //           //     final doc = snapshot.data!.docs[index];
  //           //     return _buildUserListIteam(doc, snapshot.data!.docs.length);
  //           //   },
  //           // );
  //         }
  //       });
  // }
  //
  // Widget _buildMessageiteam(document, String email, String uid, String proPic, int legnth, var snapshot) {
  //   Map<String, dynamic> data = document.data() as Map<String, dynamic>;
  //
  //   List apilist = [];
  //
  //   apilist.addAll(chattingProvider.getblockListApi.blockByMe as Iterable);
  //   apilist.addAll(chattingProvider.getblockListApi.blockByOther as Iterable);
  //   print("  + + + + :---  $apilist");
  //
  //   if (chattingProvider.searchiteams.length < legnth - 1) {
  //     if (snapshot.data!.docs.isNotEmpty) {
  //       chattingProvider.searchiteams.add({
  //         "name": email,
  //         "image": proPic,
  //         "uid": uid,
  //         "message": data["message"],
  //         "timestamp": data["timestamp"]
  //       });
  //     }
  //   }
  //
  //   return apilist.contains(uid)
  //       ? const SizedBox()
  //       : ListTile(
  //           dense: true,
  //           onTap: () {
  //             Navigator.push(
  //                 context,
  //                 MaterialPageRoute(
  //                   builder: (context) => ChattingPage(
  //                     proPic: proPic,
  //                     resiverUserId: uid,
  //                     resiverUseremail: email,
  //                     userData: data,
  //                   ),
  //                 )
  //             );
  //           },
  //           contentPadding: const EdgeInsets.symmetric(vertical: 5),
  //           leading: proPic == "null" ? const CircleAvatar(
  //                   backgroundColor: Colors.transparent,
  //                   radius: 25,
  //                   backgroundImage: AssetImage(
  //                     "assets/Image/05.png",
  //                   )) : CircleAvatar(
  //                   backgroundColor: Colors.transparent,
  //                   radius: 25,
  //                   backgroundImage: NetworkImage("${Config.baseUrl}$proPic"),
  //                 ),
  //           title: Text(
  //             email,
  //             style: Theme.of(context).textTheme.bodyMedium!,
  //           ),
  //           subtitle: Text(data["message"],
  //               maxLines: 1,
  //               overflow: TextOverflow.ellipsis,
  //               style: Theme.of(context).textTheme.bodySmall),
  //           trailing: Text(
  //               DateFormat('hh:mm a')
  //                   .format(DateTime.fromMicrosecondsSinceEpoch(
  //                       data["timestamp"].microsecondsSinceEpoch))
  //                   .toString(),
  //               style: const TextStyle(
  //                 fontSize: 10,
  //               ))
  //   );
  // }
  //
  // ChatServices chatservices = ChatServices();
  //
  // Widget _buildUserListIteam(DocumentSnapshot document, int legth) {
  //   Map<String, dynamic> data = document.data()! as Map<String, dynamic>;
  //   print("firebase data :- ${data}");
  //   var uid = Provider.of<HomeProvider>(context, listen: false).uid;
  //   List ids = [data["uid"], uid];
  //
  //   if (Provider.of<HomeProvider>(context, listen: false).userlocalData.userLogin!.name != data["name"]) {
  //     return StreamBuilder(
  //         stream: chatservices.getMessage(userId: data["uid"], otherUserId: Provider.of<HomeProvider>(context, listen: false).uid),
  //         builder: (context, snapshot) {
  //           if (snapshot.hasError) {
  //             return Text("Error${snapshot.error}",style: Theme.of(context).textTheme.bodySmall);
  //           }
  //           if (snapshot.connectionState == ConnectionState.waiting) {
  //             return const SizedBox();
  //           } else {
  //             return snapshot.data!.docs.isEmpty
  //                 ? const SizedBox()
  //                 : _buildMessageiteam(snapshot.data!.docs.last, data["name"],
  //                     data["uid"], data["pro_pic"].toString(), legth, snapshot);
  //           }
  //         });
  //     // return Container(
  //     //   height: 40,
  //     //   width: 300,
  //     //   color: Colors.red,
  //     //   margin: EdgeInsets.all(8),
  //     // );
  //   } else {
  //     return const SizedBox();
  //   }
  // }


  Widget _buildUserList() {
    return StreamBuilder(
      stream: FirebaseFirestore.instance.collection("datingUser").snapshots(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Text("Error");
        }
        if (snapshot.connectionState == ConnectionState.waiting) {
          return ListTile(
            contentPadding: const EdgeInsets.symmetric(vertical: 5),
            leading: commonSimmer(height: 50, width: 50, radius: 50),
            title: Row(
              children: [
                commonSimmer(height: 10, width: 50, radius: 10),
              ],
            ),
            subtitle: Row(
              children: [
                commonSimmer(height: 10, width: 30, radius: 10),
              ],
            ),
            trailing: commonSimmer(height: 10, width: 30, radius: 10),
          );
        } else {
          List<DocumentSnapshot> userDocs = snapshot.data!.docs;
          List<Future<Map<String, dynamic>>> userWithTimestamps = userDocs.map((userDoc) async {
            var userId = userDoc['uid'];
            var currentUserId = Provider.of<HomeProvider>(context, listen: false).uid;

            // Construct the chat room ID
            String chatRoomId = userId.compareTo(currentUserId) < 0
                ? '${userId}_$currentUserId'
                : '${currentUserId}_$userId';

            // Fetch the latest message in the chat room
            var messagesQuery = await FirebaseFirestore.instance.collection("chat_rooms").doc(chatRoomId).collection("message").orderBy("timestamp", descending: true).limit(1).get();

            // Extract the latest timestamp and message
            if (messagesQuery.docs.isNotEmpty) {
              var latestMessageDoc = messagesQuery.docs.first;
              return {
                "userDoc": userDoc,
                "latestMessage": latestMessageDoc["message"],
                "latestTimestamp": latestMessageDoc["timestamp"].millisecondsSinceEpoch,
              };
            } else {
              return {
                "userDoc": userDoc,
                "latestMessage": null,
                "latestTimestamp": 0,
              };
            }
          }).toList();

          // Écoute tous les messages (collectionGroup) juste pour déclencher un
          // re-fetch des derniers messages par utilisateur dès qu'un nouveau
          // message est envoyé/reçu — sans ça la liste ne se met à jour que si
          // la collection "datingUser" change, jamais quand on écrit un message.
          return StreamBuilder(
            stream: FirebaseFirestore.instance.collectionGroup("message").snapshots(),
            builder: (context, _) {
          return FutureBuilder(
            future: Future.wait(userWithTimestamps),
            builder: (context, AsyncSnapshot<List<Map<String, dynamic>>> userSnapshot) {
              if (!userSnapshot.hasData) {
                return AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: KeyedSubtree(
                    key: const ValueKey('chats-loading'),
                    child: ListTile(
                      contentPadding: const EdgeInsets.symmetric(vertical: 5),
                      leading: commonSimmer(height: 50, width: 50, radius: 50),
                      title: Row(
                        children: [
                          commonSimmer(height: 10, width: 50, radius: 10),
                        ],
                      ),
                      subtitle: Row(
                        children: [
                          commonSimmer(height: 10, width: 30, radius: 10),
                        ],
                      ),
                      trailing: commonSimmer(height: 10, width: 30, radius: 10),
                    ),
                  ),
                );
              }

              // Sort the users based on their latest message timestamp
              List<Map<String, dynamic>> sortedUsers = userSnapshot.data!;
              sortedUsers.sort((a, b) {
                return b["latestTimestamp"].compareTo(a["latestTimestamp"]);
              });

              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: KeyedSubtree(
                  key: const ValueKey('chats-loaded'),
                  child: SingleChildScrollView(
                    child: ListView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      shrinkWrap: true,
                      itemCount: sortedUsers.length,
                      itemBuilder: (context, index) {
                        final userDoc = sortedUsers[index]["userDoc"];
                        final latestMessage = sortedUsers[index]["latestMessage"];
                        return _buildUserListItem(userDoc, userDocs.length, index);
                      },
                    ),
                  ),
                ),
              );
            },
          );
            },
          );
        }
      },
    );
  }


  Widget _buildMessageItem(document, String email, String uid, String proPic, int legnth, var snapshot, int index) {
    Map<String, dynamic> data = document.data() as Map<String, dynamic>;

    List apilist = [];
    apilist.addAll(chattingProvider.getblockListApi.blockByMe as Iterable);
    apilist.addAll(chattingProvider.getblockListApi.blockByOther as Iterable);
    print("  + + + + :---  $apilist");

    if (chattingProvider.searchiteams.length < legnth - 1) {
      if (snapshot.data!.docs.isNotEmpty) {
        chattingProvider.searchiteams.add({
          "name": email,
          "image": proPic,
          "uid": uid,
          "message": data["message"],
          "timestamp": data["timestamp"]
        });
      }
    }
    return apilist.contains(uid)
        ? const SizedBox()
        : _listEntrance(index, ListTile(
        dense: true,
        onTap: () {
          Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChattingPage(
                  proPic: proPic,
                  resiverUserId: uid,
                  resiverUseremail: email,
                  userData: data,
                ),
              ));
        },
        contentPadding: const EdgeInsets.symmetric(vertical: 5),
        leading: proPic == "null"
            ? const CircleAvatar(
            backgroundColor: Colors.transparent,
            radius: 25,
            backgroundImage: AssetImage(
              "assets/Image/05.png",
              // "assets/Image/appmainLogo1.png",
            ))
            : CircleAvatar(
          backgroundColor: Colors.transparent,
          radius: 25,
          backgroundImage: NetworkImage("${Config.baseUrl}$proPic"),
        ),
        title: Text(
          email,
          style: Theme.of(context).textTheme.bodyMedium!,
        ),
        subtitle: Text(data["message"],
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.bodySmall),
        trailing: Text(
            DateFormat('hh:mm a')
                .format(DateTime.fromMicrosecondsSinceEpoch(
                data["timestamp"].microsecondsSinceEpoch))
                .toString(),
            style: const TextStyle(
              fontSize: 10,
            ))));
  }

  ChatServices chatServices = ChatServices();

  Widget _buildUserListItem(DocumentSnapshot document, int legth, int index) {
    Map<String, dynamic> data = document.data()! as Map<String, dynamic>;
    var uid = Provider.of<HomeProvider>(context, listen: false).uid;
    List ids = [data["uid"], uid];

    if (Provider.of<HomeProvider>(context, listen: false).userlocalData.userLogin!.name != data["name"]) {
      return StreamBuilder(stream: chatServices.getMessage(userId: data["uid"], otherUserId: Provider.of<HomeProvider>(context, listen: false).uid),
          builder: (context, snapshot) {
            if (snapshot.hasError) {
              return Text("Error${snapshot.error}",
                  style: Theme.of(context).textTheme.bodySmall);
            }
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const SizedBox();
            } else {
              return snapshot.data!.docs.isEmpty
                  ? const SizedBox()
                  : _buildMessageItem(snapshot.data!.docs.last, data["name"], data["uid"], data["pro_pic"].toString(), legth, snapshot, index);
            }
          });
    } else {
      return const SizedBox();
    }
  }

}

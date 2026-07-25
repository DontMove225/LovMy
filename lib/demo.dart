import 'package:lovmy/presentation/screens/splash_bording/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:agora_rtc_engine/agora_rtc_engine.dart';
import 'package:permission_handler/permission_handler.dart';

// const String appId = "YOUR_APP_ID";
// const String token = "YOUR_TEMP_TOKEN";
const String channelName = "test_channel";

// void main() => runApp(const MyApp());

// class MyApp extends StatelessWidget {
//   const MyApp({super.key});
//   @override
//   Widget build(BuildContext context) => const MaterialApp(home: VideoCallPage());
// }

class VideoCallPage extends StatefulWidget {
  const VideoCallPage({super.key});

  @override
  State<VideoCallPage> createState() => _VideoCallPageState();
}

class _VideoCallPageState extends State<VideoCallPage> {
  late RtcEngine _engine;
  int? _remoteUid;
  bool _joined = false;

  @override
  void initState() {
    super.initState();
    _initAgora();
  }

  Future<void> _initAgora() async {
    await [Permission.microphone, Permission.camera].request();

    _engine = createAgoraRtcEngine();
    await _engine.initialize(
      RtcEngineContext(
        appId: agoraVcKey,
        channelProfile: ChannelProfileType.channelProfileLiveBroadcasting,
      ),
    );

    await _engine.setClientRole(role: ClientRoleType.clientRoleBroadcaster);

    _engine.registerEventHandler(
      RtcEngineEventHandler(
        onJoinChannelSuccess: (conn, elapsed) {
          setState(() {
            _joined = true;
          });
        },
        onUserJoined: (conn, remoteUid, elapsed) {
          setState(() {
            _remoteUid = remoteUid;
          });
        },
        onUserOffline: (conn, remoteUid, reason) {
          setState(() {
            _remoteUid = null;
          });
        },
      ),
    );

    await _engine.enableVideo();
    await _engine.startPreview();

    await _engine.joinChannel(
      token: agoraVcKey,
      channelId: channelName,
      uid: 0,
      options: const ChannelMediaOptions(),
    );
  }

  @override
  void dispose() {
    _engine.leaveChannel();
    _engine.release();
    super.dispose();
  }

  Widget _renderLocalPreview() {
    if (_joined) {
      return AgoraVideoView(
        controller: VideoViewController(
          rtcEngine: _engine,
          canvas: VideoCanvas(uid: 0),
        ),
      );
    } else {
      return const Center(child: Text('Joining channel...'));
    }
  }

  Widget _renderRemoteVideo() {
    if (_remoteUid != null) {
      return AgoraVideoView(
        controller: VideoViewController.remote(
          rtcEngine: _engine,
          canvas: VideoCanvas(uid: _remoteUid),
          connection: RtcConnection(channelId: channelName),
        ),
      );
    } else {
      return const Center(child: Text('Waiting for remote user...'));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Agora Video Call')),
      body: Stack(
        children: [
          Center(child: _renderRemoteVideo()),
          Align(
            alignment: Alignment.topLeft,
            child: SizedBox(
              width: 120,
              height: 160,
              child: Card(
                elevation: 4,
                child: _renderLocalPreview(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:lovmy/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../Logic/cubits/onBording_cubit/onbording_cubit.dart';
import '../../../core/ui.dart';


// 4321098767 :- abcdef
// 9909909901 :- 123


String android_bannerid = "";
String android_in_id = "";

String ios_bannerid = "";
String ios_in_id = "";
String agoraVcKey = "";

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  static const String splashScreenRoute = "/";
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  // Entrée : fondu + pop élastique du logo
  late final AnimationController _entranceController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  );
  late final Animation<double> _fadeAnimation = CurvedAnimation(
    parent: _entranceController,
    curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
  );
  late final Animation<double> _scaleAnimation = CurvedAnimation(
    parent: _entranceController,
    curve: Curves.elasticOut,
  );
  late final Animation<Offset> _slideAnimation = Tween<Offset>(
    begin: const Offset(-1.4, 0),
    end: Offset.zero,
  ).animate(CurvedAnimation(
    parent: _entranceController,
    curve: Curves.easeOutCubic,
  ));

  // Battement de coeur en boucle une fois le logo apparu
  late final AnimationController _pulseController = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1100),
  );
  late final Animation<double> _pulseAnimation = TweenSequence<double>([
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.08), weight: 10),
    TweenSequenceItem(tween: Tween(begin: 1.08, end: 1.0), weight: 10),
    TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.05), weight: 10),
    TweenSequenceItem(tween: Tween(begin: 1.05, end: 1.0), weight: 10),
    TweenSequenceItem(tween: ConstantTween(1.0), weight: 60),
  ]).animate(CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut));

  @override
  void initState() {
    super.initState();

    _entranceController.forward().whenComplete(() {
      _pulseController.repeat();
    });

    // Démarrer la géolocalisation en parallèle
    Provider.of<OnBordingProvider>(context, listen: false).getCurrentLatAndLong(context);

    // Appel smstypeapi — si ça échoue, on continue quand même
    BlocProvider.of<OnbordingCubit>(context).smstypeapi(context).then((value) {
      if (value != null) {
        android_bannerid = value["banner_id"] ?? "";
        android_in_id    = value["in_id"] ?? "";
        ios_bannerid     = value["ios_banner_id"] ?? "";
        ios_in_id        = value["ios_in_id"] ?? "";
        agoraVcKey       = value["agora_app_id"] ?? "";
        print("agoraVcKey:- $agoraVcKey");
        fun();
      }
    }).catchError((e) {
      // smstypeapi a échoué — on laisse getCurrentLatAndLong gérer la navigation
      print("smstypeapi error (ignored): $e");
    });
  }
  
  
  fun() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.setString("maintainanceenabled", onbordingCubit.smaTypeApiModel!.maintainanceEnabled);
    prefs.setString("otpauth", onbordingCubit.smaTypeApiModel!.otpAuth);
  }

  late OnbordingCubit onbordingCubit;

  @override
  void dispose() {
    _entranceController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    onbordingCubit = Provider.of<OnbordingCubit>(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: AnimatedBuilder(
          animation: Listenable.merge([_entranceController, _pulseController]),
          builder: (context, child) {
            final scale = _scaleAnimation.value * _pulseAnimation.value;
            return Opacity(
              opacity: _fadeAnimation.value,
              child: FractionalTranslation(
                translation: _slideAnimation.value,
                child: Transform.scale(
                  scale: scale,
                  child: child,
                ),
              ),
            );
          },
          child: SizedBox(
            width: 220,
            height: 220,
            child: Stack(
              alignment: Alignment.center,
              children: [
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, _) {
                    final glowScale = 1.0 + (_pulseAnimation.value - 1.0) * 2;
                    return Transform.scale(
                      scale: glowScale,
                      child: Container(
                        width: 190,
                        height: 190,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              AppColors.passionRed.withValues(alpha: 0.28),
                              AppColors.passionRed.withValues(alpha: 0.0),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
                Image.asset(
                  "assets/Image/Logo_LovMy_splash_screen.png",
                  height: 180,
                  width: 180,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

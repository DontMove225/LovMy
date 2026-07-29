import 'dart:async';
import 'dart:io' show Platform;
import 'package:camera/camera.dart';
import 'package:lovmy/Logic/cubits/auth_cubit/auth_cubit.dart';
import 'package:lovmy/Logic/cubits/auth_cubit/auth_state.dart';
import 'package:lovmy/core/ui.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/bottombar.dart';
import 'package:lovmy/presentation/screens/splash_bording/creat_steps.dart';
import 'package:lovmy/presentation/screens/auth/login_screen.dart';
import 'package:lovmy/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:lovmy/presentation/widgets/main_button.dart';
import 'package:lovmy/presentation/widgets/other_widget.dart';
import 'package:lovmy/presentation/widgets/sizeboxx.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Logic/cubits/onBording_cubit/onbording_cubit.dart';
import '../../../language/localization/app_localization.dart';
import '../other/profileScreen/profile_page.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  static const String authScreenRoute = "/authScreen";
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> with TickerProviderStateMixin {
  late OnBordingProvider onBordingProvider;
  late final AnimationController _entranceController;

  @override
  void initState() {
    _requestCameraPermission();

    setOnbordingFalse();
    BlocProvider.of<OnbordingCubit>(context).smstypeapi(context);
    _entranceController = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _entranceController.forward();
    super.initState();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  /// Entrée fade+slide-up échelonnée (chaque élément part un peu après le
  /// précédent) pour la colonne de boutons, pilotée par [_entranceController].
  Widget _staggeredEntry(int index, Widget child) {
    final start = (0.12 * index).clamp(0.0, 1.0);
    final end = (start + 0.6).clamp(0.0, 1.0);
    final curved = CurvedAnimation(parent: _entranceController, curve: Interval(start, end, curve: Curves.easeOut));
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  }

  late OnbordingCubit onbordingCubit;

  Future<void> _requestCameraPermission() async {
    PermissionStatus status = await Permission.camera.request();
    if (status.isGranted) {
      imagecontroller = CameraController(
        cameras[0],
        ResolutionPreset.medium,
        enableAudio: false,
      );
      initializeControllerFuture = imagecontroller.initialize();
    } else {
      print('Camera permission is not granted');
    }
  }

  setOnbordingFalse() async {
    SharedPreferences preferences = await SharedPreferences.getInstance();
    preferences.setBool("Onbording", false);
  }

  @override
  Widget build(BuildContext context) {
    onBordingProvider = Provider.of<OnBordingProvider>(context);
    onbordingCubit = Provider.of<OnbordingCubit>(context);
    return Scaffold(
      body: Stack(
        children: [

          const ImageSlider(
            imageUrls: [
              'assets/Image/img1.jpg',
              'assets/Image/img2.jpg',
              'assets/Image/img3.jpg',
            ],
          ),
          Positioned(
            bottom: 0,
            child: Container(
              height: MediaQuery.of(context).size.height,
              width: MediaQuery.of(context).size.width,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: const [0.1, 1, 1.3],
                  colors: [
                    Colors.transparent,
                    AppColors.auroraIndigo.withOpacity(0.85),
                    AppColors.auroraIndigo,
                  ],
                ),
              ),
            ),
          ),

          Stack(
            children: [

              Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const SizBoxH(size: 0.02),
                        const Spacer(flex: 6),
                        Text(AppLocalizations.of(context)?.translate("Let's dive in into your account!") ?? "Let's dive in into your account!",style: Theme.of(context).textTheme.bodyMedium!.copyWith(color: AppColors.white),),

                        const SizedBox(height: 10,),
                        _staggeredEntry(0, Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            if (Platform.isAndroid)
                              _SocialIconButton(
                                iconPath: "assets/icons/google.svg",
                                onTap: () {
                                  BlocProvider.of<AuthCubit>(context).signInWithGoogle(context);
                                },
                              ),
                            if (Platform.isAndroid) const SizedBox(width: 18),
                            _SocialIconButton(
                              iconPath: "assets/icons/facebook.svg",
                              onTap: () {
                                Fluttertoast.showToast(msg: AppLocalizations.of(context)?.translate("Coming soon") ?? "Bientôt disponible");
                              },
                            ),
                            if (Platform.isIOS) const SizedBox(width: 18),
                            if (Platform.isIOS)
                              _SocialIconButton(
                                iconPath: "assets/icons/applelogo.svg",
                                onTap: () {
                                  Fluttertoast.showToast(msg: AppLocalizations.of(context)?.translate("Coming soon") ?? "Bientôt disponible");
                                },
                              ),
                          ],
                        )),

                        const SizBoxH(size: 0.018),
                        Image.asset("assets/Image/appmainLogo1.png", height: 36, width: 36),
                        const SizBoxH(size: 0.012),
                        _staggeredEntry(1, Row(
                          children: [
                          Expanded(child: MainButton(
                            title: AppLocalizations.of(context)?.translate("Continue with Email/Mobile Number") ?? "Continue with Email/Mobile Number",
                            gradient: AppColors.gradientAurora,
                            glowColor: AppColors.auroraViolet,
                            onTap: () {
                            onBordingProvider.updatestepsCount(0);
                            Navigator.pushNamed(context, CreatSteps.creatStepsRoute);
                            // Navigator.push(context, MaterialPageRoute(builder: (context) => CreatSteps(),));
                          },)),
                        ],)),
                        // onbordingCubit.smaTypeApiModel?.socialLoginEnabled == "No" ?
                        SizedBox(height: 20,),
                            // :  const Spacer(),
                        _staggeredEntry(2, InkWell(
                          onTap: () async {
                            print("done");
                          },
                          child: RichText(
                              text: TextSpan(children: [
                            TextSpan(
                                text: AppLocalizations.of(context)?.translate("I have an account? ") ?? "I have an account? ",
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    Navigator.pushNamed(context, LoginScreen.loginRoute);
                                  },
                                style: Theme.of(context).textTheme.bodySmall!.copyWith(color: AppColors.white)),
                            TextSpan(
                                text: "Login",
                                recognizer: TapGestureRecognizer()
                                  ..onTap = () {
                                    Navigator.pushNamed(context, LoginScreen.loginRoute);
                                  },
                                style: Theme.of(context).textTheme.bodySmall!.copyWith(color: AppColors.white,fontWeight: FontWeight.bold)),
                          ])),
                        )),

                        const SizedBox(height: 10,),

                      ])),

              BlocConsumer<AuthCubit, AuthStates>(
                  listener: (context, state)  {

                if (state is AuthErrorState) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(state.errorMessage)));
                }

                if (state is AuthErrorGoogle) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context)?.translate("Google sign-in failed") ?? "Google sign-in failed")));
                }

                if (state is AuthLoggedInState) {
                  Navigator.pushNamed(context, CreatSteps.creatStepsRoute);
                  onBordingProvider.setDataInFildes(state.firebaseuser);
                }

                if (state is AuthUserHomeState) {
                  Navigator.pushNamedAndRemoveUntil(context, BottomBar.bottomBarRoute, (route) => false);
                }

              }, builder: (context, state) {
                if (state is AuthLoading) {
                  return Center(child: CircularProgressIndicator(color: AppColors.appColor));
                } else {
                  return const SizedBox();
                }
              })

            ],
          ),

        ],
      ),
    );
  }
}

/// Petit bouton rond de connexion sociale — Google (Android), Facebook
/// (toutes plateformes) et Apple (iOS) sont affichés conditionnellement par
/// [Platform] à l'appel de ce widget, pas ici.
class _SocialIconButton extends StatelessWidget {
  final String iconPath;
  final VoidCallback onTap;

  const _SocialIconButton({required this.iconPath, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return PressScale(
      onTap: onTap,
      child: Container(
        height: 52,
        width: 52,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Center(
          child: SvgPicture.asset(iconPath, height: 22, width: 22),
        ),
      ),
    );
  }
}

class ImageSlider extends StatefulWidget {
  final List<String> imageUrls;

  const ImageSlider({super.key, required this.imageUrls});

  @override
  ImageSliderState createState() => ImageSliderState();
}

class ImageSliderState extends State<ImageSlider> {
  int _currentPage = 0;
  late Timer _timer;

  @override
  void initState() {
    super.initState();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _startAutoPlay() {
    _timer = Timer.periodic(const Duration(seconds: 5), (timer) {
      setState(() {
        _currentPage = (_currentPage + 1) % widget.imageUrls.length;
      });
    });
  }

  @override
  Widget build(BuildContext context) {

    return AnimatedSwitcher(
      duration: const Duration(seconds: 5),

      // Effet Ken Burns : léger zoom lent sur chaque image pendant tout le
      // cycle d'affichage, en plus du fondu enchaîné existant.
      child: TweenAnimationBuilder<double>(
        key: ValueKey<int>(_currentPage),
        tween: Tween<double>(begin: 1.0, end: 1.06),
        duration: const Duration(seconds: 5),
        curve: Curves.easeOut,
        builder: (context, scale, child) => Transform.scale(
          scale: scale,
          child: child,
        ),
        child: Image.asset(
          widget.imageUrls[_currentPage],
          fit: BoxFit.cover,
          height: MediaQuery.of(context).size.height,
          width: MediaQuery.of(context).size.width,
        ),
      ),

      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: child,
        );
      },

    );
  }
}

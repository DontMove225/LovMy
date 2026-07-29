import 'package:lovmy/presentation/widgets/main_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../../Logic/cubits/onBording_cubit/onbording_cubit.dart';
import '../../../core/notifications.dart';
import '../../../core/ui.dart';
import '../../../language/localization/app_localization.dart';
import '../../widgets/other_widget.dart';
import '../BottomNavBar/home_screen.dart';
import '../Splash_Bording/auth_screen.dart';
import 'onBordingProvider/onbording_provider.dart';

class OnBoardingScreen extends StatefulWidget {
  static const String onBoardingScreenRoute = "/OnBoardingScreen";
  const OnBoardingScreen({Key? key}) : super(key: key);

  @override
  State<OnBoardingScreen> createState() => _OnBoardingScreenState();
}

class _OnBoardingScreenState extends State<OnBoardingScreen> {

  late OnBordingProvider onBordingProvider;

  @override
  void initState() {
    requestPermission();
    BlocProvider.of<OnbordingCubit>(context).smstypeapi(context);
    // TODO: implement initState
    super.initState();
  }
  late OnbordingCubit onbordingCubit;


  @override
  Widget build(BuildContext context) {
    onBordingProvider = Provider.of<OnBordingProvider>(context);
    onbordingCubit = Provider.of<OnbordingCubit>(context);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          PageView.builder(
            controller: onBordingProvider.onbordingScroll,
            onPageChanged: (value) {
              onBordingProvider.updateOnboradingCurrent(value);
            },
            itemCount: onBordingProvider.onBordingData.length,
            itemBuilder: (context, index){
              return Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    decoration:  BoxDecoration(
                      image: DecorationImage(image: AssetImage(onBordingProvider.onBordingData[index]["image"]))
                    ),
                    height: MediaQuery.of(context).size.height,width: MediaQuery.of(context).size.width,),
                  if (onBordingProvider.onBordingData[index]["lottie"] != null)
                    Positioned(
                      bottom: MediaQuery.of(context).size.height * 0.3,
                      child: SizedBox(
                        height: 180,
                        width: 180,
                        child: Lottie.asset(onBordingProvider.onBordingData[index]["lottie"], repeat: true, fit: BoxFit.contain),
                      ),
                    ),
                ],
              );
            }
          ),
          Padding(
            padding: const EdgeInsets.all(15),
            child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    height: 25,
                    width : MediaQuery.of(context).size.width,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [

                        ...List.generate(
                            onBordingProvider.onBordingData.length,
                                (index) {
                              return Indicator(
                                isActive: onBordingProvider.onboradingCurrent == index ? true : false,
                              );
                            }),

                      ],
                    ),
                  ),
                  const SizedBox(height: 10,),
                  ClipRect(
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 320),
                      switchInCurve: Curves.easeOut,
                      switchOutCurve: Curves.easeIn,
                      transitionBuilder: (child, animation) => FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(begin: const Offset(0, 0.25), end: Offset.zero).animate(animation),
                          child: child,
                        ),
                      ),
                      child: Text(
                        onBordingProvider.onBordingData[onBordingProvider.onboradingCurrent]["title"],
                        key: ValueKey(onBordingProvider.onboradingCurrent),
                        style: Theme.of(context).textTheme.headlineSmall,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20,),
                   onBordingProvider.onboradingCurrent == onBordingProvider.onBordingData.length-1 ? Row(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       Expanded(child: PressScale(
                           onTap: () async {
                             SharedPreferences prefs = await SharedPreferences.getInstance();
                             prefs.setString("maintainanceenabled", onbordingCubit.smaTypeApiModel?.maintainanceEnabled ?? "No");
                             Navigator.pushNamedAndRemoveUntil(context, AuthScreen.authScreenRoute, (route) => false);
                           },
                           child: Text(AppLocalizations.of(context)?.translate("Skip") ?? "Skip",style: Theme.of(context).textTheme.bodyLarge!.copyWith(fontWeight: FontWeight.w700),textAlign: TextAlign.center,))
                       ),
                       Expanded(
                         child: MainButton(title: AppLocalizations.of(context)?.translate("Let's Start") ?? "Let's Start",radius: 80,gradient: AppColors.gradientAurora,glowColor: AppColors.auroraViolet,onTap: () async {
                           SharedPreferences prefs = await SharedPreferences.getInstance();
                           prefs.setString("maintainanceenabled", onbordingCubit.smaTypeApiModel?.maintainanceEnabled ?? "No");
                           Navigator.pushNamedAndRemoveUntil(context, AuthScreen.authScreenRoute, (route) => false);
                         },),
                       ),
                     ],
                   ) :Row(
                       children: [
                    Expanded(child: PressScale(
                        onTap: () async {
                          SharedPreferences prefs = await SharedPreferences.getInstance();
                          prefs.setString("maintainanceenabled", onbordingCubit.smaTypeApiModel?.maintainanceEnabled ?? "No");
                          Navigator.pushNamedAndRemoveUntil(context, AuthScreen.authScreenRoute, (route) => false);
                        },
                        child: Text(AppLocalizations.of(context)?.translate("Skip") ?? "Skip",style: Theme.of(context).textTheme.bodyLarge!.copyWith(fontWeight: FontWeight.w700),textAlign: TextAlign.center,))
                    ),
                     Expanded(child: MainButton(title: AppLocalizations.of(context)?.translate("Next") ?? "Next",radius: 80,gradient: AppColors.gradientAurora,glowColor: AppColors.auroraViolet,onTap: () {
                       onBordingProvider.onbordingScroll.jumpToPage(onBordingProvider.onboradingCurrent+1);
                    },)),
                  ]),
            ]),
          ),
        ],
      ),
    );
  }
}

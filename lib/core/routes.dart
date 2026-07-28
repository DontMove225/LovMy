import 'package:lovmy/presentation/screens/BottomNavBar/bottombar.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/match/browes.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/mapscreen.dart';
import 'package:lovmy/presentation/screens/BottomNavBar/notification_page.dart';
import 'package:lovmy/presentation/screens/Splash_Bording/auth_screen.dart';
import 'package:lovmy/presentation/screens/other/editProfile/editprofile.dart';
import 'package:lovmy/presentation/screens/other/likeMatch/like_match.dart';
import 'package:lovmy/presentation/screens/other/premium/plandetials.dart';
import 'package:lovmy/presentation/screens/other/premium/premium.dart';
import 'package:lovmy/presentation/screens/other/profileAbout/detailscreen.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/faqpage.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/profile_page.dart';
import 'package:lovmy/presentation/screens/splash_bording/creat_steps.dart';
import 'package:lovmy/presentation/screens/auth/login_screen.dart';
import 'package:lovmy/presentation/screens/splash_bording/onbording_screens.dart';
import 'package:lovmy/presentation/screens/splash_bording/recover_email.dart';
import 'package:lovmy/presentation/screens/splash_bording/splash_screen.dart';
import 'package:flutter/material.dart';
import '../presentation/screens/BottomNavBar/home_screen.dart';
import 'page_transitions.dart';


class Routes {
  static Route? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case SplashScreen.splashScreenRoute:
        return LovMyPageRoute(builder: (context) => const SplashScreen());
        case OnBoardingScreen.onBoardingScreenRoute:
        return LovMyPageRoute(builder: (context) => const OnBoardingScreen());

      case AuthScreen.authScreenRoute:
        return LovMyPageRoute(builder: (context) => const AuthScreen());

      case RecoverEmail.recoverEmailRoute:
        return LovMyPageRoute(builder: (context) => const RecoverEmail());

      case CreatSteps.creatStepsRoute:
        return LovMyPageRoute(builder: (context) => const CreatSteps());

      case BottomBar.bottomBarRoute:
        return LovMyPageRoute(builder: (context) => const BottomBar());

      case HomeScreen.homeScrennRoute:
        return LovMyPageRoute(builder: (context) => const HomeScreen());

      case BrowesPage.browsPageRoute:
        return LovMyPageRoute(builder: (context) => const BrowesPage());

      case MapScreen.mapScreenRoute:
        return LovMyPageRoute(builder: (context) => const MapScreen());

      case ProfilePage.profilePageRoute:
        return LovMyPageRoute(builder: (context) => const ProfilePage());

      case PremiumScreen.premiumScreenRoute:
        return LovMyPageRoute(builder: (context) => const PremiumScreen());

      case EditProfile.editProfileRoute:
        return LovMyPageRoute(builder: (context) => const EditProfile());

      case DetailScreen.detailScreenRoute:
        return LovMyPageRoute(builder: (context) => const DetailScreen());

      case LoginScreen.loginRoute:
        return LovMyPageRoute(builder: (context) => const LoginScreen());

        case NotificationPage.notificationRoute:
        return LovMyPageRoute(builder: (context) => const NotificationPage());

        case LikeMatchScreen.likeMatchScreenRoute:
          return LovMyPageRoute(builder: (context) => const LikeMatchScreen());
          case FaqPage.faqRoute:
          return LovMyPageRoute(builder: (context) => const FaqPage());
          case PlanDetils.planRoutes:
          return LovMyPageRoute(builder: (context) => const PlanDetils());

      default:
        return null;
    }
  }
}

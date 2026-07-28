// ignore_for_file: unused_local_variable, avoid_print, unnecessary_brace_in_string_interps, use_build_context_synchronously, non_constant_identifier_names

import 'dart:convert';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:lovmy/Logic/cubits/Home_cubit/home_cubit.dart';
import 'package:lovmy/Logic/cubits/language_cubit/language_bloc.dart';
import 'package:lovmy/Logic/cubits/litedark/lite_dark_cubit.dart';
import 'package:lovmy/Logic/cubits/litedark/lite_dark_state.dart';
import 'package:lovmy/core/ui.dart';
import 'package:lovmy/presentation/screens/Splash_Bording/auth_screen.dart';
import 'package:lovmy/presentation/screens/other/editProfile/editprofile.dart';
import 'package:lovmy/presentation/screens/other/premium/plandetials.dart';
import 'package:lovmy/presentation/screens/other/premium/premium.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/faqpage.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/pagelist.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/profile_privacy.dart';
import 'package:lovmy/presentation/screens/other/profileScreen/profile_provider.dart';
import 'package:lovmy/presentation/screens/splash_bording/onBordingProvider/onbording_provider.dart';
import 'package:lovmy/presentation/widgets/sizeboxx.dart';
import 'package:lovmy/wallete_code/wallete_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_svg/svg.dart';
import 'package:get/get.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../Logic/cubits/Home_cubit/homestate.dart';
import '../../../../Logic/cubits/onBording_cubit/onbording_cubit.dart';
import '../../../../by_coin_screen/coin_screen.dart';
import '../../../../by_coin_screen/mygift.dart';
import '../../../../by_coin_screen/refer_and_earn_screen.dart';
import '../../../../core/config.dart';
import '../../../../core/google_ads.dart';
import '../../../../data/localdatabase.dart';
import '../../../../language/localization/app_localization.dart';
import '../../../../wallete_code/wallet_provider.dart';
import '../../../firebase/chat_page.dart';
import '../../../widgets/appbarr.dart';
import '../../../widgets/main_button.dart';
import '../../BottomNavBar/bottombar.dart';
import '../../BottomNavBar/homeProvider/homeprovier.dart';

List<CameraDescription> cameras = [];

late CameraController imagecontroller;
late Future<void> initializeControllerFuture;


class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  static const profilePageRoute = "/profilePage";

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late HomeProvider homeProvider;
  late ProfileProvider profileProvider;
  late OnBordingProvider onBordingProvider;

  late HomePageCubit homePageCubit;
  late HomeCompleteState homeCompleteState;
  late WalleteProvider walleteProvider;
  late OnbordingCubit onbordingCubit;

  // late Future<void> _initializeControllerFuture;


  @override
  void initState() {
    super.initState();

    loadAd();
    BlocProvider.of<HomePageCubit>(context).initforHome(context);
    profileProvider = Provider.of<ProfileProvider>(context,listen: false);
    walleteProvider = Provider.of<WalleteProvider>(context,listen: false);
    homeProvider = Provider.of<HomeProvider>(context,listen: false);
    BlocProvider.of<OnbordingCubit>(context).smstypeapi(context);
    profileProvider.faqApi(context);
    profileProvider.pageListApi(context);
    profileProvider.getPackage();
    walleteProvider.walletreportApi(context: context);
    getdata();
    fun();
  }



  @override
  void dispose() {
    imagecontroller.dispose();
    super.dispose();
  }

  String networkImage = "";
  XFile? selectImageprofile;
  XFile? selectImageprofilevaridfy;
  ImagePicker picker = ImagePicker();
  ImagePicker pickervaridfy = ImagePicker();
  String? base64String;
  String? base64Stringverfy;


  bool _isFrontCamera = false;


  void _toggleCamera() async {
    CameraDescription newCameraDescription;
    if (_isFrontCamera) {
      newCameraDescription = cameras.firstWhere((camera) =>
      camera.lensDirection == CameraLensDirection.back);
    } else {
      newCameraDescription = cameras.firstWhere((camera) =>
      camera.lensDirection == CameraLensDirection.front);
    }

    imagecontroller = CameraController(
      newCameraDescription,
      ResolutionPreset.medium,
      enableAudio: false
    );

    setState(() {
      _isFrontCamera = !_isFrontCamera;
      initializeControllerFuture = imagecontroller.initialize();
    });
  }

  int value = 0;

  List languageimage = [
    'assets/icons/L-French.png',
    'assets/icons/L-English.png',
    'assets/icons/L-Spanish.png',
    'assets/icons/L-Arabic.png',
    'assets/icons/L-Hindi-Gujarati.png',
    'assets/icons/L-Hindi-Gujarati.png',
    'assets/icons/L-Afrikaans.png',
    'assets/icons/L-Bengali.png',
    'assets/icons/L-Indonesion.png',
  ];

  // Pas d'icône PNG dédiée pour ces langues — drapeau emoji affiché à la place
  // (voir languageFlagEmoji ci-dessous).
  List languageFlagEmoji = [
    "🇮🇹",
    "🇵🇹",
    "🇩🇪",
    "🇳🇱",
    "🇨🇳",
    "🇯🇵",
    "🇻🇳",
    "🇷🇺",
    "🇹🇷",
    "🇵🇱",
  ];

  List languagetext = [
    'French',
    'English',
    'Spanish',
    'Arabic',
    'Hindi',
    'Gujarati',
    'Afrikaans',
    'Bengali',
    'Indonesian',
    'Italian',
    'Portuguese',
    'German',
    'Dutch',
    'Chinese',
    'Japanese',
    'Vietnamese',
    'Russian',
    'Turkish',
    'Polish',
  ];


  fun() async {
    for(int a= 0 ;a<languagetext.length;a++){
      if(languagetext[a].toString().compareTo(Get.locale.toString()) == 0){
        setState(() {
          value = a;
        });
      }else{
      }
    }
  }


  getdata() async {
    SharedPreferences preferences = await SharedPreferences.getInstance();
    final saved = preferences.getInt("valuelangauge");
    if (saved != null) {
      setState(() {
        value = saved;
      });
    }
  }

  bool profileloader = false;

  @override
  Widget build(BuildContext context) {
    walleteProvider = Provider.of<WalleteProvider>(context);
    homeProvider = Provider.of<HomeProvider>(context);
    profileProvider = Provider.of<ProfileProvider>(context);
    onBordingProvider = Provider.of<OnBordingProvider>(context);
    onbordingCubit = Provider.of<OnbordingCubit>(context);
    return  Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: appbarr(context, AppLocalizations.of(context)?.translate("Profile") ?? "Profile"),
      body:  SafeArea(
        child: walleteProvider.islaoding ? SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: BlocBuilder<HomePageCubit,HomePageStates>(
                builder: (context1, state) {
                if(state is HomeCompleteState){
                  return Stack(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // InkWell(
                          //   onTap: () {
                          //     Provider.of<HomeProvider>(context,listen: false).setSelectPage(0);
                          //     Navigator.pushNamedAndRemoveUntil(context, BottomBar.bottomBarRoute, (route) => true);
                          //   },
                          //   child: Center(
                          //     child: Container(
                          //       height: 50,
                          //       width: 50,
                          //       decoration: BoxDecoration(
                          //         color: AppColors.appColor,
                          //         borderRadius: BorderRadius.circular(10)
                          //       ),
                          //     ),
                          //   ),
                          // ),
                          const SizedBox(height: 10,),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Stack(
                              clipBehavior: Clip.none,
                                alignment: Alignment.center,
                                children: [


                                  state.homeData.profilelist!.isEmpty ? const SizedBox() : SizedBox(
                                    height: 70,
                                    width : 70,
                                    child: CircularProgressIndicator(
                                      strokeCap: StrokeCap.round,
                                        strokeWidth: 4,
                                        valueColor: AlwaysStoppedAnimation(AppColors.appColor),
                                        value: (double.parse(state.homeData.profilelist![homeProvider.currentIndex].matchRatio.toString().split(".").first) /100)
                                    ),
                                  ),


                                  homeProvider.userlocalData.userLogin!.profilePic != null ? Container(
                                      height: 66,
                                      width: 66,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        // image: DecorationImage(image:  NetworkImage('${Config.imagebaseurl}${profileImageController.profileimageeditApi!.userLogin.profilePic}'), fit: BoxFit.cover),
                                        image: DecorationImage(image:  NetworkImage("${Config.baseUrl}${homeProvider.userlocalData.userLogin!.profilePic}"), fit: BoxFit.cover),
                                      )) : selectImageprofile == null ? CircleAvatar(
                                    backgroundColor: Colors.grey.withOpacity(0.2),
                                    maxRadius: 33,
                                    child: Center(child: Text("${homeProvider.userlocalData.userLogin!.name?[0]}",style: const TextStyle(fontSize: 20,fontWeight: FontWeight.bold),)),
                                  ) : Container(
                                    height: 70,
                                    width: 70,
                                    decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        image: DecorationImage(image: FileImage(File(selectImageprofile!.path)), fit: BoxFit.cover),
                                    ),
                                  ),


                                  state.homeData.planId != "0" ? Positioned(
                                      top: -10,
                                      child: Image.asset("assets/icons/tajicon.png",height: 25,width: 25,),
                                  ) : const SizedBox(),


                                  state.homeData.profilelist!.isEmpty ? const SizedBox() : Positioned(
                                    bottom: -10,
                                    child: Container(
                                      height: 22,
                                      width: 35,
                                      decoration: BoxDecoration(
                                         border: Border.all(color: Colors.white,width: 3),
                                         // color: AppColors.appColor,
                                         borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Container(
                                        height: 22,
                                        width: 35,
                                        decoration: BoxDecoration(
                                            color: AppColors.appColor,
                                            borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Center(
                                          child: Text(
                                            "${state.homeData.profilelist![homeProvider.currentIndex].matchRatio.toString().split(".").first}%",
                                            style: Theme.of(context).textTheme.bodySmall!.copyWith(color: Colors.white,fontSize: 9,fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                      ),
                                    ),
                                  )


                                ],
                              ),
                              const SizBoxW(size: 0.02),


                              BlocBuilder<HomePageCubit, HomePageStates>(
                                  builder: (context, state) {
                                    if (state is HomeCompleteState) {
                                      return Expanded(
                                        child: Row(
                                          children: [
                                            Flexible(
                                              child: Text(
                                                "${homeProvider.userlocalData.userLogin!.name}",
                                                style: Theme.of(context).textTheme.headlineSmall,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            const SizedBox(width: 5),
                                            state.homeData.isVerify == "0" ? InkWell(
                                              onTap: () {

                                                imagecontroller = CameraController(
                                                  cameras[0],
                                                  ResolutionPreset.medium,
                                                  enableAudio: false,
                                                );
                                                initializeControllerFuture = imagecontroller.initialize();

                                                showDialog<String>(
                                                  barrierDismissible: false,
                                                  context: context,
                                                  builder: (BuildContext context) => AlertDialog(
                                                    elevation: 0,
                                                    insetPadding: const EdgeInsets.only(left: 10,right: 10),
                                                    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                                    shape: RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.circular(20),
                                                    ),
                                                    title: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Center(child: Icon(Icons.camera_alt,color: AppColors.appColor,size: 30)),
                                                        const SizedBox(height: 10,),
                                                        Center(child: Text(AppLocalizations.of(context)?.translate("Get Photo Verified") ?? "Get Photo Verified",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 22),)),
                                                        const SizedBox(height: 10,),
                                                        Text(AppLocalizations.of(context)?.translate("We want to know it`s really you.") ?? "We want to know it`s really you.",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16),),
                                                        ListTile(
                                                          contentPadding: EdgeInsets.zero,
                                                          title: Text(AppLocalizations.of(context)?.translate("Tack a quick video selfie") ?? "Tack a quick video selfie",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,fontWeight: FontWeight.bold),),
                                                          subtitle: Text(AppLocalizations.of(context)?.translate("Confirm you`re the person in your photos.") ?? "Confirm you`re the person in your photos.",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 14,color: Colors.grey),),
                                                        ),
                                                        const SizedBox(height: 10,),
                                                        MainButton(
                                                            bgColor: AppColors.appColor,titleColor: Colors.white,
                                                            title: AppLocalizations.of(context)?.translate("Continue") ?? "Continue",
                                                            onTap: () {
                                                              showDialog<String>(
                                                                barrierDismissible: false,
                                                                context: context,
                                                                builder: (BuildContext context) => AlertDialog(
                                                                  elevation: 0,
                                                                  insetPadding: const EdgeInsets.only(left: 10,right: 10),
                                                                  backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                                                  shape: RoundedRectangleBorder(
                                                                    borderRadius: BorderRadius.circular(20),
                                                                  ),
                                                                  title: Column(
                                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                    children: [
                                                                      const SizedBox(height: 10,),
                                                                      Center(child: Text(AppLocalizations.of(context)?.translate("Before you continue...") ?? "Before you continue...",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 22),)),
                                                                      const SizedBox(height: 10,),
                                                                      ListTile(
                                                                        isThreeLine: true,
                                                                        contentPadding: EdgeInsets.zero,
                                                                        leading: Container(
                                                                          height: 20,
                                                                          width: 20,
                                                                          decoration: BoxDecoration(
                                                                              color: AppColors.appColor,
                                                                              borderRadius: BorderRadius.circular(65)
                                                                          ),
                                                                          child: const Center(child: Icon(Icons.check,color: Colors.white,size: 12,)),
                                                                        ),
                                                                        title: Transform.translate(offset: const Offset(-10, -3),child: Text(AppLocalizations.of(context)?.translate("Prep your lighting") ?? "Prep your lighting",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 18,fontWeight: FontWeight.bold),)),
                                                                        subtitle: Transform.translate(
                                                                          offset: const Offset(-10, 0),
                                                                          child: Column(
                                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                                            children: [
                                                                              Row(
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                                children: [
                                                                                  Padding(
                                                                                    padding: const EdgeInsets.only(top: 7.0),
                                                                                    child: Container(
                                                                                      height: 7,
                                                                                      width: 7,
                                                                                      decoration: const BoxDecoration(
                                                                                          color: Colors.grey,
                                                                                          shape: BoxShape.circle
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                  const SizedBox(width: 5,),
                                                                                  Flexible(child: Text(AppLocalizations.of(context)?.translate("Choose a well-lit environment") ?? "Choose a well-lit environment",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,color: Colors.grey,),maxLines: 2,))
                                                                                ],
                                                                              ),
                                                                              const SizedBox(height: 5,),
                                                                              Row(
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                                children: [
                                                                                  Padding(
                                                                                    padding: const EdgeInsets.only(top: 7.0),
                                                                                    child: Container(
                                                                                      height: 7,
                                                                                      width: 7,
                                                                                      decoration: const BoxDecoration(
                                                                                          color: Colors.grey,
                                                                                          shape: BoxShape.circle
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                  const SizedBox(width: 5,),
                                                                                  Flexible(child: Text(AppLocalizations.of(context)?.translate("Turn up your brightness") ?? "Turn up your brightness",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,color: Colors.grey,),maxLines: 2,))

                                                                                ],
                                                                              ),
                                                                              const SizedBox(height: 5,),
                                                                              Row(
                                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                children: [
                                                                                  Padding(
                                                                                    padding: const EdgeInsets.only(top: 7.0),
                                                                                    child: Container(
                                                                                      height: 7,
                                                                                      width: 7,
                                                                                      decoration: const BoxDecoration(
                                                                                          color: Colors.grey,
                                                                                          shape: BoxShape.circle
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                  const SizedBox(width: 5,),
                                                                                  Flexible(child: Text("Avoid ${homeProvider.userlocalData.userLogin!.name} glare and backlighting",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,color: Colors.grey,),maxLines: 2,))
                                                                                ],
                                                                              ),
                                                                            ],
                                                                          ),
                                                                        ),
                                                                      ),
                                                                      const SizedBox(height: 10,),
                                                                      ListTile(
                                                                        isThreeLine: true,
                                                                        contentPadding: EdgeInsets.zero,
                                                                        leading: Container(
                                                                          height: 20,
                                                                          width: 20,
                                                                          decoration: BoxDecoration(
                                                                              color: AppColors.appColor,
                                                                              borderRadius: BorderRadius.circular(65)
                                                                          ),
                                                                          child: const Center(child: Icon(Icons.check,color: Colors.white,size: 12,)),
                                                                        ),
                                                                        title: Transform.translate(offset: const Offset(-10, -3),child: Text(AppLocalizations.of(context)?.translate("Show your face") ?? "Show your face",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 18,fontWeight: FontWeight.bold),)),
                                                                        subtitle: Transform.translate(
                                                                          offset: const Offset(-10, 0),
                                                                          child: Column(
                                                                            crossAxisAlignment: CrossAxisAlignment.start,
                                                                            children: [
                                                                              Row(
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                                children: [
                                                                                  Padding(
                                                                                    padding: const EdgeInsets.only(top: 7.0),
                                                                                    child: Container(
                                                                                      height: 7,
                                                                                      width: 7,
                                                                                      decoration: const BoxDecoration(
                                                                                          color: Colors.grey,
                                                                                          shape: BoxShape.circle
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                  const SizedBox(width: 5,),
                                                                                  Flexible(child: Text(AppLocalizations.of(context)?.translate("Face the camera directly") ?? "Face the camera directly",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,color: Colors.grey,),maxLines: 2,))
                                                                                ],
                                                                              ),
                                                                              const SizedBox(height: 5,),
                                                                              Row(
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                mainAxisAlignment: MainAxisAlignment.start,
                                                                                children: [
                                                                                  Padding(
                                                                                    padding: const EdgeInsets.only(top: 7.0),
                                                                                    child: Container(
                                                                                      height: 7,
                                                                                      width: 7,
                                                                                      decoration: const BoxDecoration(
                                                                                          color: Colors.grey,
                                                                                          shape: BoxShape.circle
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                  const SizedBox(width: 5,),
                                                                                  Flexible(child: Text(AppLocalizations.of(context)?.translate("Remove hats, sunglasses, and face coverings") ?? "Remove hats, sunglasses, and face coverings",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,color: Colors.grey,),maxLines: 2,))
                                                                                ],
                                                                              ),

                                                                            ],
                                                                          ),
                                                                        ),
                                                                      ),
                                                                      const SizedBox(height: 10,),
                                                                      MainButton(
                                                                          bgColor: AppColors.appColor,titleColor: Colors.white,
                                                                          title: AppLocalizations.of(context)?.translate("Continue") ?? "Continue",
                                                                          onTap: () async {
                                                                            showModalBottomSheet(
                                                                                isScrollControlled: true,
                                                                                backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                                                                context: context,
                                                                                builder: (c) {
                                                                                  return StatefulBuilder(builder: (context, setState) {
                                                                                    return Container(
                                                                                      padding: const EdgeInsets.all(15),
                                                                                      decoration: BoxDecoration(
                                                                                        color: Theme.of(context).scaffoldBackgroundColor,
                                                                                        borderRadius: BorderRadius.circular(16),
                                                                                      ),
                                                                                      child: SafeArea(
                                                                                        child: Scaffold(
                                                                                          resizeToAvoidBottomInset: false,
                                                                                          body: SingleChildScrollView(
                                                                                            child: Column(
                                                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                                                              children: [
                                                                                                const SizedBox(height: 30,),
                                                                                                InkWell(
                                                                                                    onTap: () {
                                                                                                      Navigator.pop(context);
                                                                                                    },
                                                                                                    child: const Icon(Icons.close)
                                                                                                ),
                                                                                                const SizedBox(height: 10,),
                                                                                                Center(child: Text(AppLocalizations.of(context)?.translate("Get ready for") ?? "Get ready for",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 24,fontWeight: FontWeight.bold))),
                                                                                                Center(child: Text(AppLocalizations.of(context)?.translate("your image selfie") ?? "your image selfie",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 24,fontWeight: FontWeight.bold))),
                                                                                                const SizedBox(height: 10,),
                                                                                                Center(
                                                                                                  child: ClipOval(
                                                                                                    child: SizedBox(
                                                                                                      height: 350,
                                                                                                      width: 230,
                                                                                                      child: selectImageprofilevaridfy == null ?
                                                                                                      GestureDetector(
                                                                                                        onDoubleTap: () {
                                                                                                          setState((){
                                                                                                            _toggleCamera();
                                                                                                          });
                                                                                                        },
                                                                                                        child: FutureBuilder<void>(
                                                                                                          future: initializeControllerFuture,
                                                                                                          builder: (context, snapshot) {
                                                                                                            if (snapshot.connectionState == ConnectionState.done) {
                                                                                                              return CameraPreview(imagecontroller);
                                                                                                            } else {
                                                                                                              return Center(child: CircularProgressIndicator(color: AppColors.appColor,));
                                                                                                            }
                                                                                                          },
                                                                                                        ),
                                                                                                      ) :
                                                                                                      Image.file(File(selectImageprofilevaridfy!.path),fit: BoxFit.cover),
                                                                                                    ),
                                                                                                  ),
                                                                                                ),
                                                                                                const SizedBox(height: 10,),
                                                                                                Center(child: Text(AppLocalizations.of(context)?.translate("Make sure to frame your face in the oval, then tap  'I am Ready'!") ?? "Make sure to frame your face in the oval, then tap  'I am Ready'!",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16,fontWeight: FontWeight.bold),maxLines: 2,textAlign: TextAlign.center,)),
                                                                                                const SizedBox(height: 10,),
                                                                                                MainButton(
                                                                                                  bgColor: AppColors.appColor,titleColor: Colors.white,
                                                                                                  title: AppLocalizations.of(context)?.translate("I am Ready") ?? "I am Ready",
                                                                                                  onTap: () async {

                                                                                                    try {
                                                                                                      await initializeControllerFuture;
                                                                                                      selectImageprofilevaridfy = await imagecontroller.takePicture();
                                                                                                      List<int> imageByte = File(selectImageprofilevaridfy!.path).readAsBytesSync();
                                                                                                      base64Stringverfy =base64Encode(imageByte);

                                                                                                      profileProvider.identiverifyApi(context: context,img: base64Stringverfy.toString()).then((value) {
                                                                                                        Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (context) => const BottomBar()), (route) => false);
                                                                                                        setState(() {

                                                                                                        });
                                                                                                      });

                                                                                                      print(" + + + + + :----  ${base64Stringverfy}");
                                                                                                    } catch (e) {
                                                                                                      print('Error taking picture: $e');
                                                                                                    }


                                                                                                    setState((){});

                                                                                                  },
                                                                                                ),
                                                                                              ],
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      ),
                                                                                    );
                                                                                  },);
                                                                                });

                                                                          }
                                                                      ),
                                                                      const SizedBox(height: 10,),
                                                                      InkWell(
                                                                        onTap: () {
                                                                          for(int i=0; i<2; i++){
                                                                            Navigator.pop(context);
                                                                          }
                                                                        },
                                                                          child: Center(child: Text(AppLocalizations.of(context)?.translate("Maybe Later") ?? "Maybe Later",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 18),))),
                                                                    ],
                                                                  ),
                                                                ),
                                                              );
                                                            })
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              },
                                              child: const Padding(
                                                padding: EdgeInsets.only(top: 4.0),
                                                child: Image(image: AssetImage("assets/icons/newverfy.png"),height: 22,width: 22),
                                              ),
                                            ) : state.homeData.isVerify == "1" ? InkWell(
                                              onTap: () {
                                                showDialog<String>(
                                                  barrierDismissible: false,
                                                  context: context,
                                                  builder: (BuildContext context) => AlertDialog(
                                                    elevation: 0,
                                                    insetPadding: const EdgeInsets.only(left: 10,right: 10),
                                                    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                                    shape: RoundedRectangleBorder(
                                                      borderRadius: BorderRadius.circular(20),
                                                    ),
                                                    title: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.center,
                                                      children: [
                                                        Container(
                                                          height: 100,
                                                          width: 100,
                                                          decoration: BoxDecoration(
                                                              shape: BoxShape.circle,
                                                              image: DecorationImage(image: NetworkImage("${Config.baseUrl}${homeProvider.userlocalData.userLogin!.identityPicture}"),fit: BoxFit.cover)
                                                          ),
                                                        ),
                                                        const SizedBox(height: 10,),
                                                        Center(child: Text(AppLocalizations.of(context)?.translate("verification Under") ?? "verification Under",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 22),)),
                                                        Center(child: Text('Review',style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 22),)),
                                                        const SizedBox(height: 10,),
                                                        Padding(
                                                          padding: const EdgeInsets.only(left: 15,right: 15),
                                                          child: Text(AppLocalizations.of(context)?.translate("We are currently reviewing your selfies and will get back to you shortly!") ?? "We are currently reviewing your selfies and will get back to you shortly!",style: Theme.of(context).textTheme.headlineSmall!.copyWith(fontSize: 16),textAlign: TextAlign.center),
                                                        ),
                                                        const SizedBox(height: 20,),
                                                        MainButton(
                                                            bgColor: AppColors.appColor,titleColor: Colors.white,
                                                            title: AppLocalizations.of(context)?.translate("OKAY") ?? "OKAY",
                                                            onTap: () {
                                                              Navigator.pop(context);
                                                            }),
                                                        const SizedBox(height: 10,),
                                                      ],
                                                    ),
                                                  ),
                                                );
                                              },
                                              child: const Padding(
                                                padding: EdgeInsets.only(top: 4.0),
                                                child: Image(image: AssetImage("assets/icons/progressicon.png"),height: 22,width: 22,),
                                              ),
                                            ) : const Padding(
                                              padding: EdgeInsets.only(top: 4.0),
                                              child: Image(image: AssetImage("assets/icons/approveicon.png"),height: 22,width: 22,),
                                            ),
                                            const SizedBox(width: 15,),
                                          ],
                                        ),
                                      );
                                    }else{
                                      return const SizedBox();
                                    }
                                  }
                              ),


                              InkWell(
                               onTap: () {

                                 showModalBottomSheet(
                                   context: context,
                                   backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                                   shape: const RoundedRectangleBorder(borderRadius: BorderRadius.only(topLeft: Radius.circular(15),topRight: Radius.circular(15))),
                                   builder: (context) {
                                   return Padding(
                                     padding: const EdgeInsets.all(15),
                                     child: SingleChildScrollView(
                                       child: Column(
                                         children: [
                                           Text(AppLocalizations.of(context)?.translate("From where do you want to take the photo?") ?? "From where do you want to take the photo?", style: Theme.of(context).textTheme.bodyLarge,),
                                           const SizedBox(height: 15),
                                           Row(
                                             children: [
                                               Expanded(
                                                 child: MainButton(
                                                     bgColor: AppColors.appColor,titleColor: Colors.white,
                                                     title: AppLocalizations.of(context)?.translate("Gallery") ?? "Gallery",
                                                     onTap: () async {
                                                       final picked = await picker.pickImage(source: ImageSource.gallery);
                                                       setState(() {
                                                         profileloader = true;
                                                       });
                                                       if(picked!= null){

                                                         setState(() {
                                                           selectImageprofile = picked;
                                                         });

                                                         List<int> imageByte = File(selectImageprofile!.path).readAsBytesSync();
                                                         base64String = base64Encode(imageByte);

                                                         profileProvider.profilepicApi(context: context,img: base64String.toString()).then((value) {
                                                           Navigator.of(context).pop();
                                                           profileloader = false;
                                                           setState(() {});
                                                         });


                                                       } else{
                                                         print("did not pick an image!!");
                                                       }
                                                     }),
                                               ),
                                               const SizedBox(width: 8),
                                               Expanded(
                                                 child: MainButton(
                                                     bgColor: AppColors.appColor,titleColor: Colors.white,
                                                     title: AppLocalizations.of(context)?.translate("Camera") ?? "Camera",
                                                     onTap: () async {
                                                       final picked=await picker.pickImage(source: ImageSource.camera);
                                                       setState(() {
                                                         profileloader = true;
                                                       });
                                                       if(picked!= null){
                                                         setState(() {
                                                           selectImageprofile = picked;
                                                         });

                                                         List<int> imageByte =File(selectImageprofile!.path).readAsBytesSync();
                                                         base64String =base64Encode(imageByte);
                                                         profileProvider.profilepicApi(context: context,img: base64String.toString()).then((value) {
                                                           Navigator.of(context).pop();
                                                           profileloader = false;
                                                           setState(() {

                                                           });
                                                         });

                                                       } else{
                                                         print("did not pick an image!!");
                                                       }
                                                     }
                                                     ),
                                               ),
                                             ],
                                           ),
                                           const SizedBox(height: 15),
                                         ],
                                       ),
                                     ),
                                   );
                                 },
                               );


                               },
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.appColor,
                                    borderRadius: BorderRadius.circular(20)
                                  ),
                                  padding: const EdgeInsets.symmetric(vertical: 5,horizontal: 8),
                                  child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(AppLocalizations.of(context)?.translate("Edit") ?? "Edit",style: Theme.of(context).textTheme.bodySmall!.copyWith(color: AppColors.white),),
                                        const SizedBox(width: 5,),
                                        SvgPicture.asset("assets/icons/edit.svg"),

                                  ]),
                                ),
                              ),

                            ],
                          ),
                          const SizedBox(height: 10,),


                          onbordingCubit.smaTypeApiModel?.admobEnabled == "Yes" ? SizedBox(
                            width: MediaQuery.of(context).size.width,
                            height: 60,
                            child: AdWidget(ad: bannerADs()),
                          ) : const SizedBox(),


                          const SizedBox(height: 10,),



                          InkWell(
                            onTap: () {
                              state.homeData.planId != "0" ?
                              Navigator.pushNamed(context, PlanDetils.planRoutes) :
                              Navigator.pushNamed(context, PremiumScreen.premiumScreenRoute);
                            },

                            child: Container(
                              width: MediaQuery.of(context).size.width,

                              decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(20),
                                  color: AppColors.appColor,
                                  image: const DecorationImage(image: AssetImage("assets/Image/profileBg.png"),fit: BoxFit.cover),
                              ),

                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Row(
                                  children: [
                                    Expanded(child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(state.homeData.planId != "0" ?AppLocalizations.of(context)?.translate("You're Activated Membership!") ?? "You're Activated Membership!" :AppLocalizations.of(context)?.translate("Join Our Membership Today!") ?? "Join Our Membership Today!",style: Theme.of(context).textTheme.bodyLarge!.copyWith(color: AppColors.white,fontWeight: FontWeight.w700),maxLines: 1,overflow: TextOverflow.ellipsis),
                                        const SizedBox(height: 5,),
                                        Text(state.homeData.planId != "0" ? AppLocalizations.of(context)?.translate("Enjoy  premium and match anywhere.") ?? "Enjoy  premium and match anywhere." : AppLocalizations.of(context)?.translate("Checkout LovMy Premium") ?? "Checkout LovMy Premium",style: Theme.of(context).textTheme.bodySmall!.copyWith(color: AppColors.white,overflow: TextOverflow.ellipsis),maxLines: 1,overflow: TextOverflow.ellipsis),
                                      ],
                                    ),),
                                    Container(
                                      padding: const EdgeInsets.symmetric(vertical: 5,horizontal: 8),
                                      decoration: BoxDecoration(
                                          color: AppColors.white,
                                          borderRadius: BorderRadius.circular(12)
                                      ),
                                      child: Text(state.homeData.planId != "0" ? AppLocalizations.of(context)?.translate("Active") ?? "Active" : AppLocalizations.of(context)?.translate("Go") ?? "Go",style: Theme.of(context).textTheme.bodySmall!.copyWith(color: AppColors.appColor)),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const SizBoxH(size: 0.01),
                          onbordingCubit.smaTypeApiModel?.giftFun == "Enabled" ?  ListView.builder(
                            clipBehavior: Clip.none,
                              physics: const NeverScrollableScrollPhysics(),
                              shrinkWrap: true,
                              itemBuilder: (c, i) {
                                return i == 6 ? profileProvider.isLoading ?  ListView.builder(
                                    physics: const NeverScrollableScrollPhysics(),
                                    shrinkWrap: true,
                                    itemBuilder: (context, index) {
                                      return ListTile(
                                        onTap: () {

                                          Navigator.push(context, MaterialPageRoute(builder: (context) => Loream(title: profileProvider.privacyPolicy.pagelist![index].title.toString(), discription: profileProvider.privacyPolicy.pagelist![index].description.toString()),));

                                        },
                                        dense: true,
                                        contentPadding: EdgeInsets.zero,
                                        leading: SizedBox(
                                          height: 30,
                                          width: 30,
                                          child: Center(
                                            child: SvgPicture.asset("assets/icons/clipboard-text.svg",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),
                                              // height: 25,
                                              // width: 25,
                                            ),
                                          ),
                                        ),
                                        title: Text(
                                          profileProvider.privacyPolicy.pagelist![index].title.toString(),
                                          style: Theme.of(context).textTheme.bodyMedium!,
                                        ),
                                        trailing:  SvgPicture.asset("assets/icons/Arrow - Right 2.svg",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),),
                                      );
                                    }  ,itemCount: profileProvider.privacyPolicy.pagelist!.length) : const SizedBox() :



                                ListTile(
                                  onTap: () async {
                                    if (i == 0) {
                                      Navigator.pushNamed(context, EditProfile.editProfileRoute);
                                    }
                                    else if(i == 1){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const Wallete_Screen(),));
                                    }
                                    else if(i == 2){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const ByCoiin(),));
                                    }
                                    else if(i == 3){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const Coin_Withdraw_Screen(),));
                                    }
                                    else if(i == 4){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const Refer_And_Earn(),));
                                    }
                                    else if(i == 5){
                                      _openThemeModeSheet(context);
                                    }
                                    else if(i == 7){
                                      Navigator.pushNamed(context, FaqPage.faqRoute);
                                    }
                                    else if(i == 8){
                                      profileProvider.blocklistaApi(context).then((value) {
                                        Navigator.push(context, MaterialPageRoute(builder: (context) => const profile_privacyy(),));
                                        setState(() {
                                        });
                                      });
                                    }
                                    else if(i == 9){

                                      showModalBottomSheet(
                                        context: context,
                                        isScrollControlled: true,
                                        builder: (context) {
                                        return Container(
                                          height: 610,
                                          decoration:  BoxDecoration(
                                            color: Theme.of(context).scaffoldBackgroundColor,
                                            borderRadius: const BorderRadius.only(topRight: Radius.circular(15),topLeft: Radius.circular(15)),
                                          ),
                                          child:  Padding(
                                            padding: const EdgeInsets.only(left: 15,right: 15,top: 10),
                                            child: SingleChildScrollView(
                                              scrollDirection: Axis.vertical,
                                              child: Column(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                mainAxisSize: MainAxisSize.min,
                                                children: <Widget>[
                                                  ListView.builder(
                                                    shrinkWrap: true,
                                                    scrollDirection: Axis.vertical,
                                                    physics: const NeverScrollableScrollPhysics(),
                                                    itemCount: 19,
                                                    itemBuilder: (context, index) {
                                                      return GestureDetector(
                                                        onTap: () async{

                                                          SharedPreferences preferences = await SharedPreferences.getInstance();

                                                          setState(()  {
                                                            value = index;
                                                            preferences.setInt("valuelangauge", value);
                                                          });



                                                          switch (index) {
                                                            case 0:
                                                              BlocProvider.of<LanguageCubit>(context).toFrench();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 1:
                                                              BlocProvider.of<LanguageCubit>(context).toEnglish();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 2:
                                                              BlocProvider.of<LanguageCubit>(context).toSpanish();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 3:
                                                              BlocProvider.of<LanguageCubit>(context).toArabic();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 4:
                                                              BlocProvider.of<LanguageCubit>(context).toHindi();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 5:
                                                              BlocProvider.of<LanguageCubit>(context).toGujarati();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 6:
                                                              BlocProvider.of<LanguageCubit>(context).toAfrikaans();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 7:
                                                              BlocProvider.of<LanguageCubit>(context).toBengali();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 8:
                                                              BlocProvider.of<LanguageCubit>(context).toIndonesian();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 9:
                                                              BlocProvider.of<LanguageCubit>(context).toItalian();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 10:
                                                              BlocProvider.of<LanguageCubit>(context).toPortuguese();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 11:
                                                              BlocProvider.of<LanguageCubit>(context).toGerman();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 12:
                                                              BlocProvider.of<LanguageCubit>(context).toDutch();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 13:
                                                              BlocProvider.of<LanguageCubit>(context).toChinese();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 14:
                                                              BlocProvider.of<LanguageCubit>(context).toJapanese();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 15:
                                                              BlocProvider.of<LanguageCubit>(context).toVietnamese();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 16:
                                                              BlocProvider.of<LanguageCubit>(context).toRussian();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 17:
                                                              BlocProvider.of<LanguageCubit>(context).toTurkish();
                                                              Navigator.pop(context);
                                                              break;
                                                            case 18:
                                                              BlocProvider.of<LanguageCubit>(context).toPolish();
                                                              Navigator.pop(context);
                                                              break;
                                                          }
                                                        },
                                                        child: Container(
                                                          height: 60,
                                                          width: MediaQuery.of(context).size.width,
                                                          margin: const EdgeInsets.symmetric(vertical: 7),
                                                          decoration: BoxDecoration(
                                                              border: Border.all(color: value == index ? AppColors.appColor : Colors.transparent,),
                                                              color:  Theme.of(context).scaffoldBackgroundColor,
                                                              borderRadius: BorderRadius.circular(10)),
                                                          child: Column(
                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                              children: [
                                                                Row(
                                                                  children: [
                                                                    Container(
                                                                      height: 45,
                                                                      width: 60,
                                                                      margin: const EdgeInsets.symmetric(
                                                                          horizontal: 10),
                                                                      decoration: BoxDecoration(
                                                                        color: Colors.transparent,
                                                                        borderRadius: BorderRadius.circular(100),
                                                                      ),
                                                                      child: Center(
                                                                        child: index < languageimage.length
                                                                            ? Container(
                                                                                height: 32,
                                                                                width: 32,
                                                                                decoration: BoxDecoration(image: DecorationImage(image: AssetImage(languageimage[index]),)),
                                                                              )
                                                                            : Text(languageFlagEmoji[index - languageimage.length], style: const TextStyle(fontSize: 28)),
                                                                      ),
                                                                    ),
                                                                    const SizedBox(height: 10),
                                                                    Column(
                                                                      crossAxisAlignment:
                                                                      CrossAxisAlignment.start,
                                                                      children: [
                                                                        Text(languagetext[index], style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 14)),
                                                                      ],
                                                                    ),
                                                                    const Spacer(),
                                                                    CheckboxListTile(index),
                                                                    const SizedBox(width: 15,),
                                                                  ],
                                                                ),
                                                              ]),
                                                        ),
                                                      );
                                                    },
                                                  )
                                                ],
                                              ),
                                            ),
                                          ),
                                        );
                                         },
                                      );

                                    }
                                    else if(i == profileProvider.menuList.length -2) {
                                      profileProvider.deleteButtomSheet(context);
                                    }else if(i == profileProvider.menuList.length -3) {
                                      Share.share(
                                        "Hey! 👋've found this awesome dating app called ${profileProvider.appName} and thought you might be interested too! 😊.Check it out:${Platform.isAndroid
                                            ? 'https://play.google.com/store/apps/details?id=${profileProvider.packageName}'
                                            : Platform.isIOS
                                            ? 'https://apps.apple.com/us/app/${profileProvider.appName}/id${profileProvider.packageName}'
                                            : ""}",
                                      );
                                    }
                                    else if(i == profileProvider.menuList.length -1) {
                                      isUserLogOut(Provider.of<HomeProvider>(context,listen: false).uid);
                                      Navigator.pushNamedAndRemoveUntil(context, AuthScreen.authScreenRoute,(route) => false,);
                                      homeProvider.setSelectPage(0);
                                      Preferences.clear();
                                      // await GoogleSignIn().signOut();
                                      // await FacebookAuth.instance.logOut();
                                      SharedPreferences prefs = await SharedPreferences.getInstance();
                                      prefs.setDouble("rediuse", 0);
                                    }
                                  },
                                  dense: true,
                                  contentPadding: EdgeInsets.zero,
                                  leading: SizedBox(
                                    height: 30,
                                    width: 30,
                                    child: Center(
                                      child: SvgPicture.asset("${profileProvider.menuList[i]["icon"]}",colorFilter: ColorFilter.mode(profileProvider.menuList[i]["iconShow"] == "0" ? Colors.red : Theme.of(context).indicatorColor, BlendMode.srcIn),
                                        // height: 25,
                                        // width: 25,
                                      ),
                                    ),
                                  ),
                                  title: Text(AppLocalizations.of(context)?.translate("${profileProvider.menuList[i]["title"]}") ?? "${profileProvider.menuList[i]["title"]}", style: Theme.of(context).textTheme.bodyMedium!.copyWith(color: profileProvider.menuList[i]["iconShow"] == "0" ? Colors.red : null),),
                                  trailing:
                                  profileProvider.menuList[i]["iconShow"] == "1" ? SvgPicture.asset("${profileProvider.menuList[i]["traling"]}",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),) : const SizedBox(),
                                );
                              },
                              itemCount: profileProvider.menuList.length
                          ) : ListView.builder(
                              clipBehavior: Clip.none,
                              physics: const NeverScrollableScrollPhysics(),
                              shrinkWrap: true,
                              itemBuilder: (c, i) {
                                return i == 3 ? profileProvider.isLoading ?  ListView.builder(
                                    physics: const NeverScrollableScrollPhysics(),
                                    shrinkWrap: true,
                                    itemBuilder: (context, index) {
                                      return ListTile(
                                        onTap: () {

                                          Navigator.push(context, MaterialPageRoute(builder: (context) => Loream(title: profileProvider.privacyPolicy.pagelist![index].title.toString(), discription: profileProvider.privacyPolicy.pagelist![index].description.toString()),));

                                        },
                                        dense: true,
                                        contentPadding: EdgeInsets.zero,
                                        leading: SizedBox(
                                          height: 30,
                                          width: 30,
                                          child: Center(
                                            child: SvgPicture.asset("assets/icons/clipboard-text.svg",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),
                                              // height: 25,
                                              // width: 25,
                                            ),
                                          ),
                                        ),
                                        title: Text(
                                          profileProvider.privacyPolicy.pagelist![index].title.toString(),
                                          style: Theme.of(context).textTheme.bodyMedium!,
                                        ),
                                        trailing:  SvgPicture.asset("assets/icons/Arrow - Right 2.svg",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),),
                                      );
                                    }  ,itemCount: profileProvider.privacyPolicy.pagelist!.length) : const SizedBox() :



                                ListTile(
                                  onTap: () async {
                                    if (i == 0) {
                                      Navigator.pushNamed(context, EditProfile.editProfileRoute);
                                    }
                                    else if(i == 1){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const Wallete_Screen(),));
                                      // Navigator.pushNamed(context, FaqPage.faqRoute);
                                    }
                                    else if(i == 2){
                                      Navigator.push(context, MaterialPageRoute(builder: (context) => const Refer_And_Earn(),));
                                    }
                                    else if(i == 4){
                                      _openThemeModeSheet(context);
                                    }
                                    else if(i == 5){
                                      Navigator.pushNamed(context, FaqPage.faqRoute);
                                    }
                                    else if(i == 6){
                                      profileProvider.blocklistaApi(context).then((value) {
                                        Navigator.push(context, MaterialPageRoute(builder: (context) => const profile_privacyy(),));
                                        setState(() {
                                        });
                                      });
                                    }
                                    else if(i == 7){
                                      showModalBottomSheet(
                                        context: context,
                                        isScrollControlled: true,
                                        builder: (context) {
                                          return Container(
                                            height: 610,
                                            decoration:  BoxDecoration(
                                              color: Theme.of(context).scaffoldBackgroundColor,
                                              borderRadius: const BorderRadius.only(topRight: Radius.circular(15),topLeft: Radius.circular(15)),
                                            ),
                                            child:  Padding(
                                              padding: const EdgeInsets.only(left: 15,right: 15,top: 10),
                                              child: SingleChildScrollView(
                                                scrollDirection: Axis.vertical,
                                                child: Column(
                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: <Widget>[
                                                    ListView.builder(
                                                      shrinkWrap: true,
                                                      scrollDirection: Axis.vertical,
                                                      physics: const NeverScrollableScrollPhysics(),
                                                      itemCount: 19,
                                                      itemBuilder: (context, index) {
                                                        return GestureDetector(
                                                          onTap: () async{

                                                            SharedPreferences preferences = await SharedPreferences.getInstance();

                                                            setState(()  {
                                                              value = index;
                                                              preferences.setInt("valuelangauge", value);
                                                            });



                                                            switch (index) {
                                                              case 0:
                                                                BlocProvider.of<LanguageCubit>(context).toFrench();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 1:
                                                                BlocProvider.of<LanguageCubit>(context).toEnglish();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 2:
                                                                BlocProvider.of<LanguageCubit>(context).toSpanish();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 3:
                                                                BlocProvider.of<LanguageCubit>(context).toArabic();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 4:
                                                                BlocProvider.of<LanguageCubit>(context).toHindi();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 5:
                                                                BlocProvider.of<LanguageCubit>(context).toGujarati();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 6:
                                                                BlocProvider.of<LanguageCubit>(context).toAfrikaans();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 7:
                                                                BlocProvider.of<LanguageCubit>(context).toBengali();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 8:
                                                                BlocProvider.of<LanguageCubit>(context).toIndonesian();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 9:
                                                                BlocProvider.of<LanguageCubit>(context).toItalian();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 10:
                                                                BlocProvider.of<LanguageCubit>(context).toPortuguese();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 11:
                                                                BlocProvider.of<LanguageCubit>(context).toGerman();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 12:
                                                                BlocProvider.of<LanguageCubit>(context).toDutch();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 13:
                                                                BlocProvider.of<LanguageCubit>(context).toChinese();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 14:
                                                                BlocProvider.of<LanguageCubit>(context).toJapanese();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 15:
                                                                BlocProvider.of<LanguageCubit>(context).toVietnamese();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 16:
                                                                BlocProvider.of<LanguageCubit>(context).toRussian();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 17:
                                                                BlocProvider.of<LanguageCubit>(context).toTurkish();
                                                                Navigator.pop(context);
                                                                break;
                                                              case 18:
                                                                BlocProvider.of<LanguageCubit>(context).toPolish();
                                                                Navigator.pop(context);
                                                                break;
                                                            }
                                                          },
                                                          child: Container(
                                                            height: 60,
                                                            width: MediaQuery.of(context).size.width,
                                                            margin: const EdgeInsets.symmetric(vertical: 7),
                                                            decoration: BoxDecoration(
                                                                border: Border.all(color: value == index ? AppColors.appColor : Colors.transparent,),
                                                                color:  Theme.of(context).scaffoldBackgroundColor,
                                                                borderRadius: BorderRadius.circular(10)),
                                                            child: Column(
                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                children: [
                                                                  Row(
                                                                    children: [
                                                                      Container(
                                                                        height: 45,
                                                                        width: 60,
                                                                        margin: const EdgeInsets.symmetric(
                                                                            horizontal: 10),
                                                                        decoration: BoxDecoration(
                                                                          color: Colors.transparent,
                                                                          borderRadius: BorderRadius.circular(100),
                                                                        ),
                                                                        child: Center(
                                                                          child: index < languageimage.length
                                                                              ? Container(
                                                                                  height: 32,
                                                                                  width: 32,
                                                                                  decoration: BoxDecoration(image: DecorationImage(image: AssetImage(languageimage[index]),)),
                                                                                )
                                                                              : Text(languageFlagEmoji[index - languageimage.length], style: const TextStyle(fontSize: 28)),
                                                                        ),
                                                                      ),
                                                                      const SizedBox(height: 10),
                                                                      Column(
                                                                        crossAxisAlignment:
                                                                        CrossAxisAlignment.start,
                                                                        children: [
                                                                          Text(languagetext[index], style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 14)),
                                                                        ],
                                                                      ),
                                                                      const Spacer(),
                                                                      CheckboxListTile(index),
                                                                      const SizedBox(width: 15,),
                                                                    ],
                                                                  ),
                                                                ]),
                                                          ),
                                                        );
                                                      },
                                                    )
                                                  ],
                                                ),
                                              ),
                                            ),
                                          );
                                        },
                                      );

                                    }
                                    else if(i == profileProvider.menuListcondition.length -2) {
                                      profileProvider.deleteButtomSheet(context);
                                    }else if(i == profileProvider.menuListcondition.length -3) {
                                      Share.share(
                                        "Hey! 👋've found this awesome dating app called ${profileProvider.appName} and thought you might be interested too! 😊.Check it out:${Platform.isAndroid
                                            ? 'https://play.google.com/store/apps/details?id=${profileProvider.packageName}'
                                            : Platform.isIOS
                                            ? 'https://apps.apple.com/us/app/${profileProvider.appName}/id${profileProvider.packageName}'
                                            : ""}",
                                      );
                                    }
                                    else if(i == profileProvider.menuListcondition.length -1) {
                                      isUserLogOut(Provider.of<HomeProvider>(context,listen: false).uid);
                                      Navigator.pushNamedAndRemoveUntil(context, AuthScreen.authScreenRoute,(route) => false,);
                                      homeProvider.setSelectPage(0);
                                      Preferences.clear();
                                      // await GoogleSignIn().signOut();
                                      // await FacebookAuth.instance.logOut();
                                      SharedPreferences prefs = await SharedPreferences.getInstance();
                                      prefs.setDouble("rediuse", 0);
                                    }
                                  },
                                  dense: true,
                                  contentPadding: EdgeInsets.zero,
                                  leading: SizedBox(
                                    height: 30,
                                    width: 30,
                                    child: Center(
                                      child: SvgPicture.asset("${profileProvider.menuListcondition[i]["icon"]}",colorFilter: ColorFilter.mode(profileProvider.menuListcondition[i]["iconShow"] == "0" ? Colors.red : Theme.of(context).indicatorColor, BlendMode.srcIn),
                                        // height: 25,
                                        // width: 25,
                                      ),
                                    ),
                                  ),
                                  title: Text(AppLocalizations.of(context)?.translate("${profileProvider.menuListcondition[i]["title"]}") ?? "${profileProvider.menuListcondition[i]["title"]}", style: Theme.of(context).textTheme.bodyMedium!.copyWith(color: profileProvider.menuListcondition[i]["iconShow"] == "0" ? Colors.red : null),),
                                  trailing:
                                  profileProvider.menuListcondition[i]["iconShow"] == "1" ? SvgPicture.asset("${profileProvider.menuListcondition[i]["traling"]}",colorFilter: ColorFilter.mode(Theme.of(context).indicatorColor, BlendMode.srcIn),) : const SizedBox(),
                                );
                              },
                              itemCount: profileProvider.menuListcondition.length
                          ),
                          // SizedBox(height: 100,)
                        ],
                      ),
                      profileloader ? Padding(
                        padding: const EdgeInsets.only(top: 300),
                        child: Center(child: CircularProgressIndicator(color: AppColors.appColor,)),
                      ) : SizedBox()
                    ],
                  );
                }
                else{
                  return Padding(
                    padding: const EdgeInsets.only(top: 300),
                    child: Center(child: CircularProgressIndicator(color: AppColors.appColor,)),
                  );
                }
              }
            ),
          ),
        ) : Center(child: CircularProgressIndicator(color: AppColors.appColor,)),
      ),
    );
  }

  void _openThemeModeSheet(BuildContext context) {
    final options = [
      (ThemeMode.system, "System", Icons.brightness_auto),
      (ThemeMode.light, "Light", Icons.light_mode),
      (ThemeMode.dark, "Dark", Icons.dark_mode),
    ];
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.only(topRight: Radius.circular(15), topLeft: Radius.circular(15)),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(15),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(AppLocalizations.of(context)?.translate("Dark Mode") ?? "Dark Mode", style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 15),
                  BlocBuilder<ThemeBloc, ThemeState>(
                    builder: (context, state) {
                      return Column(
                        children: options.map((opt) {
                          final selected = state.themeMode == opt.$1;
                          return GestureDetector(
                            onTap: () {
                              BlocProvider.of<ThemeBloc>(context).setTheme(opt.$1);
                              Navigator.pop(context);
                            },
                            child: Container(
                              height: 60,
                              margin: const EdgeInsets.symmetric(vertical: 7),
                              padding: const EdgeInsets.symmetric(horizontal: 15),
                              decoration: BoxDecoration(
                                border: Border.all(color: selected ? AppColors.appColor : Colors.transparent),
                                color: Theme.of(context).cardColor,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                children: [
                                  Icon(opt.$3, color: Theme.of(context).indicatorColor),
                                  const SizedBox(width: 15),
                                  Text(AppLocalizations.of(context)?.translate(opt.$2) ?? opt.$2, style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 14)),
                                  const Spacer(),
                                  if (selected) Icon(Icons.check_circle, color: AppColors.appColor),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                  const SizedBox(height: 15),
                ],
              ),
            ),
          ),
        );
      },
    );
  }


  Widget CheckboxListTile(int index) {
    return SizedBox(
      height: 24,
      width: 24,
      child: ElevatedButton(
        onPressed: () async {
          value = index;
          SharedPreferences preferences = await SharedPreferences.getInstance();
          setState(() {
            value = index;
            preferences.setInt("valuelangauge", value);

            switch (index) {
              case 0:
                BlocProvider.of<LanguageCubit>(context).toFrench();
                Navigator.pop(context);
                break;
              case 1:
                BlocProvider.of<LanguageCubit>(context).toEnglish();
                Navigator.pop(context);
                break;
              case 2:
                BlocProvider.of<LanguageCubit>(context).toSpanish();
                Navigator.pop(context);
                break;
              case 3:
                BlocProvider.of<LanguageCubit>(context).toArabic();
                Navigator.pop(context);
                break;
              case 4:
                BlocProvider.of<LanguageCubit>(context).toHindi();
                Navigator.pop(context);
                break;
              case 5:
                BlocProvider.of<LanguageCubit>(context).toGujarati();
                Navigator.pop(context);
                break;
              case 6:
                BlocProvider.of<LanguageCubit>(context).toAfrikaans();
                Navigator.pop(context);
                break;
              case 7:
                BlocProvider.of<LanguageCubit>(context).toBengali();
                Navigator.pop(context);
                break;
              case 8:
                BlocProvider.of<LanguageCubit>(context).toIndonesian();
                Navigator.pop(context);
                break;
              case 9:
                BlocProvider.of<LanguageCubit>(context).toItalian();
                Navigator.pop(context);
                break;
              case 10:
                BlocProvider.of<LanguageCubit>(context).toPortuguese();
                Navigator.pop(context);
                break;
              case 11:
                BlocProvider.of<LanguageCubit>(context).toGerman();
                Navigator.pop(context);
                break;
              case 12:
                BlocProvider.of<LanguageCubit>(context).toDutch();
                Navigator.pop(context);
                break;
              case 13:
                BlocProvider.of<LanguageCubit>(context).toChinese();
                Navigator.pop(context);
                break;
              case 14:
                BlocProvider.of<LanguageCubit>(context).toJapanese();
                Navigator.pop(context);
                break;
              case 15:
                BlocProvider.of<LanguageCubit>(context).toVietnamese();
                Navigator.pop(context);
                break;
              case 16:
                BlocProvider.of<LanguageCubit>(context).toRussian();
                Navigator.pop(context);
                break;
              case 17:
                BlocProvider.of<LanguageCubit>(context).toTurkish();
                Navigator.pop(context);
                break;
              case 18:
                BlocProvider.of<LanguageCubit>(context).toPolish();
                Navigator.pop(context);
                break;
            }

          });
        },
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.ivory,
          side: BorderSide(
            color: (value == index)
                ? Colors.transparent
                : Colors.transparent,
            width: (value == index) ? 2 : 2,
          ),
          padding: const EdgeInsets.all(0),
        ),
        child: Center(
            child: Icon(
              Icons.check,
              color: value == index ? Colors.black : Colors.transparent,
              size: 18,
            )),
      ),
    );
  }



}
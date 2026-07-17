import 'package:flutter/material.dart';
import 'package:lovmy_ui/lovmy_ui.dart';

void main() => runApp(const GalleryApp());

class GalleryApp extends StatelessWidget {
  const GalleryApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LovMy UI',
      debugShowCheckedModeBanner: false,
      theme: LovMyTheme.dark,
      home: const GalleryScreen(),
    );
  }
}

class GalleryScreen extends StatelessWidget {
  const GalleryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Photo de démo (nécessite un accès réseau).
    const demoPhoto = NetworkImage('https://picsum.photos/seed/lovmy/600/800');

    return LovMyAuroraBackground(
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 60),
          children: [
            const LovMyLogo(markSize: 44),
            const SizedBox(height: 6),
            Text('COMPOSANTS · ÉTAPE 1', style: LovMyTypography.eyebrow),
            const SizedBox(height: 28),

            _Section('Boutons'),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                LovMyPassionButton(onPressed: () {}, child: const Text('Passion')),
                LovMyEmberGlowButton(onPressed: () {}, child: const Text('Ember Glow')),
                LovMyScaleTapButton(onPressed: () {}, child: const Text('Scale Tap')),
                const LovMyLikeButton(),
              ],
            ),
            const SizedBox(height: 30),

            _Section('Carte de profil'),
            LovMyReveal(
              child: LovMyProfileCard(
                image: demoPhoto,
                name: 'Amara',
                age: 27,
                location: 'Abidjan · 3 km',
                verified: true,
                online: true,
                tags: const ['Voyage', 'Café', 'Design'],
              ),
            ),
            const SizedBox(height: 30),

            _Section('Carte à swiper'),
            SizedBox(
              height: 380,
              child: LovMySwipeCard(
                onSwiped: (_) {},
                child: LovMyProfileCard(image: demoPhoto, name: 'Koffi', age: 29, tags: const ['Musique', 'Sport']),
              ),
            ),
            const SizedBox(height: 30),

            _Section('Chat'),
            const LovMyChatBubble(text: 'Salut ! Ton profil m\'a tapé dans l\'œil 👀', time: '21:04'),
            const LovMyChatBubble(text: 'Haha merci — on prend un café ?', outgoing: true, time: '21:05'),
            const SizedBox(height: 10),
            const Align(alignment: Alignment.centerLeft, child: LovMyTypingIndicator()),
            const SizedBox(height: 30),

            _Section('Verre & Premium'),
            LovMyGlassCard(
              child: Row(
                children: [
                  const LovMyHeartbeatLoader(size: 40),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        LovMyPremiumBadge(),
                        SizedBox(height: 8),
                        Text('Passez Premium pour voir qui vous a liké.', style: LovMyTypography.bodySoft),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            LovMyPricingCard(
              title: 'Gold',
              price: '4 900 F',
              featured: true,
              features: const ['Likes illimités', 'Voir qui vous a liké', '1 Boost par semaine'],
              action: LovMyPassionButton(onPressed: () {}, child: const Text('Choisir Gold')),
            ),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  const _Section(this.title);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Text(title, style: LovMyTypography.title),
      );
}

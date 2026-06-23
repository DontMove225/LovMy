<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            ['question' => 'Quelle photo dois-je utiliser sur LovMy ?', 'answer' => 'Téléchargez sur LovMy des photos qui montrent la personne que tout le monde est venu voir : vous ! Oublie tes amis car il ne s\'agit pas d\'eux et enlève tes lunettes de soleil car elles cachent ton visage.', 'status' => 1],
            ['question' => 'Que dois-je mettre dans ma biographie ?', 'answer' => 'Votre biographie est un instantané de qui vous êtes. Parlez de vos hobbies ou de ce que vous recherchez chez un partenaire.', 'status' => 1],
            ['question' => 'Comment puis-je annuler une mise en relation ?', 'answer' => 'Vous pouvez annuler la mise en relation avec n\'importe qui à tout moment depuis leur profil.', 'status' => 1],
            ['question' => 'Comment fonctionnent les matchs LovMy ?', 'answer' => 'Deux membres doivent tous deux utiliser la fonction Swipe Right® pour s\'aimer l\'un l\'autre afin d\'établir une correspondance.', 'status' => 1],
            ['question' => 'LovMy est-il gratuit ?', 'answer' => 'LovMy peut être téléchargé gratuitement. Les fonctionnalités de base vous permettent de créer un profil et d\'utiliser les swipes.', 'status' => 1],
            ['question' => 'Comment fonctionne LovMy ?', 'answer' => 'LovMy vous met en relation avec des profils grâce à la technologie de géolocalisation, en fonction des filtres de sexe, de distance et d\'orientation que vous avez définis.', 'status' => 1],
            ['question' => 'Les profils LovMy sont-ils réels ?', 'answer' => 'LovMy propose la vérification des photos pour s\'assurer que la personne à qui vous parlez correspond à ses photos.', 'status' => 1],
            ['question' => 'LovMy peut-il être utilisé sur un ordinateur ?', 'answer' => 'Oui, LovMy est disponible sur web et sur les applications mobiles iOS et Android.', 'status' => 1],
        ];

        DB::table('tbl_faq')->insertOrIgnore($faqs);
    }
}

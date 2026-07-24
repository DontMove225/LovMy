# LovMy Web V2

Projet Next.js pour la version V2 du frontend LovMy.

## Installation

1. Copier `.env.local.example` vers `.env.local`.
2. Installer les dépendances : `npm install`.
3. Lancer le serveur de développement : `npm run dev`.

## Structure

- `src/app/` : pages et layout Next.js
- `src/context/` : provider de contexte pour les URLs API/images/paiement
- `public/` : fichiers statiques (à créer / copier si nécessaire)

## Notes

- Le projet est prêt à démarrer la migration depuis React CRA.
- La `Home` page affiche déjà les URLs de connexion à l'API.
- Il faudra migrer les routes et composants existants plus tard.

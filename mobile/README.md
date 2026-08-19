# Figures — app mobile (iOS)

Version native (React Native / Expo) de l'app web Figures. Elle partage le
même backend Supabase que `index.html` (donc les classes/personnages créés
sur le web sont visibles côté mobile et inversement), et appelle la même
fonction Netlify (`netlify/functions/complete.js`) pour la génération IA des
fiches personnage.

## Ce qui est déjà fait

- Écrans élève : accueil/quiz, mes fiches (collection + maîtrise), mon espace
- Écrans prof : fiches (par matière), classe (créer/rejoindre/rooster/assigner),
  réglages, création de personnage par IA (nom → quiz généré, éditable)
- Lecteur de quiz + résultat (score, fiche générée, récompenses)
- Mode révision (questions reconstruites à partir des fiches déjà collectées)
- 10 badges (4 génériques + 6 par matière), calculés en direct
- Auth Supabase pour les profs (email/mot de passe), élèves identifiés par
  code de classe + prénom/nom (comme sur le web)
- 8 quiz prêts à l'emploi (Curie, Hugo, Newton, César, Molière, Van Gogh,
  Mozart, Owens) + le quiz de démo partagé (Napoléon)
- Icône, splash screen, configuration EAS (`eas.json`)

## Ce qui reste à faire avant publication

- **Compte Apple Developer** : tu en as un ✓ — il faudra son Apple Team ID
  et un Apple ID avec accès App Store Connect (voir `eas.json`, section
  `submit.production.ios`, à compléter).
- **Bundle identifier** : `com.figures.app` dans `app.json` est un
  placeholder — remplace-le par un identifiant que tu contrôles (ex.
  `com.tonnom.figures`) avant le premier build.
- **URL de l'app web déployée** : copie `.env.example` vers `.env` et
  renseigne `EXPO_PUBLIC_API_BASE_URL` avec l'URL Netlify de `index.html`
  (c'est elle qui expose `/.netlify/functions/complete` pour l'IA).
- **Icônes/splash définitifs** : j'ai généré une version simple du logo
  "F." (`assets/icon.png`, `assets/splash-icon.png`) — à remplacer par une
  version travaillée si besoin.
- **Tests réels sur device** : rien n'a été testé sur un vrai iPhone/simulateur
  depuis cet environnement (pas de Mac ici) — à faire via Expo Go ou un build
  de dev avant la soumission.

## Comment builder sans Mac (EAS Build)

Comme tu n'as pas de Mac, le build/signature iOS se fait dans le cloud via
[EAS Build](https://docs.expo.dev/build/introduction/) — Expo compile,
signe et (si demandé) soumet l'app à l'App Store Connect à ta place.

```bash
cd mobile
npm install
npm install -g eas-cli   # ou: npx eas-cli ...

eas login                # connecte ton compte Expo (gratuit)
eas build:configure      # confirme la config iOS (bundle id, etc.)

# Build de test installable sur ton iPhone sans passer par l'App Store :
eas build --platform ios --profile preview

# Build de production (à soumettre à l'App Store) :
eas build --platform ios --profile production

# Une fois le build prêt, soumission directe à App Store Connect :
eas submit --platform ios --profile production
```

`eas build` te demandera de te connecter à ton compte Apple Developer une
fois (identifiants Apple ID) — EAS gère ensuite les certificats et profils de
provisionnement automatiquement, sans Xcode.

## Développement local (aperçu rapide)

```bash
npm install
npx expo start
```

Scanne le QR code avec l'app **Expo Go** (iOS/Android) pour prévisualiser
l'app sans build natif — pratique pour itérer sur l'UI avant de lancer un
vrai build EAS.

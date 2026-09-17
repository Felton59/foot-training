# Foot Training ⚽

Application d'entraînement de foot pour enfant : séances guidées, défis chiffrés, XP, niveaux et badges.
Fonctionne hors-ligne ; les données restent sur le téléphone (pensez à exporter une sauvegarde).

## Développement

    npm install
    npm run dev        # serveur local (accessible depuis le téléphone sur le même Wi-Fi)
    npm test           # tests unitaires
    npm run typecheck
    npm run build

Le contenu (exercices, défis, badges, niveaux) se modifie dans `src/data/`.

## Mise en ligne (GitHub Pages)

1. Créer un dépôt GitHub et y pousser la branche `main`.
2. Settings → Pages → Source : « GitHub Actions ».
3. Chaque push sur `main` déploie l'app sur `https://<utilisateur>.github.io/<dépôt>/`.

## Installation sur le téléphone

- Android (Chrome) : ouvrir l'adresse → menu ⋮ → « Installer l'application ».
- iPhone (Safari) : ouvrir l'adresse → bouton Partager → « Sur l'écran d'accueil ».

# Foot Training — Design

Date : 2026-09-17

## Objectif

Application mobile d'entraînement de football pour un enfant de 8 ans, utilisée à deux (parent + enfant) sur le téléphone du parent, pendant les séances au jardin, au parc ou au terrain. Elle doit le faire progresser grâce à des séances guidées, des défis chiffrés et un système de motivation (XP, niveaux, badges).

Rythme cible : 3 à 5 séances par semaine, de 30 min à 1 h.

Domaines travaillés : technique balle au pied, passes et tirs, physique / coordination, gardien de but.

Matériel disponible : ballon, plots, jardin, terrain / parc.

## Hors périmètre (v1)

- Synchronisation entre appareils, comptes utilisateurs, serveur.
- Plusieurs profils d'enfants.
- Vidéos ou animations d'exercices (texte + emoji/icônes uniquement).
- Notifications push.

## Choix technique

Web app installable (PWA), 100 % hors-ligne, données stockées sur le téléphone.

- Vite + React + TypeScript
- `vite-plugin-pwa` (manifest + service worker, pré-cache de tous les assets)
- Vitest pour les tests unitaires
- Hébergement statique : GitHub Pages ou Netlify
- Interface en français, pensée mobile (portrait, gros boutons, texte court)

## Architecture

```
src/
  data/
    exercises.ts      # bibliothèque d'exercices (données pures)
    challenges.ts     # défis mesurables + paliers
    badges.ts         # définitions des badges
    levels.ts         # seuils d'XP des niveaux
  engine/
    sessionBuilder.ts # compose une séance
    progression.ts    # XP, niveaux, badges, paliers, semaine réussie
    week.ts           # utilitaires de semaine (lundi → dimanche)
  storage/
    schema.ts         # types de l'état persistant + version
    store.ts          # lecture/écriture localStorage, migrations
    backup.ts         # export / import JSON validé
  ui/
    screens/          # Home, Session, Challenges, Progress, Settings
    components/       # Timer, XpBar, BadgeCard, TierChip, ...
  App.tsx
```

Règles :
- `engine/*` ne dépend que de `data/*` et des types de `storage/schema.ts` : fonctions pures, sans accès au DOM, au stockage ni à l'heure système (la date est passée en paramètre).
- `ui/*` appelle `engine` et `storage`, jamais l'inverse.

## Modèle de données

### Contenu (statique)

```ts
type Domain = 'technique' | 'passes-tirs' | 'physique' | 'gardien';
type Equipment = 'ballon' | 'plots' | 'grand-espace';

interface Exercise {
  id: string;
  name: string;
  domain: Domain | 'echauffement' | 'retour-calme';
  durationMin: number;          // durée par défaut
  equipment: Equipment[];       // tout le matériel requis
  steps: string[];              // 2 à 4 consignes courtes
  tip?: string;                 // conseil de coach
}

interface Challenge {
  id: string;
  name: string;
  domain: Domain;
  unit: string;                 // "jongles", "s", "tirs cadrés /10"...
  better: 'higher' | 'lower';
  tiers: { bronze: number; argent: number; or: number };
  maxValue?: number;            // plafond pour 'higher' (ex. 10 pour les "/10")
  minValue?: number;            // plancher pour 'lower' (ex. 3.5 s au sprint 20 m)
  equipment: Equipment[];
  howTo: string[];
}
```

Bibliothèque de départ : ~40 exercices (au moins 4 échauffements, 3 retours au calme, 8 par domaine technique / passes-tirs / physique, 5 gardien) et les 10 défis ci-dessous.

| Défi | Domaine | Unité | Sens | Bronze | Argent | Or |
|---|---|---|---|---|---|---|
| Jongles pied fort (FFF Cher, défi jonglage) | technique | jongles | + | 10 | 20 | 30 |
| Jongles pied faible (FFF Cher, défi jonglage) | technique | jongles | + | 5 | 10 | 20 |
| Défi slalom 12 points (FFF Yvelines U9, fiche 6) | technique | points (/12) | + | 8 | 10 | 12 |
| Défi contrôle orienté + tir (FFF Escaut, défi U10-U11) | technique | points (/15) | + | 6 | 9 | 12 |
| Défi passe dosée (FFF Yvelines U9, fiche 7) | passes-tirs | points (/50) | + | 15 | 25 | 35 |
| Défi tir (FFF Mayenne, fiches 4 et 7) | passes-tirs | points (/15) | + | 5 | 8 | 11 |
| Défi tir pied faible (FFF Mayenne, fiche 4) | passes-tirs | points (/15) | + | 3 | 6 | 9 |
| Sprint 20 m (FFF Vendée, tests PPF) | physique | s | − | 5.0 | 4.5 | 4.1 |
| Allers-retours en 1 minute (FFF Mayenne, fiche 2) | physique | allers-retours | + | 3 | 4 | 5 |
| Défi tirs au but, gardien (FFF Indre-et-Loire, défi U11) | gardien | /10 | + | 3 | 5 | 7 |

**Paliers au-delà de l'or** : une fois l'or atteint, des paliers « Or +1 », « Or +2 », etc. se débloquent, espacés du même écart qu'entre argent et or (ex. jongles : 75, 100, 125…). Pour les défis « /10 », le plafond est 10 ; pour les temps, un plancher raisonnable est fixé par défi (`minValue`) et on n'ajoute plus de palier au-delà.

### État persistant

```ts
interface AppState {
  version: 1;
  profile: { name: string; avatar: string; equipment: Equipment[] };
  sessions: CompletedSession[];
  results: ChallengeResult[];
  badges: { id: string; earnedAt: string }[];   // ISO date
  inProgress?: InProgressSession;
  lastBackupAt?: string;
}

interface CompletedSession {
  id: string;
  date: string;                // ISO
  plannedMin: 30 | 45 | 60;
  items: { exerciseId: string; domain: string; durationMin: number; done: boolean }[];
}

interface ChallengeResult { challengeId: string; date: string; value: number }

interface InProgressSession {
  plan: SessionPlan;
  currentIndex: number;
  remainingSec: number;
  startedAt: string;
}
```

L'XP et le niveau ne sont **pas stockés** : ils sont recalculés depuis `sessions` et `results` (source de vérité unique, pas d'incohérence possible). Les badges sont stockés pour conserver leur date d'obtention.

## Composition d'une séance (`sessionBuilder`)

Entrées : durée choisie (30/45/60), matériel du profil, historique des séances, date du jour, générateur aléatoire injectable (pour les tests).

Structure :

| Durée | Échauffement | Blocs d'exercices | Défi | Retour au calme |
|---|---|---|---|---|
| 30 min | 5 min | 2 blocs | 1 (~5 min) | 3 min |
| 45 min | 5 min | 3 blocs | 1 | 5 min |
| 60 min | 7 min | 4 blocs | 1 | 5 min |

Un bloc = 1 ou 2 exercices du même domaine, dont la durée totale remplit le temps restant réparti équitablement entre blocs.

Règles :
1. Seuls les exercices et défis dont tout le matériel est disponible sont proposés.
2. Les domaines des blocs sont choisis du moins récemment travaillé au plus récent (sur l'historique), sans doublon dans une même séance tant que possible.
3. Le domaine **gardien** apparaît au plus dans 1 séance sur 3 (sur les 3 dernières séances).
4. Un exercice présent dans la séance précédente n'est pas reproposé s'il existe une alternative.
5. Le défi porte sur un des domaines de la séance ; priorité au défi le moins récemment tenté.
6. Si les filtres ne laissent aucun exercice pour un domaine, ce domaine est sauté et remplacé par le suivant.

Pendant la séance : l'utilisateur peut « passer » un exercice (marqué `done: false`) ou le terminer. Le minuteur émet un bip + vibration (si disponible) en fin d'exercice ; le passage au suivant reste manuel.

## Progression (`progression`)

### XP
- Séance terminée : 1 XP par minute d'exercice réellement faite (items `done`).
- Nouveau record personnel sur un défi : +20 XP (pas pour le tout premier résultat).
- Palier atteint pour la première fois : bronze +15, argent +25, or +40, chaque palier Or+n +40.
- Semaine réussie (≥ 3 séances du lundi au dimanche) : +50 XP, une fois par semaine.

### Niveaux

| Niveau | XP requis |
|---|---|
| Poussin | 0 |
| Espoir | 250 |
| Titulaire | 700 |
| Capitaine | 1400 |
| Star | 2500 |
| Légende | 4000 |

(≈ 250 XP/semaine attendus → Légende en ~4 mois ; ajustable dans `levels.ts`.)

### Badges (liste de départ)

| Badge | Condition |
|---|---|
| Premier pas | 1 séance terminée |
| Régulier | 10 séances |
| Acharné | 50 séances |
| Semaine en or | 1 semaine réussie |
| Série de 4 | 4 semaines réussies consécutives |
| 50 jongles | ≥ 50 au défi jongles |
| Pied gauche en feu | or au défi jongles pied faible **ou** tirs pied faible |
| Fusée | or au sprint 20 m |
| Sniper | 10/10 aux tirs cadrés |
| Mur infranchissable | or aux arrêts sur 10 tirs |
| Touche-à-tout | au moins bronze sur un défi de chaque domaine |
| Collectionneur | or sur 5 défis différents |

Les badges sont réévalués après chaque séance et chaque résultat de défi ; les nouveaux badges et un passage de niveau déclenchent un écran de célébration.

## Écrans

- **Accueil** : prénom + avatar, niveau + barre d'XP vers le suivant, pastilles des 7 jours de la semaine (séances faites, objectif 3–5), bouton « Commencer la séance » (choix 30/45/60) ; si une séance est en cours : bouton « Reprendre ».
- **Séance** : aperçu du plan (liste + matériel à préparer) → déroulé plein écran exercice par exercice (nom, domaine, consignes, conseil, grand minuteur, boutons Pause / Passer / Terminé) → saisie du défi → récapitulatif (XP gagnée, records, badges).
- **Défis** : liste des 10 défis avec record et palier actuel ; détail : consignes, saisie d'un résultat hors séance, courbe de progression (SVG simple), prochain palier.
- **Progrès** : badges (obtenus / à débloquer avec condition), historique des séances, minutes par domaine sur les 4 dernières semaines.
- **Réglages** : prénom, avatar (choix d'emoji), matériel disponible, Exporter / Importer la sauvegarde, réinitialiser (double confirmation).

Navigation : barre d'onglets en bas (Accueil, Défis, Progrès, Réglages) ; l'écran Séance est plein écran, sans barre.

## Stockage et erreurs

- Clé localStorage unique `foot-training:state`, écriture après chaque action (fin d'exercice, résultat, réglage).
- `store.load()` : si absent → état initial (écran d'accueil demande le prénom) ; si JSON illisible → on conserve la valeur brute sous `foot-training:corrupt-<date>` et on affiche un message proposant d'importer une sauvegarde.
- Migrations : fonction par version (`migrate[n]`), appliquées en chaîne au chargement.
- Si localStorage est indisponible (navigation privée), bandeau d'avertissement « la progression ne sera pas enregistrée ».
- Export : fichier `foot-training-AAAA-MM-JJ.json` ; met à jour `lastBackupAt`.
- Import : validation de la structure et de la version avant de remplacer l'état ; en cas d'échec, message clair et état actuel inchangé.
- Rappel de sauvegarde sur l'accueil si `lastBackupAt` absent ou > 30 jours et au moins 5 séances.
- Saisie de défi : valeur numérique positive obligatoire ; si le résultat dépasse le record de plus de 2× (ou divise un temps par plus de 1,5), demande de confirmation.
- Séance en cours sauvegardée à chaque changement d'exercice et toutes les 10 s du minuteur ; reprise possible jusqu'à 12 h après `startedAt`, sinon proposée à l'abandon.
- Écran maintenu allumé pendant la séance via Wake Lock API si disponible (sinon ignoré).

## Tests

Vitest, sur les modules purs :
- `sessionBuilder` : respect de la durée totale (± 2 min), filtre matériel, rotation des domaines, règle gardien 1/3, non-répétition, repli quand un domaine est vide.
- `progression` : calcul d'XP, seuils de niveaux, records, paliers (dont Or+n et plafonds), semaine réussie, chaque badge.
- `week` : découpage lundi → dimanche.
- `store` / `backup` : état initial, migrations, JSON corrompu, import invalide rejeté.
- Données : chaque exercice/défi a un id unique, un matériel valide, des paliers cohérents avec `better`.

Vérification manuelle avant mise en ligne : parcours complet d'une séance en viewport mobile, installation PWA et fonctionnement en mode avion.

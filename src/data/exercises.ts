import type { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  // Échauffement (4)
  { id: 'ech-trottinage-ballon', name: 'Trottinage ballon au pied', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Pose 2 plots (ou 2 repères) à 10 m l'un de l'autre.", "Fais des allers-retours entre les repères en poussant le ballon à petites touches, en changeant de pied toutes les 10 touches.", "Pour finir : fais le plus d'allers-retours possible en 1 minute, sans perdre le ballon."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 2)",
    diagram: {
      height: 40,
      items: [
        { kind: 'plot', x: 8, y: 22 }, { kind: 'plot', x: 92, y: 22 }, { kind: 'enfant', x: 16, y: 12 }, { kind: 'ballon', x: 23, y: 14 },
        { kind: 'texte', x: 50, y: 5, text: 'petites touches' }, { kind: 'texte', x: 50, y: 36, text: '10 m' },
      ],
      arrows: [
        { kind: 'course', points: [[28, 16], [84, 16]], label: '1' },
        { kind: 'course', points: [[84, 27], [16, 27]], label: '2' },
      ],
    } },
  { id: 'ech-toe-taps', name: 'Toe taps', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Ballon arrêté devant toi : touche le dessus du ballon avec la semelle, sans appuyer, pied droit puis pied gauche, en alternant vite.", "Fais 30 secondes rapide, puis 15 secondes de repos.", "Recommence jusqu'à la fin du temps."],
    tip: 'Reste sur la pointe des pieds.' },
  { id: 'ech-mobilite', name: 'Réveil du corps', domain: 'echauffement', durationMin: 5, equipment: [],
    steps: ["Cours sur place en montant les genoux (30 s), puis en touchant tes fesses avec les talons (30 s).", "Fais 10 grands cercles de bras vers l'avant, puis 10 vers l'arrière.", "Fais 5 pas chassés vers la gauche, puis 5 vers la droite. Recommence tout jusqu'à la fin du temps."] },
  { id: 'ech-passes-douces', name: 'Passes douces avec papa', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Faites-vous des passes tout doucement.", "Arrête le ballon avec un pied, renvoie-le avec l'autre."],
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 15, y: 20 }, { kind: 'papa', x: 85, y: 20 }, { kind: 'texte', x: 50, y: 34, text: '3 m' }],
      arrows: [{ kind: 'balle', points: [[22, 17], [77, 17]] }, { kind: 'balle', points: [[77, 23], [22, 23]] }],
    } },

  // Technique (16)
  { id: 'tech-jongles-series', name: 'Séries de jongles', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ["Jongle le plus longtemps possible en comptant tes touches.", "Quand le ballon tombe, recommence en essayant de battre ton score.", "Si c'est trop dur : laisse le ballon rebondir une fois par terre entre deux touches."],
    tip: 'Cheville bloquée, pointe du pied légèrement levée.' },
  { id: 'tech-jongles-pied-faible', name: 'Jongles pied faible', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Jongle uniquement avec ton pied le moins fort.", "Au début, laisse le ballon rebondir par terre entre deux touches.", "Quand ça devient facile, essaie sans rebond."] },
  { id: 'tech-conduite-semelle', name: 'Conduite à la semelle', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Recule sur 5 m en tirant le ballon vers toi avec la semelle.", "Puis fais rouler le ballon de côté sous ta semelle, en pas chassés, sur 3 m.", "Recommence avec l'autre pied."],
    diagram: {
      height: 50,
      items: [
        { kind: 'enfant', x: 76, y: 14 }, { kind: 'ballon', x: 84, y: 14 }, { kind: 'plot', x: 93, y: 14 },
        { kind: 'plot', x: 22, y: 14 }, { kind: 'texte', x: 50, y: 5, text: '5 m en reculant' }, { kind: 'texte', x: 44, y: 34, text: '3 m de côté' },
      ],
      arrows: [
        { kind: 'course', points: [[66, 18], [28, 18]], label: '1' },
        { kind: 'course', points: [[22, 22], [22, 44]], label: '2' },
      ],
    } },
  { id: 'tech-slalom', name: 'Slalom entre les plots', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Aligne 4 plots espacés de 1,5 m.", "Fais l'aller-retour en slalom, ballon au pied : aller avec le pied droit, retour avec le pied gauche.", "Tu pars avec 10 points : chaque plot touché fait perdre 1 point. Recommence en essayant de garder tes 10 points, puis de plus en plus vite."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 11)",
    tip: 'Petites touches, ballon collé au pied.',
    diagram: {
      height: 50,
      items: [
        { kind: 'enfant', x: 8, y: 25 }, { kind: 'ballon', x: 14, y: 29 },
        { kind: 'plot', x: 30, y: 25 }, { kind: 'plot', x: 46, y: 25 }, { kind: 'plot', x: 62, y: 25 }, { kind: 'plot', x: 78, y: 25 },
      ],
      arrows: [
        { kind: 'course', curve: true, points: [[16, 25], [30, 14], [38, 25], [46, 36], [54, 25], [62, 14], [70, 25], [78, 36], [92, 25]] },
      ],
    } },
  { id: 'tech-crochets', name: 'Crochets et demi-tours', domain: 'technique', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Pose un plot à 5 m devant toi.", "Conduis le ballon jusqu'au plot, fais demi-tour avec l'intérieur du pied et reviens.", "Recommence avec l'extérieur du pied, puis avec la semelle."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 8, y: 20 }, { kind: 'ballon', x: 15, y: 25 }, { kind: 'plot', x: 80, y: 20 },
        { kind: 'texte', x: 45, y: 6, text: '5 m' }, { kind: 'texte', x: 80, y: 35, text: 'demi-tour' },
      ],
      arrows: [{ kind: 'course', curve: true, points: [[18, 14], [72, 13], [89, 20], [72, 27], [22, 27]] }],
    } },
  { id: 'tech-controle-lance', name: 'Contrôles de balles lancées', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ["Papa, à 3 m de toi, te lance le ballon en cloche, à la main.", "Arrête-le avec le pied, la cuisse ou la poitrine : il doit rester tout près de toi.", "Change de partie du corps à chaque fois."],
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 15, y: 24 }, { kind: 'papa', x: 85, y: 24 }, { kind: 'texte', x: 50, y: 36, text: '3 m' }],
      arrows: [{ kind: 'balle', curve: true, points: [[78, 20], [50, 6], [22, 20]] }],
    } },
  { id: 'tech-controle-oriente', name: 'Contrôle orienté', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Pose un plot à 3 m à ta gauche et un à 3 m à ta droite.", "Papa te fait une passe et crie « gauche » ou « droite ».", "D'une seule touche, pousse le ballon vers le bon plot."],
    diagram: {
      items: [
        { kind: 'enfant', x: 50, y: 24 }, { kind: 'papa', x: 50, y: 53 },
        { kind: 'plot', x: 10, y: 24 }, { kind: 'plot', x: 90, y: 24 },
        { kind: 'texte', x: 50, y: 8, text: '« gauche » ou « droite » ?' },
      ],
      arrows: [
        { kind: 'balle', points: [[50, 46], [50, 31]], label: '1' },
        { kind: 'balle', points: [[44, 24], [16, 24]], label: '2' },
        { kind: 'balle', points: [[56, 24], [84, 24]], label: '2' },
      ],
    } },
  { id: 'tech-dribble-1c1', name: 'Dribble contre papa', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m ; papa se met devant.", "Pars à 8 m du but avec le ballon et essaie de passer papa avec une feinte.", "Si tu le passes, tire dans le but. Papa défend doucement au début."],
    diagram: {
      items: [
        { kind: 'enfant', x: 8, y: 30 }, { kind: 'ballon', x: 15, y: 34 }, { kind: 'papa', x: 68, y: 30 },
        { kind: 'plot', x: 92, y: 20 }, { kind: 'plot', x: 92, y: 40 }, { kind: 'texte', x: 58, y: 54, text: 'feinte' },
      ],
      arrows: [
        { kind: 'course', curve: true, points: [[19, 30], [48, 30], [60, 45], [76, 42]], label: '1' },
        { kind: 'balle', points: [[79, 39], [94, 30]], label: '2' },
      ],
    },
    withGoal: {
      steps: ["Papa se met devant le but.", "Pars à 8 m du but avec le ballon et essaie de passer papa avec une feinte.", "Si tu le passes, tire dans le but. Papa défend doucement au début."],
      equipment: ['ballon', 'but'],
      goal: { x: 95, y: 30, length: 20, vertical: true, removes: [[92, 20], [92, 40]] },
    } },
  { id: 'tech-feintes', name: 'Feintes sur place', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Ballon arrêté devant toi : fais tourner ta jambe devant le ballon sans le toucher (passement de jambe), 10 fois à gauche puis 10 fois à droite.", "Fais semblant de tirer, puis emmène le ballon sur le côté avec l'intérieur du pied (crochet), 10 fois.", "Recommence de plus en plus vite."] },

  { id: 'tech-10-vies', name: 'Les 10 vies', domain: 'technique', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Fais un carré de 8 m sur 8 m avec 4 plots. Tu commences avec 10 vies.", "Conduis ton ballon dans le carré pendant 30 secondes : papa essaie de toucher ton ballon ou de le sortir du carré.", "Papa touche le ballon : tu perds 1 vie. Il le sort du carré : tu perds 2 vies. Fais 3 manches et compte les vies qui te restent."],
    source: "FFF – District de Lyon et du Rhône, « Ateliers U9 »",
    tip: 'Mets ton corps entre papa et le ballon, et garde le ballon loin de ses pieds.',
    diagram: {
      items: [
        { kind: 'plot', x: 10, y: 8 }, { kind: 'plot', x: 90, y: 8 }, { kind: 'plot', x: 10, y: 52 }, { kind: 'plot', x: 90, y: 52 },
        { kind: 'texte', x: 50, y: 4, text: 'carré de 8 m' },
        { kind: 'enfant', x: 44, y: 32 }, { kind: 'ballon', x: 36, y: 36 }, { kind: 'papa', x: 70, y: 22 },
      ],
      arrows: [{ kind: 'course', points: [[64, 25], [42, 34]] }],
    } },

  { id: 'tech-maison-jardin', name: "Maison ou jardin", domain: 'technique', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Fais un carré de 6 m avec 4 plots et pose un repère au milieu (plot couché ou vêtement) : c'est la « maison ».", "Conduis ton ballon dans le carré sans t'arrêter.", "Papa crie « Maison » : bloque le ballon avec la semelle sur le repère. « Jardin » : sors vite du carré ballon au pied. « Top » : bloque le ballon là où tu es."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 9)",
    tip: "Garde le ballon tout près de toi pour pouvoir l'arrêter à tout moment.",
    diagram: {
      items: [{ kind: 'plot', x: 15, y: 8 }, { kind: 'plot', x: 85, y: 8 }, { kind: 'plot', x: 15, y: 52 }, { kind: 'plot', x: 85, y: 52 }, { kind: 'plot', x: 50, y: 30 }, { kind: 'texte', x: 50, y: 40, text: "maison" }, { kind: 'enfant', x: 28, y: 18 }, { kind: 'ballon', x: 34, y: 22 }],
      arrows: [{ kind: 'course', curve: true, points: [[36, 25], [44, 24], [47, 28]] }],
    } },
  { id: 'tech-couleurs', name: "Couleurs annoncées", domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Pose 3 plots de couleurs différentes en éventail, à 5 m de ton point de départ.", "Papa annonce une couleur : conduis ton ballon jusqu'au plot de cette couleur, fais-en le tour et reviens au départ.", "Quand c'est facile, papa annonce 2 couleurs à la suite. Chaque plot non touché rapporte 1 point."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiches 5, 6 et 14)",
    tip: "Pas de plots de couleur ? Numérote-les 1, 2 et 3.",
    diagram: {
      height: 50,
      items: [{ kind: 'enfant', x: 10, y: 25 }, { kind: 'ballon', x: 17, y: 28 }, { kind: 'plot', x: 78, y: 8 }, { kind: 'plot', x: 84, y: 25 }, { kind: 'plot', x: 78, y: 42 }, { kind: 'texte', x: 50, y: 6, text: "« rouge ! »" }],
      arrows: [{ kind: 'course', curve: true, points: [[21, 26], [70, 18], [88, 25], [72, 32], [22, 30]] }],
    } },
  { id: 'tech-dribble-plots', name: "Dribble des plots et tir", domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Aligne 2 plots espacés de 4 m, puis fais un but de 2 plots 4 m après le 2e.", "Pars ballon au pied : évite le 1er plot par un dribble (1 point), puis le 2e (1 point).", "Tire dans le but (1 point) : 3 points possibles. Change de pied et de dribble à chaque passage."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 8)",
    diagram: {
      height: 50,
      items: [{ kind: 'enfant', x: 6, y: 25 }, { kind: 'ballon', x: 12, y: 29 }, { kind: 'plot', x: 35, y: 25 }, { kind: 'plot', x: 60, y: 25 }, { kind: 'plot', x: 92, y: 15 }, { kind: 'plot', x: 92, y: 35 }],
      arrows: [{ kind: 'course', curve: true, points: [[16, 25], [30, 14], [42, 25], [55, 36], [67, 25]], label: "1" }, { kind: 'balle', points: [[71, 25], [91, 25]], label: "2" }],
    },
    withGoal: {
      steps: ["Aligne 2 plots espacés de 4 m, le 2e à 4 m du but.", "Pars ballon au pied : évite le 1er plot par un dribble (1 point), puis le 2e (1 point).", "Tire dans le but (1 point) : 3 points possibles. Change de pied et de dribble à chaque passage."],
      equipment: ['ballon', 'plots', 'but'],
      goal: { x: 95, y: 25, length: 20, vertical: true, removes: [[92, 15], [92, 35]] },
    } },
  { id: 'tech-soleil', name: "1, 2, 3 Soleil ballon au pied", domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Papa se met à 15 m, dos à toi. Tu pars avec ton ballon.", "Pendant que papa dit « 1, 2, 3… », avance en conduisant ton ballon.", "Sur « soleil ! », papa se retourne : arrête-toi, le pied sur le ballon. S'il voit bouger le ballon, retourne au départ !"],
    source: "FFF – District des Yvelines, « 73 jeux / situations U7-U9 »",
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 10, y: 20 }, { kind: 'ballon', x: 17, y: 20 }, { kind: 'papa', x: 90, y: 20 }, { kind: 'texte', x: 50, y: 33, text: "15 m" }],
      arrows: [{ kind: 'course', points: [[21, 16], [62, 16]] }],
    } },
  { id: 'tech-epervier', name: "La traversée de l'épervier", domain: 'technique', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Avec 4 plots, marque au milieu du terrain une bande de 3 m de large : c'est là que papa, l'épervier, a le droit de défendre.", "Traverse la bande ballon au pied, jusqu'à 5 m après. Papa essaie de sortir ton ballon, mais seulement dans sa bande.", "Traversée réussie = 1 point pour toi, ballon sorti = 1 point pour papa. Fais 10 traversées en allers-retours."],
    source: "FFF – District de Lyon et du Rhône, « Ateliers U9 »",
    tip: "Papa défend doucement au début : il doit te laisser une chance !",
    diagram: {
      items: [{ kind: 'plot', x: 42, y: 6 }, { kind: 'plot', x: 42, y: 54 }, { kind: 'plot', x: 58, y: 6 }, { kind: 'plot', x: 58, y: 54 }, { kind: 'texte', x: 50, y: 48, text: "3 m" }, { kind: 'papa', x: 50, y: 24 }, { kind: 'enfant', x: 8, y: 34 }, { kind: 'ballon', x: 15, y: 36 }],
      arrows: [{ kind: 'course', curve: true, points: [[19, 36], [42, 44], [60, 40], [92, 34]] }],
    } },
  { id: 'tech-traverser-marquer', name: "Traverser puis marquer", domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Marque une zone de 5 m de large où papa défend, et un but de 2 plots 5 m après la zone.", "Pars ballon au pied et passe la zone de papa sans te faire prendre le ballon.", "Une fois passé, va marquer dans le but. Si papa te prend le ballon, repars du départ. Combien de buts en 2 minutes ?"],
    source: "FFF – District de Lyon et du Rhône, « Jeux d'éveil » (« Deux pour se défendre », en 1 contre 1)",
    diagram: {
      items: [{ kind: 'plot', x: 34, y: 6 }, { kind: 'plot', x: 34, y: 54 }, { kind: 'plot', x: 60, y: 6 }, { kind: 'plot', x: 60, y: 54 }, { kind: 'papa', x: 47, y: 30 }, { kind: 'plot', x: 92, y: 20 }, { kind: 'plot', x: 92, y: 40 }, { kind: 'enfant', x: 6, y: 34 }, { kind: 'ballon', x: 13, y: 36 }],
      arrows: [{ kind: 'course', curve: true, points: [[17, 38], [40, 46], [66, 38]], label: "1" }, { kind: 'balle', points: [[70, 36], [91, 30]], label: "2" }],
    },
    withGoal: {
      steps: ["Avec des plots, marque une zone de 5 m de large où papa défend, à 5 m devant le but.", "Pars ballon au pied et passe la zone de papa sans te faire prendre le ballon.", "Une fois passé, va marquer dans le but. Si papa te prend le ballon, repars du départ. Combien de buts en 2 minutes ?"],
      equipment: ['ballon', 'plots', 'but'],
      goal: { x: 95, y: 30, length: 20, vertical: true, removes: [[92, 20], [92, 40]] },
    } },

  // Passes et tirs (15)
  { id: 'pt-passes-interieur', name: 'Passes intérieur du pied', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon'],
    steps: ["Mets-toi à 5 m de papa.", "Fais 10 passes avec l'intérieur du pied droit, puis 10 avec le gauche.", "Recommence jusqu'à la fin du temps."],
    tip: 'Pied d\'appui à côté du ballon, pointe vers papa.',
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 10, y: 20 }, { kind: 'papa', x: 90, y: 20 }, { kind: 'texte', x: 50, y: 34, text: '5 m' }],
      arrows: [{ kind: 'balle', points: [[17, 17], [82, 17]] }, { kind: 'balle', points: [[82, 23], [17, 23]] }],
    } },
  { id: 'pt-passes-une-touche', name: 'Passes en une touche', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Renvoie chaque passe directement, sans arrêter le ballon.", "Après 10 passes réussies, recule de 1 m."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 15, y: 20 }, { kind: 'papa', x: 85, y: 20 },
        { kind: 'texte', x: 50, y: 6, text: 'renvoie sans arrêter' }, { kind: 'texte', x: 50, y: 34, text: '3 m' },
      ],
      arrows: [{ kind: 'balle', points: [[22, 17], [77, 17]] }, { kind: 'balle', points: [[77, 23], [22, 23]] }],
    } },
  { id: 'pt-passes-porte', name: 'Passes dans la porte', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Mets-toi à 5 m de papa et fais une porte avec 2 plots écartés de 1 m, à mi-chemin entre vous.", "Fais une passe à papa en faisant passer le ballon entre les plots.", "Après 5 réussites de suite, recule de 1 m."],
    diagram: {
      height: 50,
      items: [
        { kind: 'enfant', x: 10, y: 25 }, { kind: 'ballon', x: 18, y: 25 },
        { kind: 'plot', x: 50, y: 17 }, { kind: 'plot', x: 50, y: 33 }, { kind: 'texte', x: 50, y: 8, text: 'porte de 1 m' },
        { kind: 'papa', x: 90, y: 25 },
      ],
      arrows: [{ kind: 'balle', points: [[22, 25], [84, 25]] }],
    } },
  { id: 'pt-tirs-cadres', name: 'Tirs cadrés', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m.", "Pose le ballon à 6 m du but et tire.", "Vise près d'un plot, puis près de l'autre."],
    diagram: {
      items: [
        { kind: 'enfant', x: 8, y: 30 }, { kind: 'ballon', x: 16, y: 30 },
        { kind: 'plot', x: 90, y: 16 }, { kind: 'plot', x: 90, y: 44 }, { kind: 'texte', x: 50, y: 54, text: '6 m' },
      ],
      arrows: [{ kind: 'balle', points: [[20, 28], [87, 21]] }, { kind: 'balle', points: [[20, 32], [87, 39]] }],
    },
    withGoal: {
      steps: ["Pose le ballon à 6 m du but.", "Tire en visant près d'un poteau.", "Puis vise près de l'autre poteau, et recommence."],
      equipment: ['ballon', 'but'],
      goal: { x: 94, y: 30, length: 28, vertical: true, removes: [[90, 16], [90, 44]] },
    } },
  { id: 'pt-tirs-pied-faible', name: 'Tirs pied faible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m.", "Pose le ballon à 5 m du but.", "Tire uniquement avec ton pied le moins fort."],
    diagram: {
      items: [
        { kind: 'enfant', x: 10, y: 30 }, { kind: 'ballon', x: 18, y: 30 },
        { kind: 'plot', x: 90, y: 16 }, { kind: 'plot', x: 90, y: 44 },
        { kind: 'texte', x: 50, y: 8, text: 'pied le moins fort' }, { kind: 'texte', x: 50, y: 54, text: '5 m' },
      ],
      arrows: [{ kind: 'balle', points: [[22, 30], [92, 30]] }],
    },
    withGoal: {
      steps: ["Pose le ballon à 5 m du but.", "Tire uniquement avec ton pied le moins fort."],
      equipment: ['ballon', 'but'],
      goal: { x: 94, y: 30, length: 28, vertical: true, removes: [[90, 16], [90, 44]] },
    } },
  { id: 'pt-tirs-apres-conduite', name: 'Conduite puis tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but de 2 plots écartés de 2 m, et pose 3 repères de tir : à 5 m (1 point), 7 m (2 points) et 9 m (3 points).", "Pars 5 m derrière le repère de ton choix en conduisant le ballon, et tire quand tu arrives sur le repère.", "Fais 3 tirs par manche et essaie de marquer au moins 3 points."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 7)",
    diagram: {
      height: 50,
      items: [
        { kind: 'enfant', x: 6, y: 25 }, { kind: 'ballon', x: 13, y: 25 },
        { kind: 'plot', x: 92, y: 13 }, { kind: 'plot', x: 92, y: 37 }, { kind: 'texte', x: 55, y: 44, text: 'repères 5 · 7 · 9 m' },
      ],
      arrows: [
        { kind: 'course', points: [[17, 25], [52, 25]], label: '1' },
        { kind: 'balle', points: [[56, 25], [94, 25]], label: '2' },
      ],
    },
    withGoal: {
      steps: ["Pose 3 repères de tir devant le but : à 5 m (1 point), 7 m (2 points) et 9 m (3 points).", "Pars 5 m derrière le repère de ton choix en conduisant le ballon, et tire quand tu arrives sur le repère.", "Fais 3 tirs par manche et essaie de marquer au moins 3 points."],
      equipment: ['ballon', 'plots', 'but'],
      goal: { x: 95, y: 25, length: 24, vertical: true, removes: [[92, 13], [92, 37]] },
    } },
  { id: 'pt-volee', name: 'Reprises de volée', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Papa lance le ballon à la main vers ton pied.", "Frappe le ballon avant qu'il touche le sol et renvoie-le dans les mains de papa."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 15, y: 22 }, { kind: 'papa', x: 85, y: 22 }, { kind: 'texte', x: 50, y: 35, text: 'sans toucher le sol' },
      ],
      arrows: [
        { kind: 'balle', curve: true, points: [[78, 17], [50, 7], [22, 17]], label: '1' },
        { kind: 'balle', points: [[22, 26], [77, 26]], label: '2' },
      ],
    } },
  { id: 'pt-passes-longues', name: 'Passes longues', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'grand-espace'],
    steps: ["Mets-toi à 12 m de papa.", "Fais-lui une passe en frappant avec le lacet, bien au milieu du ballon.", "Papa te renvoie le ballon. Recommence."],
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 7, y: 20 }, { kind: 'papa', x: 92, y: 20 }, { kind: 'texte', x: 50, y: 34, text: '12 m' }],
      arrows: [{ kind: 'balle', points: [[14, 17], [84, 17]] }, { kind: 'balle', points: [[84, 23], [14, 23]] }],
    } },
  { id: 'pt-une-deux', name: 'Une-deux et tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but de 2 plots à 15 m de toi ; papa se place à mi-chemin, sur le côté.", "Passe le ballon à papa (1) et cours vers le but (2).", "Papa te remet le ballon devant toi (3) : tire au but (4)."],
    diagram: {
      items: [
        { kind: 'enfant', x: 10, y: 45 }, { kind: 'ballon', x: 16, y: 41 },
        { kind: 'papa', x: 48, y: 12 },
        { kind: 'plot', x: 92, y: 20 }, { kind: 'plot', x: 92, y: 40 },
      ],
      arrows: [
        { kind: 'balle', points: [[19, 38], [44, 16]], label: '1' },
        { kind: 'course', points: [[16, 48], [56, 48]], label: '2' },
        { kind: 'balle', points: [[51, 17], [57, 42]], label: '3' },
        { kind: 'balle', points: [[60, 44], [88, 31]], label: '4' },
      ],
    },
    withGoal: {
      steps: ["Mets-toi à 15 m du but ; papa se place à mi-chemin, sur le côté.", "Passe le ballon à papa (1) et cours vers le but (2).", "Papa te remet le ballon devant toi (3) : tire au but (4)."],
      equipment: ['ballon', 'but'],
      goal: { x: 95, y: 30, length: 20, vertical: true, removes: [[92, 20], [92, 40]] },
    } },
  { id: 'pt-precision-cible', name: 'Tir sur cible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Choisis une cible : un arbre, un seau ou un sac.", "Pose le ballon à 5 m et tire 10 fois.", "Compte combien de fois tu as touché la cible, puis essaie de faire mieux."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 10, y: 20 }, { kind: 'ballon', x: 18, y: 20 }, { kind: 'cible', x: 88, y: 20 },
        { kind: 'texte', x: 50, y: 32, text: '5 m' },
      ],
      arrows: [{ kind: 'balle', points: [[22, 20], [80, 20]] }],
    } },

  { id: 'pt-passe-dosee', name: 'Passe dosée dans les carrés', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Avec des plots (ou des vêtements), marque 3 carrés l'un derrière l'autre, à 3 m de toi : un grand (3 m), un moyen (2 m), puis un petit (1 m).", "Fais une passe pour que le ballon s'arrête dans un carré : grand = 2 points, moyen = 5 points, petit = 10 points.", "Fais 10 passes et compte tes points, puis recommence avec l'autre pied."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 12)",
    tip: "Frappe avec l'intérieur du pied et dose ta force : le ballon doit s'arrêter, pas traverser.",
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 6, y: 20 }, { kind: 'ballon', x: 13, y: 20 },
        { kind: 'plot', x: 28, y: 6 }, { kind: 'plot', x: 28, y: 34 }, { kind: 'plot', x: 50, y: 6 }, { kind: 'plot', x: 50, y: 34 },
        { kind: 'plot', x: 56, y: 10 }, { kind: 'plot', x: 56, y: 30 }, { kind: 'plot', x: 71, y: 10 }, { kind: 'plot', x: 71, y: 30 },
        { kind: 'plot', x: 77, y: 14 }, { kind: 'plot', x: 77, y: 26 }, { kind: 'plot', x: 86, y: 14 }, { kind: 'plot', x: 86, y: 26 },
        { kind: 'texte', x: 39, y: 20, text: '2 pts' }, { kind: 'texte', x: 63, y: 20, text: '5 pts' }, { kind: 'texte', x: 81, y: 36, text: '10 pts' },
      ],
      arrows: [{ kind: 'balle', points: [[17, 17], [80, 17]] }],
    } },

  { id: 'pt-tir-porte', name: "Tir dans la porte", domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais une porte de 1 m avec 2 plots et pose ton ballon à 2 m de la porte.", "Tire 3 fois : si le ballon passe au moins 2 fois dans la porte, recule à 3 m, puis à 4 m.", "Recommence au pied droit, puis au pied gauche, puis en conduisant le ballon avant de tirer."],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 4)",
    tip: "Frappe avec l'intérieur du pied pour que le ballon reste au sol.",
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 8, y: 20 }, { kind: 'ballon', x: 15, y: 20 }, { kind: 'plot', x: 88, y: 13 }, { kind: 'plot', x: 88, y: 27 }, { kind: 'texte', x: 52, y: 34, text: "2 m → 3 m → 4 m" }],
      arrows: [{ kind: 'balle', points: [[19, 20], [92, 20]] }],
    } },
  { id: 'pt-parcours-passes', name: "Parcours de passes", domain: 'passes-tirs', durationMin: 10, equipment: ['ballon', 'plots'],
    steps: ["Marque 3 petits carrés de 1 m à la suite, espacés de 4 m, le 1er à 3 m de toi.", "Fais une passe pour arrêter le ballon dans le 1er carré, va le chercher, puis vise le 2e carré, puis le 3e.", "Pour chaque carré : réussi au 1er essai = 10 points, au 2e = 5 points, au 3e = 1 point. Combien de points sur le parcours ?"],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiche 13)",
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 6, y: 20 }, { kind: 'ballon', x: 12, y: 20 }, { kind: 'plot', x: 30, y: 14 }, { kind: 'plot', x: 30, y: 26 }, { kind: 'plot', x: 56, y: 14 }, { kind: 'plot', x: 56, y: 26 }, { kind: 'plot', x: 82, y: 14 }, { kind: 'plot', x: 82, y: 26 }, { kind: 'texte', x: 30, y: 35, text: "1" }, { kind: 'texte', x: 56, y: 35, text: "2" }, { kind: 'texte', x: 82, y: 35, text: "3" }],
      arrows: [{ kind: 'balle', points: [[16, 20], [28, 20]] }, { kind: 'balle', points: [[34, 20], [54, 20]] }, { kind: 'balle', points: [[60, 20], [80, 20]] }],
    } },
  { id: 'pt-10-buts-or', name: "10 buts en or", domain: 'passes-tirs', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Fais un but de 2 plots écartés de 2 m. Papa se place sur le côté, à 5 m du but.", "Papa appuie sur « Départ » et te passe le ballon : tire au but, puis reviens vers papa pour la passe suivante.", "Marque 10 buts le plus vite possible : papa appuie sur « Arrivée » au 10e. Moins d'1 minute, c'est de l'or !"],
    source: "FFF – District de Lyon et du Rhône, « Ateliers U9 »",
    stopwatch: true,
    diagram: {
      items: [{ kind: 'plot', x: 92, y: 20 }, { kind: 'plot', x: 92, y: 40 }, { kind: 'papa', x: 55, y: 52 }, { kind: 'enfant', x: 40, y: 30 }],
      arrows: [{ kind: 'balle', points: [[51, 47], [43, 36]], label: "1" }, { kind: 'balle', points: [[46, 30], [90, 30]], label: "2" }],
    },
    withGoal: {
      steps: ["Papa se place sur le côté, à 5 m du but.", "Papa appuie sur « Départ » et te passe le ballon : tire au but, puis reviens vers papa pour la passe suivante.", "Marque 10 buts le plus vite possible : papa appuie sur « Arrivée » au 10e. Moins d'1 minute, c'est de l'or !"],
      equipment: ['ballon', 'but'],
      goal: { x: 95, y: 30, length: 20, vertical: true, removes: [[92, 20], [92, 40]] },
    } },
  { id: 'pt-beret-tir', name: "Le béret tir", domain: 'passes-tirs', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Pose le ballon à 8 m de toi, un plot 3 m derrière le ballon, et un but de 2 plots 6 m plus loin.", "Papa appuie sur « Départ » en criant « partez ! » : sprinte jusqu'au ballon et fais le tour du plot en conduite.", "Tire au but : papa appuie sur « Arrivée » quand le ballon passe. Essaie de battre ton temps."],
    source: "FFF – District de Lyon et du Rhône, « Ateliers U9 » et FFF – District des Yvelines, « 73 jeux / situations U7-U9 » (« Béret but »)",
    stopwatch: true,
    diagram: {
      items: [{ kind: 'enfant', x: 6, y: 30 }, { kind: 'ballon', x: 30, y: 30 }, { kind: 'plot', x: 46, y: 30 }, { kind: 'plot', x: 92, y: 20 }, { kind: 'plot', x: 92, y: 40 }],
      arrows: [{ kind: 'course', points: [[11, 30], [26, 30]], label: "1" }, { kind: 'course', curve: true, points: [[33, 26], [48, 22], [52, 32], [42, 38]], label: "2" }, { kind: 'balle', points: [[50, 38], [90, 32]], label: "3" }],
    },
    withGoal: {
      steps: ["Pose le ballon à 8 m de toi et un plot 3 m derrière le ballon ; le but est 6 m plus loin.", "Papa appuie sur « Départ » en criant « partez ! » : sprinte jusqu'au ballon et fais le tour du plot en conduite.", "Tire au but : papa appuie sur « Arrivée » quand le ballon passe. Essaie de battre ton temps."],
      equipment: ['ballon', 'plots', 'but'],
      goal: { x: 95, y: 30, length: 20, vertical: true, removes: [[92, 20], [92, 40]] },
    } },

  // Physique / coordination (8)
  { id: 'phy-sprints', name: 'Sprints courts', domain: 'physique', durationMin: 6, equipment: ['grand-espace'],
    steps: ["Choisis une ligne d'arrivée à 10 m (un arbre, un sac).", "Cours le plus vite possible jusqu'à l'arrivée, puis reviens en marchant pour souffler.", "Fais 6 sprints en tout : 3 en partant debout, puis 3 en partant assis par terre."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 8, y: 20 }, { kind: 'texte', x: 88, y: 8, text: 'arrivée' }, { kind: 'texte', x: 50, y: 32, text: '10 m' },
      ],
      arrows: [{ kind: 'course', points: [[15, 20], [92, 20]] }],
    } },
  { id: 'phy-navette', name: 'Navettes', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ["Aligne 3 plots espacés de 4 m et mets-toi au premier.", "Cours toucher le 2e plot et reviens au départ.", "Puis cours toucher le 3e plot et reviens. Repose-toi 30 secondes et recommence."],
    diagram: {
      height: 50,
      items: [
        { kind: 'enfant', x: 7, y: 25 }, { kind: 'plot', x: 16, y: 25 }, { kind: 'plot', x: 50, y: 25 }, { kind: 'plot', x: 84, y: 25 },
      ],
      arrows: [
        { kind: 'course', points: [[20, 17], [48, 17]], label: '1' },
        { kind: 'course', points: [[48, 9], [20, 9]], label: '2' },
        { kind: 'course', points: [[20, 33], [82, 33]], label: '3' },
        { kind: 'course', points: [[82, 42], [20, 42]], label: '4' },
      ],
    } },
  { id: 'phy-pas-chasses', name: 'Pas chassés et appuis', domain: 'physique', durationMin: 5, equipment: [],
    steps: ["Fais des pas chassés sur 4 m vers la gauche, puis reviens vers la droite, sans croiser les pieds.", "Puis fais des petits pas très rapides sur place pendant 10 secondes, et repose-toi 10 secondes.", "Alterne les deux jusqu'à la fin du temps."],
    diagram: {
      height: 40,
      items: [
        { kind: 'plot', x: 15, y: 30 }, { kind: 'plot', x: 85, y: 30 }, { kind: 'enfant', x: 78, y: 19 },
        { kind: 'texte', x: 50, y: 36, text: '4 m' },
      ],
      arrows: [
        { kind: 'course', points: [[72, 15], [20, 15]], label: '1' },
        { kind: 'course', points: [[20, 23], [72, 23]], label: '2' },
      ],
    } },
  { id: 'phy-cloche-pied', name: 'Cloche-pied', domain: 'physique', durationMin: 5, equipment: [],
    steps: ["Fais 10 sauts sur le pied gauche, puis 10 sur le pied droit.", "Fais 10 sauts pieds joints en avant, puis 10 en arrière.", "Repose-toi 30 secondes et recommence."],
    tip: 'Atterris en douceur, genoux souples.' },
  { id: 'phy-equilibre', name: 'Équilibre flamant rose', domain: 'physique', durationMin: 5, equipment: ['ballon'],
    steps: ["Tiens-toi sur un pied pendant 20 secondes, la semelle de l'autre pied posée sur le ballon.", "Change de pied.", "Quand c'est facile, recommence en posant le pied sur le ballon sans appuyer dessus."] },
  { id: 'phy-reaction', name: 'Jeu de réaction', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ["Pose un plot à 3 m à ta gauche et un à 3 m à ta droite ; mets-toi au milieu.", "Papa crie « gauche » ou « droite » : cours toucher le bon plot et reviens au milieu.", "Papa peut essayer de te piéger en montrant l'autre côté !"],
    source: "FFF – District de la Mayenne, « 30 exercices et défis techniques U7-U9 » (fiches 5 et 14, sans ballon)",
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 50, y: 20 }, { kind: 'plot', x: 10, y: 20 }, { kind: 'plot', x: 90, y: 20 },
        { kind: 'texte', x: 50, y: 34, text: '« gauche » ou « droite » ?' },
      ],
      arrows: [{ kind: 'course', points: [[44, 20], [16, 20]] }, { kind: 'course', points: [[56, 20], [84, 20]] }],
    } },
  { id: 'phy-terre-mer-ciel', name: 'Terre, mer, ciel', domain: 'physique', durationMin: 6, equipment: ['ballon'],
    steps: ["Pose 2 plots (ou trace une ligne) : sur la ligne, c'est « terre » ; devant, c'est « mer » ; derrière, c'est « ciel ».", "Papa crie « terre », « mer » ou « ciel » : saute le plus vite possible au bon endroit.", "Quand tu ne te trompes plus, recommence ballon au pied : conduis-le dans la bonne zone."],
    source: "FFF – District des Yvelines, « 73 jeux / situations U7-U9 »",
    tip: 'Papa peut raconter une histoire : « poisson » veut dire mer, « oiseau » veut dire ciel.',
    diagram: {
      height: 40,
      items: [
        { kind: 'plot', x: 12, y: 20 }, { kind: 'plot', x: 88, y: 20 },
        { kind: 'texte', x: 60, y: 7, text: 'ciel' }, { kind: 'texte', x: 60, y: 20, text: 'terre' }, { kind: 'texte', x: 60, y: 33, text: 'mer' },
        { kind: 'enfant', x: 32, y: 20 },
      ],
      arrows: [
        { kind: 'course', points: [[32, 15], [32, 8]] },
        { kind: 'course', points: [[32, 25], [32, 32]] },
      ],
    } },
  { id: 'phy-parcours', name: "Parcours d'agilité", domain: 'physique', durationMin: 8, equipment: ['plots'],
    steps: ["Installe le parcours : 4 plots espacés de 1,5 m pour le slalom, 2 m plus loin un plot couché à sauter, puis l'arrivée 5 m plus loin.", "Papa appuie sur « Départ » : fais le parcours sans ballon le plus vite possible, et il appuie sur « Arrivée » à la fin.", "Repose-toi, puis essaie de battre ton temps."],
    stopwatch: true,
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 5, y: 20 },
        { kind: 'plot', x: 18, y: 20 }, { kind: 'plot', x: 30, y: 20 }, { kind: 'plot', x: 42, y: 20 }, { kind: 'plot', x: 54, y: 20 },
        { kind: 'plot', x: 70, y: 20 }, { kind: 'texte', x: 70, y: 33, text: 'saute' },
        { kind: 'plot', x: 93, y: 20 }, { kind: 'texte', x: 91, y: 33, text: 'arrivée' },
      ],
      arrows: [
        { kind: 'course', curve: true, points: [[11, 20], [18, 12], [24, 20], [30, 28], [36, 20], [42, 12], [48, 20], [54, 28], [62, 20], [70, 11], [78, 20], [87, 20]] },
      ],
    } },

  // Gardien (9)
  { id: 'gar-prise-balle', name: 'Prises de balle', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Papa te lance le ballon au ventre, puis à la poitrine, puis au-dessus de la tête.", "Attrape-le avec les mains en forme de W (les pouces presque collés)."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to catch » (exercice 4)",
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 15, y: 20 }, { kind: 'papa', x: 85, y: 20 },
        { kind: 'texte', x: 50, y: 8, text: 'mains en W' }, { kind: 'texte', x: 50, y: 32, text: '3 m' },
      ],
      arrows: [{ kind: 'balle', points: [[78, 20], [22, 20]] }],
    } },
  { id: 'gar-balles-basses', name: 'Balles au sol', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 5 m de papa.", "Papa fait rouler le ballon vers toi.", "Descends en gardant les jambes serrées, ramasse le ballon et serre-le contre ton ventre."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 10, y: 20 }, { kind: 'papa', x: 90, y: 20 },
        { kind: 'texte', x: 50, y: 8, text: 'le ballon roule' }, { kind: 'texte', x: 50, y: 32, text: '5 m' },
      ],
      arrows: [{ kind: 'balle', points: [[83, 20], [17, 20]] }],
    } },
  { id: 'gar-plongeons', name: 'Plongeons à genoux', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Sur l'herbe (jamais sur un sol dur), mets-toi avec un genou au sol, l'autre jambe pliée, les bras le long du corps.", "Papa, à 3 m, fait rouler doucement le ballon à côté de toi, à gauche ou à droite.", "Pousse sur ta jambe, tends les bras vers le ballon et laisse-toi tomber sur le côté : attrape-le avec les deux mains et serre-le contre toi."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to dive low » (exercice 1), en version douce",
    diagram: {
      height: 50,
      items: [
        { kind: 'papa', x: 50, y: 8 }, { kind: 'enfant', x: 50, y: 36 }, { kind: 'ballon', x: 26, y: 38 },
        { kind: 'texte', x: 60, y: 22, text: '3 m' }, { kind: 'texte', x: 50, y: 47, text: 'à genoux, sur l’herbe' },
      ],
      arrows: [
        { kind: 'balle', points: [[45, 13], [29, 33]] },
        { kind: 'course', points: [[44, 38], [32, 38]] },
      ],
    } },
  { id: 'gar-arrets', name: 'Arrêts dans le but', domain: 'gardien', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m et mets-toi au milieu.", "Papa tire doucement depuis 5 m, d'abord droit sur toi.", "Puis il tire de plus en plus loin de tes mains."],
    diagram: {
      items: [
        { kind: 'plot', x: 10, y: 12 }, { kind: 'plot', x: 10, y: 48 }, { kind: 'enfant', x: 10, y: 30 },
        { kind: 'papa', x: 90, y: 30 }, { kind: 'ballon', x: 79, y: 30 }, { kind: 'texte', x: 48, y: 55, text: '5 m' },
      ],
      arrows: [
        { kind: 'balle', points: [[75, 29], [17, 29]], label: '1' },
        { kind: 'balle', points: [[75, 33], [16, 42]], label: '2' },
      ],
    },
    withGoal: {
      steps: ["Mets-toi au milieu du but.", "Papa tire doucement depuis 5 m, d'abord droit sur toi.", "Puis il tire de plus en plus loin de tes mains."],
      equipment: ['ballon', 'but'],
      goal: { x: 5, y: 30, length: 36, vertical: true, removes: [[10, 12], [10, 48]] },
    } },
  { id: 'gar-relances', name: 'Relances', domain: 'gardien', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Pose un plot à 8 m de toi.", "Relance le ballon à la main en le faisant rouler jusqu'au plot.", "Puis pose le ballon par terre et dégage-le au pied le plus loin possible."],
    diagram: {
      height: 40,
      items: [
        { kind: 'enfant', x: 8, y: 20 }, { kind: 'plot', x: 88, y: 20 }, { kind: 'texte', x: 48, y: 32, text: '8 m, en roulant' },
      ],
      arrows: [{ kind: 'balle', points: [[15, 20], [82, 20]] }],
    } },

  { id: 'gar-mains-ballon', name: "Les mains sur le ballon", domain: 'gardien', durationMin: 5, equipment: ['ballon'],
    steps: ["Allonge-toi sur le dos, les bras tendus vers le ciel, les mains ouvertes l'une à côté de l'autre.", "Papa, debout à côté de toi, lâche le ballon juste au-dessus de tes mains : attrape-le avec les deux mains en même temps, en gardant les yeux ouverts.", "Papa lâche le ballon de plus en plus haut. Quand c'est facile, fais-le debout."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to catch » (exercice 1)",
    tip: "Ne ferme pas les yeux : regarde le ballon jusque dans tes mains.",
  },
  { id: 'gar-arrets-genoux', name: "Arrêts à genoux", domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à genoux, le haut du corps un peu penché en avant. Papa se place à 4 m de toi.", "Papa te lance le ballon à la main vers le visage ou la poitrine : attrape-le devant ton visage, les bras un peu pliés.", "Quand tu attrapes 10 ballons de suite, papa tire doucement au pied, de volée."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to catch » (exercices 2 et 3)",
    diagram: {
      height: 40,
      items: [{ kind: 'enfant', x: 15, y: 20 }, { kind: 'papa', x: 85, y: 20 }, { kind: 'texte', x: 50, y: 33, text: "4 m" }, { kind: 'texte', x: 15, y: 7, text: "à genoux" }],
      arrows: [{ kind: 'balle', points: [[78, 20], [22, 20]] }],
    } },
  { id: 'gar-retourne-attrape', name: "Retourne-toi et attrape", domain: 'gardien', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Fais un but de 2 plots écartés de 3 m et mets-toi sur le côté du but, dos à papa, qui est à 6 m.", "Papa crie « Hop ! » : retourne-toi, fais des pas chassés jusqu'au milieu du but.", "Papa tire doucement : attrape le ballon devant ton visage ou ton ventre, bien en équilibre."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to catch » (exercice 5)",
    diagram: {
      items: [{ kind: 'plot', x: 12, y: 15 }, { kind: 'plot', x: 12, y: 45 }, { kind: 'enfant', x: 12, y: 6 }, { kind: 'papa', x: 80, y: 30 }],
      arrows: [{ kind: 'course', points: [[16, 10], [16, 28]], label: "1" }, { kind: 'balle', points: [[73, 30], [22, 30]], label: "2" }],
    },
    withGoal: {
      steps: ["Mets-toi à côté d'un poteau, dos à papa, qui est à 6 m du but.", "Papa crie « Hop ! » : retourne-toi, fais des pas chassés jusqu'au milieu du but.", "Papa tire doucement : attrape le ballon devant ton visage ou ton ventre, bien en équilibre."],
      equipment: ['ballon', 'but'],
      goal: { x: 8, y: 30, length: 30, vertical: true, removes: [[12, 15], [12, 45]] },
    } },
  { id: 'gar-plongeon-couleur', name: "Plongeon couleur", domain: 'gardien', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Sur l'herbe, mets-toi accroupi, un genou au sol. Pose un plot de couleur à 1,5 m à ta gauche et un d'une autre couleur à 1,5 m à ta droite.", "Papa, devant toi, montre ou crie une couleur : laisse-toi tomber sur le côté vers ce plot, les deux mains en avant.", "Quand c'est facile, papa fait rouler le ballon vers le plot annoncé : attrape-le en tombant et serre-le contre toi."],
    source: "FIFA Training Centre, « Goalkeeping fundamentals : learning to dive » (exercice 2) et FIFA Training Centre, « Goalkeeping fundamentals : learning to dive low » (exercice 1), en version douce",
    tip: "Tombe sur le côté (hanche puis épaule), jamais sur le ventre. Uniquement sur l'herbe.",
    diagram: {
      height: 40,
      items: [{ kind: 'plot', x: 25, y: 20 }, { kind: 'plot', x: 75, y: 20 }, { kind: 'enfant', x: 50, y: 20 }, { kind: 'papa', x: 50, y: 5 }, { kind: 'texte', x: 25, y: 33, text: "bleu" }, { kind: 'texte', x: 75, y: 33, text: "rouge" }],
      arrows: [{ kind: 'course', points: [[45, 22], [31, 22]] }],
    } },

  // Retour au calme (4)
  { id: 'calme-marche-respiration', name: 'Marche et respiration', domain: 'retour-calme', durationMin: 3, equipment: [],
    steps: ["Marche tranquillement.", "Inspire par le nez en comptant jusqu'à 3.", "Souffle lentement par la bouche en comptant jusqu'à 4."] },
  { id: 'calme-etirements', name: 'Étirements doux', domain: 'retour-calme', durationMin: 5, equipment: [],
    steps: ["Debout, attrape ton pied derrière toi et tiens 15 secondes, puis change de jambe.", "Assis jambes tendues, essaie de toucher tes pieds et tiens 15 secondes.", "Respire calmement pendant les étirements."] },
  { id: 'calme-jongles-mains', name: 'Jonglage à la main', domain: 'retour-calme', durationMin: 3, equipment: ['ballon'],
    steps: ["Lance le ballon en l'air avec les mains et rattrape-le.", "Puis tape dans tes mains avant de le rattraper.", "Essaie de taper 2 fois, puis 3 fois !"] },
  { id: 'calme-bilan', name: 'Bilan avec papa', domain: 'retour-calme', durationMin: 3, equipment: ['ballon'],
    steps: ["Assieds-toi sur le ballon avec papa.", "Dis ce que tu as le mieux réussi aujourd'hui.", "Choisissez ensemble ce que tu travailleras la prochaine fois."] },
];

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

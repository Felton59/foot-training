import type { Exercise } from './types';

export const EXERCISES: Exercise[] = [
  // Échauffement (4)
  { id: 'ech-trottinage-ballon', name: 'Trottinage ballon au pied', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Avance doucement en poussant le ballon devant toi à petites touches.", "Toutes les 10 touches, change de pied.", "Sur la dernière minute, accélère un peu."] },
  { id: 'ech-toe-taps', name: 'Toe taps', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Ballon arrêté devant toi : pose la semelle droite dessus, puis la gauche, en alternant vite.", "Fais 30 secondes rapide, puis 15 secondes de repos.", "Recommence jusqu'à la fin du temps."],
    tip: 'Reste sur la pointe des pieds.' },
  { id: 'ech-mobilite', name: 'Réveil du corps', domain: 'echauffement', durationMin: 5, equipment: [],
    steps: ["Cours sur place en montant les genoux (30 s), puis en touchant tes fesses avec les talons (30 s).", "Fais 10 grands cercles de bras vers l'avant, puis 10 vers l'arrière.", "Fais 5 pas chassés vers la gauche, puis 5 vers la droite. Recommence tout jusqu'à la fin du temps."] },
  { id: 'ech-passes-douces', name: 'Passes douces avec papa', domain: 'echauffement', durationMin: 5, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Faites-vous des passes tout doucement : arrête le ballon avant de le renvoyer.", "Change de pied à chaque passe."] },

  // Technique (9)
  { id: 'tech-jongles-series', name: 'Séries de jongles', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ["Jongle le plus longtemps possible en comptant tes touches.", "Quand le ballon tombe, recommence en essayant de battre ton score.", "Si c'est trop dur : laisse le ballon rebondir une fois par terre entre deux touches."],
    tip: 'Cheville bloquée, pointe du pied légèrement levée.' },
  { id: 'tech-jongles-pied-faible', name: 'Jongles pied faible', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Jongle uniquement avec ton pied le moins fort.", "Au début, laisse le ballon rebondir par terre entre deux touches.", "Quand ça devient facile, essaie sans rebond."] },
  { id: 'tech-conduite-semelle', name: 'Conduite à la semelle', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Avance sur 5 m en faisant rouler le ballon sous ta semelle.", "Reviens en reculant, toujours avec la semelle.", "Puis déplace-toi sur le côté. Recommence en changeant de pied."] },
  { id: 'tech-slalom', name: 'Slalom entre les plots', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Aligne 4 plots espacés de 1,5 m.", "Slalome à l'aller avec le pied droit, au retour avec le pied gauche.", "Puis utilise les deux pieds et va de plus en plus vite."],
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
    steps: ["Pose un plot à 5 m devant toi.", "Conduis le ballon jusqu'au plot, fais demi-tour avec l'intérieur du pied et reviens.", "Recommence avec l'extérieur du pied, puis avec la semelle."] },
  { id: 'tech-controle-lance', name: 'Contrôles de balles lancées', domain: 'technique', durationMin: 8, equipment: ['ballon'],
    steps: ["Papa te lance le ballon en l'air, à la main.", "Arrête-le avec le pied, la cuisse ou la poitrine : il doit rester tout près de toi.", "Change de partie du corps à chaque fois."] },
  { id: 'tech-controle-oriente', name: 'Contrôle orienté', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Pose un plot à 3 m à ta gauche et un à 3 m à ta droite.", "Papa te fait une passe et crie « gauche » ou « droite ».", "D'une seule touche, pousse le ballon vers le bon plot."] },
  { id: 'tech-dribble-1c1', name: 'Dribble contre papa', domain: 'technique', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m ; papa se met devant.", "Pars à 8 m avec le ballon et essaie de passer papa avec une feinte.", "Si tu le passes, tire dans le but. Papa défend doucement au début."] },
  { id: 'tech-feintes', name: 'Feintes sur place', domain: 'technique', durationMin: 6, equipment: ['ballon'],
    steps: ["Ballon arrêté devant toi : passe ta jambe par-dessus le ballon sans le toucher (passement de jambe), 10 fois à gauche puis 10 fois à droite.", "Fais semblant de tirer, puis emmène le ballon sur le côté avec l'intérieur du pied (crochet), 10 fois.", "Recommence de plus en plus vite."] },

  // Passes et tirs (10)
  { id: 'pt-passes-interieur', name: 'Passes intérieur du pied', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon'],
    steps: ["Mets-toi à 5 m de papa.", "Fais 10 passes avec l'intérieur du pied droit, puis 10 avec le gauche.", "Recommence jusqu'à la fin du temps."],
    tip: 'Pied d\'appui à côté du ballon, pointe vers papa.' },
  { id: 'pt-passes-une-touche', name: 'Passes en une touche', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Renvoie chaque passe directement, sans arrêter le ballon.", "Après 10 passes réussies, recule de 1 m."] },
  { id: 'pt-passes-porte', name: 'Passes dans la porte', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais une porte avec 2 plots écartés de 1 m, entre toi et papa.", "Fais une passe à papa en faisant passer le ballon entre les plots.", "Après 5 réussites de suite, recule de 1 m."],
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
    steps: ["Fais un but avec 2 plots écartés de 2 m.", "Pose le ballon à 6 m du but et tire.", "Vise près d'un plot, puis près de l'autre."] },
  { id: 'pt-tirs-pied-faible', name: 'Tirs pied faible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Même but de 2 plots, ballon posé à 5 m.", "Tire uniquement avec ton pied le moins fort."] },
  { id: 'pt-tirs-apres-conduite', name: 'Conduite puis tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Pose le ballon à 12 m du but.", "Conduis le ballon vers le but en accélérant.", "Tire avant d'être à 6 m du but, puis retourne au départ."] },
  { id: 'pt-volee', name: 'Reprises de volée', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Papa lance le ballon à la main vers ton pied.", "Renvoie-le directement dans ses mains, sans le laisser toucher le sol."] },
  { id: 'pt-passes-longues', name: 'Passes longues', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'grand-espace'],
    steps: ["Mets-toi à 12 m de papa.", "Fais-lui une passe en frappant avec le lacet, bien au milieu du ballon.", "Papa te renvoie le ballon. Recommence."] },
  { id: 'pt-une-deux', name: 'Une-deux et tir', domain: 'passes-tirs', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots ; papa se place entre toi et le but, sur le côté.", "Passe le ballon à papa (1) et cours vers le but (2).", "Papa te remet le ballon devant toi (3) : tire au but (4)."],
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
    } },
  { id: 'pt-precision-cible', name: 'Tir sur cible', domain: 'passes-tirs', durationMin: 6, equipment: ['ballon'],
    steps: ["Choisis une cible : un arbre, un seau ou un sac.", "Pose le ballon à 5 m et tire 10 fois.", "Compte combien de fois tu as touché la cible, puis essaie de faire mieux."] },

  // Physique / coordination (8)
  { id: 'phy-sprints', name: 'Sprints courts', domain: 'physique', durationMin: 6, equipment: ['grand-espace'],
    steps: ["Choisis une ligne d'arrivée à 10 m (un arbre, un sac).", "Cours le plus vite possible jusqu'à l'arrivée, puis reviens en marchant pour souffler.", "Fais 6 sprints en tout : 3 en partant debout, puis 3 en partant assis par terre."] },
  { id: 'phy-navette', name: 'Navettes', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ["Aligne 3 plots espacés de 4 m et mets-toi au premier.", "Cours toucher le 2e plot et reviens au départ.", "Puis cours toucher le 3e plot et reviens. Repose-toi 30 secondes et recommence."] },
  { id: 'phy-pas-chasses', name: 'Pas chassés et appuis', domain: 'physique', durationMin: 5, equipment: [],
    steps: ["Fais des pas chassés sur 4 m vers la gauche, puis reviens vers la droite, sans croiser les pieds.", "Puis fais des petits pas très rapides sur place pendant 10 secondes, et repose-toi 10 secondes.", "Alterne les deux jusqu'à la fin du temps."] },
  { id: 'phy-cloche-pied', name: 'Cloche-pied', domain: 'physique', durationMin: 5, equipment: [],
    steps: ["Fais 10 sauts sur le pied gauche, puis 10 sur le pied droit.", "Fais 10 sauts pieds joints en avant, puis 10 en arrière.", "Repose-toi 30 secondes et recommence."],
    tip: 'Atterris en douceur, genoux souples.' },
  { id: 'phy-equilibre', name: 'Équilibre flamant rose', domain: 'physique', durationMin: 5, equipment: ['ballon'],
    steps: ["Tiens-toi sur un pied pendant 20 secondes, la semelle de l'autre pied posée sur le ballon.", "Change de pied.", "Quand c'est facile, recommence les yeux fermés !"] },
  { id: 'phy-reaction', name: 'Jeu de réaction', domain: 'physique', durationMin: 6, equipment: ['plots'],
    steps: ["Pose un plot à 3 m à ta gauche et un à 3 m à ta droite ; mets-toi au milieu.", "Papa crie « gauche » ou « droite » : cours toucher le bon plot et reviens au milieu.", "Papa peut essayer de te piéger en montrant l'autre côté !"] },
  { id: 'phy-chat-ballon', name: 'Chat ballon', domain: 'physique', durationMin: 6, equipment: ['ballon'],
    steps: ["Délimitez une zone d'environ 10 m sur 10 m.", "Conduis ton ballon dans la zone et échappe à papa qui essaie de te toucher.", "Si papa te touche, on inverse : c'est toi qui chasses."] },
  { id: 'phy-parcours', name: "Parcours d'agilité", domain: 'physique', durationMin: 8, equipment: ['plots'],
    steps: ["Installe le parcours : 4 plots en ligne pour un slalom, un plot couché à sauter, puis un plot d'arrivée 5 m plus loin.", "Fais le parcours sans ballon le plus vite possible pendant que papa chronomètre.", "Repose-toi, puis essaie de battre ton temps."] },

  // Gardien (5)
  { id: 'gar-prise-balle', name: 'Prises de balle', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 3 m de papa.", "Papa te lance le ballon au ventre, puis à la poitrine, puis au-dessus de la tête.", "Attrape-le avec les mains en forme de W (les pouces presque collés)."] },
  { id: 'gar-balles-basses', name: 'Balles au sol', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à 5 m de papa.", "Papa fait rouler le ballon vers toi.", "Descends en gardant les jambes serrées, ramasse le ballon et serre-le contre ton ventre."] },
  { id: 'gar-plongeons', name: 'Plongeons à genoux', domain: 'gardien', durationMin: 6, equipment: ['ballon'],
    steps: ["Mets-toi à genoux sur l'herbe (jamais sur un sol dur).", "Papa lance le ballon doucement sur ton côté.", "Laisse-toi tomber sur le côté en attrapant le ballon. Alterne gauche et droite."] },
  { id: 'gar-arrets', name: 'Arrêts dans le but', domain: 'gardien', durationMin: 8, equipment: ['ballon', 'plots'],
    steps: ["Fais un but avec 2 plots écartés de 2 m et mets-toi au milieu.", "Papa tire doucement depuis 5 m, d'abord droit sur toi.", "Puis il tire de plus en plus loin de tes mains."] },
  { id: 'gar-relances', name: 'Relances', domain: 'gardien', durationMin: 6, equipment: ['ballon', 'plots'],
    steps: ["Pose un plot à 8 m de toi.", "Relance le ballon à la main en le faisant rouler jusqu'au plot.", "Puis pose le ballon par terre et dégage-le au pied le plus loin possible."] },

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

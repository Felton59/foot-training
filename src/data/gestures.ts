export type GestureCategory = 'dribble' | 'frappe' | 'passe' | 'controle' | 'tete' | 'gardien' | 'defense';
export type GestureLevel = 'facile' | 'moyen' | 'difficile' | 'expert';
export type GestureChannel = 'sikana' | 'footstyle';

export interface Gesture {
  id: string;
  name: string;
  category: GestureCategory;
  level: GestureLevel;
  /** À quoi sert le geste, en une phrase. */
  purpose: string;
  steps: string[];
  tip?: string;
  /** Vidéo de démonstration sur YouTube. */
  youtubeId: string;
  channel: GestureChannel;
}

export const CATEGORIES: { id: GestureCategory; label: string }[] = [
  { id: 'dribble', label: 'Dribbles' },
  { id: 'frappe', label: 'Frappes' },
  { id: 'passe', label: 'Passes' },
  { id: 'controle', label: 'Contrôles et conduite' },
  { id: 'tete', label: 'Jeu de tête' },
  { id: 'gardien', label: 'Gardien' },
  { id: 'defense', label: 'Défense' },
];

export const LEVEL_LABELS: Record<GestureLevel, string> = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile', expert: 'Expert' };

export const CHANNEL_SOURCES: Record<GestureChannel, string> = {
  sikana: 'Vidéo : Sikana, série « Apprendre à jouer au foot » (chaîne YouTube SIKANA Français)',
  footstyle: 'Vidéo : Footstyle TV (chaîne YouTube)',
};

export const GESTURES: Gesture[] = [
  // ——— Dribbles ———
  {
    id: 'crochet',
    name: 'Le crochet',
    category: 'dribble',
    level: 'facile',
    purpose: "Changer de direction d'un coup pour laisser le défenseur sur place.",
    steps: [
      'Conduis le ballon en avançant.',
      "Pose ton pied d'appui à côté du ballon et, avec l'intérieur de l'autre pied, emmène le ballon sur le côté.",
      'Pars tout de suite dans la nouvelle direction en accélérant.',
    ],
    tip: 'Plus le changement de direction est brusque, plus le défenseur est surpris.',
    youtubeId: 'P4FvKTU124w',
    channel: 'sikana',
  },
  {
    id: 'rateau',
    name: 'Le râteau',
    category: 'dribble',
    level: 'facile',
    purpose: "Faire reculer le ballon avec la semelle pour repartir dans l'autre sens.",
    steps: [
      'Conduis le ballon, puis pose la semelle dessus.',
      'Tire le ballon vers toi en le faisant rouler sous ta semelle.',
      "Tourne-toi et repars avec le ballon dans l'autre direction.",
    ],
    tip: 'Garde bien ton équilibre sur ton pied d’appui pendant que tu tires le ballon.',
    youtubeId: 'WRHD0tPErBg',
    channel: 'sikana',
  },
  {
    id: 'feinte-corps',
    name: 'La feinte de corps',
    category: 'dribble',
    level: 'facile',
    purpose: "Faire croire au défenseur que tu pars d'un côté, puis partir de l'autre.",
    steps: [
      'Avance vers le défenseur avec le ballon.',
      'À 2 m de lui, penche tout ton corps d’un côté, comme si tu partais par là.',
      "Quand il se décale, pousse le ballon de l'autre côté avec l'extérieur du pied et accélère.",
    ],
    tip: 'Exagère le mouvement des épaules : c’est lui qui trompe le défenseur.',
    youtubeId: 'e-twqVBjvmc',
    channel: 'sikana',
  },
  {
    id: 'petit-pont',
    name: 'Le petit pont',
    category: 'dribble',
    level: 'moyen',
    purpose: 'Faire passer le ballon entre les jambes du défenseur.',
    steps: [
      'Avance vers le défenseur en regardant ses jambes.',
      'Quand il écarte les jambes, pousse le ballon entre ses pieds, pas trop fort.',
      'Contourne-le vite et récupère le ballon derrière lui.',
    ],
    tip: 'Le bon moment, c’est quand le défenseur ouvre les jambes pour aller vers le ballon.',
    youtubeId: 'QLcez4gnSJc',
    channel: 'sikana',
  },
  {
    id: 'grand-pont',
    name: 'Le grand pont',
    category: 'dribble',
    level: 'moyen',
    purpose: "Passer le ballon d'un côté du défenseur et courir de l'autre côté pour le récupérer.",
    steps: [
      'Avance vers le défenseur quand il y a de la place derrière lui.',
      "Pousse le ballon d'un côté du défenseur, assez fort pour qu'il passe derrière lui.",
      "Cours de l'autre côté du défenseur, en sprint, et récupère le ballon derrière lui.",
    ],
    tip: 'Ne le tente pas près de la ligne de touche : il faut de la place des deux côtés.',
    youtubeId: 'ntwd7RL3apU',
    channel: 'sikana',
  },
  {
    id: 'double-contact',
    name: 'Le double contact',
    category: 'dribble',
    level: 'moyen',
    purpose: "Faire passer le ballon d'un pied à l'autre pour éviter le défenseur au dernier moment.",
    steps: [
      'Avance vers le défenseur en conduisant le ballon.',
      "À 1 m de lui, pousse le ballon avec l'intérieur d'un pied vers ton autre pied.",
      "Avec l'intérieur de l'autre pied, emmène tout de suite le ballon sur le côté et accélère.",
    ],
    tip: 'Les deux touches doivent s’enchaîner très vite, presque en même temps.',
    youtubeId: 'm0j0731O8Gw',
    channel: 'sikana',
  },
  {
    id: 'passement-jambe',
    name: 'Le passement de jambe',
    category: 'dribble',
    level: 'moyen',
    purpose: "Faire croire avec ta jambe que tu vas partir d'un côté, puis partir de l'autre.",
    steps: [
      "À 2 m du défenseur, fais tourner ta jambe devant le ballon, sans le toucher, de l'intérieur vers l'extérieur.",
      'Pose ce pied à côté du ballon, comme si tu partais de ce côté.',
      "Avec l'extérieur de l'autre pied, pousse le ballon du côté opposé et accélère.",
    ],
    tip: 'Commence lentement, ballon arrêté, puis de plus en plus vite.',
    youtubeId: 'g_YDCuLZOsA',
    channel: 'sikana',
  },
  {
    id: 'roulette',
    name: 'La roulette',
    category: 'dribble',
    level: 'difficile',
    purpose: 'Tourner sur toi-même avec le ballon pour passer le défenseur.',
    steps: [
      'À 1 m du défenseur, pose la semelle de ton pied fort sur le ballon et tire-le vers toi.',
      'Pose ce pied et tourne sur toi-même en tournant le dos au défenseur.',
      "Finis le tour en emmenant le ballon avec la semelle de l'autre pied, puis accélère.",
    ],
    tip: 'Apprends-la d’abord sans défenseur, très lentement, en comptant « 1, 2, 3 ».',
    youtubeId: 'TiVS3XoF2CQ',
    channel: 'sikana',
  },
  {
    id: 'sombrero',
    name: 'Le coup du sombrero',
    category: 'dribble',
    level: 'difficile',
    purpose: 'Faire passer le ballon en l’air par-dessus le défenseur.',
    steps: [
      "Quand le défenseur arrive face à toi, glisse ton pied sous le ballon.",
      'Soulève le ballon d’un petit coup sec pour qu’il passe au-dessus de sa tête ou de son épaule.',
      'Contourne le défenseur et récupère le ballon derrière lui avant qu’il retombe loin.',
    ],
    tip: 'Entraîne-toi d’abord seul à lever le ballon par-dessus un plot, puis par-dessus papa accroupi.',
    youtubeId: 'WHabkPRp1uQ',
    channel: 'sikana',
  },
  {
    id: 'elastico',
    name: "L'elastico (la virgule)",
    category: 'dribble',
    level: 'expert',
    purpose: "Pousser le ballon d'un côté puis le ramener aussitôt de l'autre avec le même pied.",
    steps: [
      "Avec l'extérieur de ton pied fort, pousse doucement le ballon vers l'extérieur.",
      "Sans poser le pied, ramène tout de suite le ballon vers l'intérieur avec l'intérieur du même pied.",
      'Pars du côté où tu as ramené le ballon en accélérant.',
    ],
    tip: 'Au début, fais-le ballon arrêté, très lentement : c’est la cheville qui travaille, pas toute la jambe.',
    youtubeId: 'USMF3aoqWIg',
    channel: 'footstyle',
  },
  {
    id: 'arc-en-ciel',
    name: "L'arc-en-ciel",
    category: 'dribble',
    level: 'expert',
    purpose: 'Faire passer le ballon par-dessus ta tête et celle du défenseur, avec les deux pieds.',
    steps: [
      "Coince le ballon entre le talon de ton pied d'appui et le dessus de ton autre pied.",
      'Fais rouler le ballon sur le mollet avec le pied de devant, puis donne un coup de talon vers le haut.',
      'Le ballon passe au-dessus de ta tête : cours devant pour le récupérer.',
    ],
    tip: 'Geste de spectacle : apprends-le pour t’amuser, pas pour les matchs.',
    youtubeId: 'ozF8LkXhTtQ',
    channel: 'footstyle',
  },

  // ——— Frappes ———
  {
    id: 'plat-du-pied',
    name: 'Le tir du plat du pied',
    category: 'frappe',
    level: 'facile',
    purpose: 'Le tir le plus précis : pour placer le ballon là où le gardien n’est pas.',
    steps: [
      "Pose ton pied d'appui à côté du ballon, pointé vers le but.",
      "Ouvre ton pied de frappe et frappe le milieu du ballon avec l'intérieur du pied.",
      'Accompagne le geste vers la cible, la cheville bien dure.',
    ],
    tip: 'Vise un coin du but plutôt que de frapper fort.',
    youtubeId: 'OP3og1ULpqY',
    channel: 'sikana',
  },
  {
    id: 'penalty',
    name: 'Le penalty',
    category: 'frappe',
    level: 'facile',
    purpose: 'Marquer face au gardien depuis le point de penalty.',
    steps: [
      'Choisis ton coin avant de prendre ton élan, et ne change plus d’avis.',
      'Prends 3 ou 4 pas d’élan, calmement.',
      'Frappe du plat du pied pour être précis, en regardant le ballon.',
    ],
    tip: 'Un tir bien placé près du poteau est presque impossible à arrêter.',
    youtubeId: '0tsjekQYG5Q',
    channel: 'sikana',
  },
  {
    id: 'cou-de-pied',
    name: 'Le tir du cou-de-pied',
    category: 'frappe',
    level: 'moyen',
    purpose: 'Le tir le plus puissant, avec le dessus du pied (les lacets).',
    steps: [
      "Arrive vers le ballon et pose ton pied d'appui à côté, un peu en retrait.",
      'Pointe le bout du pied vers le sol et frappe le milieu du ballon avec les lacets.',
      'Garde le buste au-dessus du ballon pour que le tir reste bas, et accompagne vers le but.',
    ],
    tip: 'Si le ballon part dans les nuages, c’est que tu te penches en arrière.',
    youtubeId: 'oDIKZtdsOvo',
    channel: 'sikana',
  },
  {
    id: 'exterieur-pied',
    name: "Le tir de l'extérieur du pied",
    category: 'frappe',
    level: 'difficile',
    purpose: 'Frapper sans ouvrir le pied, pour surprendre le gardien avec un ballon qui tourne.',
    steps: [
      "Pose ton pied d'appui un peu derrière et à côté du ballon.",
      "Tourne la pointe du pied vers l'intérieur et frappe le ballon avec l'extérieur du pied.",
      'Accompagne le geste vers la cible : le ballon part en tournant vers l’extérieur.',
    ],
    youtubeId: '8avtbZ6arnw',
    channel: 'sikana',
  },
  {
    id: 'frappe-enroulee',
    name: 'La frappe enroulée',
    category: 'frappe',
    level: 'difficile',
    purpose: 'Faire tourner le ballon pour qu’il contourne le gardien et rentre au second poteau.',
    steps: [
      'Prends ton élan un peu de côté par rapport au ballon.',
      "Frappe le côté du ballon avec l'intérieur du pied, pas le milieu.",
      'Accompagne le geste en travers de ton corps pour donner de l’effet.',
    ],
    tip: 'Vise à côté du but : l’effet ramènera le ballon dedans.',
    youtubeId: 'ff6z3a_iqb0',
    channel: 'sikana',
  },
  {
    id: 'balle-piquee',
    name: 'La balle piquée',
    category: 'frappe',
    level: 'difficile',
    purpose: 'Faire passer le ballon par-dessus le gardien quand il sort vers toi.',
    steps: [
      'Regarde où est le gardien : il doit être sorti de son but.',
      'Glisse le bout du pied sous le ballon, sans prendre beaucoup d’élan.',
      'Donne un petit coup sec vers le haut : le ballon monte et retombe derrière le gardien.',
    ],
    youtubeId: 's14XQhMNorc',
    channel: 'sikana',
  },
  {
    id: 'coup-franc',
    name: 'Le coup franc direct',
    category: 'frappe',
    level: 'difficile',
    purpose: 'Marquer directement sur coup franc, en passant au-dessus ou à côté du mur.',
    steps: [
      'Pose le ballon et recule de quelques pas, un peu de côté.',
      'Choisis ton coin : celui que le mur cache au gardien.',
      'Frappe enroulé pour que le ballon passe le mur puis redescende dans le but.',
    ],
    youtubeId: 'i8UQUdDHG20',
    channel: 'sikana',
  },

  // ——— Passes ———
  {
    id: 'passe-courte',
    name: 'La passe courte',
    category: 'passe',
    level: 'facile',
    purpose: 'Donner le ballon précisément à un partenaire proche.',
    steps: [
      "Regarde ton partenaire, puis pose ton pied d'appui à côté du ballon, pointé vers lui.",
      "Ouvre ton pied et frappe le milieu du ballon avec l'intérieur du pied.",
      'Accompagne vers ton partenaire : le ballon doit rouler sans rebondir.',
    ],
    tip: 'Passe dans le pied de ton partenaire, ni trop fort ni trop doux.',
    youtubeId: 'eTr-OHV62po',
    channel: 'sikana',
  },
  {
    id: 'une-deux',
    name: 'Le une-deux',
    category: 'passe',
    level: 'facile',
    purpose: 'Passer un défenseur à deux : tu passes, tu cours, tu récupères le ballon derrière lui.',
    steps: [
      'Fais une passe à ton partenaire.',
      'Cours tout de suite derrière le défenseur, sans regarder le ballon partir.',
      'Ton partenaire te remet le ballon en une touche dans ta course.',
    ],
    tip: 'Le secret, c’est de démarrer ta course dès que le ballon quitte ton pied.',
    youtubeId: 'WeWX0iJfnZA',
    channel: 'sikana',
  },
  {
    id: 'passe-longue',
    name: 'La passe longue',
    category: 'passe',
    level: 'moyen',
    purpose: 'Envoyer le ballon loin, en l’air, vers un partenaire éloigné.',
    steps: [
      "Prends un peu d'élan en biais et pose ton pied d'appui à côté du ballon.",
      'Frappe le bas du ballon avec le cou-de-pied, un peu vers l’intérieur.',
      'Penche-toi légèrement en arrière et accompagne le geste vers le haut.',
    ],
    youtubeId: 'DthSnfTCths',
    channel: 'sikana',
  },
  {
    id: 'centre',
    name: 'Le centre',
    category: 'passe',
    level: 'moyen',
    purpose: 'Envoyer le ballon depuis le côté du terrain devant le but, pour un partenaire.',
    steps: [
      'Conduis le ballon le long de la ligne de côté.',
      'Lève la tête pour voir où sont tes partenaires devant le but.',
      'Frappe le bas du ballon avec l’intérieur du pied pour l’envoyer devant le but.',
    ],
    youtubeId: 'eJ_KrjeFTjg',
    channel: 'sikana',
  },
  {
    id: 'talonnade',
    name: 'La talonnade',
    category: 'passe',
    level: 'moyen',
    purpose: 'Passer le ballon derrière toi avec le talon, sans te retourner.',
    steps: [
      'Vérifie qu’un partenaire est bien derrière toi.',
      'Passe ton pied au-dessus du ballon.',
      'Frappe le ballon vers l’arrière avec le talon.',
    ],
    youtubeId: 'ZQ1Wj7JTcc8',
    channel: 'sikana',
  },
  {
    id: 'aile-de-pigeon',
    name: "L'aile de pigeon",
    category: 'passe',
    level: 'difficile',
    purpose: 'Dévier le ballon sur le côté avec le talon, en levant la jambe comme une aile.',
    steps: [
      'Laisse arriver le ballon à côté de ton pied d’appui.',
      'Lève le pied de frappe sur le côté, genou plié, comme une aile.',
      'Touche le ballon avec le talon ou l’arrière du pied pour l’envoyer derrière ou sur le côté.',
    ],
    youtubeId: 'wOmc5CJA5Jg',
    channel: 'sikana',
  },

  // ——— Contrôles et conduite ———
  {
    id: 'controle-sol',
    name: 'Contrôler une passe au sol',
    category: 'controle',
    level: 'facile',
    purpose: 'Arrêter proprement un ballon qui arrive en roulant.',
    steps: [
      'Va vers le ballon et place-toi bien en face.',
      "Présente l'intérieur du pied, le pied un peu levé.",
      'Au contact, recule légèrement le pied pour amortir : le ballon doit s’arrêter tout près de toi.',
    ],
    tip: 'Ton pied est comme un coussin, pas comme un mur.',
    youtubeId: 'zeyVlBVu54E',
    channel: 'sikana',
  },
  {
    id: 'conduite',
    name: 'La conduite de balle',
    category: 'controle',
    level: 'facile',
    purpose: 'Avancer avec le ballon collé au pied, en gardant la tête levée.',
    steps: [
      "Pousse le ballon par petites touches avec l'intérieur ou l'extérieur du pied.",
      'Garde le ballon à moins d’un pas devant toi.',
      'Lève la tête entre deux touches pour voir autour de toi.',
    ],
    tip: 'Plus tu vas vite, plus les touches peuvent être longues ; près d’un défenseur, fais-les toutes petites.',
    youtubeId: 'a_frAe53iVo',
    channel: 'sikana',
  },
  {
    id: 'jongle',
    name: 'Apprendre à jongler',
    category: 'controle',
    level: 'facile',
    purpose: 'Garder le ballon en l’air : le meilleur moyen de bien sentir le ballon.',
    steps: [
      'Lâche le ballon de tes mains, fais une touche avec le pied et rattrape-le.',
      'Frappe avec le dessus du pied, la pointe légèrement levée, pas trop fort.',
      'Quand c’est facile, fais 2 touches avant de rattraper, puis 3…',
    ],
    tip: 'Le ballon doit monter à peu près jusqu’à ta taille, pas plus haut.',
    youtubeId: 'VyMJkqiN20Y',
    channel: 'sikana',
  },
  {
    id: 'controle-aerien',
    name: 'Contrôler une passe aérienne',
    category: 'controle',
    level: 'moyen',
    purpose: 'Arrêter un ballon qui arrive en l’air, avec le pied.',
    steps: [
      'Regarde le ballon et place-toi là où il va tomber.',
      'Lève le pied vers le ballon, le dessus du pied tendu.',
      'Au contact, descends le pied avec le ballon pour l’amortir et le poser au sol.',
    ],
    youtubeId: 'yZwKLRjYZcA',
    channel: 'sikana',
  },
  {
    id: 'controle-oriente',
    name: 'Le contrôle orienté',
    category: 'controle',
    level: 'moyen',
    purpose: 'Contrôler le ballon en l’emmenant déjà vers là où tu veux aller.',
    steps: [
      'Avant que le ballon arrive, regarde où tu veux aller.',
      "Au contact, pousse le ballon dans cette direction avec l'intérieur ou l'extérieur du pied.",
      'Enchaîne tout de suite : conduite, passe ou tir.',
    ],
    tip: 'Un bon contrôle orienté, c’est un défenseur déjà dépassé.',
    youtubeId: 'aQF9OH4Dh9o',
    channel: 'sikana',
  },
  {
    id: 'amorti-poitrine',
    name: "L'amorti de la poitrine",
    category: 'controle',
    level: 'moyen',
    purpose: 'Arrêter un ballon haut avec la poitrine pour le faire retomber à tes pieds.',
    steps: [
      'Place-toi sous le ballon, les bras écartés sur les côtés.',
      'Bombe le torse et penche-toi un peu en arrière au moment où le ballon arrive.',
      'Au contact, rentre la poitrine pour que le ballon retombe devant tes pieds.',
    ],
    youtubeId: 'Ok5Rx6ltR98',
    channel: 'sikana',
  },

  // ——— Jeu de tête ———
  {
    id: 'tete',
    name: 'La tête',
    category: 'tete',
    level: 'moyen',
    purpose: 'Frapper le ballon avec le front pour passer, dégager ou marquer.',
    steps: [
      'Garde les yeux ouverts et regarde le ballon arriver.',
      'Frappe le ballon avec le front, pas avec le dessus de la tête.',
      'Donne de la force avec ton buste, en allant vers le ballon.',
    ],
    tip: 'Commence avec un ballon mou lancé doucement à la main par papa.',
    youtubeId: 'JYsxLC_ioB8',
    channel: 'sikana',
  },
  {
    id: 'tete-sautee',
    name: 'La tête en sautant',
    category: 'tete',
    level: 'difficile',
    purpose: 'Sauter pour prendre le ballon plus haut que les autres.',
    steps: [
      'Prends un petit élan et saute sur un pied ou sur les deux.',
      'Arme ton buste vers l’arrière pendant le saut.',
      'Frappe le ballon avec le front au point le plus haut du saut.',
    ],
    youtubeId: 'uai3hIxszhM',
    channel: 'sikana',
  },

  // ——— Gardien ———
  {
    id: 'arret-gardien',
    name: "L'arrêt du gardien",
    category: 'gardien',
    level: 'facile',
    purpose: 'Bien placer les mains pour attraper le ballon sans le relâcher.',
    steps: [
      'Tiens-toi prêt : jambes fléchies, sur la pointe des pieds, les mains devant.',
      'Ballon haut : mains en forme de cœur, pouces qui se touchent derrière le ballon.',
      'Ballon bas : doigts vers le sol, puis ramène le ballon contre ta poitrine.',
    ],
    youtubeId: 'rYyKAViODWY',
    channel: 'sikana',
  },
  {
    id: 'relance-main',
    name: 'La relance à la main',
    category: 'gardien',
    level: 'facile',
    purpose: 'Relancer le jeu vite et précisément vers un partenaire.',
    steps: [
      'Repère un partenaire libre.',
      'Pour une relance courte, fais rouler le ballon au sol comme au bowling.',
      'Pour une relance longue, lance le ballon bras tendu, par-dessus l’épaule.',
    ],
    youtubeId: 'fUBcyTQz8e8',
    channel: 'sikana',
  },
  {
    id: 'degagement-volee',
    name: 'Le dégagement de volée',
    category: 'gardien',
    level: 'moyen',
    purpose: 'Envoyer le ballon loin en le frappant avant qu’il touche le sol.',
    steps: [
      'Tiens le ballon devant toi, bras tendus.',
      'Lâche le ballon et frappe-le avec le cou-de-pied avant qu’il touche le sol.',
      'Accompagne la frappe vers le haut et vers l’avant.',
    ],
    youtubeId: 'm7otu117vE4',
    channel: 'sikana',
  },

  // ——— Défense ———
  {
    id: 'bien-defendre',
    name: 'Bien défendre',
    category: 'defense',
    level: 'moyen',
    purpose: 'Empêcher l’attaquant de passer et lui prendre le ballon au bon moment.',
    steps: [
      'Reste entre l’attaquant et ton but, à 1 m de lui.',
      'Tiens-toi un pied devant l’autre, genoux fléchis, et regarde le ballon, pas ses feintes.',
      'Attends qu’il pousse le ballon un peu trop loin pour le prendre.',
    ],
    tip: 'Ne plonge pas sur le ballon : c’est ce qu’il attend pour te dribbler.',
    youtubeId: 'NBEAb29RMo8',
    channel: 'sikana',
  },
];

export function getGesture(id: string): Gesture | undefined {
  return GESTURES.find((g) => g.id === id);
}

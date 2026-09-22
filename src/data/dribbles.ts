export interface Dribble {
  id: string;
  name: string;
  level: 'facile' | 'moyen' | 'difficile';
  /** À quoi sert le geste, en une phrase. */
  purpose: string;
  steps: string[];
  tip?: string;
  /** Vidéo de démonstration de la chaîne YouTube « SIKANA Français ». */
  youtubeId: string;
}

export const DRIBBLE_SOURCE = 'Vidéos : Sikana, série « Apprendre à jouer au foot » (chaîne YouTube SIKANA Français)';

export const DRIBBLES: Dribble[] = [
  {
    id: 'crochet',
    name: 'Le crochet',
    level: 'facile',
    purpose: "Changer de direction d'un coup pour laisser le défenseur sur place.",
    steps: [
      'Conduis le ballon en avançant.',
      "Pose ton pied d'appui à côté du ballon et, avec l'intérieur de l'autre pied, emmène le ballon sur le côté.",
      'Pars tout de suite dans la nouvelle direction en accélérant.',
    ],
    tip: 'Plus le changement de direction est brusque, plus le défenseur est surpris.',
    youtubeId: 'P4FvKTU124w',
  },
  {
    id: 'rateau',
    name: 'Le râteau',
    level: 'facile',
    purpose: "Faire reculer le ballon avec la semelle pour repartir dans l'autre sens.",
    steps: [
      'Conduis le ballon, puis pose la semelle dessus.',
      'Tire le ballon vers toi en le faisant rouler sous ta semelle.',
      "Tourne-toi et repars avec le ballon dans l'autre direction.",
    ],
    tip: 'Garde bien ton équilibre sur ton pied d’appui pendant que tu tires le ballon.',
    youtubeId: 'WRHD0tPErBg',
  },
  {
    id: 'feinte-corps',
    name: 'La feinte de corps',
    level: 'facile',
    purpose: "Faire croire au défenseur que tu pars d'un côté, puis partir de l'autre.",
    steps: [
      'Avance vers le défenseur avec le ballon.',
      'À 2 m de lui, penche tout ton corps d’un côté, comme si tu partais par là.',
      "Quand il se décale, pousse le ballon de l'autre côté avec l'extérieur du pied et accélère.",
    ],
    tip: 'Exagère le mouvement des épaules : c’est lui qui trompe le défenseur.',
    youtubeId: 'e-twqVBjvmc',
  },
  {
    id: 'petit-pont',
    name: 'Le petit pont',
    level: 'moyen',
    purpose: 'Faire passer le ballon entre les jambes du défenseur.',
    steps: [
      'Avance vers le défenseur en regardant ses jambes.',
      'Quand il écarte les jambes, pousse le ballon entre ses pieds, pas trop fort.',
      'Contourne-le vite et récupère le ballon derrière lui.',
    ],
    tip: 'Le bon moment, c’est quand le défenseur ouvre les jambes pour aller vers le ballon.',
    youtubeId: 'QLcez4gnSJc',
  },
  {
    id: 'double-contact',
    name: 'Le double contact',
    level: 'moyen',
    purpose: "Faire passer le ballon d'un pied à l'autre pour éviter le défenseur au dernier moment.",
    steps: [
      'Avance vers le défenseur en conduisant le ballon.',
      "À 1 m de lui, pousse le ballon avec l'intérieur d'un pied vers ton autre pied.",
      "Avec l'intérieur de l'autre pied, emmène tout de suite le ballon sur le côté et accélère.",
    ],
    tip: 'Les deux touches doivent s’enchaîner très vite, presque en même temps.',
    youtubeId: 'm0j0731O8Gw',
  },
  {
    id: 'passement-jambe',
    name: 'Le passement de jambe',
    level: 'moyen',
    purpose: "Faire croire avec ta jambe que tu vas partir d'un côté, puis partir de l'autre.",
    steps: [
      "À 2 m du défenseur, fais tourner ta jambe devant le ballon, sans le toucher, de l'intérieur vers l'extérieur.",
      'Pose ce pied à côté du ballon, comme si tu partais de ce côté.',
      "Avec l'extérieur de l'autre pied, pousse le ballon du côté opposé et accélère.",
    ],
    tip: 'Commence lentement, ballon arrêté, puis de plus en plus vite.',
    youtubeId: 'g_YDCuLZOsA',
  },
  {
    id: 'roulette',
    name: 'La roulette',
    level: 'difficile',
    purpose: 'Tourner sur toi-même avec le ballon pour passer le défenseur.',
    steps: [
      'À 1 m du défenseur, pose la semelle de ton pied fort sur le ballon et tire-le vers toi.',
      'Pose ce pied et tourne sur toi-même en tournant le dos au défenseur.',
      "Finis le tour en emmenant le ballon avec la semelle de l'autre pied, puis accélère.",
    ],
    tip: 'Apprends-la d’abord sans défenseur, très lentement, en comptant « 1, 2, 3 ».',
    youtubeId: 'TiVS3XoF2CQ',
  },
];

export function getDribble(id: string): Dribble | undefined {
  return DRIBBLES.find((d) => d.id === id);
}

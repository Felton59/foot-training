import type { Domain, Equipment, ExerciseKind } from '../storage/schema';

export interface Exercise {
  id: string;
  name: string;
  domain: ExerciseKind;
  durationMin: number;
  equipment: Equipment[];
  steps: string[];
  tip?: string;
  /** Fiche d'origine quand l'exercice vient d'une source officielle. */
  source?: string;
  diagram?: Diagram;
  /** Affiche un chrono Départ / Arrivée pendant l'exercice. */
  stopwatch?: boolean;
  /** Dribbles à revoir en vidéo pour cet exercice (ids de data/dribbles). */
  dribbles?: string[];
  /** Version utilisée quand un vrai but est disponible (au lieu d'un but en plots). */
  withGoal?: { steps: string[]; equipment: Equipment[]; goal: GoalPlacement };
}

/** Où dessiner le vrai but dans le schéma, et quels éléments (plots du but, légende) retirer. */
export interface GoalPlacement {
  x: number;
  y: number;
  length: number;
  vertical: boolean;
  removes: [number, number][];
}

/** Schéma vu de dessus. Terrain de 100 de large sur `height` de haut (60 par défaut). */
export interface Diagram {
  height?: number;
  items: DiagramItem[];
  arrows: DiagramArrow[];
}

export type DiagramItem =
  | { kind: 'enfant' | 'papa' | 'plot' | 'ballon' | 'cible'; x: number; y: number }
  | { kind: 'texte'; x: number; y: number; text: string }
  | { kind: 'but'; x: number; y: number; length: number; vertical: boolean };

export interface DiagramArrow {
  /** course = déplacement du joueur, balle = passe ou tir. */
  kind: 'course' | 'balle';
  points: [number, number][];
  curve?: boolean;
  label?: string;
}

export interface Challenge {
  id: string;
  name: string;
  domain: Domain;
  unit: string;
  better: 'higher' | 'lower';
  tiers: { bronze: number; argent: number; or: number };
  maxValue?: number;
  minValue?: number;
  equipment: Equipment[];
  howTo: string[];
  /** Chrono Départ / Arrivée, ou compte à rebours de durée fixe. */
  timer?: { kind: 'stopwatch' } | { kind: 'countdown'; seconds: number };
  /** Fiche d'origine quand le défi vient d'une source officielle. */
  source?: string;
  diagram?: Diagram;
  /** Version utilisée quand un vrai but est disponible (au lieu d'un but en plots). */
  withGoal?: { howTo: string[]; equipment: Equipment[]; goal: GoalPlacement };
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

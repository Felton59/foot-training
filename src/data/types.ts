import type { Domain, Equipment, ExerciseKind } from '../storage/schema';

export interface Exercise {
  id: string;
  name: string;
  domain: ExerciseKind;
  durationMin: number;
  equipment: Equipment[];
  steps: string[];
  tip?: string;
  diagram?: Diagram;
}

/** Schéma vu de dessus. Terrain de 100 de large sur `height` de haut (60 par défaut). */
export interface Diagram {
  height?: number;
  items: DiagramItem[];
  arrows: DiagramArrow[];
}

export type DiagramItem =
  | { kind: 'enfant' | 'papa' | 'plot' | 'ballon'; x: number; y: number }
  | { kind: 'texte'; x: number; y: number; text: string };

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
}

export interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

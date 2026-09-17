import type { Domain, Equipment, ExerciseKind } from '../storage/schema';

export interface Exercise {
  id: string;
  name: string;
  domain: ExerciseKind;
  durationMin: number;
  equipment: Equipment[];
  steps: string[];
  tip?: string;
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

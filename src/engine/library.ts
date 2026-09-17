import type { Exercise } from '../data/types';
import type { ExerciseKind } from '../storage/schema';

/** Ordre des catégories, dans l'ordre d'une séance. */
export const KIND_ORDER: ExerciseKind[] = ['echauffement', 'technique', 'passes-tirs', 'physique', 'gardien', 'retour-calme'];

export interface ExerciseGroup {
  kind: ExerciseKind;
  exercises: Exercise[];
}

export function groupExercisesByKind(exercises: Exercise[]): ExerciseGroup[] {
  return KIND_ORDER.map((kind) => ({ kind, exercises: exercises.filter((e) => e.domain === kind) })).filter(
    (g) => g.exercises.length > 0,
  );
}

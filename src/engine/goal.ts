import type { Challenge, Diagram, Exercise, GoalPlacement } from '../data/types';
import type { Equipment } from '../storage/schema';

const owns = (needed: Equipment[], owned: Equipment[]) => needed.every((q) => owned.includes(q));

type Doable = { equipment: Equipment[]; withGoal?: { equipment: Equipment[] } };

/** Vrai quand un but est coché : on montre alors la version « vrai but », même s'il manque un autre matériel. */
export function usesRealGoal(item: Doable, owned: Equipment[]): boolean {
  return !!item.withGoal && owned.includes('but');
}

/** Faisable avec le matériel : version plots ou version vrai but. */
export function isDoable(item: Doable, owned: Equipment[]): boolean {
  return owns(item.equipment, owned) || (!!item.withGoal && owns(item.withGoal.equipment, owned));
}

/** Remplace le but en plots du schéma par un vrai but, dessiné sous les joueurs. */
export function withRealGoal(diagram: Diagram | undefined, goal: GoalPlacement): Diagram | undefined {
  if (!diagram) return diagram;
  const removed = (x: number, y: number) => goal.removes.some(([rx, ry]) => rx === x && ry === y);
  return {
    ...diagram,
    items: [
      { kind: 'but', x: goal.x, y: goal.y, length: goal.length, vertical: goal.vertical },
      ...diagram.items.filter((i) => !removed(i.x, i.y)),
    ],
  };
}

export function exerciseFor(exercise: Exercise, owned: Equipment[]): Exercise {
  if (!usesRealGoal(exercise, owned)) return exercise;
  const { steps, equipment, goal } = exercise.withGoal!;
  return { ...exercise, steps, equipment, diagram: withRealGoal(exercise.diagram, goal) };
}

export function challengeFor(challenge: Challenge, owned: Equipment[]): Challenge {
  if (!usesRealGoal(challenge, owned)) return challenge;
  const { howTo, equipment, goal } = challenge.withGoal!;
  return { ...challenge, howTo, equipment, diagram: withRealGoal(challenge.diagram, goal) };
}

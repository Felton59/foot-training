import { describe, expect, it } from 'vitest';
import { EXERCISES } from '../data/exercises';
import type { Exercise } from '../data/types';
import { groupExercisesByKind, KIND_ORDER } from './library';

const ex = (id: string, domain: Exercise['domain']): Exercise => ({ id, name: id, domain, durationMin: 5, equipment: [], steps: ['a', 'b'] });

describe('groupExercisesByKind', () => {
  it('follows the order of a session', () => {
    expect(KIND_ORDER).toEqual(['echauffement', 'technique', 'passes-tirs', 'physique', 'gardien', 'retour-calme']);
  });

  it('groups exercises by kind, keeping their order and skipping empty kinds', () => {
    const groups = groupExercisesByKind([ex('t1', 'technique'), ex('w1', 'echauffement'), ex('t2', 'technique')]);
    expect(groups.map((g) => [g.kind, g.exercises.map((e) => e.id)])).toEqual([
      ['echauffement', ['w1']],
      ['technique', ['t1', 't2']],
    ]);
  });

  it('covers the whole library', () => {
    const groups = groupExercisesByKind(EXERCISES);
    expect(groups).toHaveLength(6);
    expect(groups.reduce((n, g) => n + g.exercises.length, 0)).toBe(EXERCISES.length);
  });
});

import { describe, expect, it } from 'vitest';
import { CHALLENGES } from '../data/challenges';
import { EXERCISES, getExercise } from '../data/exercises';
import type { Challenge, Exercise } from '../data/types';
import { challengeFor, exerciseFor, isDoable, withRealGoal } from './goal';

const shot: Exercise = {
  id: 'shot',
  name: 'Tir',
  domain: 'passes-tirs',
  durationMin: 5,
  equipment: ['ballon', 'plots'],
  steps: ['Fais un but avec 2 plots.', 'Tire.'],
  diagram: {
    items: [{ kind: 'plot', x: 90, y: 20 }, { kind: 'plot', x: 90, y: 40 }, { kind: 'texte', x: 90, y: 50, text: 'but' }, { kind: 'enfant', x: 10, y: 30 }],
    arrows: [],
  },
  withGoal: {
    steps: ['Mets-toi face au but.', 'Tire.'],
    equipment: ['ballon', 'but'],
    goal: { x: 94, y: 30, length: 20, vertical: true, removes: [[90, 20], [90, 40], [90, 50]] },
  },
};

describe('real goal variant', () => {
  it('keeps the cone version without a goal', () => {
    expect(exerciseFor(shot, ['ballon', 'plots'])).toBe(shot);
  });

  it('uses the goal version when a goal is available', () => {
    const shown = exerciseFor(shot, ['ballon', 'plots', 'but']);
    expect(shown.steps).toEqual(['Mets-toi face au but.', 'Tire.']);
    expect(shown.equipment).toEqual(['ballon', 'but']);
    expect(shown.diagram?.items).toEqual([
      { kind: 'but', x: 94, y: 30, length: 20, vertical: true },
      { kind: 'enfant', x: 10, y: 30 },
    ]);
  });

  it('shows the real goal as soon as a goal is ticked, even if other equipment is missing', () => {
    const withCones: Exercise = { ...shot, withGoal: { ...shot.withGoal!, equipment: ['ballon', 'plots', 'but'] } };
    const shown = exerciseFor(withCones, ['ballon', 'but']);
    expect(shown.equipment).toEqual(['ballon', 'plots', 'but']);
    expect(shown.diagram?.items[0].kind).toBe('but');
    expect(isDoable(withCones, ['ballon', 'but'])).toBe(false);
  });

  it('makes goal exercises doable with a goal but no cones', () => {
    expect(isDoable(shot, ['ballon', 'but'])).toBe(true);
    expect(isDoable(shot, ['ballon', 'plots'])).toBe(true);
    expect(isDoable(shot, ['ballon'])).toBe(false);
  });

  it('leaves diagrams without a goal untouched', () => {
    expect(withRealGoal(undefined, shot.withGoal!.goal)).toBeUndefined();
  });

  it('applies the goal version to challenges too', () => {
    const c = CHALLENGES.find((ch) => ch.id === 'defi-tirs-au-but') as Challenge;
    expect(challengeFor(c, ['ballon', 'plots'])).toBe(c);
    const shown = challengeFor(c, ['ballon', 'but']);
    expect(shown.howTo[0]).not.toMatch(/plots/);
    expect(shown.diagram?.items.some((i) => i.kind === 'but')).toBe(true);
  });
});

describe('goal variants in the content', () => {
  const buildsConeGoal = (lines: string[]) => lines.some((s) => /but (de|avec) 2 plots|but de 2 plots/.test(s));

  it('offers a real goal version for every exercise and challenge that builds a goal with cones', () => {
    expect(EXERCISES.filter((e) => buildsConeGoal(e.steps) && !e.withGoal).map((e) => e.id)).toEqual([]);
    expect(CHALLENGES.filter((c) => buildsConeGoal(c.howTo) && !c.withGoal).map((c) => c.id)).toEqual([]);
  });

  it('never asks to build a goal with cones in the real goal version', () => {
    for (const e of EXERCISES.filter((ex) => ex.withGoal)) expect(buildsConeGoal(e.withGoal!.steps), e.id).toBe(false);
    for (const c of CHALLENGES.filter((ch) => ch.withGoal)) expect(buildsConeGoal(c.withGoal!.howTo), c.id).toBe(false);
  });

  it('removes only items that exist and keeps the goal inside the pitch', () => {
    const variants = [
      ...EXERCISES.filter((e) => e.withGoal).map((e) => [e.id, e.diagram, e.withGoal!.goal] as const),
      ...CHALLENGES.filter((c) => c.withGoal).map((c) => [c.id, c.diagram, c.withGoal!.goal] as const),
    ];
    expect(variants.length).toBe(15);
    for (const [id, diagram, goal] of variants) {
      expect(diagram, id).toBeDefined();
      for (const [x, y] of goal.removes) {
        expect(diagram!.items.some((i) => i.x === x && i.y === y), `${id} ${x},${y}`).toBe(true);
      }
      const height = diagram!.height ?? 60;
      const half = goal.length / 2;
      const [minX, maxX, minY, maxY] = goal.vertical
        ? [goal.x - 1.5, goal.x + 1.5, goal.y - half, goal.y + half]
        : [goal.x - half, goal.x + half, goal.y - 1.5, goal.y + 1.5];
      expect(minX >= 0 && maxX <= 100 && minY >= 0 && maxY <= height, id).toBe(true);
    }
  });

  it('shows the real goal to a family that ticked it', () => {
    const shown = exerciseFor(getExercise('pt-tirs-cadres')!, ['ballon', 'but']);
    expect(shown.equipment).toEqual(['ballon', 'but']);
    expect(shown.steps.join(' ')).not.toMatch(/plot/);
  });
});

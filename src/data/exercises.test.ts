import { describe, expect, it } from 'vitest';
import { ALL_DOMAINS, ALL_EQUIPMENT, type ExerciseKind } from '../storage/schema';
import { EXERCISES, getExercise } from './exercises';

const count = (kind: ExerciseKind) => EXERCISES.filter((e) => e.domain === kind).length;

describe('exercises data', () => {
  it('has 42 exercises with unique ids', () => {
    expect(EXERCISES).toHaveLength(42);
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(42);
  });

  it('uses FFF sheets for the exercises that replaced invented ones', () => {
    expect(getExercise('phy-chat-ballon')).toBeUndefined();
    for (const id of ['phy-terre-mer-ciel', 'tech-10-vies', 'pt-passe-dosee']) {
      expect(getExercise(id)?.source, id).toMatch(/^FFF – District/);
    }
  });

  it('has the expected mix', () => {
    expect(count('echauffement')).toBeGreaterThanOrEqual(4);
    expect(count('retour-calme')).toBeGreaterThanOrEqual(3);
    expect(count('technique')).toBeGreaterThanOrEqual(8);
    expect(count('passes-tirs')).toBeGreaterThanOrEqual(8);
    expect(count('physique')).toBeGreaterThanOrEqual(8);
    expect(count('gardien')).toBeGreaterThanOrEqual(5);
  });

  it('is usable with only a ball', () => {
    const ballOnly = (kind: ExerciseKind) =>
      EXERCISES.filter((e) => e.domain === kind && e.equipment.every((q) => q === 'ballon')).length;
    for (const kind of [...ALL_DOMAINS, 'echauffement', 'retour-calme'] as ExerciseKind[]) {
      expect(ballOnly(kind), kind).toBeGreaterThanOrEqual(2);
    }
  });

  it('has well-formed entries', () => {
    for (const e of EXERCISES) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(2);
      expect(e.steps.length, e.id).toBeLessThanOrEqual(4);
      expect(e.durationMin, e.id).toBeGreaterThan(0);
      expect(e.equipment.every((q) => ALL_EQUIPMENT.includes(q)), e.id).toBe(true);
    }
  });

  it('keeps diagram elements inside the pitch', () => {
    for (const e of EXERCISES.filter((ex) => ex.diagram)) {
      const height = e.diagram!.height ?? 60;
      const points = [
        ...e.diagram!.items.map((i) => [i.x, i.y]),
        ...e.diagram!.arrows.flatMap((a) => a.points),
      ];
      for (const [x, y] of points) {
        expect(x, e.id).toBeGreaterThanOrEqual(0);
        expect(x, e.id).toBeLessThanOrEqual(100);
        expect(y, e.id).toBeGreaterThanOrEqual(0);
        expect(y, e.id).toBeLessThanOrEqual(height);
      }
      for (const a of e.diagram!.arrows) expect(a.points.length, e.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('finds exercises by id', () => {
    expect(getExercise('ech-trottinage-ballon')?.domain).toBe('echauffement');
    expect(getExercise('nope')).toBeUndefined();
  });
});

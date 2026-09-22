import { describe, expect, it } from 'vitest';
import { CATEGORIES, GESTURES, getGesture } from './gestures';
import { EXERCISES } from './exercises';

describe('gestures', () => {
  it('has unique ids, every category filled and ordered from easiest to hardest', () => {
    expect(new Set(GESTURES.map((g) => g.id)).size).toBe(GESTURES.length);
    expect(new Set(GESTURES.map((g) => g.youtubeId)).size).toBe(GESTURES.length);
    const order = { facile: 0, moyen: 1, difficile: 2, expert: 3 };
    for (const c of CATEGORIES) {
      const levels = GESTURES.filter((g) => g.category === c.id).map((g) => order[g.level]);
      expect(levels.length, c.id).toBeGreaterThan(0);
      expect([...levels].sort((a, b) => a - b), c.id).toEqual(levels);
    }
  });

  it('keeps the dribbles from easiest to expert', () => {
    expect(GESTURES.filter((g) => g.category === 'dribble').map((g) => g.id)).toEqual([
      'crochet', 'rateau', 'feinte-corps', 'petit-pont', 'grand-pont', 'double-contact', 'passement-jambe', 'roulette', 'sombrero', 'elastico', 'arc-en-ciel',
    ]);
  });

  it('explains each gesture in 3 short steps with a demonstration video', () => {
    for (const g of GESTURES) {
      expect(g.steps, g.id).toHaveLength(3);
      expect(g.purpose.length, g.id).toBeGreaterThan(10);
      expect(g.youtubeId, g.id).toMatch(/^[\w-]{11}$/);
    }
  });

  it('finds gestures by id', () => {
    expect(getGesture('roulette')?.name).toBe('La roulette');
    expect(getGesture('nope')).toBeUndefined();
  });

  it('links exercises to existing gestures', () => {
    const linked = EXERCISES.filter((e) => e.gestures?.length);
    expect(linked.length).toBeGreaterThanOrEqual(30);
    for (const e of linked) {
      for (const id of e.gestures!) expect(getGesture(id), `${e.id} → ${id}`).toBeDefined();
    }
    expect(EXERCISES.find((e) => e.id === 'tech-dribble-1c1')?.gestures).toContain('crochet');
    expect(EXERCISES.find((e) => e.id === 'gar-relances')?.gestures).toEqual(['relance-main', 'degagement-volee']);
  });
});

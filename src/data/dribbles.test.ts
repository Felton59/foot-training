import { describe, expect, it } from 'vitest';
import { DRIBBLES, getDribble } from './dribbles';
import { EXERCISES } from './exercises';

describe('dribbles', () => {
  it('has 7 dribbles with unique ids, ordered from easiest to hardest', () => {
    expect(DRIBBLES.map((d) => d.id)).toEqual(['crochet', 'rateau', 'feinte-corps', 'petit-pont', 'double-contact', 'passement-jambe', 'roulette']);
    const order = { facile: 0, moyen: 1, difficile: 2 };
    const levels = DRIBBLES.map((d) => order[d.level]);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it('explains each dribble in 3 short steps with a demonstration video', () => {
    for (const d of DRIBBLES) {
      expect(d.steps, d.id).toHaveLength(3);
      expect(d.purpose.length, d.id).toBeGreaterThan(10);
      expect(d.youtubeId, d.id).toMatch(/^[\w-]{11}$/);
    }
  });

  it('finds dribbles by id', () => {
    expect(getDribble('roulette')?.name).toBe('La roulette');
    expect(getDribble('nope')).toBeUndefined();
  });

  it('links dribbling exercises to existing dribbles', () => {
    const linked = EXERCISES.filter((e) => e.dribbles?.length);
    expect(linked.map((e) => e.id).sort()).toEqual(
      ['tech-conduite-semelle', 'tech-crochets', 'tech-dribble-1c1', 'tech-dribble-plots', 'tech-epervier', 'tech-feintes', 'tech-traverser-marquer'].sort(),
    );
    for (const e of linked) {
      for (const id of e.dribbles!) expect(getDribble(id), `${e.id} → ${id}`).toBeDefined();
    }
  });
});

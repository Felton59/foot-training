import { describe, expect, it } from 'vitest';
import { ALL_DOMAINS, ALL_EQUIPMENT } from '../storage/schema';
import { BADGES, getBadge } from './badges';
import { CHALLENGES, getChallenge } from './challenges';

describe('challenges data', () => {
  it('has 10 challenges with unique ids', () => {
    expect(CHALLENGES).toHaveLength(13);
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(13);
  });

  it('covers every domain', () => {
    for (const d of ALL_DOMAINS) {
      expect(CHALLENGES.some((c) => c.domain === d)).toBe(true);
    }
  });

  it.each(CHALLENGES.map((c) => [c.id, c] as const))('%s has consistent tiers and bounds', (_id, c) => {
    const { bronze, argent, or } = c.tiers;
    if (c.better === 'higher') {
      expect(bronze).toBeLessThan(argent);
      expect(argent).toBeLessThan(or);
      if (c.maxValue !== undefined) expect(c.maxValue).toBeGreaterThanOrEqual(or);
      expect(c.minValue).toBeUndefined();
    } else {
      expect(bronze).toBeGreaterThan(argent);
      expect(argent).toBeGreaterThan(or);
      if (c.minValue !== undefined) expect(c.minValue).toBeLessThanOrEqual(or);
      expect(c.maxValue).toBeUndefined();
    }
    expect(c.equipment.every((e) => ALL_EQUIPMENT.includes(e))).toBe(true);
    expect(c.howTo.length).toBeGreaterThanOrEqual(2);
  });

  it('finds challenges by id', () => {
    expect(getChallenge('jongles-pied-fort')?.name).toBe('Jongles pied fort');
    expect(getChallenge('nope')).toBeUndefined();
  });
});

describe('official challenges', () => {
  it('replaces invented challenges with FFF ones', () => {
    for (const old of ['jongles', 'slalom-plots', 'passes-a-deux', 'tirs-cadres', 'tirs-pied-faible', 'controles', 'arrets-gardien']) {
      expect(getChallenge(old), old).toBeUndefined();
    }
    for (const id of ['jongles-pied-fort', 'jongles-pied-faible', 'defi-slalom-12', 'defi-passe-dosee', 'defi-tir', 'defi-tir-pied-faible', 'allers-retours-1min', 'defi-controle-tir', 'sprint-20m', 'defi-tirs-au-but', 'course-brisee-4x10', 'jonglerie-mouvement', 'conduite-piquets']) {
      expect(getChallenge(id)?.source, id).toMatch(/^FFF – District/);
    }
  });
});

describe('challenge diagrams', () => {
  it('shows a diagram for every challenge that places things at a distance', () => {
    const withDistance = CHALLENGES.filter((c) => c.howTo.some((s) => /\d+(,\d+)? m\b/.test(s)));
    expect(withDistance.filter((c) => !c.diagram).map((c) => c.id)).toEqual([]);
  });

  it('keeps challenge diagram elements inside the pitch', () => {
    for (const c of CHALLENGES.filter((ch) => ch.diagram)) {
      const height = c.diagram!.height ?? 60;
      const points = [...c.diagram!.items.map((i) => [i.x, i.y]), ...c.diagram!.arrows.flatMap((a) => a.points)];
      for (const [x, y] of points) {
        expect(x, c.id).toBeGreaterThanOrEqual(0);
        expect(x, c.id).toBeLessThanOrEqual(100);
        expect(y, c.id).toBeGreaterThanOrEqual(0);
        expect(y, c.id).toBeLessThanOrEqual(height);
      }
    }
  });
});

describe('age-appropriate goals', () => {
  it('keeps juggling goals reachable for an 8-year-old', () => {
    expect(getChallenge('jongles-pied-fort')?.tiers).toEqual({ bronze: 3, argent: 6, or: 10 });
    expect(getChallenge('jongles-pied-faible')?.tiers).toEqual({ bronze: 2, argent: 4, or: 6 });
  });

  it('keeps every challenge goal suited to an 8-year-old beginner', () => {
    expect(getChallenge('jonglerie-mouvement')?.tiers, 'jonglerie-mouvement').toEqual({ bronze: 1, argent: 3, or: 6 });
    expect(getChallenge('defi-slalom-12')?.tiers, 'defi-slalom-12').toEqual({ bronze: 6, argent: 8, or: 10 });
    expect(getChallenge('conduite-piquets')?.tiers, 'conduite-piquets').toEqual({ bronze: 35, argent: 30, or: 25 });
    expect(getChallenge('defi-controle-tir')?.tiers, 'defi-controle-tir').toEqual({ bronze: 4, argent: 7, or: 10 });
    expect(getChallenge('defi-passe-dosee')?.tiers, 'defi-passe-dosee').toEqual({ bronze: 8, argent: 15, or: 25 });
    expect(getChallenge('defi-tir')?.tiers, 'defi-tir').toEqual({ bronze: 3, argent: 6, or: 9 });
    expect(getChallenge('defi-tir-pied-faible')?.tiers, 'defi-tir-pied-faible').toEqual({ bronze: 2, argent: 4, or: 6 });
    expect(getChallenge('sprint-20m')?.tiers, 'sprint-20m').toEqual({ bronze: 5.5, argent: 5, or: 4.6 });
    expect(getChallenge('course-brisee-4x10')?.tiers, 'course-brisee-4x10').toEqual({ bronze: 16.5, argent: 15, or: 14 });
    expect(getChallenge('allers-retours-1min')?.tiers, 'allers-retours-1min').toEqual({ bronze: 2, argent: 3, or: 4 });
    expect(getChallenge('defi-tirs-au-but')?.tiers, 'defi-tirs-au-but').toEqual({ bronze: 2, argent: 4, or: 6 });
  });
});

describe('badges data', () => {
  it('has 12 badges with unique ids', () => {
    expect(BADGES).toHaveLength(12);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(12);
    expect(getBadge('sniper')?.emoji).toBe('🎯');
  });
});

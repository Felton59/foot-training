import { describe, expect, it } from 'vitest';
import { levelFor } from './levels';

describe('levelFor', () => {
  it('starts at Poussin', () => {
    const info = levelFor(0);
    expect(info.level.name).toBe('Poussin');
    expect(info.index).toBe(0);
    expect(info.next?.name).toBe('Espoir');
    expect(info.progress).toBe(0);
  });

  it('computes progress inside a level', () => {
    expect(levelFor(125).progress).toBeCloseTo(0.5);
    expect(levelFor(249).level.name).toBe('Poussin');
  });

  it('switches level exactly at the threshold', () => {
    expect(levelFor(250).level.name).toBe('Espoir');
    expect(levelFor(250).progress).toBe(0);
    expect(levelFor(1400).level.name).toBe('Capitaine');
  });

  it('caps at Légende', () => {
    const info = levelFor(9999);
    expect(info.level.name).toBe('Légende');
    expect(info.next).toBeNull();
    expect(info.progress).toBe(1);
  });
});

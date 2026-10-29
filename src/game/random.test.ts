import { describe, expect, it } from 'vitest';
import { WORDS } from '../data/words';
import { drawCode, drawCodes, drawKeywords } from './random';
import { applyAction, createInitialState, isValidCode, KEYWORD_COUNT, MAX_ROUNDS } from './state';

describe('drawKeywords', () => {
  it('deals 4 different words to each team', () => {
    for (let i = 0; i < 200; i++) {
      const keywords = drawKeywords();
      expect(keywords.map((k) => k.length)).toEqual([KEYWORD_COUNT, KEYWORD_COUNT]);
      expect(new Set(keywords.flat()).size).toBe(KEYWORD_COUNT * 2);
      expect(keywords.flat().every((w) => WORDS.includes(w))).toBe(true);
    }
  });

  it('works with exactly enough words, even if some repeat', () => {
    const words = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'a'];
    expect(drawKeywords(words).flat().sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  });

  it('can deal any word', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) drawKeywords().flat().forEach((w) => seen.add(w));
    expect(seen.size).toBeGreaterThan(WORDS.length * 0.9);
  });
});

describe('drawCode', () => {
  it('always gives a valid code, and every one of the 24 codes comes up', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const code = drawCode();
      expect(isValidCode(code)).toBe(true);
      seen.add(code.join(''));
    }
    expect(seen.size).toBe(24);
  });

  it('copes with a rand that returns its extremes', () => {
    expect(isValidCode(drawCode(() => 0))).toBe(true);
    expect(isValidCode(drawCode(() => 0.9999999))).toBe(true);
  });
});

describe('a game dealt with these draws', () => {
  it('is accepted by START_GAME', () => {
    const codes = drawCodes();
    expect(codes.map((c) => c.length)).toEqual([MAX_ROUNDS, MAX_ROUNDS]);
    const s = applyAction(createInitialState(), {
      type: 'START_GAME',
      teams: [
        { name: 'Red', players: [] },
        { name: 'Blue', players: [] },
      ],
      keywords: drawKeywords(),
      codes,
    });
    expect(s.phase).toBe('KEYWORDS');
  });
});

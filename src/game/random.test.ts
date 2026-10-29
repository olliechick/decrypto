import { describe, expect, it } from 'vitest';
import { WORDS } from '../data/words';
import {
  cleanGameCode,
  deal,
  drawCode,
  drawKeywords,
  GAME_CODE_LENGTH,
  isValidGameCode,
  makeGameCode,
  seededRand,
} from './random';
import { applyAction, createInitialState, isValidCode, KEYWORD_COUNT, MAX_ROUNDS, TeamIndex } from './state';

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

describe('game codes', () => {
  it('are short, and never use letters that look like digits', () => {
    for (let i = 0; i < 500; i++) {
      const code = makeGameCode();
      expect(code).toHaveLength(GAME_CODE_LENGTH);
      expect(code).not.toMatch(/[01OI]/);
      expect(isValidGameCode(code)).toBe(true);
    }
  });

  it('are tidied up when typed', () => {
    expect(cleanGameCode(' ab cd ')).toBe('ABCD');
    expect(isValidGameCode(cleanGameCode('k7q2'))).toBe(true);
    expect(isValidGameCode('ABC')).toBe(false);
    expect(isValidGameCode('AB0D')).toBe(false);
  });
});

describe('deal', () => {
  it('gives the same deal for the same game code, so both phones agree', () => {
    expect(deal('K7Q2')).toEqual(deal('K7Q2'));
  });

  it("never gives both teams the same word, and each has 8 valid codes", () => {
    for (let i = 0; i < 300; i++) {
      const { keywords, codes } = deal(makeGameCode());
      expect(new Set(keywords.flat()).size).toBe(KEYWORD_COUNT * 2);
      expect(codes.map((c) => c.length)).toEqual([MAX_ROUNDS, MAX_ROUNDS]);
      expect(codes.flat().every(isValidCode)).toBe(true);
    }
  });

  it('gives different deals for different game codes', () => {
    const deals = new Set(['AAAA', 'AAAB', 'BAAA', 'K7Q2', 'ZZZZ'].map((c) => deal(c).keywords.flat().join()));
    expect(deals.size).toBe(5);
  });

  it('spreads seeded numbers evenly between 0 and 1', () => {
    const rand = seededRand('K7Q2');
    const values = Array.from({ length: 10000 }, rand);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    const mean = values.reduce((a, b) => a + b) / values.length;
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
  });

  it("is accepted by START_GAME for either team", () => {
    const { keywords, codes } = deal('K7Q2');
    for (const team of [0, 1] as TeamIndex[]) {
      const s = applyAction(createInitialState(), {
        type: 'START_GAME',
        gameCode: 'K7Q2',
        team,
        players: [],
        keywords: keywords[team],
        codes: codes[team],
      });
      expect(s.phase).toBe('PLAYING');
    }
  });
});

import { describe, expect, it } from 'vitest';
import { WORDS } from './words';

describe('the word list', () => {
  it('has enough words for plenty of games', () => {
    expect(WORDS.length).toBeGreaterThanOrEqual(400);
  });

  it('has no duplicates', () => {
    const dupes = WORDS.filter((w, i) => WORDS.indexOf(w) !== i);
    expect(dupes).toEqual([]);
  });

  it('is all single, lower-case words', () => {
    expect(WORDS.filter((w) => !/^[a-z]+$/.test(w))).toEqual([]);
  });
});

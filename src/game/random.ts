import { WORDS } from '../data/words';
import { Code, CODE_LENGTH, KEYWORD_COUNT, MAX_ROUNDS } from './state';

// The random draws for a new game, kept out of the reducer so it stays pure. `rand` can be swapped in tests.

export type Rand = () => number;

// The first `n` items of a Fisher-Yates shuffle of `items`
function pick<T>(items: T[], n: number, rand: Rand): T[] {
  const pool = [...items];
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// KEYWORD_COUNT keywords for each team, with no word dealt twice
export function drawKeywords(words: string[] = WORDS, rand: Rand = Math.random): string[][] {
  const unique = [...new Set(words)];
  const drawn = pick(unique, KEYWORD_COUNT * 2, rand);
  return [drawn.slice(0, KEYWORD_COUNT), drawn.slice(KEYWORD_COUNT)];
}

const DIGITS = Array.from({ length: KEYWORD_COUNT }, (_, i) => i + 1);

export const drawCode = (rand: Rand = Math.random): Code => pick(DIGITS, CODE_LENGTH, rand);

// A code for every round, for each team
export const drawCodes = (rand: Rand = Math.random): Code[][] =>
  [0, 1].map(() => Array.from({ length: MAX_ROUNDS }, () => drawCode(rand)));

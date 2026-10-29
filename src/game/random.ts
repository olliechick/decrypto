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

// Both phones deal from the same game code, so they agree on who has which keywords without talking to each other.
// No 0/O or 1/I, so a code read across the table can't be mistyped.
const GAME_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const GAME_CODE_LENGTH = 4;

export const makeGameCode = (rand: Rand = Math.random): string =>
  Array.from({ length: GAME_CODE_LENGTH }, () => GAME_CODE_ALPHABET[Math.floor(rand() * GAME_CODE_ALPHABET.length)]).join('');

// What someone typed, tidied up: upper case, no spaces
export const cleanGameCode = (input: string) => input.toUpperCase().replace(/\s/g, '');

export const isValidGameCode = (code: string) =>
  code.length === GAME_CODE_LENGTH && [...code].every((c) => GAME_CODE_ALPHABET.includes(c));

// A repeatable random number generator for a game code (FNV-1a hash, then mulberry32)
export function seededRand(seed: string): Rand {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The whole deal for a game code: both teams' keywords and codes. Every phone with the same code (and the same word
// list) gets the same deal.
export function deal(gameCode: string, words: string[] = WORDS) {
  const rand = seededRand(gameCode);
  return { keywords: drawKeywords(words, rand), codes: drawCodes(rand) };
}

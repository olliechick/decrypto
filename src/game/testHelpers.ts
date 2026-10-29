import { applyAction, Code, createInitialState, GameAction, GameState, getCode, TeamSetup } from './state';

// Test-only helpers for driving the reducer like the app does

// Applies actions in order, bumping `version` like the app does
export function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((s, a) => ({ ...applyAction(s, a), version: s.version + 1 }), state);
}

export const KEYWORDS = [
  ['apple', 'river', 'castle', 'robot'],
  ['piano', 'tiger', 'cloud', 'anchor'],
];

// Different codes each round, so clue sheets and guesses can be told apart
export const CODES: Code[][] = [
  [[1, 2, 3], [4, 3, 2], [2, 4, 1], [3, 1, 4], [1, 3, 2], [4, 1, 3], [2, 3, 4], [3, 2, 1]],
  [[4, 1, 2], [2, 3, 1], [1, 4, 3], [3, 4, 2], [2, 1, 4], [1, 2, 3], [4, 3, 1], [3, 1, 2]],
];

export const TEAMS: TeamSetup[] = [
  { name: 'Red', players: [] },
  { name: 'Blue', players: [] },
];

export function startGame(teams: TeamSetup[] = TEAMS): GameState {
  return run(createInitialState(), { type: 'START_GAME', teams, keywords: KEYWORDS, codes: CODES });
}

// A started game where both teams have seen their keywords: team 0 is about to encrypt in round 1
export const newGame = (teams?: TeamSetup[]) => run(startGame(teams), { type: 'DONE_KEYWORDS' }, { type: 'DONE_KEYWORDS' });

// A valid code that isn't `code`
export const wrong = (code: Code): Code => [code[1], code[2], code[0]];

export interface TurnOptions {
  clues?: string[];
  intercepted?: boolean; // the other team guesses the code (ignored in round 1)
  miscommunicated?: boolean; // the encrypting team gets its own code wrong
}

// Plays the current team's transmission from ENCRYPT through to the REVEAL
export function reveal(s: GameState, opts: TurnOptions = {}): GameState {
  const code = getCode(s)!;
  s = run(s, { type: 'SUBMIT_CLUES', clues: opts.clues ?? [`r${s.round}a`, `r${s.round}b`, `r${s.round}c`] });
  if (s.phase === 'INTERCEPT') s = run(s, { type: 'SUBMIT_INTERCEPT', guess: opts.intercepted ? code : wrong(code) });
  return run(s, { type: 'SUBMIT_DECODE', guess: opts.miscommunicated ? wrong(code) : code });
}

// Plays the current team's transmission and moves on
export const turn = (s: GameState, opts: TurnOptions = {}) => run(reveal(s, opts), { type: 'NEXT' });

// Plays a whole round: team 0 then team 1
export const round = (s: GameState, team0: TurnOptions = {}, team1: TurnOptions = {}) => turn(turn(s, team0), team1);

// Plays `n` quiet rounds, where nobody gets a token
export function quietRounds(s: GameState, n: number): GameState {
  for (let i = 0; i < n; i++) s = round(s);
  return s;
}

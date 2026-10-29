import { applyAction, Code, createInitialState, GameAction, GameState, TeamSetup } from './state';

// Test-only helpers for driving the reducer like the app does

// Applies actions in order, bumping `version` like the app does
export function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((s, a) => ({ ...applyAction(s, a), version: s.version + 1 }), state);
}

export const KEYWORDS = [
  ['apple', 'river', 'castle', 'robot'],
  ['piano', 'tiger', 'cloud', 'anchor'],
];

// Different codes each round, so turns can be told apart
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

// Plays the current team's turn: the encryptor's done, the code is revealed, and on to the next turn
export const turn = (s: GameState) => run(s, { type: 'DONE_ENCRYPTING' }, { type: 'REVEAL_CODE' }, { type: 'NEXT' });

// Plays `n` whole rounds: team 0 then team 1
export function rounds(s: GameState, n = 1): GameState {
  for (let i = 0; i < n * 2; i++) s = turn(s);
  return s;
}

import { applyAction, Code, createInitialState, GameAction, GameState, TeamIndex } from './state';

// Test-only helpers for driving the reducer like the app does

// Applies actions in order, bumping `version` like the app does
export function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce((s, a) => ({ ...applyAction(s, a), version: s.version + 1 }), state);
}

export const KEYWORDS = ['apple', 'river', 'castle', 'robot'];

// Different codes each round, so rounds can be told apart
export const CODES: Code[] = [[1, 2, 3], [4, 3, 2], [2, 4, 1], [3, 1, 4], [1, 3, 2], [4, 1, 3], [2, 3, 4], [3, 2, 1]];

export const start = (overrides: Partial<Extract<GameAction, { type: 'START_GAME' }>> = {}) =>
  run(createInitialState(), {
    type: 'START_GAME',
    gameCode: 'ABCD',
    team: 0 as TeamIndex,
    players: [],
    keywords: KEYWORDS,
    codes: CODES,
    ...overrides,
  });

// Reveals this round's code and moves on to the next round
export const round = (s: GameState) => run(s, { type: 'REVEAL_CODE' }, { type: 'NEXT_ROUND' });

export function rounds(s: GameState, n: number): GameState {
  for (let i = 0; i < n; i++) s = round(s);
  return s;
}

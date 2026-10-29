import { describe, expect, it } from 'vitest';
import {
  applyAction,
  createInitialState,
  GameAction,
  GameState,
  getCode,
  getEncryptor,
  isLastTurn,
  MAX_ROUNDS,
  normalizeState,
} from './state';
import { CODES, KEYWORDS, newGame, rounds, run, startGame, TEAMS, turn } from './testHelpers';

describe('starting a game', () => {
  it('a brand-new state is on the setup screen', () => {
    const s = createInitialState();
    expect(s.phase).toBe('SETUP');
    expect(s.teams).toEqual([]);
  });

  it('START_GAME deals the keywords and shows team 0 theirs first', () => {
    const s = startGame();
    expect(s.phase).toBe('KEYWORDS');
    expect(s.activeTeam).toBe(0);
    expect(s.teams.map((t) => t.keywords)).toEqual(KEYWORDS);
    expect(s.round).toBe(1);
  });

  it('trims names and drops blank players', () => {
    const s = startGame([
      { name: '  Red ', players: [' Sam ', '', '  '] },
      { name: 'Blue', players: [] },
    ]);
    expect(s.teams[0].name).toBe('Red');
    expect(s.teams[0].players).toEqual(['Sam']);
  });

  const start = (overrides: Partial<Extract<GameAction, { type: 'START_GAME' }>>) =>
    run(createInitialState(), { type: 'START_GAME', teams: TEAMS, keywords: KEYWORDS, codes: CODES, ...overrides });

  it.each<[string, Partial<Extract<GameAction, { type: 'START_GAME' }>>]>([
    ['only one team', { teams: [TEAMS[0]] }],
    ['a blank team name', { teams: [TEAMS[0], { name: '  ', players: [] }] }],
    ['two teams with the same name', { teams: [TEAMS[0], { name: 'red', players: [] }] }],
    ['three keywords', { keywords: [KEYWORDS[0].slice(0, 3), KEYWORDS[1]] }],
    ['a blank keyword', { keywords: [['a', 'b', 'c', ' '], KEYWORDS[1]] }],
    ['a keyword both teams have', { keywords: [KEYWORDS[0], ['Apple', 'x', 'y', 'z']] }],
    ['too few codes', { codes: [CODES[0].slice(0, MAX_ROUNDS - 1), CODES[1]] }],
    ['an invalid code', { codes: [[[1, 1, 2], ...CODES[0].slice(1)], CODES[1]] }],
  ])('START_GAME with %s is ignored', (_, overrides) => {
    expect(start(overrides).phase).toBe('SETUP');
  });

  it('START_GAME is ignored once a game is under way', () => {
    const s = newGame();
    expect(run(s, { type: 'START_GAME', teams: TEAMS, keywords: KEYWORDS, codes: CODES }).phase).toBe('ENCRYPT');
  });

  it('after both teams have seen their keywords, team 0 encrypts in round 1', () => {
    let s = run(startGame(), { type: 'DONE_KEYWORDS' });
    expect(s.phase).toBe('KEYWORDS');
    expect(s.activeTeam).toBe(1);
    s = run(s, { type: 'DONE_KEYWORDS' });
    expect(s.phase).toBe('ENCRYPT');
    expect(s.activeTeam).toBe(0);
    expect(s.round).toBe(1);
    expect(getCode(s)).toEqual(CODES[0][0]);
  });
});

describe('a turn', () => {
  it('goes ENCRYPT, GUESS, REVEAL', () => {
    let s = newGame();
    s = run(s, { type: 'DONE_ENCRYPTING' });
    expect(s.phase).toBe('GUESS');
    s = run(s, { type: 'REVEAL_CODE' });
    expect(s.phase).toBe('REVEAL');
    expect(getCode(s)).toEqual(CODES[0][0]);
  });

  it('then passes to team 1 in the same round, then team 0 in the next', () => {
    let s = turn(newGame());
    expect([s.phase, s.activeTeam, s.round]).toEqual(['ENCRYPT', 1, 1]);
    expect(getCode(s)).toEqual(CODES[1][0]);
    s = turn(s);
    expect([s.phase, s.activeTeam, s.round]).toEqual(['ENCRYPT', 0, 2]);
    expect(getCode(s)).toEqual(CODES[0][1]);
  });

  it('ignores actions in the wrong phase', () => {
    const encrypting = newGame();
    for (const action of [{ type: 'DONE_KEYWORDS' }, { type: 'REVEAL_CODE' }, { type: 'NEXT' }] satisfies GameAction[]) {
      expect(applyAction(encrypting, action)).toBe(encrypting);
    }
    const guessing = run(encrypting, { type: 'DONE_ENCRYPTING' });
    for (const action of [{ type: 'DONE_ENCRYPTING' }, { type: 'NEXT' }] satisfies GameAction[]) {
      expect(applyAction(guessing, action)).toBe(guessing);
    }
  });
});

describe('encryptors', () => {
  it("rotate through each team's players, round by round", () => {
    let s = newGame([
      { name: 'Red', players: ['Ann', 'Ben', 'Cat'] },
      { name: 'Blue', players: ['Dan', 'Eve'] },
    ]);
    const seen: (string | null)[][] = [];
    for (let i = 0; i < 4; i++) {
      seen.push([getEncryptor(s, 0), getEncryptor(s, 1)]);
      s = rounds(s);
    }
    expect(seen).toEqual([
      ['Ann', 'Dan'],
      ['Ben', 'Eve'],
      ['Cat', 'Dan'],
      ['Ann', 'Eve'],
    ]);
  });

  it('are null without players', () => {
    expect(getEncryptor(newGame(), 0)).toBeNull();
  });
});

describe('the end of the game', () => {
  it('comes after team 1 has played the last round', () => {
    let s = rounds(newGame(), MAX_ROUNDS - 1);
    s = turn(s);
    expect([s.phase, s.activeTeam, s.round]).toEqual(['ENCRYPT', 1, MAX_ROUNDS]);
    expect(isLastTurn(s)).toBe(true);
    s = turn(s);
    expect(s.phase).toBe('GAME_OVER');
    expect(s.round).toBe(MAX_ROUNDS);
  });

  it('can come early, after any turn, since the notepad decides the winner', () => {
    const s = rounds(newGame(), 3);
    expect(run(s, { type: 'END_GAME' }).phase).toBe('GAME_OVER');
    expect(run(startGame(), { type: 'END_GAME' }).phase).toBe('GAME_OVER');
    expect(run(createInitialState(), { type: 'END_GAME' }).phase).toBe('SETUP');
  });

  it("nothing but NEW_GAME works once it's over", () => {
    const s = run(newGame(), { type: 'END_GAME' });
    expect(applyAction(s, { type: 'NEXT' })).toBe(s);
    expect(applyAction(s, { type: 'END_GAME' })).toBe(s);
    const fresh = run(s, { type: 'NEW_GAME' });
    expect(fresh.phase).toBe('SETUP');
    expect(fresh.version).toBe(s.version + 1);
  });
});

describe('saved games', () => {
  it('every phase of a real game loads unchanged', () => {
    const step = (s: GameState): GameState => {
      const next: Record<string, GameAction['type']> = {
        KEYWORDS: 'DONE_KEYWORDS',
        ENCRYPT: 'DONE_ENCRYPTING',
        GUESS: 'REVEAL_CODE',
        REVEAL: 'NEXT',
      };
      return run(s, { type: next[s.phase] } as GameAction);
    };
    const phases = new Set<string>();
    for (let s = startGame(); ; s = step(s)) {
      phases.add(s.phase);
      expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
      if (s.phase === 'GAME_OVER') break;
    }
    expect(phases.size).toBe(5);
  });

  it.each([null, 'nonsense', 42, { phase: 'DANCING' }, { phase: 'ENCRYPT', teams: [] }])(
    'unusable saved data (%j) starts afresh',
    (stored) => {
      expect(normalizeState(stored)).toEqual(createInitialState());
    }
  );

  it.each<[string, () => unknown]>([
    ['missing codes', () => ({ ...newGame(), codes: undefined })],
    ['too few codes', () => ({ ...newGame(), codes: [CODES[0].slice(1), CODES[1]] })],
    ['a team without keywords', () => ({ ...newGame(), teams: [{ name: 'Red', players: [] }, newGame().teams[1]] })],
    ['a round out of range', () => ({ ...newGame(), round: MAX_ROUNDS + 1 })],
    ['a phase from an older version', () => ({ ...newGame(), phase: 'INTERCEPT' })],
  ])('a saved game with %s starts afresh', (_, make) => {
    expect(normalizeState(JSON.parse(JSON.stringify(make()))).phase).toBe('SETUP');
  });

  it('drops fields from an older version', () => {
    const old = { ...newGame(), clues: ['a', 'b', 'c'], transmissions: [] };
    expect(normalizeState(old)).toEqual(newGame());
  });
});

import { describe, expect, it } from 'vitest';
import {
  applyAction,
  Code,
  createInitialState,
  GameAction,
  GameState,
  getClueSheet,
  getCode,
  getEncryptor,
  getResult,
  getScore,
  getTokens,
  isValidCode,
  MAX_ROUNDS,
  normalizeState,
} from './state';
import { CODES, KEYWORDS, newGame, quietRounds, reveal, round, run, startGame, TEAMS, turn, wrong } from './testHelpers';

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

describe('a transmission', () => {
  it('needs 3 clues, none blank', () => {
    const s = newGame();
    expect(run(s, { type: 'SUBMIT_CLUES', clues: ['a', 'b'] }).phase).toBe('ENCRYPT');
    expect(run(s, { type: 'SUBMIT_CLUES', clues: ['a', ' ', 'c'] }).phase).toBe('ENCRYPT');
    expect(run(s, { type: 'SUBMIT_CLUES', clues: [' a ', 'b', 'c'] }).clues).toEqual(['a', 'b', 'c']);
  });

  it('skips interception in round 1', () => {
    const s = run(newGame(), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] });
    expect(s.phase).toBe('DECODE');
    expect(run(s, { type: 'BACK_TO_INTERCEPT' }).phase).toBe('DECODE');
  });

  it('has the other team intercept from round 2', () => {
    const s = run(round(newGame()), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] });
    expect(s.round).toBe(2);
    expect(s.phase).toBe('INTERCEPT');
  });

  it('ignores invalid guesses', () => {
    const s = run(round(newGame()), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] });
    for (const guess of [[1, 2], [1, 1, 2], [0, 1, 2], [1, 2, 5], [1, 2, 3, 4], [1.5, 2, 3]]) {
      expect(run(s, { type: 'SUBMIT_INTERCEPT', guess }).phase).toBe('INTERCEPT');
    }
  });

  it('keeps the intercept guess hidden until the reveal, and it can be redone', () => {
    let s = run(round(newGame()), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] });
    s = run(s, { type: 'SUBMIT_INTERCEPT', guess: [1, 2, 3] });
    expect(s.phase).toBe('DECODE');
    expect(s.interceptGuess).toEqual([1, 2, 3]);
    expect(s.transmissions).toHaveLength(2);
    s = run(s, { type: 'BACK_TO_INTERCEPT' });
    expect(s.phase).toBe('INTERCEPT');
    expect(s.interceptGuess).toBeNull();
  });

  it('saves the transmission at the reveal', () => {
    const s = run(round(newGame()), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] }, { type: 'SUBMIT_INTERCEPT', guess: [1, 2, 3] }, { type: 'SUBMIT_DECODE', guess: [4, 3, 2] });
    expect(s.phase).toBe('REVEAL');
    expect(s.clues).toBeNull();
    expect(s.interceptGuess).toBeNull();
    expect(s.transmissions.at(-1)).toEqual({
      round: 2,
      team: 0,
      encryptor: null,
      code: CODES[0][1],
      clues: ['a', 'b', 'c'],
      interceptGuess: [1, 2, 3],
      decodeGuess: [4, 3, 2],
    });
  });

  it('then passes to team 1 in the same round, then team 0 in the next', () => {
    let s = turn(newGame());
    expect([s.phase, s.activeTeam, s.round]).toEqual(['ENCRYPT', 1, 1]);
    expect(getCode(s)).toEqual(CODES[1][0]);
    s = turn(s);
    expect([s.phase, s.activeTeam, s.round]).toEqual(['ENCRYPT', 0, 2]);
  });

  it('ignores actions in the wrong phase', () => {
    const s = newGame();
    for (const action of [
      { type: 'DONE_KEYWORDS' },
      { type: 'SUBMIT_INTERCEPT', guess: [1, 2, 3] },
      { type: 'SUBMIT_DECODE', guess: [1, 2, 3] },
      { type: 'BACK_TO_INTERCEPT' },
      { type: 'NEXT' },
    ] satisfies GameAction[]) {
      expect(applyAction(s, action)).toBe(s);
    }
    const revealed = reveal(s);
    expect(applyAction(revealed, { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] })).toBe(revealed);
  });
});

describe('tokens', () => {
  it('a correct decode and a missed interception give no tokens', () => {
    const s = round(round(newGame()));
    expect(getTokens(s, 0)).toEqual({ interceptions: 0, miscommunications: 0 });
    expect(getTokens(s, 1)).toEqual({ interceptions: 0, miscommunications: 0 });
  });

  it('a wrong decode gives the encrypting team a miscommunication', () => {
    const s = round(newGame(), { miscommunicated: true });
    expect(getTokens(s, 0)).toEqual({ interceptions: 0, miscommunications: 1 });
    expect(getScore(s, 0)).toBe(-1);
  });

  it('a right interception gives the other team an interception', () => {
    const s = round(round(newGame()), { intercepted: true });
    expect(getTokens(s, 1)).toEqual({ interceptions: 1, miscommunications: 0 });
    expect(getScore(s, 1)).toBe(1);
  });

  it('can give both at once', () => {
    const s = round(round(newGame()), { intercepted: true, miscommunicated: true });
    expect(getTokens(s, 0).miscommunications).toBe(1);
    expect(getTokens(s, 1).interceptions).toBe(1);
  });
});

describe('encryptors', () => {
  it('rotate through each team\'s players, round by round', () => {
    let s = newGame([
      { name: 'Red', players: ['Ann', 'Ben', 'Cat'] },
      { name: 'Blue', players: ['Dan', 'Eve'] },
    ]);
    const seen: (string | null)[][] = [];
    for (let i = 0; i < 4; i++) {
      seen.push([getEncryptor(s, 0), getEncryptor(s, 1)]);
      s = round(s);
    }
    expect(seen).toEqual([
      ['Ann', 'Dan'],
      ['Ben', 'Eve'],
      ['Cat', 'Dan'],
      ['Ann', 'Eve'],
    ]);
    expect(s.transmissions.map((t) => t.encryptor)).toEqual(['Ann', 'Dan', 'Ben', 'Eve', 'Cat', 'Dan', 'Ann', 'Eve']);
  });

  it('are null without players', () => {
    expect(getEncryptor(newGame(), 0)).toBeNull();
  });
});

describe('the clue sheet', () => {
  it('files each clue under the keyword it pointed to', () => {
    let s = turn(newGame(), { clues: ['red', 'flow', 'king'] }); // code 1-2-3
    s = turn(s);
    s = turn(s, { clues: ['tin', 'tower', 'bank'] }); // code 4-3-2
    expect(getClueSheet(s, 0)).toEqual([
      [{ round: 1, clue: 'red' }],
      [
        { round: 1, clue: 'flow' },
        { round: 2, clue: 'bank' },
      ],
      [
        { round: 1, clue: 'king' },
        { round: 2, clue: 'tower' },
      ],
      [{ round: 2, clue: 'tin' }],
    ]);
    expect(getClueSheet(s, 1).flat()).toHaveLength(3);
  });

  it('doesn\'t include a transmission until it\'s revealed', () => {
    const s = run(newGame(), { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] });
    expect(getClueSheet(s, 0).flat()).toEqual([]);
  });
});

describe('the end of the game', () => {
  it('waits for the end of the round', () => {
    // Team 0 gets its second interception on team 1's turn in round 3
    let s = round(round(newGame()), {}, { intercepted: true });
    s = reveal(turn(s), { intercepted: true });
    expect(getTokens(s, 0).interceptions).toBe(2);
    expect(s.phase).toBe('REVEAL');
    expect(getResult(s)).toBeNull();
    s = run(s, { type: 'NEXT' });
    expect(s.phase).toBe('GAME_OVER');
    expect(getResult(s)).toEqual({ winner: 0, reason: 'interceptions' });
  });

  it('does not end on the first team\'s turn, even with a second token', () => {
    let s = round(newGame(), { miscommunicated: true });
    s = turn(s, { miscommunicated: true });
    expect(getTokens(s, 0).miscommunications).toBe(2);
    expect(s.phase).toBe('ENCRYPT');
    expect(s.activeTeam).toBe(1);
  });

  it('2 miscommunications lose', () => {
    const s = round(round(newGame(), { miscommunicated: true }), { miscommunicated: true });
    expect(s.phase).toBe('GAME_OVER');
    expect(getResult(s)).toEqual({ winner: 1, reason: 'miscommunications' });
  });

  it('a team with 2 interceptions and 2 miscommunications goes to the score', () => {
    // Team 1: 2 interceptions, 2 miscommunications (score 0). Team 0: nothing (score 0)
    let s = round(newGame(), {}, { miscommunicated: true });
    s = round(s, { intercepted: true });
    s = round(s, { intercepted: true }, { miscommunicated: true });
    expect(s.phase).toBe('GAME_OVER');
    expect(getResult(s)).toEqual({ winner: null, reason: 'draw' });
  });

  it('both teams reaching an end in the same round goes to the score', () => {
    // Team 0 gets 2 interceptions (score 2); team 1 gets 2 interceptions and 1 miscommunication (score 1)
    let s = round(round(newGame()), { intercepted: true }, { intercepted: true });
    s = round(s, { intercepted: true }, { intercepted: true, miscommunicated: true });
    expect(s.phase).toBe('GAME_OVER');
    expect(getScore(s, 0)).toBe(2);
    expect(getScore(s, 1)).toBe(1);
    expect(getResult(s)).toEqual({ winner: 0, reason: 'score' });
  });

  it('a tie on score is a draw', () => {
    let s = round(round(newGame()), { intercepted: true }, { intercepted: true });
    s = round(s, { intercepted: true }, { intercepted: true });
    expect(getResult(s)).toEqual({ winner: null, reason: 'draw' });
  });

  it('after the last round with nobody out, the higher score wins', () => {
    let s = round(round(newGame()), { intercepted: true });
    s = quietRounds(s, MAX_ROUNDS - 3);
    expect(s.round).toBe(MAX_ROUNDS);
    expect(s.phase).toBe('ENCRYPT');
    s = round(s);
    expect(s.phase).toBe('GAME_OVER');
    expect(s.round).toBe(MAX_ROUNDS);
    expect(getResult(s)).toEqual({ winner: 1, reason: 'score' });
  });

  it('after the last round, a tie is a draw', () => {
    const s = quietRounds(newGame(), MAX_ROUNDS);
    expect(s.phase).toBe('GAME_OVER');
    expect(getResult(s)).toEqual({ winner: null, reason: 'draw' });
    expect(s.transmissions).toHaveLength(MAX_ROUNDS * 2);
  });

  it('nothing but NEW_GAME works once it\'s over', () => {
    const s = quietRounds(newGame(), MAX_ROUNDS);
    expect(applyAction(s, { type: 'NEXT' })).toBe(s);
    const fresh = run(s, { type: 'NEW_GAME' });
    expect(fresh.phase).toBe('SETUP');
    expect(fresh.transmissions).toEqual([]);
    expect(fresh.version).toBe(s.version + 1);
  });
});

describe('saved games', () => {
  it('a game survives being saved and loaded', () => {
    const s = round(round(newGame()), { intercepted: true });
    expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it.each([null, 'nonsense', 42, { phase: 'DANCING' }, { phase: 'ENCRYPT', teams: [] }])(
    'unusable saved data (%j) starts afresh',
    (stored) => {
      expect(normalizeState(stored)).toEqual(createInitialState());
    }
  );

  it('fills in missing fields', () => {
    const { transmissions: _, ...partial } = newGame();
    expect(normalizeState(partial).transmissions).toEqual([]);
  });
});

// Plays many random games, making legal and illegal moves, and checks the rules always hold
describe('random games', () => {
  const randomCode = (rand: () => number): Code => {
    const digits = [1, 2, 3, 4].sort(() => rand() - 0.5);
    return digits.slice(0, 3);
  };

  // A small seeded generator, so a failure can be reproduced
  const seeded = (seed: number) => () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };

  it('always end within the last round, with the tokens matching the result', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const rand = seeded(seed);
      let s: GameState = newGame();
      for (let step = 0; step < 5000 && s.phase !== 'GAME_OVER'; step++) {
        const guess = rand() < 0.4 ? getCode(s)! : rand() < 0.5 ? wrong(getCode(s)!) : randomCode(rand);
        const actions: GameAction[] = [
          { type: 'SUBMIT_CLUES', clues: ['a', 'b', 'c'] },
          { type: 'SUBMIT_INTERCEPT', guess },
          { type: 'SUBMIT_DECODE', guess },
          { type: 'BACK_TO_INTERCEPT' },
          { type: 'NEXT' },
          { type: 'DONE_KEYWORDS' },
        ];
        s = run(s, actions[Math.floor(rand() * actions.length)]);
        expect(s.round).toBeLessThanOrEqual(MAX_ROUNDS);
        expect(s.transmissions.every((t) => isValidCode(t.code) && t.clues.length === 3)).toBe(true);
      }
      expect(s.phase).toBe('GAME_OVER');
      const result = getResult(s)!;
      const [a, b] = [getTokens(s, 0), getTokens(s, 1)];
      if (result.reason === 'interceptions') expect(getTokens(s, result.winner).interceptions).toBeGreaterThanOrEqual(2);
      if (result.reason === 'miscommunications') {
        expect(getTokens(s, result.winner === 0 ? 1 : 0).miscommunications).toBeGreaterThanOrEqual(2);
      }
      if (s.round < MAX_ROUNDS) {
        expect(Math.max(a.interceptions, a.miscommunications, b.interceptions, b.miscommunications)).toBeGreaterThanOrEqual(2);
      }
      // Every finished round has exactly one transmission per team
      expect(s.transmissions).toHaveLength(s.round * 2);
    }
  });
});

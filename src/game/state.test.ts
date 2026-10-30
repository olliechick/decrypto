import { describe, expect, it } from 'vitest';
import { applyAction, createInitialState, getCode, getCodeKeywords, getEncryptor, MAX_ROUNDS, normalizeState } from './state';
import { CODES, KEYWORDS, round, rounds, run, start } from './testHelpers';

describe('starting a game', () => {
  it('a brand-new state is on the setup screen', () => {
    expect(createInitialState().phase).toBe('SETUP');
  });

  it("START_GAME puts this team's keywords on show for round 1, with the code hidden (and each player once)", () => {
    const s = start({ team: 1, players: [' Sam ', '', 'Jo', 'sam'] });
    expect(s.phase).toBe('PLAYING');
    expect(s.team).toBe(1);
    expect(s.keywords).toEqual(KEYWORDS);
    expect(s.players).toEqual(['Sam', 'Jo']);
    expect(s.round).toBe(1);
    expect(s.revealed).toBe(false);
    expect(getCode(s)).toEqual(CODES[0]);
  });

  it.each<[string, Parameters<typeof start>[0]]>([
    ['no game code', { gameCode: '' }],
    ['three keywords', { keywords: KEYWORDS.slice(0, 3) }],
    ['a blank keyword', { keywords: ['a', 'b', 'c', ' '] }],
    ['the same keyword twice', { keywords: ['a', 'b', 'c', 'A'] }],
    ['too few codes', { codes: CODES.slice(1) }],
    ['an invalid code', { codes: [[1, 1, 2], ...CODES.slice(1)] }],
  ])('START_GAME with %s is ignored', (_, overrides) => {
    expect(start(overrides).phase).toBe('SETUP');
  });

  it('START_GAME can rejoin a game at a later round, with that round\'s code and encryptor', () => {
    const s = start({ players: ['Ann', 'Ben'], round: 4 });
    expect(s.round).toBe(4);
    expect(s.revealed).toBe(false);
    expect(getCode(s)).toEqual(CODES[3]);
    expect(getEncryptor(s)).toBe('Ben');
  });

  it.each([0, MAX_ROUNDS + 1, 2.5])('START_GAME at round %s is ignored', (r) => {
    expect(start({ round: r }).phase).toBe('SETUP');
  });

  it('START_GAME is ignored once a game is under way', () => {
    const s = start();
    expect(applyAction(s, { type: 'START_GAME', gameCode: 'ZZZZ', team: 1, players: [], keywords: ['w', 'x', 'y', 'z'], codes: CODES })).toBe(s);
  });
});

describe('rounds', () => {
  it('reveal the code, then move on to the next round with a new, hidden code', () => {
    let s = run(start(), { type: 'REVEAL_CODE' });
    expect(s.revealed).toBe(true);
    s = run(s, { type: 'NEXT_ROUND' });
    expect(s.round).toBe(2);
    expect(s.revealed).toBe(false);
    expect(getCode(s)).toEqual(CODES[1]);
  });

  it("give the encryptor this round's keywords in the code's order", () => {
    // KEYWORDS: 1 apple, 2 river, 3 castle, 4 robot; CODES[1] is 4-3-2
    expect(getCodeKeywords(start())).toEqual(['apple', 'river', 'castle']);
    expect(getCodeKeywords(round(start()))).toEqual(['robot', 'castle', 'river']);
    expect(getCodeKeywords(createInitialState())).toEqual([]);
  });

  it("can't move on before the code is revealed, so a stray tap can't skip a code", () => {
    const s = start();
    expect(applyAction(s, { type: 'NEXT_ROUND' })).toBe(s);
  });

  it('a reveal tapped too early can be hidden again', () => {
    const s = run(start(), { type: 'REVEAL_CODE' }, { type: 'HIDE_CODE' });
    expect(s.revealed).toBe(false);
    expect(s.round).toBe(1);
  });

  it('end after the last round', () => {
    let s = rounds(start(), MAX_ROUNDS - 1);
    expect(s.round).toBe(MAX_ROUNDS);
    expect(getCode(s)).toEqual(CODES[MAX_ROUNDS - 1]);
    s = round(s);
    expect(s.phase).toBe('GAME_OVER');
    expect(s.round).toBe(MAX_ROUNDS);
  });
});

describe('encryptors', () => {
  it("rotate through the team's players, round by round", () => {
    let s = start({ players: ['Ann', 'Ben', 'Cat'] });
    const seen: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      seen.push(getEncryptor(s));
      s = round(s);
    }
    expect(seen).toEqual(['Ann', 'Ben', 'Cat', 'Ann']);
  });

  it('are null without players', () => {
    expect(getEncryptor(start())).toBeNull();
  });
});

describe('the end of the game', () => {
  it('can come early, since the notepad decides the winner', () => {
    const s = run(rounds(start(), 3), { type: 'END_GAME' });
    expect(s.phase).toBe('GAME_OVER');
    expect(s.endedEarly).toBe(true);
    expect(run(rounds(start(), MAX_ROUNDS - 1), { type: 'END_GAME' }).endedEarly).toBe(true);
    expect(rounds(start(), MAX_ROUNDS).endedEarly).toBe(false);
    expect(run(createInitialState(), { type: 'END_GAME' }).phase).toBe('SETUP');
  });

  it('a game ended by mistake can carry on where it was', () => {
    const before = run(rounds(start(), 3), { type: 'REVEAL_CODE' });
    const s = run(before, { type: 'END_GAME' }, { type: 'RESUME_GAME' });
    expect(s.phase).toBe('PLAYING');
    expect(s.round).toBe(4);
    expect(s.revealed).toBe(true);
    expect(s.endedEarly).toBe(false);
    expect(applyAction(before, { type: 'RESUME_GAME' })).toBe(before);
    expect(applyAction(createInitialState(), { type: 'RESUME_GAME' }).phase).toBe('SETUP');
  });

  it("nothing but NEW_GAME and RESUME_GAME works once it's over", () => {
    const s = run(start(), { type: 'END_GAME' });
    for (const type of ['REVEAL_CODE', 'HIDE_CODE', 'NEXT_ROUND', 'END_GAME'] as const) {
      expect(applyAction(s, { type })).toBe(s);
    }
    const fresh = run(s, { type: 'NEW_GAME' });
    expect(fresh.phase).toBe('SETUP');
    expect(fresh.keywords).toEqual([]);
    expect(fresh.version).toBe(s.version + 1);
  });
});

describe('saved games', () => {
  it('a game at every stage loads unchanged', () => {
    let s = start({ players: ['Ann'] });
    for (let i = 0; i < MAX_ROUNDS; i++) {
      expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
      s = run(s, { type: 'REVEAL_CODE' });
      expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
      s = run(s, { type: 'NEXT_ROUND' });
    }
    expect(s.phase).toBe('GAME_OVER');
    expect(normalizeState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });

  it('a game over saved before endedEarly was kept says whether it ended early', () => {
    const { endedEarly: _, ...old } = run(rounds(start(), 2), { type: 'END_GAME' });
    expect(normalizeState(JSON.parse(JSON.stringify(old))).endedEarly).toBe(true);
    const { endedEarly: __, ...finished } = rounds(start(), MAX_ROUNDS);
    expect(normalizeState(JSON.parse(JSON.stringify(finished))).endedEarly).toBe(false);
  });

  it.each([null, 'nonsense', 42, { phase: 'DANCING' }, { phase: 'PLAYING' }])(
    'unusable saved data (%j) starts afresh',
    (stored) => {
      expect(normalizeState(stored)).toEqual(createInitialState());
    }
  );

  it.each<[string, () => unknown]>([
    ['missing codes', () => ({ ...start(), codes: undefined })],
    ['too few codes', () => ({ ...start(), codes: CODES.slice(1) })],
    ['three keywords', () => ({ ...start(), keywords: KEYWORDS.slice(1) })],
    ['no game code', () => ({ ...start(), gameCode: '' })],
    ['a round out of range', () => ({ ...start(), round: MAX_ROUNDS + 1 })],
    ['a phase from the one-phone version', () => ({ ...start(), phase: 'ENCRYPT' })],
  ])('a saved game with %s starts afresh', (_, make) => {
    expect(normalizeState(JSON.parse(JSON.stringify(make()))).phase).toBe('SETUP');
  });
});

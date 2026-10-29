// The rules of Decrypto as a pure reducer. Everything random (keywords, codes) is drawn by the caller and passed in,
// so the reducer never needs randomness and tests can pick their own.

export const KEYWORD_COUNT = 4; // keywords per team, numbered 1-4
export const CODE_LENGTH = 3; // digits in a code, all different, each 1-4
export const MAX_ROUNDS = 8; // after this, the game is decided on score
export const TOKENS_TO_END = 2; // 2 interceptions wins, 2 miscommunications loses

export type TeamIndex = 0 | 1;
export type Code = number[]; // CODE_LENGTH different digits from 1 to KEYWORD_COUNT

export interface Team {
  name: string;
  players: string[]; // optional; when given, the encryptor rotates through them in order
  keywords: string[]; // KEYWORD_COUNT words, keyword n is keywords[n - 1]
}

// One team's turn as encryptor in one round, saved once both guesses are in
export interface Transmission {
  round: number;
  team: TeamIndex; // the encrypting team
  encryptor: string | null;
  code: Code;
  clues: string[]; // clue i points to keyword code[i]
  interceptGuess: Code | null; // the other team's guess; null in round 1, when there's no interception
  decodeGuess: Code; // the encrypting team's own guess
}

// SETUP: teams are being entered; nothing is drawn yet
// KEYWORDS: `activeTeam` is privately looking at its keywords (team 0, then team 1)
// ENCRYPT: `activeTeam`'s encryptor privately sees the code and types the clues
// INTERCEPT: the clues are public; the other team enters its guess (never in round 1)
// DECODE: the encrypting team enters its guess
// REVEAL: the code and both guesses are shown; the last transmission is the one revealed
// GAME_OVER: see getResult
export type Phase = 'SETUP' | 'KEYWORDS' | 'ENCRYPT' | 'INTERCEPT' | 'DECODE' | 'REVEAL' | 'GAME_OVER';

// Saved in localStorage
export interface GameState {
  phase: Phase;
  teams: Team[]; // exactly 2 once the game has started
  codes: Code[][]; // codes[team][round - 1], drawn up front for every round
  round: number; // 1 to MAX_ROUNDS
  activeTeam: TeamIndex; // in KEYWORDS the team looking; otherwise the encrypting team
  clues: string[] | null; // the clues for the transmission in progress
  interceptGuess: Code | null; // locked in for the transmission in progress, but not shown until the reveal
  transmissions: Transmission[];
  version: number;
}

export interface TeamSetup {
  name: string;
  players: string[];
}

export type GameAction =
  | { type: 'START_GAME'; teams: TeamSetup[]; keywords: string[][]; codes: Code[][] }
  | { type: 'DONE_KEYWORDS' }
  | { type: 'SUBMIT_CLUES'; clues: string[] }
  | { type: 'SUBMIT_INTERCEPT'; guess: Code }
  | { type: 'SUBMIT_DECODE'; guess: Code }
  | { type: 'BACK_TO_INTERCEPT' }
  | { type: 'NEXT' }
  | { type: 'NEW_GAME' };

export type Result =
  | { winner: TeamIndex; reason: 'interceptions' | 'miscommunications' | 'score' }
  | { winner: null; reason: 'draw' };

export function createInitialState(): GameState {
  return {
    phase: 'SETUP',
    teams: [],
    codes: [[], []],
    round: 1,
    activeTeam: 0,
    clues: null,
    interceptGuess: null,
    transmissions: [],
    version: 0,
  };
}

const PHASES: Phase[] = ['SETUP', 'KEYWORDS', 'ENCRYPT', 'INTERCEPT', 'DECODE', 'REVEAL', 'GAME_OVER'];

// Repairs a saved game: anything unusable starts a fresh game rather than crashing
export function normalizeState(stored: unknown): GameState {
  const defaults = createInitialState();
  if (!stored || typeof stored !== 'object') return defaults;
  const s = { ...defaults, ...(stored as Partial<GameState>) };
  if (!PHASES.includes(s.phase)) return defaults;
  const state: GameState = {
    ...s,
    teams: Array.isArray(s.teams) ? s.teams : [],
    codes: Array.isArray(s.codes) ? s.codes : [[], []],
    transmissions: Array.isArray(s.transmissions) ? s.transmissions : [],
  };
  return state.phase === 'SETUP' || isPlayable(state) ? state : defaults;
}

// Whether a saved game in progress has everything the screens rely on
function isPlayable(s: GameState): boolean {
  const teamsOk =
    s.teams.length === 2 &&
    s.teams.every((t) => typeof t?.name === 'string' && Array.isArray(t.players) && t.keywords?.length === KEYWORD_COUNT);
  const codesOk = s.codes.length === 2 && s.codes.every((c) => Array.isArray(c) && c.length === MAX_ROUNDS && c.every(isValidCode));
  const roundOk = Number.isInteger(s.round) && s.round >= 1 && s.round <= MAX_ROUNDS && (s.activeTeam === 0 || s.activeTeam === 1);
  const guessing = s.phase === 'INTERCEPT' || s.phase === 'DECODE';
  const cluesOk = !guessing || (Array.isArray(s.clues) && s.clues.length === CODE_LENGTH);
  const revealOk = s.phase !== 'REVEAL' || s.transmissions.length > 0;
  return teamsOk && codesOk && roundOk && cluesOk && revealOk;
}

export const otherTeam = (team: TeamIndex): TeamIndex => (team === 0 ? 1 : 0);

export function isValidCode(code: unknown): code is Code {
  return (
    Array.isArray(code) &&
    code.length === CODE_LENGTH &&
    code.every((d) => Number.isInteger(d) && d >= 1 && d <= KEYWORD_COUNT) &&
    new Set(code).size === CODE_LENGTH
  );
}

export const codesEqual = (a: Code, b: Code) => a.length === b.length && a.every((d, i) => d === b[i]);

export const wasIntercepted = (t: Transmission) => t.interceptGuess !== null && codesEqual(t.interceptGuess, t.code);
export const wasMiscommunicated = (t: Transmission) => !codesEqual(t.decodeGuess, t.code);

// The player encrypting for `team` this round, or null if no players were entered
export function getEncryptor(state: GameState, team: TeamIndex, round = state.round): string | null {
  const players = state.teams[team]?.players ?? [];
  return players.length ? players[(round - 1) % players.length] : null;
}

// The code `team`'s encryptor has this round
export const getCode = (state: GameState, team: TeamIndex = state.activeTeam): Code | null =>
  state.codes[team]?.[state.round - 1] ?? null;

// Tokens are never stored; they're counted from the transmissions so they can't disagree with them
export function getTokens(state: GameState, team: TeamIndex) {
  const interceptions = state.transmissions.filter((t) => t.team !== team && wasIntercepted(t)).length;
  const miscommunications = state.transmissions.filter((t) => t.team === team && wasMiscommunicated(t)).length;
  return { interceptions, miscommunications };
}

export function getScore(state: GameState, team: TeamIndex) {
  const { interceptions, miscommunications } = getTokens(state, team);
  return interceptions - miscommunications;
}

// The public clue sheet for `team`: one column per keyword, with every clue given for it so far
export function getClueSheet(state: GameState, team: TeamIndex): { round: number; clue: string }[][] {
  const columns: { round: number; clue: string }[][] = Array.from({ length: KEYWORD_COUNT }, () => []);
  for (const t of state.transmissions) {
    if (t.team !== team) continue;
    t.code.forEach((digit, i) => columns[digit - 1].push({ round: t.round, clue: t.clues[i] }));
  }
  return columns;
}

// Whether the game ends with the round that's just finished, and how. Only meaningful once both teams have had
// their turn in the round.
export function getRoundEndResult(state: GameState): Result | null {
  const [a, b] = [getTokens(state, 0), getTokens(state, 1)];
  const wins = [
    a.interceptions >= TOKENS_TO_END || b.miscommunications >= TOKENS_TO_END,
    b.interceptions >= TOKENS_TO_END || a.miscommunications >= TOKENS_TO_END,
  ];
  if (wins[0] !== wins[1]) {
    const winner: TeamIndex = wins[0] ? 0 : 1;
    const won = getTokens(state, winner).interceptions >= TOKENS_TO_END;
    return { winner, reason: won ? 'interceptions' : 'miscommunications' };
  }
  // Both teams hit an end condition at once, or the last round is over: the higher score wins
  if (wins[0] || state.round >= MAX_ROUNDS) {
    const diff = getScore(state, 0) - getScore(state, 1);
    if (diff === 0) return { winner: null, reason: 'draw' };
    return { winner: diff > 0 ? 0 : 1, reason: 'score' };
  }
  return null;
}

// The final result, once the game is over
export const getResult = (state: GameState): Result | null =>
  state.phase === 'GAME_OVER' ? getRoundEndResult(state) : null;

const cleanWords = (words: string[]) => words.map((w) => w.trim());

function startEncrypting(state: GameState, team: TeamIndex, round: number): GameState {
  return { ...state, phase: 'ENCRYPT', activeTeam: team, round, clues: null, interceptGuess: null };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'SETUP') return state;
      const { teams, keywords, codes } = action;
      if (teams.length !== 2 || keywords.length !== 2 || codes.length !== 2) return state;
      const names = teams.map((t) => t.name.trim());
      if (names.some((n) => !n) || names[0].toLowerCase() === names[1].toLowerCase()) return state;
      const allKeywords = keywords.flatMap(cleanWords);
      if (keywords.some((k) => k.length !== KEYWORD_COUNT) || allKeywords.some((w) => !w)) return state;
      if (new Set(allKeywords.map((w) => w.toLowerCase())).size !== allKeywords.length) return state;
      if (codes.some((c) => c.length < MAX_ROUNDS || !c.every(isValidCode))) return state;
      return {
        ...createInitialState(),
        phase: 'KEYWORDS',
        teams: teams.map((t, i) => ({
          name: names[i],
          players: cleanWords(t.players).filter(Boolean),
          keywords: cleanWords(keywords[i]),
        })),
        codes: codes.map((c) => c.slice(0, MAX_ROUNDS)),
        version: state.version,
      };
    }

    case 'DONE_KEYWORDS':
      if (state.phase !== 'KEYWORDS') return state;
      // Both teams have seen their keywords: team 0 encrypts first
      if (state.activeTeam === 1) return startEncrypting(state, 0, 1);
      return { ...state, activeTeam: 1 };

    case 'SUBMIT_CLUES': {
      if (state.phase !== 'ENCRYPT') return state;
      const clues = cleanWords(action.clues);
      if (clues.length !== CODE_LENGTH || clues.some((c) => !c)) return state;
      // No interception in round 1: there are no earlier clues to go on
      return { ...state, phase: state.round === 1 ? 'DECODE' : 'INTERCEPT', clues };
    }

    case 'SUBMIT_INTERCEPT':
      if (state.phase !== 'INTERCEPT' || !isValidCode(action.guess)) return state;
      return { ...state, phase: 'DECODE', interceptGuess: [...action.guess] };

    case 'BACK_TO_INTERCEPT':
      // Lets the intercepting team fix its guess before the reveal
      if (state.phase !== 'DECODE' || state.round === 1) return state;
      return { ...state, phase: 'INTERCEPT', interceptGuess: null };

    case 'SUBMIT_DECODE': {
      const code = getCode(state);
      if (state.phase !== 'DECODE' || !isValidCode(action.guess) || !code || !state.clues) return state;
      const transmission: Transmission = {
        round: state.round,
        team: state.activeTeam,
        encryptor: getEncryptor(state, state.activeTeam),
        code,
        clues: state.clues,
        interceptGuess: state.interceptGuess,
        decodeGuess: [...action.guess],
      };
      return {
        ...state,
        phase: 'REVEAL',
        clues: null,
        interceptGuess: null,
        transmissions: [...state.transmissions, transmission],
      };
    }

    case 'NEXT':
      if (state.phase !== 'REVEAL') return state;
      if (state.activeTeam === 0) return startEncrypting(state, 1, state.round);
      // Both teams have had their turn: the round is over
      if (getRoundEndResult(state)) return { ...state, phase: 'GAME_OVER' };
      return startEncrypting(state, 0, state.round + 1);

    case 'NEW_GAME':
      return { ...createInitialState(), version: state.version };
  }
}

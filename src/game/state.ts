// The game as a pure reducer. The app only deals the keywords and shows the codes: clues, guesses and tokens go on
// the printed notepad. Everything random (keywords, codes) is drawn by the caller and passed in, so the reducer never
// needs randomness and tests can pick their own.

export const KEYWORD_COUNT = 4; // keywords per team, numbered 1-4
export const CODE_LENGTH = 3; // digits in a code, all different, each 1-4
export const MAX_ROUNDS = 8; // the most rounds a game can have

export type TeamIndex = 0 | 1;
export type Code = number[]; // CODE_LENGTH different digits from 1 to KEYWORD_COUNT

export interface Team {
  name: string;
  players: string[]; // optional; when given, the encryptor rotates through them in order
  keywords: string[]; // KEYWORD_COUNT words, keyword n is keywords[n - 1]
}

// SETUP: teams are being entered; nothing is drawn yet
// KEYWORDS: `activeTeam` is privately looking at its keywords (team 0, then team 1)
// ENCRYPT: `activeTeam`'s encryptor privately sees the code and gives the clues
// GUESS: the teams write down the clues and their guesses on the notepad; the code stays hidden
// REVEAL: the code is shown to everyone
// GAME_OVER: after the last round, or ended early (the notepad says who won); every keyword is shown
export type Phase = 'SETUP' | 'KEYWORDS' | 'ENCRYPT' | 'GUESS' | 'REVEAL' | 'GAME_OVER';

// Saved in localStorage
export interface GameState {
  phase: Phase;
  teams: Team[]; // exactly 2 once the game has started
  codes: Code[][]; // codes[team][round - 1], drawn up front for every round
  round: number; // 1 to MAX_ROUNDS
  activeTeam: TeamIndex; // in KEYWORDS the team looking; otherwise the encrypting team
  version: number;
}

export interface TeamSetup {
  name: string;
  players: string[];
}

export type GameAction =
  | { type: 'START_GAME'; teams: TeamSetup[]; keywords: string[][]; codes: Code[][] }
  | { type: 'DONE_KEYWORDS' }
  | { type: 'DONE_ENCRYPTING' }
  | { type: 'REVEAL_CODE' }
  | { type: 'NEXT' }
  | { type: 'END_GAME' }
  | { type: 'NEW_GAME' };

export function createInitialState(): GameState {
  return {
    phase: 'SETUP',
    teams: [],
    codes: [[], []],
    round: 1,
    activeTeam: 0,
    version: 0,
  };
}

const PHASES: Phase[] = ['SETUP', 'KEYWORDS', 'ENCRYPT', 'GUESS', 'REVEAL', 'GAME_OVER'];

// Repairs a saved game: anything unusable starts a fresh game rather than crashing
export function normalizeState(stored: unknown): GameState {
  const defaults = createInitialState();
  if (!stored || typeof stored !== 'object') return defaults;
  const s = { ...defaults, ...(stored as Partial<GameState>) };
  if (!PHASES.includes(s.phase)) return defaults;
  const state: GameState = {
    phase: s.phase,
    teams: Array.isArray(s.teams) ? s.teams : [],
    codes: Array.isArray(s.codes) ? s.codes : [[], []],
    round: s.round,
    activeTeam: s.activeTeam,
    version: typeof s.version === 'number' ? s.version : 0,
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
  return teamsOk && codesOk && roundOk;
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

// The player encrypting for `team` this round, or null if no players were entered
export function getEncryptor(state: GameState, team: TeamIndex, round = state.round): string | null {
  const players = state.teams[team]?.players ?? [];
  return players.length ? players[(round - 1) % players.length] : null;
}

// The code `team`'s encryptor has this round
export const getCode = (state: GameState, team: TeamIndex = state.activeTeam): Code | null =>
  state.codes[team]?.[state.round - 1] ?? null;

// Whether this is the last turn of the game: team 1's turn in the last round
export const isLastTurn = (state: GameState) => state.round === MAX_ROUNDS && state.activeTeam === 1;

const cleanWords = (words: string[]) => words.map((w) => w.trim());

const IN_PLAY: Phase[] = ['KEYWORDS', 'ENCRYPT', 'GUESS', 'REVEAL'];

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
      if (state.activeTeam === 1) return { ...state, phase: 'ENCRYPT', activeTeam: 0, round: 1 };
      return { ...state, activeTeam: 1 };

    case 'DONE_ENCRYPTING':
      if (state.phase !== 'ENCRYPT') return state;
      return { ...state, phase: 'GUESS' };

    case 'REVEAL_CODE':
      if (state.phase !== 'GUESS') return state;
      return { ...state, phase: 'REVEAL' };

    case 'NEXT':
      if (state.phase !== 'REVEAL') return state;
      if (isLastTurn(state)) return { ...state, phase: 'GAME_OVER' };
      if (state.activeTeam === 0) return { ...state, phase: 'ENCRYPT', activeTeam: 1 };
      return { ...state, phase: 'ENCRYPT', activeTeam: 0, round: state.round + 1 };

    case 'END_GAME':
      // The notepad decides the winner, so the game can end after any turn
      if (!IN_PLAY.includes(state.phase)) return state;
      return { ...state, phase: 'GAME_OVER' };

    case 'NEW_GAME':
      return { ...createInitialState(), version: state.version };
  }
}

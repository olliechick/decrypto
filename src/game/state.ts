// One team's phone, as a pure reducer. Each team has its own phone propped up showing its keywords; the encryptor
// taps to see each round's code. Clues, guesses and tokens go on the printed notepad. The phones never talk to each
// other: both deal from the same game code (see random.ts), so they agree on the keywords without syncing.

export const KEYWORD_COUNT = 4; // keywords per team, numbered 1-4
export const CODE_LENGTH = 3; // digits in a code, all different, each 1-4
export const MAX_ROUNDS = 8; // the most rounds a game can have

export type TeamIndex = 0 | 1;
export type Code = number[]; // CODE_LENGTH different digits from 1 to KEYWORD_COUNT

// SETUP: starting a game or joining one with the other phone's game code
// PLAYING: the keywords are on show; the encryptor can look at this round's code, then reveal it to everyone
// GAME_OVER: after the last round, or ended early (the notepad says who won)
export type Phase = 'SETUP' | 'PLAYING' | 'GAME_OVER';

// Saved in localStorage
export interface GameState {
  phase: Phase;
  gameCode: string; // shared by both phones
  team: TeamIndex; // which team this phone is: the phone that started the game is team 0, the one that joined is team 1
  players: string[]; // this team's players, optional; when given, the encryptor rotates through them in order
  keywords: string[]; // KEYWORD_COUNT words, keyword n is keywords[n - 1]
  codes: Code[]; // this team's code for each round, codes[round - 1]
  round: number; // 1 to MAX_ROUNDS
  revealed: boolean; // this round's code has been shown to everyone, after the guesses
  version: number;
}

export type GameAction =
  | { type: 'START_GAME'; gameCode: string; team: TeamIndex; players: string[]; keywords: string[]; codes: Code[] }
  | { type: 'REVEAL_CODE' }
  | { type: 'HIDE_CODE' }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'NEW_GAME' };

export function createInitialState(): GameState {
  return {
    phase: 'SETUP',
    gameCode: '',
    team: 0,
    players: [],
    keywords: [],
    codes: [],
    round: 1,
    revealed: false,
    version: 0,
  };
}

const PHASES: Phase[] = ['SETUP', 'PLAYING', 'GAME_OVER'];

// Repairs a saved game: anything unusable (including a game saved by an older version) starts afresh
export function normalizeState(stored: unknown): GameState {
  const defaults = createInitialState();
  if (!stored || typeof stored !== 'object') return defaults;
  const s = { ...defaults, ...(stored as Partial<GameState>) };
  if (!PHASES.includes(s.phase)) return defaults;
  const state: GameState = {
    phase: s.phase,
    gameCode: typeof s.gameCode === 'string' ? s.gameCode : '',
    team: s.team,
    players: Array.isArray(s.players) ? s.players : [],
    keywords: Array.isArray(s.keywords) ? s.keywords : [],
    codes: Array.isArray(s.codes) ? s.codes : [],
    round: s.round,
    revealed: s.revealed === true,
    version: typeof s.version === 'number' ? s.version : 0,
  };
  return state.phase === 'SETUP' || isPlayable(state) ? state : defaults;
}

// Whether a saved game in progress has everything the screens rely on
function isPlayable(s: GameState): boolean {
  return (
    Boolean(s.gameCode) &&
    (s.team === 0 || s.team === 1) &&
    s.keywords.length === KEYWORD_COUNT &&
    s.keywords.every((w) => typeof w === 'string' && w) &&
    s.codes.length === MAX_ROUNDS &&
    s.codes.every(isValidCode) &&
    Number.isInteger(s.round) &&
    s.round >= 1 &&
    s.round <= MAX_ROUNDS
  );
}

export function isValidCode(code: unknown): code is Code {
  return (
    Array.isArray(code) &&
    code.length === CODE_LENGTH &&
    code.every((d) => Number.isInteger(d) && d >= 1 && d <= KEYWORD_COUNT) &&
    new Set(code).size === CODE_LENGTH
  );
}

// This team's encryptor for the round, or null if no players were entered
export function getEncryptor(state: GameState, round = state.round): string | null {
  return state.players.length ? state.players[(round - 1) % state.players.length] : null;
}

// This round's code
export const getCode = (state: GameState): Code | null => state.codes[state.round - 1] ?? null;

// The keyword for each digit of this round's code, in the code's order, for the encryptor to write clues for
export const getCodeKeywords = (state: GameState): string[] => (getCode(state) ?? []).map((d) => state.keywords[d - 1]);

export const isLastRound = (state: GameState) => state.round === MAX_ROUNDS;

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'SETUP') return state;
      const keywords = action.keywords.map((w) => w.trim());
      if (!action.gameCode || (action.team !== 0 && action.team !== 1)) return state;
      if (keywords.length !== KEYWORD_COUNT || keywords.some((w) => !w)) return state;
      if (new Set(keywords.map((w) => w.toLowerCase())).size !== KEYWORD_COUNT) return state;
      if (action.codes.length < MAX_ROUNDS || !action.codes.every(isValidCode)) return state;
      return {
        ...createInitialState(),
        phase: 'PLAYING',
        gameCode: action.gameCode,
        team: action.team,
        players: action.players.map((p) => p.trim()).filter(Boolean),
        keywords,
        codes: action.codes.slice(0, MAX_ROUNDS),
        version: state.version,
      };
    }

    case 'REVEAL_CODE':
      if (state.phase !== 'PLAYING') return state;
      return { ...state, revealed: true };

    case 'HIDE_CODE':
      // Undoes a reveal tapped too early, before the round moves on
      if (state.phase !== 'PLAYING') return state;
      return { ...state, revealed: false };

    case 'NEXT_ROUND':
      // Only once the code has been revealed, so a stray tap can't skip a round's code
      if (state.phase !== 'PLAYING' || !state.revealed) return state;
      if (isLastRound(state)) return { ...state, phase: 'GAME_OVER' };
      return { ...state, round: state.round + 1, revealed: false };

    case 'END_GAME':
      // The notepad decides the winner, so the game can end at any point
      if (state.phase !== 'PLAYING') return state;
      return { ...state, phase: 'GAME_OVER' };

    case 'NEW_GAME':
      return { ...createInitialState(), version: state.version };
  }
}

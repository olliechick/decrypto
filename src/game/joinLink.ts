import { cleanGameCode, isValidGameCode } from './random';

// The other team's phone joins by scanning a QR code of this link with its camera, which opens the app with the game
// code filled in. Typing the code works too.
const JOIN_PARAM = 'join';

export const joinUrl = (origin: string, gameCode: string) => `${origin}/?${JOIN_PARAM}=${gameCode}`;

// The game code in a join link's query string, or null if there isn't a valid one
export function readJoinCode(search: string): string | null {
  const raw = new URLSearchParams(search).get(JOIN_PARAM);
  if (raw === null) return null;
  const code = cleanGameCode(raw);
  return isValidGameCode(code) ? code : null;
}

// The current address without the join code, so a refresh doesn't offer to join again
export function withoutJoinCode(href: string): string {
  const url = new URL(href);
  url.searchParams.delete(JOIN_PARAM);
  return url.toString();
}

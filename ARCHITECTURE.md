# Architecture

How Decrypto is put together, and why. For how to play and how to run it, see [README.md](README.md).

## The big picture

```
 team Black's phone                         team White's phone
 ┌───────────────────────┐                  ┌───────────────────────┐
 │ Start a new game      │   game code      │ Join: types the code  │
 │ shows code "K7Q2" ────┼── read aloud ──▶ │                       │
 │                       │                  │                       │
 │ deal("K7Q2")[0]       │  (no network)    │ deal("K7Q2")[1]       │
 │ keywords + 8 codes    │                  │ keywords + 8 codes    │
 └───────────────────────┘                  └───────────────────────┘
          clues, guesses and tokens: on the printed notepad
```

- **Each team has its own phone**, propped up showing its keywords. The encryptor taps to see the round's code.
- **The app only deals and shows secrets.** Clues, guesses and tokens go on the printed notepad, so the app never needs to know them or work out who won.
- **The phones never talk to each other.** There's nothing to keep in step during the game: each phone only shows its own team's words and codes, and the teams play the rounds together. The only thing the phones have to agree on is the deal, so the teams never get the same keyword. They agree by both dealing from the same game code ([`random.ts`](src/game/random.ts)), so no server or network is needed.
- **Saved in `localStorage`.** [`useGame.ts`](src/hooks/useGame.ts) runs actions through the reducer and saves the whole state, so a refresh or a closed tab loses nothing.

## The deal

- **Joining by QR code.** The starting phone can show a QR code ([`QrCode.tsx`](src/components/QrCode.tsx), drawn with `qrcode-generator`) of a join link, `https://…/?join=K7Q2` ([`joinLink.ts`](src/game/joinLink.ts)). The other phone scans it with its normal camera app, which opens the link, so the app needs no camera access of its own. `App.tsx` reads the code once, takes it out of the address (so a refresh doesn't offer to join again) and opens the join form with it filled in. If that phone already has a game going, it asks first.
- `makeGameCode` makes a 4-character code from 32 letters and digits, leaving out 0, O, 1 and I so it can be read across the table. `cleanGameCode` tidies what's typed (upper case, no spaces).
- **The last character is a check character**, worked out from the first 3 and the deal's version (`dealVersion`: a number to bump when the deal changes, plus the whole word list). `isValidGameCode` rejects a code made by a version with a different deal, or mistyped, with a 1 in 32 chance of missing it. `isWellFormedGameCode` only checks the length and characters, so a join link from another version still reaches the join form, which explains what's wrong; such a link never ends a game in progress.
- `deal(gameCode)` seeds a random number generator from the code (`seededRand`: an FNV-1a hash, then mulberry32), shuffles the word list and takes 8 different words. Team 0 (the phone that started) gets the first 4 and team 1 (the phone that joined) gets the next 4, so the teams never share a word. Each team gets 8 codes from the same generator.
- **The deal depends on the word list and the order of the draws.** Changing either changes what every game code deals, so both phones must be on the same version, which the check character enforces. Bump the number in `dealVersion` when changing the draws. A deploy mid-game only matters if one phone reloads to the new version and starts a new game, since each saved game keeps its own keywords and codes.
- Another phone that knows the game code could work out the other team's keywords. That's fine for a party game: nothing ever shows them.

## Game state

All of it is in [`src/game/state.ts`](src/game/state.ts):

- `GameState` is one phone's game: the game code, which team this phone is, its players, its keywords, its 8 codes, the round, and whether this round's code has been revealed.
- `applyAction(state, action)` is a pure reducer. It ignores actions that aren't allowed, so a stray tap can't break the game. `useGame`'s `startGame` deals from the game code and passes this team's keywords and codes in with `START_GAME`, so the reducer has no randomness.

```
SETUP ─START_GAME─▶ PLAYING: round 1 … 8 ─────────────────────────────▶ GAME_OVER
                      code hidden ─REVEAL_CODE─▶ code shown ─NEXT_ROUND─▶ next round, code hidden
                                  ◀─HIDE_CODE──             (after round 8: GAME_OVER)
                    END_GAME: from PLAYING at any time (someone has won on the notepad)
```

- `NEXT_ROUND` only works once the code has been revealed, so a stray tap can't skip a round's code. `HIDE_CODE` undoes a reveal tapped too soon.
- **Encryptors** rotate through the team's players by round (`getEncryptor`). Without players, the app just says "Encryptor".

## Keeping the code secret

- The code is behind a [`Gate`](src/components/Gate.tsx) ("Only Ann should look" → **Show me**) in an overlay, so the encryptor can pick the phone up away from their team. The gate starts hidden each time it opens, and hides itself again if the page is hidden (the phone is locked or another app is opened).
- [`Button`](src/components/Button.tsx) ignores taps for its first half second (`ARM_DELAY_MS`), so a double tap can't also press the button that appears in its place.

## The propped-up phone

- [`useWakeLock`](src/hooks/useWakeLock.ts) keeps the screen on while a game is in progress (the Screen Wake Lock API). Browsers drop the lock when the page is hidden, so it asks again when the page is visible. Where it isn't supported, the phone just sleeps as normal.
- [`KeywordsCard`](src/components/KeywordsCard.tsx) shows one keyword per row, each as big as fits on one line: the font size comes from the screen width and the word's length. Every word in the list fits on one line on a 320px-wide phone.
- **Add to home screen.** [`manifest.webmanifest`](public/manifest.webmanifest) and the Apple tags in `index.html` let the app be added to a phone's home screen, so it opens full screen in portrait, without the browser's address bar. The icon is [`favicon.svg`](public/favicon.svg); the PNGs next to it were rendered from it. There's deliberately no service worker: one would cache old versions, and both phones need the same version (see "The deal").
- Team Black (the phone that started) is black and team White is white, as in the board game ([`teamStyles.ts`](src/utils/teamStyles.ts)).

## What's stored in the browser

| Key | What |
| --- | --- |
| `decrypto:gameState:v1` | The whole `GameState` (`useGame.ts`) |

- **`normalizeState` checks a saved game** before using it. Anything a screen couldn't show (no game code, missing codes or keywords, a game saved by the older one-phone version, and so on) starts afresh instead of crashing.
- When adding a field to `GameState`, give it a default in `createInitialState` and copy it in `normalizeState`.
- Tabs in the same browser share the saved game, so two "phones" on one computer need different browser profiles (or a private window).

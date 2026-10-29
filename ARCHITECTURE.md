# Architecture

How Decrypto is put together, and why. For how to play and how to run it, see [README.md](README.md).

## The big picture

- **No server.** The app is a static site on Netlify. Both teams share one phone, so there's nothing to sync.
- **One reducer, one screen per phase.** All the rules are in [`src/game/state.ts`](src/game/state.ts). [`App.tsx`](src/App.tsx) shows one screen for each `phase` of the game.
- **Saved in `localStorage`.** [`useGame.ts`](src/hooks/useGame.ts) runs actions through the reducer and saves the whole state, so a refresh or a closed tab loses nothing.

## Game state

- `GameState` is the whole game: the two teams (names, players and keywords), a code for every round for each team (`codes[team][round - 1]`), the round, whose turn it is (`activeTeam`), the clues and locked-in intercept for the turn in progress, and every finished `Transmission`.
- `applyAction(state, action)` is a pure reducer. It ignores actions that aren't allowed in the current phase, so a stray tap can't break the game.
- **Randomness stays outside the reducer.** `useGame`'s `startGame` draws the keywords and every round's codes up front ([`random.ts`](src/game/random.ts)) and passes them in with `START_GAME`. Tests pass their own.
- **Tokens aren't stored.** `getTokens` counts them from the transmissions (`wasIntercepted`, `wasMiscommunicated`), so they can never disagree with what happened. The same goes for the clue sheets (`getClueSheet`) and the result (`getRoundEndResult`, `getResult`).

### Phases

```
SETUP ─START_GAME─▶ KEYWORDS (team 0, then team 1) ─DONE_KEYWORDS─▶ ┐
                                                                     │
  ┌──────────────────────── each round: team 0, then team 1 ◀───────┘
  │  ENCRYPT ──SUBMIT_CLUES──▶ INTERCEPT ──SUBMIT_INTERCEPT──▶ DECODE ──SUBMIT_DECODE──▶ REVEAL
  │            (round 1 skips INTERCEPT)   ◀──BACK_TO_INTERCEPT──
  └──NEXT──▶ the other team's ENCRYPT, or at the end of a round: the next round, or GAME_OVER
```

- **ENCRYPT** is secret: the encryptor sees the code and the keywords, and types 3 clues.
- **INTERCEPT** and **DECODE** are public: the clues are on screen. The intercept guess is stored but not shown until **REVEAL**. `BACK_TO_INTERCEPT` lets the intercepting team fix its guess before the reveal.
- **REVEAL** saves the transmission. The game only ends on `NEXT` after team 1's reveal, because the rules decide the game at the end of a round: 2 interceptions wins, 2 miscommunications loses, and if both teams hit an end at once (or round 8 is over), the higher score wins, or it's a draw.
- **Encryptors** rotate through each team's players by round (`getEncryptor`). Without players, the app just says "team X's encryptor".

## Keeping secrets on one phone

- Every secret (a team's keywords, the code) is behind a [`Gate`](src/components/Gate.tsx): "Pass the phone to …" and **Show me**. Screens after a secret never show it, so the phone can be handed on.
- A gate gets a `key` for each new secret, so it always starts hidden. It hides itself again when the page is hidden (the phone is locked or another app is opened).
- [`Button`](src/components/Button.tsx) ignores taps for its first half second (`ARM_DELAY_MS`), so a double tap can't also press the button that appears in its place, such as **Show me** on the next gate. The code picker is keyed by phase, so the intercept's **Lock in** can't also lock in the decode.
- The game-over screen shows both teams' keywords.

## What's stored in the browser

| Key | What |
| --- | --- |
| `decrypto:gameState:v1` | The whole `GameState` (`useGame.ts`) |

- **`normalizeState` checks a saved game** before using it. Anything a screen couldn't show (missing codes or keywords, no clues while guessing, and so on) starts a fresh game instead of crashing. When adding a field to `GameState`, give it a default in `createInitialState`, and make sure `normalizeState` still loads older saves.
- **Changing the `v1` throws away everyone's saved game.** Only do this for a change `normalizeState` can't repair.

## UI

- Every screen is laid out for a phone held upright ([`Screen`](src/components/Screen.tsx)). The guess screen fits on a 375×812 screen without scrolling.
- Team 0 is black and team 1 is white, as in the board game ([`teamStyles.ts`](src/utils/teamStyles.ts)).
- [`GameMenu`](src/components/GameMenu.tsx), on the encrypt, guess and reveal screens, has the clue sheets, a team's own keywords (behind a gate), how to play, and new game.

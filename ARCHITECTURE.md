# Architecture

How Decrypto is put together, and why. For how to play and how to run it, see [README.md](README.md).

## The big picture

- **The app only deals and shows secrets.** It deals each team's keywords and shows each encryptor their code. Clues, guesses and tokens go on the printed notepad, so the app never needs to know them or work out who won.
- **No server.** The app is a static site on Netlify. Both teams share one phone, so there's nothing to sync.
- **One reducer, one screen per phase.** The game's phases are in [`src/game/state.ts`](src/game/state.ts). [`App.tsx`](src/App.tsx) shows one screen for each `phase`.
- **Saved in `localStorage`.** [`useGame.ts`](src/hooks/useGame.ts) runs actions through the reducer and saves the whole state, so a refresh or a closed tab loses nothing.

## Game state

- `GameState` is the whole game: the two teams (names, players and keywords), a code for every round for each team (`codes[team][round - 1]`), the round, and whose turn it is (`activeTeam`).
- `applyAction(state, action)` is a pure reducer. It ignores actions that aren't allowed in the current phase, so a stray tap can't break the game.
- **Randomness stays outside the reducer.** `useGame`'s `startGame` draws the keywords and every round's codes up front ([`random.ts`](src/game/random.ts)) and passes them in with `START_GAME`. Tests pass their own.

### Phases

```
SETUP ─START_GAME─▶ KEYWORDS (team 0, then team 1) ─DONE_KEYWORDS─▶ ┐
                                                                     │
  ┌──────────────────────── each round: team 0, then team 1 ◀───────┘
  │  ENCRYPT ──DONE_ENCRYPTING──▶ GUESS ──REVEAL_CODE──▶ REVEAL
  └──NEXT──▶ the other team's ENCRYPT, the next round, or GAME_OVER after round 8

END_GAME: from any phase in play to GAME_OVER (someone has won on the notepad)
```

- **ENCRYPT** is secret: the encryptor sees the code and their keywords.
- **GUESS** is public: the teams write their guesses down. The encryptor can see the code again behind a gate.
- **REVEAL** shows the code to everyone.
- **GAME_OVER** comes after team 1's turn in round 8, or from **End game**, since only the notepad knows when someone has won. Everyone's keywords are shown only when asked, so the keyword-guessing tiebreaker can happen first.
- **Encryptors** rotate through each team's players by round (`getEncryptor`). Without players, the app just says "team X's encryptor".

## Keeping secrets on one phone

- Every secret (a team's keywords, the code) is behind a [`Gate`](src/components/Gate.tsx): "Pass the phone to …" and **Show me**. Screens after a secret never show it, so the phone can be handed on.
- A gate gets a `key` for each new secret, so it always starts hidden. It hides itself again when the page is hidden (the phone is locked or another app is opened).
- [`Button`](src/components/Button.tsx) ignores taps for its first half second (`ARM_DELAY_MS`), so a double tap can't also press the button that appears in its place, such as **Show me** on the next gate.

## What's stored in the browser

| Key | What |
| --- | --- |
| `decrypto:gameState:v1` | The whole `GameState` (`useGame.ts`) |

- **`normalizeState` checks a saved game** before using it. Anything a screen couldn't show (missing codes or keywords, a phase that no longer exists, and so on) starts a fresh game instead of crashing. Fields from older versions (the clues and guesses the app used to store) are dropped.
- When adding a field to `GameState`, give it a default in `createInitialState` and copy it in `normalizeState`.
- **Changing the `v1` throws away everyone's saved game.** Only do this for a change `normalizeState` can't repair.

## UI

- Every screen is laid out for a phone held upright ([`Screen`](src/components/Screen.tsx)).
- Team 0 is black and team 1 is white, as in the board game ([`teamStyles.ts`](src/utils/teamStyles.ts)).
- [`GameMenu`](src/components/GameMenu.tsx), on the encrypt, guess and reveal screens, has a team's own keywords (behind a gate), how to play (with a link to the notepad PDF), and end game.

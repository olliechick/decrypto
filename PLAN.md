# Decrypto MVP plan

A plan for a first playable version of Decrypto: two teams in the same room, **one phone** passed around. It follows Outburst's approach: a pure reducer for the rules, state saved in `localStorage`, no server.

## What the MVP is

A full game of Decrypto for two teams on one phone, from setup to a winner, without anyone seeing anything they shouldn't.

### The rules it follows

- Two teams. Each team has **4 secret keywords**, numbered 1–4, that only it can see.
- Each round, each team has an **encryptor** (a different player each round). The encryptor gets a secret **code**: 3 different digits from 1–4, such as `3-1-4`. They give 3 clues, one for each digit, that point to those keywords.
- The **other team tries to intercept** (guess the code from the clues). There's no interception in round 1, because there are no earlier clues to go on.
- Then **the encryptor's own team decodes** (guesses the code).
- Then the code is revealed:
  - The opposing team guessed right: they get an **interception token**.
  - The encryptor's team guessed wrong: they get a **miscommunication token**.
- Then the other team does the same.
- At the end of a round: 2 interception tokens wins, and 2 miscommunication tokens loses. If both happen at once (or nobody has won after round 8), the higher score wins, where score = interceptions − miscommunications. If that's still a tie, it's a draw in the MVP (the official word-guessing tiebreaker is a stretch goal).
- Every clue is public, and the clues so far are kept on a **clue sheet**, grouped by keyword number. That's what makes interception possible, so the sheet has to be in the MVP.

### The one-phone problem

Secret information has to be shown to one person or team at a time. Every secret screen sits behind a **pass-the-phone gate**: "Pass the phone to Team Red's encryptor (Sam)" → **Show me** → the secret → **Done, hide it**. The next screen never shows anything secret, so the phone can be handed on safely.

Secret things:

| What | Who sees it | When |
| --- | --- | --- |
| Team's 4 keywords | That team | At the start, and whenever they ask (behind a gate) |
| The code | That round's encryptor | While they type in the clues |
| The intercept guess | Nobody until the reveal | Once it's locked in |

Everything else (clues, the clue sheets, tokens) is public and can be on screen while the phone is on the table.

### Decisions I've made (easy to change)

- **Clues are typed into the phone** by the encryptor (and read out loud). This is what fills the clue sheets, which is the core of the game.
- **Teams enter their guesses on the phone** after talking it over: three taps on a 1–4 picker.
- **Players' names are optional.** If they're entered, the app says whose turn it is to be the encryptor and rotates through each team in order. Otherwise it just says "Team Red's encryptor".
- **No timer** in the MVP. The real game uses a sand timer once one encryptor has finished, but on one phone the teams go one after the other.
- **Our own word list**, about 400 common, concrete nouns. The official cards are copyrighted, so we don't copy them.

## Game flow

```
SETUP ──▶ KEYWORDS(team A, gated) ──▶ KEYWORDS(team B, gated) ──▶ ┐
                                                                   │
  ┌────────────────────────── for each team T, A then B ◀─────────┘
  │  ENCRYPT  (T's encryptor, gated: sees code, types 3 clues)
  │  INTERCEPT(public: clues on screen; opponent enters guess and locks it in; skipped in round 1)
  │  DECODE   (clues still on screen; T enters guess; can go back to fix the intercept)
  │  REVEAL   (code, both guesses, tokens awarded; clues go on T's sheet)
  └──▶ next team, or end of round ──▶ win check ──▶ next round or GAME_OVER
```

## Code layout

Mirrors Outburst:

- **`src/game/state.ts`** (done): `GameState`, `GameAction`, `createInitialState`, `applyAction(state, action)` and `normalizeState`, plus helpers: `getEncryptor`, `getCode`, `getTokens`, `getScore`, `getClueSheet` (clues by keyword number), `getRoundEndResult` and `getResult`. The `phase` field is the state machine above. Tokens aren't stored: they're counted from the saved transmissions.
- **Randomness stays outside the reducer.** As in Outburst, the caller draws the random parts and passes them in: `START_GAME` takes both teams' keywords and a code for every round. The reducer stays pure, and tests can pick their own words and codes.
- **`src/game/random.ts`**: `drawKeywords(words, 8)` (no repeats across the two teams) and `drawCode()`.
- **`src/data/words.ts`**: the word list. A test checks that there are no duplicates, that every entry is one lower-case word, and that there are enough words.
- **`src/hooks/useLocalStorageState.ts`**: copied from Outburst. **`src/hooks/useGame.ts`**: a simpler `useGameState` (no BroadcastChannel, no presence, no TV effects).
- **`src/components/`**:
  - `SetupScreen`: team names and optional players
  - `Gate`: the pass-the-phone wrapper for every secret screen
  - `KeywordsCard`: the 4 numbered words
  - `EncryptScreen`: the code and 3 clue fields
  - `GuessScreen`: the clues, and the code picker for INTERCEPT and DECODE
  - `RevealScreen`
  - `ClueSheet`: tabs for each team, 4 columns
  - `TokenBar`: interceptions and miscommunications
  - `GameOverScreen`: the winner, with every keyword revealed
  - `Menu`: see our words (gated), rules, new game

## Steps

1. ✅ **Rules engine and tests.** Write `state.ts` with the phases, actions, token scoring, the round-1 rule, the win, lose and tiebreak logic and the 8-round limit. Add tests in `state.test.ts`, including a full scripted game for each way a game can end, and actions that should be ignored in the wrong phase. There's no UI in this step.
2. ✅ **Words and randomness.** Add `words.ts`, `random.ts` and their tests.
3. ✅ **Playable flow.** Write `useGame` and the screens, in phase order, so a whole game can be played in the browser at phone size. Use big tap targets and portrait layout.
4. **Clue sheets and the in-game menu.** Add the clue sheet, which can be opened from the INTERCEPT and DECODE screens. Add the gated "see our words" button, new game and a short how-to-play.
5. **Robustness.**
   - The game survives a refresh: it's saved to `localStorage` under a versioned key, with `normalizeState`.
   - Each secret screen hides itself when the phone is locked or the tab is backgrounded.
   - The **Done** button on a gate ignores taps for a moment, so a double tap can't skip a screen.
6. **Docs and a playtest.** Add rules and how-to-play to the README, and write ARCHITECTURE.md (state machine, secrecy rules, storage keys). Play a full game at phone size in the browser, fix what comes up, then push to deploy.

## Not in the MVP (later)

- The official tiebreaker: each team guesses the other team's keywords.
- A sand timer, sounds and confetti.
- Undo of a reveal.
- More than 2 teams, or 3-player mode.
- Custom word lists and a no-repeat deck across games (like Outburst's).
- PWA install, keeping the screen awake (Wake Lock), and dark mode.
- Multi-device play (each team on its own phone), which would need a server.

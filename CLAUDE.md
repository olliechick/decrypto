# Decrypto

- [README.md](README.md): how to play, run, test and deploy.
- [ARCHITECTURE.md](ARCHITECTURE.md): how the code fits together and why. Read it before changing the game state or the secret screens.
- Each team has **its own phone**. The phones never talk to each other: both deal from a shared game code (see ARCHITECTURE.md).
- [Outburst](https://github.com/olliechick/outburst) (usually checked out next to this folder, at `../outburst`) uses the same stack and is a useful reference for tooling, tests and code style.

## Checks

- `npm test` runs the tests; `npm run lint` type-checks. Also try changes in the browser at phone size (`npm run dev`, port 3001).

## Rules

- Game rules go in the pure reducer in `src/game/state.ts`, not in components, with tests in `src/game/state.test.ts`.
- Randomness (keywords, codes) is dealt from the game code outside the reducer and passed in with the action. Changing the word list or the deal changes every game code's deal, so both phones must run the same version.
- The code is only ever shown behind a `Gate` until it's revealed to everyone.
- New `GameState` fields need a default in `createInitialState`, and `normalizeState` must still load saved games.
- Keep the README and ARCHITECTURE.md up to date when behaviour changes.
- Bump `version` in `package.json` (and `package-lock.json`) for a change people will notice; the app shows it with the commit.
- Pushing to `main` deploys to production.

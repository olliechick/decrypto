# Decrypto

- [README.md](README.md): how to play, run, test and deploy.
- [ARCHITECTURE.md](ARCHITECTURE.md): how the code fits together and why. Read it before changing the game state or the secret screens.
- It's played on **one phone** shared by both teams (no separate host and TV tabs, unlike Outburst).
- [Outburst](https://github.com/olliechick/outburst) (usually checked out next to this folder, at `../outburst`) uses the same stack and is a useful reference for tooling, tests and code style.

## Checks

- `npm test` runs the tests; `npm run lint` type-checks. Also try changes in the browser at phone size (`npm run dev`, port 3001).

## Rules

- Game rules go in the pure reducer in `src/game/state.ts`, not in components, with tests in `src/game/state.test.ts`.
- Randomness (keywords, codes) is drawn outside the reducer and passed in with the action.
- Anything secret (a team's keywords, the code) is only ever shown behind a `Gate`.
- New `GameState` fields need a default in `createInitialState`, and `normalizeState` must still load saved games.
- Keep the README and ARCHITECTURE.md up to date when behaviour changes.
- Pushing to `main` deploys to production.

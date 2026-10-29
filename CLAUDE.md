# Decrypto

- [README.md](README.md): how to run, test and deploy.
- The game isn't built yet. It's played on **one screen** (no separate host and TV tabs, unlike Outburst).
- [Outburst](https://github.com/olliechick/outburst) (usually checked out next to this folder, at `../outburst`) uses the same stack and is a useful reference for tooling, tests and code style (a pure reducer for the game rules, saved in `localStorage`, no server). Its host/TV syncing doesn't apply here.

## Checks

- `npm test` runs the tests; `npm run lint` type-checks. Also try changes in the browser (`npm run dev`, port 3001).

## Rules

- Game rules go in a pure reducer, not in components, with tests.
- Keep the README up to date when behaviour changes; add an ARCHITECTURE.md once there's a design.
- Pushing to `main` deploys to production.

# Decrypto

A web version of the party game Decrypto, built with React, TypeScript, Tailwind and Vite. It lives at https://decrypto.olliechick.co.nz.

Each team has **its own phone**, propped up where the team can see it, showing the team's four secret keywords. The encryptor taps to see each round's code. Clues, guesses and tokens go on the official printed notepad ([PDF from Portal Games](https://portalgames.blob.core.windows.net/decrypto/Decrypto-Notatnik.pdf)), one sheet per team.

There's no server and no accounts: it's a static site. **The phones never talk to each other.** One phone starts a game and shows a 4-character game code, and the other phone joins by typing it or scanning a QR code. Both deal from that code, so they agree on who has which keywords (never the same word twice) without syncing. Each phone saves its game in its own browser, so it survives a refresh, and keeps its screen on while a game is in progress. Add it to the home screen (Share → Add to Home Screen on an iPhone, or Add to home screen in Chrome's menu) and it opens full screen like an app.

## How to play

- **Set up.** One phone taps **Start a new game** and becomes team Black. The other joins and becomes team White: either tap **Join the other team's game** and type the game code, or tap **or by scanning a QR code** on the first phone and point the second phone's camera at it. The link opens the app with the code filled in. Each can enter its own players (optional), and then the app says whose turn it is to be the encryptor each round.
- **Each round**, the encryptor picks up their team's phone and taps **see code**. They write a clue on their sheet for each digit of the code (such as 3-1-4), in order, then hide the code and read the clues out loud.
- From round 2, the other team writes down its **intercept** (its guess at the code). The encryptor's own team writes down its guess. Then **Reveal to all** shows the code, and **On to round …** moves on. A reveal tapped too soon can be hidden again.
  - The other team guessed right: they get an **interception**. Two wins.
  - The encryptor's team guessed wrong: they get a **miscommunication**. Two loses.
- Tokens are kept on the sheets. When someone has won, **End** ends the game. Otherwise it ends after round 8, and the higher score (interceptions minus miscommunications) wins. If it's still level, each team guesses the other team's keywords.

Both phones must be on the same version of the app, because the deal depends on the word list. The last character of each game code is a check that catches a phone on a different version (and most typos): the join form says to reload the app on both phones instead of dealing different keywords. The version is shown under **How to play** on the first screen and at the bottom of the rules, such as `v2026-10-30.18:14`: when that version was built, in the phone's time zone.

The keywords come from our own list of 420 words in [`src/data/words.ts`](src/data/words.ts) (the official cards are copyrighted).

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the code fits together.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3001 (Outburst uses 3000, so both can run at once). To try both phones on one computer, use a second browser profile or a private window for the other team, because tabs in the same browser share the saved game.

- `npm test` runs the tests (Vitest): the game's rules, the word list and the seeded deal.
- `npm run lint` type-checks the code.
- `npm run build` creates a static build in `dist/`.
- `npm run preview` serves that build locally.

## Deploying

Pushing to `main` deploys to Netlify automatically once the site is connected (see `netlify.toml`). The site is a static build, so there's nothing else to host.

To connect it the first time:

1. In Netlify, **Add new site → Import an existing project → GitHub**, and pick `olliechick/decrypto`. The build command (`npm run build`) and publish folder (`dist`) come from `netlify.toml`.
2. In the site's **Domain management**, add `decrypto.olliechick.co.nz`, then add the DNS record Netlify shows (a CNAME to the site's `*.netlify.app` address) wherever `olliechick.co.nz`'s DNS is managed.

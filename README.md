# Decrypto

A web version of the party game Decrypto, built with React, TypeScript, Tailwind and Vite. It lives at https://decrypto.olliechick.co.nz.

Two teams in the same room share **one phone**, passing it round when the app says to. There's no server and no accounts: it's a static site, and the game is saved in the phone's browser, so it survives a refresh.

## How to play

- Each team has 4 secret **keywords**, numbered 1 to 4. At the start, the phone goes to each team in turn to see theirs. They can look again any time from **Our words** in the menu.
- Each round, one player on each team is the **encryptor**. The app passes the phone to them (by name, if you entered players; they take turns in the order entered) and shows them a secret 3-digit **code** such as 3-1-4. They type a clue for each digit and read the clues out loud.
- From round 2, the other team **intercepts** first: they enter their guess at the code, which stays hidden. Then the encryptor's own team enters its guess, and the code is revealed.
  - The other team guessed right: they get an **interception**. Two wins.
  - The encryptor's team guessed wrong: they get a **miscommunication**. Two loses.
- The game ends at the end of a round. If both teams finish at once, or nobody has after round 8, the higher score (interceptions minus miscommunications) wins, and a tie is a draw.
- Every clue goes on the public **clue sheets** (**Clues** in the menu), under the number of the keyword it was for. That's what the other team uses to intercept.

The keywords come from our own list of 420 words in [`src/data/words.ts`](src/data/words.ts) (the official cards are copyrighted).

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the code fits together.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3001 (Outburst uses 3000, so both can run at once).

- `npm test` runs the tests (Vitest): the game rules, the word list and the random draws.
- `npm run lint` type-checks the code.
- `npm run build` creates a static build in `dist/`.
- `npm run preview` serves that build locally.

## Deploying

Pushing to `main` deploys to Netlify automatically once the site is connected (see `netlify.toml`). The site is a static build, so there's nothing else to host.

To connect it the first time:

1. In Netlify, **Add new site → Import an existing project → GitHub**, and pick `olliechick/decrypto`. The build command (`npm run build`) and publish folder (`dist`) come from `netlify.toml`.
2. In the site's **Domain management**, add `decrypto.olliechick.co.nz`, then add the DNS record Netlify shows (a CNAME to the site's `*.netlify.app` address) wherever `olliechick.co.nz`'s DNS is managed.

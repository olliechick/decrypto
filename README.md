# Decrypto

A web version of the party game Decrypto, built with React, TypeScript, Tailwind and Vite. It will live at https://decrypto.olliechick.co.nz.

It's played on a single screen. Nothing is built yet: this is the starting point. It uses the same tooling as [Outburst](https://github.com/olliechick/outburst), and there's no server: it's a static site.

## Development

```bash
npm install
npm run dev
```

Then open http://localhost:3001 (Outburst uses 3000, so both can run at once).

- `npm test` runs the tests (Vitest; none yet).
- `npm run lint` type-checks the code.
- `npm run build` creates a static build in `dist/`.
- `npm run preview` serves that build locally.

## Deploying

Pushing to `main` deploys to Netlify automatically once the site is connected (see `netlify.toml`). The site is a static build, so there's nothing else to host.

To connect it the first time:

1. In Netlify, **Add new site → Import an existing project → GitHub**, and pick `olliechick/decrypto`. The build command (`npm run build`) and publish folder (`dist`) come from `netlify.toml`.
2. In the site's **Domain management**, add `decrypto.olliechick.co.nz`, then add the DNS record Netlify shows (a CNAME to the site's `*.netlify.app` address) wherever `olliechick.co.nz`'s DNS is managed.

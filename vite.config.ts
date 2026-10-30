import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

const buildTime = new Date().toISOString();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Also in the page, so a copy of the app that's been open a while can tell a newer one is out (useNewerVersion.ts)
      name: 'build-time',
      transformIndexHtml: (html) => html.replace('</head>', `  <meta name="build-time" content="${buildTime}" />\n  </head>`),
    },
    {
      // Fills in the service worker's cache name and the list of files it saves on install (public/sw.js)
      name: 'service-worker',
      apply: 'build',
      writeBundle({ dir = 'dist' }) {
        const files = readdirSync(dir, { recursive: true, withFileTypes: true })
          .filter((f) => f.isFile() && f.name !== 'sw.js')
          .map((f) => path.relative(dir, path.join(f.parentPath, f.name)).split(path.sep).join('/'))
          .map((f) => (f === 'index.html' ? '/' : `/${f}`))
          .sort();
        const sw = path.join(dir, 'sw.js');
        writeFileSync(
          sw,
          readFileSync(sw, 'utf8')
            .replace("const CACHE = 'decrypto-dev';", `const CACHE = 'decrypto-${buildTime}';`)
            .replace('const PRECACHE = [];', `const PRECACHE = ${JSON.stringify(files)};`)
        );
      },
    },
  ],
  define: {
    // Shown as the app's version (see AppVersion.tsx)
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  server: {
    port: 3001,
  },
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
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

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// The version the app shows, so the two phones can be checked against each other: package.json's version (bump it when
// releasing a change) and the commit it was built from (Netlify sets COMMIT_REF)
function appVersion() {
  const { version } = JSON.parse(readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf8'));
  let commit = process.env.COMMIT_REF;
  try {
    commit ??= execSync('git rev-parse HEAD').toString();
  } catch {
    // Not a git checkout: show the version alone
  }
  return commit ? `${version} (${commit.trim().slice(0, 7)})` : version;
}
process.env.VITE_APP_VERSION = appVersion();

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  server: {
    port: 3001,
  },
});

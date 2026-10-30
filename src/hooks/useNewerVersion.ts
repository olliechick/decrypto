import { useEffect, useState } from 'react';

declare const __BUILD_TIME__: string;

// Only a copy of the app this old checks for a newer one
export const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

// The build time in a copy of index.html (added by vite.config.ts)
export const readBuildTime = (html: string) => html.match(/<meta name="build-time" content="([^"]+)"/)?.[1] ?? null;

// Whether a newer version of the app is out than this one, which is more than a week old. Both phones need the same
// version for the deal, and a phone can keep an installed app open for weeks. Checked when the app opens and each time
// it comes back into view.
export function useNewerVersion(): boolean {
  const [newer, setNewer] = useState(false);
  useEffect(() => {
    const check = async () => {
      if (Date.now() - Date.parse(__BUILD_TIME__) < STALE_AFTER_MS) return;
      try {
        const latest = readBuildTime(await (await fetch('/', { cache: 'no-store' })).text());
        if (latest && latest > __BUILD_TIME__) setNewer(true);
      } catch {
        // offline: nothing to reload to
      }
    };
    check();
    const onVisible = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  return newer;
}

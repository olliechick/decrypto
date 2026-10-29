import { useEffect } from 'react';

// Keeps the screen on while `active`, so a propped-up phone doesn't go to sleep mid-game. The browser drops the lock
// whenever the page is hidden, so it's asked for again when the page comes back. Does nothing where it isn't supported.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) next.release();
        else lock = next;
      } catch {
        // e.g. low battery mode; the screen just sleeps as normal
      }
    };

    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', request);
      lock?.release();
    };
  }, [active]);
}

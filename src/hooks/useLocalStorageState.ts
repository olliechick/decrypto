import { useEffect, useRef, useState } from 'react';

type Init<T> = T | (() => T);

// `normalize` repairs a stored value written by an older version of the app
export function useLocalStorageState<T>(key: string, initialValue: Init<T>, normalize?: (stored: unknown) => T) {
  const loadedFromStorage = useRef(false);

  const read = () => {
    const fallback = () =>
      typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback();
      const parsed = JSON.parse(raw);
      loadedFromStorage.current = true;
      return normalize ? normalize(parsed) : (parsed as T);
    } catch {
      return fallback();
    }
  };

  const [state, setState] = useState<T>(read);

  // Avoid writing a value we just read straight back; a fresh default is saved at once so other tabs share it
  const didHydrate = useRef(false);

  useEffect(() => {
    if (!didHydrate.current) {
      didHydrate.current = true;
      if (loadedFromStorage.current) return;
    }
    try {
      // Unchanged (such as a change just picked up from another tab) isn't written back, so tabs don't echo each other
      const raw = JSON.stringify(state);
      if (localStorage.getItem(key) !== raw) localStorage.setItem(key, raw);
    } catch {
      // ignore quota / privacy mode issues
    }
  }, [key, state]);

  // Another tab (or the installed app and the browser, which share storage on Android) saved a change: show it here
  // too, instead of overwriting it with this tab's older copy on the next tap
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        setState(normalize ? normalize(parsed) : (parsed as T));
      } catch {
        // ignore a value that isn't JSON
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, normalize]);

  return [state, setState] as const;
}

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
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore quota / privacy mode issues
    }
  }, [key, state]);

  return [state, setState] as const;
}

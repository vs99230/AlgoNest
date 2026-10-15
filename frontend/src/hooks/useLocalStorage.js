import { useCallback, useRef, useState } from 'react';

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    /* corrupt JSON or blocked storage: use the fallback */
  }
  return fallback;
}

/**
 * useState that persists to localStorage. Safe when `key` changes:
 * the value for the new key is loaded (or `initialValue` is used) on the next render.
 */
export default function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue);
  initialRef.current = initialValue;

  const [state, setState] = useState(() => ({ key, value: read(key, initialValue) }));

  let current = state;
  if (state.key !== key) {
    current = { key, value: read(key, initialRef.current) };
    setState(current);
  }

  const setValue = useCallback((next) => {
    setState((previous) => {
      const value = typeof next === 'function' ? next(previous.value) : next;
      try {
        window.localStorage.setItem(previous.key, JSON.stringify(value));
      } catch {
        /* storage full or blocked: keep the in-memory value */
      }
      return { key: previous.key, value };
    });
  }, []);

  return [current.value, setValue];
}

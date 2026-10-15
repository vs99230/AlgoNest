import { useEffect, useRef } from 'react';

/** Calls `handler` when a pointer press lands outside `ref`. */
export default function useClickOutside(ref, handler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current(event);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref, enabled]);
}

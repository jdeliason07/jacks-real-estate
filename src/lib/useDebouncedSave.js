import { useEffect, useRef } from "react";

/**
 * Persist `value` a short while after it stops changing, instead of once per
 * keystroke. Underwriting a deal is a lot of typing into a lot of number
 * fields; writing on every character would mean hundreds of serialisations of
 * the whole record for one visit to a card.
 *
 * Two guarantees beyond plain debouncing:
 *   - the first render never writes, so loading a deal can't immediately save
 *     it straight back;
 *   - a pending write is flushed on unmount and on `pagehide`, so navigating
 *     away — or iOS quietly killing a backgrounded PWA — can't lose the last
 *     few edits.
 */
export default function useDebouncedSave(value, save, delay = 600) {
  const saveRef = useRef(save);
  saveRef.current = save;

  const pending = useRef(null);
  const hasPending = useRef(false);
  const firstRun = useRef(true);

  function flush() {
    if (!hasPending.current) return;
    hasPending.current = false;
    const v = pending.current;
    pending.current = null;
    saveRef.current(v);
  }

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    pending.current = value;
    hasPending.current = true;
    const id = setTimeout(flush, delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flush();
    };
  }, []);
}

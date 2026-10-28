import { useEffect, useState } from "react";

const KEY = "nav-indicator-index";

function readPrevious(): number | null {
  try {
    const value = sessionStorage.getItem(KEY);
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

// Every page mounts its own footer nav, so the indicator would never slide.
// Start at the previous page's tab and move to the current one on the next frame.
export function useNavIndicator(index: number) {
  const [shown, setShown] = useState(() => {
    const previous = readPrevious();
    return previous === null || previous < 0 || index < 0 ? index : previous;
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(index));
    try {
      sessionStorage.setItem(KEY, String(index));
    } catch {
      // Storage blocked: the indicator just won't slide in from the last tab
    }
    return () => cancelAnimationFrame(frame);
  }, [index]);

  return shown;
}

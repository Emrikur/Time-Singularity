import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion";

// Counts from the last shown value up (or down) to target with easeOutCubic,
// rounded to one decimal. Only re-runs when target changes.
export function useCountUp(target: number, duration = 1100) {
  const [reduceMotion] = useState(prefersReducedMotion);
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reduceMotion) return;

    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const k = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      const next = Math.round((from + (target - from) * eased) * 10) / 10;
      fromRef.current = next;
      setValue(next);
      if (k < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduceMotion]);

  return reduceMotion ? target : value;
}

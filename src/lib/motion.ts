// JS-driven motion (count-ups, Chart.js, tilt) isn't covered by the CSS
// prefers-reduced-motion rule, so it checks this instead
export function prefersReducedMotion() {
  return typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

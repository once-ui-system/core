/**
 * Whether the visitor asks for reduced motion, read now. `useReducedMotion`
 * learns the preference in an effect, so on the first render it still reads
 * false; an effect that starts an animation at mount reads this as well, or
 * the first run would animate before the hook catches up.
 */
export function prefersReducedMotionNow(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

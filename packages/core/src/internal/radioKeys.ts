import type { KeyboardEvent } from "react";

const STEP: Record<string, 1 | -1> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** The group's own enabled radios, in DOM order; a nested group's are not its own. */
const enabledRadios = (group: HTMLElement): HTMLElement[] =>
  Array.from(group.querySelectorAll<HTMLElement>('[role="radio"]')).filter(
    (radio) =>
      radio.closest('[role="radiogroup"]') === group &&
      !radio.hasAttribute("disabled") &&
      radio.getAttribute("aria-disabled") !== "true",
  );

/**
 * The WAI-ARIA radio group's keys, for a `radiogroup` element's `onKeyDown`:
 * the arrows move focus to the previous or next radio, wrapping, and choose
 * it; Home and End go to the first and last. Choosing is a click on the
 * radio, so each radio keeps its own `onClick` as the one way to select.
 */
export function radioGroupKeyDown(event: KeyboardEvent<HTMLElement>) {
  const step = STEP[event.key];
  if (!step && event.key !== "Home" && event.key !== "End") return;
  const radios = enabledRadios(event.currentTarget);
  if (radios.length === 0) return;
  const from = radios.indexOf(document.activeElement as HTMLElement);
  if (from === -1) return;
  event.preventDefault();
  const to =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? radios.length - 1
        : (from + step + radios.length) % radios.length;
  const next = radios[to];
  if (next === radios[from]) return;
  next.focus();
  next.click();
}

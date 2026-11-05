/**
 * Whether the visitor's last input was the keyboard. A focus that arrives
 * without a key press (a dialog moving focus to its first control after a
 * click) is not keyboard focus, so a hover card or tooltip should not open
 * for it. One listener pair per page, added the first time it is asked.
 */
let keyboard = false;
let listening = false;

const listen = () => {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener(
    "keydown",
    (event) => {
      // A modifier alone (Cmd for a shortcut) is not navigation.
      if (event.metaKey || event.altKey || event.ctrlKey) return;
      keyboard = true;
    },
    true,
  );
  const pointer = () => {
    keyboard = false;
  };
  document.addEventListener("pointerdown", pointer, true);
  document.addEventListener("mousedown", pointer, true);
  document.addEventListener("touchstart", pointer, { capture: true, passive: true });
};

/** Starts tracking; call on mount of anything that asks `lastInputWasKeyboard`. */
export const trackInputModality = listen;

/** True when the last input on the page was a key press. */
export const lastInputWasKeyboard = () => {
  listen();
  return keyboard;
};

/** Test helper: forget the last input. */
export const resetInputModality = () => {
  keyboard = false;
};

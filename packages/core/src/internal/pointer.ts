/**
 * Whether the primary pointer can't hover: a phone or a tablet, where
 * hover-opened UI has to show itself some other way.
 *
 * Read from the `(hover: none)` media query rather than `"ontouchstart" in
 * window`. A laptop with a touchscreen has touch events and a mouse, and the
 * old check took its hover cards and tilt effects away from the mouse.
 */
export const cannotHover = (): boolean =>
  typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches === true;

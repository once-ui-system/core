/**
 * The theme's density: one setting for how roomy the controls are. It is the
 * `density` key of `once-ui.config`'s `style`, which ThemeProvider and
 * ThemeInit write to `<html>` as `data-density`.
 *
 * The name lives here, in the type, the constants and the table below, and in
 * `$attribute` / `$sizes` of foundations' `scss/styles/density.scss`, which
 * the controls' modules read; a rename touches only these.
 *
 * Not a client module, so the server-rendered ThemeInit can read the table.
 */

import type { ScalingSize } from "../contexts/ThemeProvider.js";

export type Density = "compact" | "normal" | "spacious";

/** The style key, and `data-${DENSITY_KEY}` the attribute on `<html>`. */
export const DENSITY_KEY = "density";

export const DEFAULT_DENSITY: Density = "normal";

/**
 * What each density sets: the size a control takes when its own `size` is
 * left out (in CSS, through `[data-density]`), and the `scaling` the theme
 * takes when `scaling` itself is not set. A `scaling` that is set wins.
 */
export const DENSITIES: Record<Density, { size: "s" | "m" | "l"; scaling: ScalingSize }> = {
  compact: { size: "s", scaling: "95" },
  normal: { size: "m", scaling: "100" },
  spacious: { size: "l", scaling: "105" },
};

/** The scaling a density picks, when the theme sets no `scaling` of its own. */
export function densityScaling(density: string | undefined): ScalingSize | undefined {
  return density && density in DENSITIES ? DENSITIES[density as Density].scaling : undefined;
}

/**
 * Every control whose default size follows the density: the ones with an s,
 * m and l size today. Each renders an `auto` class when it is given no size
 * (and, for a form field, no `Form` size), which its module restyles under
 * `[data-density]`. A control joins by doing the same and being listed here,
 * which the density tests and the docs read.
 *
 * Not yet: `Input` and the fields built on it (Textarea, Select, NumberInput,
 * DateInput, DateRangeInput, ColorInput, TagInput, PasswordInput), which join
 * when their s size lands.
 */
export const DENSITY_CONTROLS = [
  "Button",
  "IconButton",
  "ToggleButton",
  "SegmentedControl",
  "Tag",
  "Switch",
  "Checkbox",
  "RadioButton",
  "RadioGroup",
  "Slider",
] as const;

export type DensityControl = (typeof DENSITY_CONTROLS)[number];

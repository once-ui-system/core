import { forwardRef } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { CondensedTShirtSizes, Schemes, Tone } from "../types";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";

export interface StatusIndicatorProps extends FlexProps {
  size?: CondensedTShirtSizes;
  /** The dot's palette hue, a fixed colour. 2.x called this `color`. */
  scheme?: Schemes | "gray";
  /**
   * A theme role (`brand`, `danger`, `success`, …) that follows the theme's
   * scheme for it, as core 3.0's `tone`. It wins over `scheme`.
   */
  tone?: Tone;
  /** Read out by screen readers; defaults to `"<color> status indicator"`, as in core. */
  "aria-label"?: string;
}

// StatusIndicator.module.scss sizes, in static spacing steps.
const SIZES = { s: "4", m: "8", l: "16" } as const;

/** Core's `StatusIndicator`: a dot in the colour scheme's 700 step. */
export const StatusIndicator: RefComponent<StatusIndicatorProps, ViewRef> = forwardRef<
  ViewRef,
  StatusIndicatorProps
>(function StatusIndicator(
  { size = "m", scheme = "blue", tone, "aria-label": ariaLabel, ...props },
  ref,
) {
  const hue = tone ?? scheme;
  const theme = useTheme();
  const { style, rest, userStyle, hidden } = flexStyle(theme, { radius: "full", ...props });
  if (hidden) return null;
  const px = theme.space(SIZES[size]);
  return (
    <View
      ref={ref}
      accessibilityRole="image"
      aria-label={ariaLabel ?? `${hue} status indicator`}
      {...rest}
      style={[
        style,
        {
          width: px,
          height: px,
          backgroundColor: theme.color(tone ? `function-${tone}-700` : `scheme-${scheme}-700`),
        },
        userStyle,
      ]}
    />
  );
});

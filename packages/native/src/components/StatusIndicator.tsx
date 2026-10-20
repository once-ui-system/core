import { forwardRef } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { CondensedTShirtSizes, Schemes } from "../types";
import { type FlexProps, flexStyle } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";

export interface StatusIndicatorProps extends FlexProps {
  size?: CondensedTShirtSizes;
  /** Core 3.0's name for `color`. */
  scheme?: Schemes | "gray";
  color?: Schemes | "gray";
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
  { size = "m", scheme, color: colorProp, "aria-label": ariaLabel, ...props },
  ref,
) {
  const color = scheme ?? colorProp ?? "blue";
  const theme = useTheme();
  const { style, rest, userStyle, hidden } = flexStyle(theme, { radius: "full", ...props });
  if (hidden) return null;
  const px = theme.space(SIZES[size]);
  return (
    <View
      ref={ref}
      accessibilityRole="image"
      aria-label={ariaLabel ?? `${color} status indicator`}
      {...rest}
      style={[
        style,
        { width: px, height: px, backgroundColor: theme.color(`scheme-${color}-700`) },
        userStyle,
      ]}
    />
  );
});

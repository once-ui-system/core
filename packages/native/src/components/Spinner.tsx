import { ActivityIndicator, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";

export interface SpinnerProps {
  size?: TShirtSizes;
  /** Defaults to `neutral-on-background-medium`. */
  color?: string;
  ariaLabel?: string;
  style?: ViewStyle;
}

// Spinner.module.scss sizes, in static spacing steps.
const SIZES = { xs: "16", s: "20", m: "24", l: "32", xl: "40" } as const;

/** Core's `Spinner`, drawn by the platform's activity indicator. */
export function Spinner({ size = "m", color, ariaLabel = "Loading", style }: SpinnerProps) {
  const theme = useTheme();
  const px = theme.space(SIZES[size]);
  return (
    <ActivityIndicator
      accessibilityLabel={ariaLabel}
      color={color ?? theme.color("neutral-on-background-medium")}
      size={px >= 32 ? "large" : "small"}
      style={[{ width: px, height: px }, style]}
    />
  );
}

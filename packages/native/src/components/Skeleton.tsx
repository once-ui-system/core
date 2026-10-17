import { useEffect, useRef } from "react";
import { Animated, type DimensionValue, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";

export interface SkeletonProps {
  shape?: "line" | "circle" | "block";
  size?: TShirtSizes;
  /** Overrides, in points. */
  width?: DimensionValue;
  height?: DimensionValue;
  /** Milliseconds before the pulse starts, to stagger several skeletons. */
  delay?: number;
  style?: ViewStyle;
}

// Skeleton.module.scss heights, in static spacing steps.
const LINE = { xs: "8", s: "12", m: "16", l: "20", xl: "24" } as const;
const CIRCLE = { xs: "20", s: "24", m: "32", l: "40", xl: "160" } as const;

/** Core's `Skeleton`: a pulsing placeholder while content loads. */
export function Skeleton({
  shape = "line",
  size = "m",
  width,
  height,
  delay = 0,
  style,
}: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
    );
    const timer = setTimeout(() => pulse.start(), delay);
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [opacity, delay]);

  const box =
    shape === "circle"
      ? { width: theme.space(CIRCLE[size]), height: theme.space(CIRCLE[size]), borderRadius: 9999 }
      : shape === "line"
        ? {
            width: "100%" as const,
            height: theme.space(LINE[size]),
            borderRadius: theme.radius("s"),
          }
        : { width: "100%" as const, height: theme.space("80"), borderRadius: theme.radius("m") };

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={[
        box,
        width !== undefined && { width },
        height !== undefined && { height },
        { backgroundColor: theme.color("neutral-background-strong"), opacity },
        style,
      ]}
    />
  );
}

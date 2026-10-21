import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, type DimensionValue, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { SpacingToken, TShirtSizes } from "../types";
import type { Length } from "./spacing";

export interface SkeletonProps {
  shape?: "line" | "circle" | "block";
  size?: TShirtSizes;
  /**
   * Overrides: a number of points (px, as in core 3.0), a token, `"320px"`,
   * `"20rem"` or `"50%"`.
   */
  width?: number | SpacingToken | Length | `${number}%`;
  height?: number | SpacingToken | Length | `${number}%`;
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
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
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
  }, [opacity, delay, reduceMotion]);

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
      aria-busy
      style={[
        box,
        width !== undefined && { width: dimension(theme, width) },
        height !== undefined && { height: dimension(theme, height) },
        { backgroundColor: theme.color("neutral-background-strong"), opacity },
        style,
      ]}
    />
  );
}

function dimension(
  theme: ReturnType<typeof useTheme>,
  value: number | SpacingToken | Length | `${number}%`,
): DimensionValue {
  if (typeof value === "string" && value.endsWith("%")) return value as DimensionValue;
  return theme.space(value as number | SpacingToken | Length);
}

/** The device's reduce-motion setting: the pulse holds still while it is on. */
function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((on) => live && setReduce(on))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduce);
    return () => {
      live = false;
      sub?.remove();
    };
  }, []);
  return reduce;
}

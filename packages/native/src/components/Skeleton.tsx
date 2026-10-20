import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { type FlexProps, flexStyle } from "./Flex";

/**
 * As core, Skeleton takes the Flex props, so `width`, `height`, `fillWidth`
 * and the rest work as on any Flex: numbers are rem, or a spacing token or
 * a percentage.
 */
export interface SkeletonProps extends Omit<FlexProps, "children"> {
  shape?: "line" | "circle" | "block";
  size?: TShirtSizes;
  /** Milliseconds before the pulse starts, to stagger several skeletons. */
  delay?: number;
}

// Skeleton.module.scss heights, in static spacing steps.
const LINE = { xs: "8", s: "12", m: "16", l: "20", xl: "24" } as const;
const CIRCLE = { xs: "20", s: "24", m: "32", l: "40", xl: "160" } as const;

/** Core's `Skeleton`: a pulsing placeholder while content loads. */
export function Skeleton({ shape = "line", size = "m", delay = 0, ...flex }: SkeletonProps) {
  const theme = useTheme();
  const { style, rest, userStyle, hidden } = flexStyle(theme, { direction: "column", ...flex });
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

  if (hidden) return null;

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
      {...rest}
      style={[
        box,
        { backgroundColor: theme.color("neutral-background-strong") },
        style,
        { opacity },
        userStyle,
      ]}
    />
  );
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

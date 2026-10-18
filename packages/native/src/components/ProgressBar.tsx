import { useEffect, useRef } from "react";
import { Animated, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { Colors } from "../types";
import { Column, Row } from "./Flex";
import { Text } from "./Text";

export interface ProgressBarProps {
  value: number;
  min?: number;
  max?: number;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom" | "left" | "right";
  /** The bar's solid colour, as core's `solid` prop: `"brand-strong"` by default. */
  barBackground?: Colors;
  style?: ViewStyle;
}

/** Core's `ProgressBar`: a rounded track that fills to `value`, with the value as a label. */
export function ProgressBar({
  value,
  min = 0,
  max = 100,
  showLabel = true,
  labelPosition = "bottom",
  barBackground = "brand-strong",
  style,
}: ProgressBarProps) {
  const theme = useTheme();
  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const width = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    Animated.timing(width, { toValue: percent, duration: 1000, useNativeDriver: false }).start();
  }, [percent, width]);

  const [scheme, weight] = barBackground.replace("-alpha", "").split("-");
  const horizontal = labelPosition === "left" || labelPosition === "right";
  const bar = (
    <View
      accessibilityRole="progressbar"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        // Grows along a row; spans the width in a column.
        ...(horizontal ? { flex: 1 } : { alignSelf: "stretch" }),
        height: theme.space("8"),
        borderRadius: 9999,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.color("neutral-border-medium"),
        backgroundColor: theme.color("neutral-background-medium"),
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: 9999,
          backgroundColor: theme.color(`${scheme}-solid-${weight}`),
          width: width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        }}
      />
    </View>
  );
  const label = showLabel ? <Text align="center">{`${value}%`}</Text> : null;
  const Layout = horizontal ? Row : Column;

  return (
    <Layout fillWidth gap={horizontal ? "16" : "8"} vertical="center" style={style}>
      {(labelPosition === "top" || labelPosition === "left") && label}
      {bar}
      {(labelPosition === "bottom" || labelPosition === "right") && label}
    </Layout>
  );
}

import { useId } from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import type { ChartVariant } from "./interfaces";

export interface SwatchProps {
  color: string;
  size?: "s" | "m";
  variant?: ChartVariant;
}

/** An SVG gradient id from `useId`, whose colons `url(#…)` would not take. */
export function useGradientId(prefix: string): string {
  return `${prefix}${useId().replace(/[^\w]/g, "")}`;
}

/** The stops of core's `LinearGradient`: solid for `flat`, fading for `gradient`, none for `outline`. */
export function gradientStops(color: string, variant: ChartVariant) {
  const [from, to] = variant === "flat" ? [1, 1] : variant === "outline" ? [0, 0] : [1, 0];
  return [
    <Stop key="from" offset="0" stopColor={color} stopOpacity={from} />,
    <Stop key="to" offset="1" stopColor={color} stopOpacity={to} />,
  ];
}

/** Core's `Swatch`: a series' colour square, filled as its bars and areas are. */
export function Swatch({ color, size = "m", variant = "gradient" }: SwatchProps) {
  const theme = useTheme();
  const id = useGradientId("swatch");
  const px = theme.space(size === "s" ? "12" : "16");
  const radius = theme.radius(size === "s" ? "xs" : "s");
  return (
    <Svg width={px} height={px} accessibilityElementsHidden importantForAccessibility="no">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {gradientStops(color, variant)}
        </LinearGradient>
      </Defs>
      <Rect
        x={0.5}
        y={0.5}
        width={px - 1}
        height={px - 1}
        rx={Math.max(0, radius - 0.5)}
        fill={`url(#${id})`}
        stroke={color}
        strokeWidth={1}
      />
    </Svg>
  );
}

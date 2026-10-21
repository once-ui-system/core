import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { type FlexProps, flexStyle } from "./Flex";
import { cubicBezier, easeInOut, keyframes, useFrameTime, useReduceMotion } from "./motion";

/** The tones the mark takes: the brand or accent hue, or the strongest neutral text. */
export type LogoSpinnerTone = "brand" | "accent" | "neutral" | "inherit";

export interface LogoSpinnerProps extends Omit<FlexProps, "children"> {
  size?: TShirtSizes;
  /**
   * `twist`: the four tiles part, turn a quarter and click back together.
   * `wave`: the tiles lift outward one after another, clockwise.
   */
  variant?: "twist" | "wave";
  /** `brand` by default. React Native has no inherited color, so `inherit` is the strongest neutral text. */
  tone?: LogoSpinnerTone;
  /** Seconds per cycle. */
  speed?: number;
  "aria-label"?: string;
}

const TONE: Record<LogoSpinnerTone, string> = {
  brand: "brand-color-strong",
  accent: "function-accent-500",
  neutral: "neutral-on-background-strong",
  inherit: "neutral-on-background-strong",
};

// LogoSpinner.module.scss: the footprint of Spinner, inset so a parted tile stays inside.
const SIZES = {
  xs: { box: "16", inset: 2 },
  s: { box: "20", inset: 2 },
  m: { box: "24", inset: 3 },
  l: { box: "32", inset: 4 },
  xl: { box: "40", inset: 5 },
} as const;

/** The mark's four tiles, top, right, bottom, left, with the center each scales around and the way it moves out. */
export const LOGO_TILES = [
  {
    d: "M173.08 155.146L247.587 80.6393C273.772 54.4536 316.228 54.4536 342.413 80.6393L416.92 155.146L308.547 263.52C301.065 271.002 288.935 271.002 281.453 263.52L173.08 155.146Z",
    cx: 295,
    cy: 165,
    dx: 0,
    dy: -1,
  },
  {
    d: "M325.48 307.547C317.998 300.065 317.998 287.935 325.48 280.453L433.854 172.08L508.361 246.587C534.546 272.772 534.546 315.228 508.361 341.413L433.854 415.92L325.48 307.547Z",
    cx: 424,
    cy: 294,
    dx: 1,
    dy: 0,
  },
  {
    d: "M173.08 432.854L281.453 324.48C288.935 316.998 301.065 316.998 308.547 324.48L416.92 432.854L342.413 507.361C316.228 533.546 273.772 533.546 247.587 507.361L173.08 432.854Z",
    cx: 295,
    cy: 424,
    dx: 0,
    dy: 1,
  },
  {
    d: "M81.6393 341.413C55.4536 315.228 55.4536 272.772 81.6393 246.587L156.146 172.08L264.52 280.453C272.002 287.935 272.002 300.065 264.52 307.547L156.146 415.92L81.6393 341.413Z",
    cx: 166,
    cy: 294,
    dx: -1,
    dy: 0,
  },
] as const;

const turn = cubicBezier(0.65, 0, 0.35, 1);
const out = cubicBezier(0.3, 0, 0.2, 1);
const snap = cubicBezier(0.5, 0, 0.3, 1.4);
const settle = cubicBezier(0.4, 0, 0.3, 1.3);

/** Each tile's offset (in the 590 box), scale and opacity at `time` seconds into the loop. */
export function logoSpinnerPose(
  variant: "twist" | "wave",
  time: number,
  duration: number,
  reduceMotion: boolean,
) {
  const rotate =
    variant === "twist" && !reduceMotion
      ? keyframes(time / duration, [
          [0, 0],
          [0.2, 0, turn],
          [0.75, 90],
          [1, 90],
        ])
      : 0;
  const tiles = LOGO_TILES.map((tile, index) => {
    // Tiles after the first start a quarter cycle apart, still until their turn.
    const delayed = variant === "wave" || reduceMotion ? time - (index * duration) / 4 : time;
    if (delayed < 0) return { x: 0, y: 0, scale: 1, opacity: 1 };
    const p = delayed / duration;
    if (reduceMotion) {
      const opacity = keyframes(
        p,
        [
          [0, 1],
          [0.25, 0.35],
          [0.5, 1],
          [1, 1],
        ],
        easeInOut,
      );
      return { x: 0, y: 0, scale: 1, opacity };
    }
    const lift =
      variant === "twist"
        ? keyframes(p, [
            [0, 0],
            [0.15, 0, out],
            [0.45, 1, snap],
            [0.8, 0],
            [1, 0],
          ])
        : keyframes(p, [
            [0, 0, out],
            [0.15, 1, settle],
            [0.4, 0],
            [1, 0],
          ]);
    const reach = variant === "twist" ? 56 : 48;
    return {
      x: tile.dx * reach * lift,
      y: tile.dy * reach * lift,
      scale: 1 - (variant === "twist" ? 0.22 : 0.16) * lift,
      opacity: 1 - (variant === "twist" ? 0.3 : 0.55) * lift,
    };
  });
  return { rotate, tiles };
}

/**
 * Core's `LogoSpinner`: the four tiles of the Once UI mark, moving. Use it
 * where a product's own loader belongs, such as an assistant working on a
 * reply; `Spinner` stays the neutral one for buttons and fields.
 *
 * With reduce motion on, the tiles stop moving and fade in turn instead.
 */
export function LogoSpinner({
  size = "m",
  variant = "twist",
  tone = "brand",
  speed,
  "aria-label": ariaLabel = "Loading",
  ...flex
}: LogoSpinnerProps) {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const time = useFrameTime(true);
  const { style, rest, userStyle, hidden } = flexStyle(theme, { center: true, ...flex });
  if (hidden) return null;

  const { box, inset } = SIZES[size];
  const px = theme.space(box);
  const pose = logoSpinnerPose(variant, time, speed ?? 1.6, reduceMotion);
  const fill = theme.color(TONE[tone]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={ariaLabel}
      {...rest}
      style={[style, { width: px, height: px, padding: inset, flexShrink: 0 }, userStyle]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 590 589">
        <G transform={`rotate(${pose.rotate.toFixed(2)} 295 294.5)`}>
          {LOGO_TILES.map((tile, index) => {
            const { x, y, scale, opacity } = pose.tiles[index];
            return (
              <Path
                key={tile.d}
                d={tile.d}
                fill={fill}
                opacity={opacity}
                transform={`translate(${(x + tile.cx).toFixed(2)} ${(y + tile.cy).toFixed(2)}) scale(${scale.toFixed(3)}) translate(${-tile.cx} ${-tile.cy})`}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

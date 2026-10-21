import { useRef, useState } from "react";
import { type AccessibilityActionEvent, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Row } from "./Flex";
import { SliderThumb, SliderTrack, snapValue, useTrackGesture, valueAt } from "./Slider";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControlledValue } from "./useControllable";

export interface RangeSliderProps {
  /** The selected `[start, end]`, when the host owns the state. Pair with `onValueChange`. */
  value?: [number, number];
  /** The range selected first when RangeSlider manages its own state. Defaults to `[min, max]`. */
  defaultValue?: [number, number];
  /** Called with the new `[start, end]`, start never above end. */
  onValueChange?: (value: [number, number]) => void;
  min?: number;
  max?: number;
  /** Every value lands on a multiple of `step` from `min`. */
  step?: number;
  /** The smallest gap the two thumbs keep between them. */
  minDistance?: number;
  /** Visible label that names the pair of thumbs. */
  label?: string;
  /** Show the selected range beside the label. */
  showValue?: boolean;
  /** How a value reads in the readout and to a screen reader, such as `(v) => \`$${v}\``. */
  formatValue?: (value: number) => string;
  /** The thumbs' accessible names, start first. */
  thumbLabels?: [string, string];
  disabled?: boolean;
  style?: ViewStyle;
}

type Thumb = 0 | 1;

/** A press on two stacked thumbs grabs whichever the finger then moves towards. */
type Grab = Thumb | "either";

const THUMBS: Thumb[] = [0, 1];

/**
 * Core's `RangeSlider`: two thumbs on one track, selecting a `[start, end]`
 * range, such as a price filter. A press on the track moves the nearer thumb
 * there and drags it; the two never cross. Each thumb is its own adjustable
 * element for screen readers, bounded by the other.
 */
export function RangeSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  label,
  showValue = false,
  formatValue = String,
  thumbLabels = ["Minimum", "Maximum"],
  disabled = false,
  style,
}: RangeSliderProps) {
  const theme = useTheme();
  const [raw, setValue] = useControlledValue(value, defaultValue ?? [min, max], onValueChange);
  const [dragging, setDragging] = useState<Grab | null>(null);
  const grab = useRef<Grab | null>(null);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const start = clamp(Math.min(raw[0], raw[1]));
  const end = clamp(Math.max(raw[0], raw[1]));
  const values: [number, number] = [start, end];

  // What was last reported, so moves that land before the next render
  // still measure against where the other thumb is now.
  const latest = useRef(values);
  latest.current = values;

  // The range a thumb can move within: up to the other thumb, less the gap.
  const bounds = (thumb: Thumb, [from, to]: [number, number] = latest.current) =>
    thumb === 0 ? [min, Math.max(min, to - minDistance)] : [Math.min(max, from + minDistance), max];

  // Moving one thumb clamps it between its bounds; it never pushes the other.
  const move = (thumb: Thumb, to: number) => {
    const [from, until] = latest.current;
    const [low, high] = bounds(thumb);
    const target = Math.min(high, Math.max(low, snapValue(to, min, step)));
    const next: [number, number] = thumb === 0 ? [target, until] : [from, target];
    if (next[0] === from && next[1] === until) return;
    latest.current = next;
    setValue(next);
  };

  const hold = (next: Grab | null) => {
    grab.current = next;
    setDragging(next);
  };

  const percent = (n: number) => (max > min ? ((n - min) / (max - min)) * 100 : 0);
  const height = theme.space("40");

  const gesture = useTrackGesture(disabled, {
    onStart: (x, width) => {
      const to = valueAt(x, width, min, max);
      const [from, until] = latest.current;
      // On two stacked thumbs the first move decides which, since only one
      // of them can go each way.
      if (from === until) {
        hold("either");
        return;
      }
      // Otherwise the nearer thumb comes to the finger; level with both, the one on its side.
      const nearer = Math.abs(to - from) - Math.abs(to - until);
      const thumb: Thumb = nearer < 0 || (nearer === 0 && to < from) ? 0 : 1;
      hold(thumb);
      move(thumb, to);
    },
    onMove: (x, width, dx) => {
      let thumb = grab.current;
      if (thumb === null) return;
      if (thumb === "either") {
        if (dx === 0) return;
        thumb = dx < 0 ? 0 : 1;
        hold(thumb);
      }
      move(thumb, valueAt(x, width, min, max));
    },
    onEnd: () => hold(null),
  });

  return (
    <View style={[{ width: "100%", gap: theme.space("8") }, style]}>
      {(label || showValue) && (
        <Row fillWidth horizontal="between" vertical="center">
          {label && (
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {label}
            </Text>
          )}
          {showValue && (
            <Text textVariant="label-default-s" onBackground="neutral-medium">
              {formatValue(start)} – {formatValue(end)}
            </Text>
          )}
        </Row>
      )}
      <View
        hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
        onLayout={gesture.onLayout}
        {...gesture.panHandlers}
        style={{ height, justifyContent: "center", opacity: disabled ? 0.4 : 1 }}
      >
        <SliderTrack from={percent(start)} to={percent(end)} />
        {THUMBS.map((thumb) => (
          <SliderThumb
            key={thumb}
            percent={percent(values[thumb])}
            active={dragging === thumb}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={thumbLabels[thumb]}
            accessibilityValue={{
              min: bounds(thumb, values)[0],
              max: bounds(thumb, values)[1],
              now: values[thumb],
              text: formatValue(values[thumb]),
            }}
            aria-disabled={disabled}
            accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
            onAccessibilityAction={(event: AccessibilityActionEvent) => {
              if (disabled) return;
              const delta = event.nativeEvent.actionName === "increment" ? step : -step;
              move(thumb, latest.current[thumb] + delta);
            }}
            // The thumb being dragged sits on top of the other one.
            style={{ zIndex: dragging === thumb ? 3 : 2 }}
          />
        ))}
      </View>
    </View>
  );
}

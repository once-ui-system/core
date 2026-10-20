import { useMemo, useRef, useState } from "react";
import {
  type AccessibilityActionEvent,
  type GestureResponderHandlers,
  type LayoutChangeEvent,
  PanResponder,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Row } from "./Flex";
import { Text } from "./Text";
import { touchSlop } from "./touch";
import { useControlledValue } from "./useControllable";

export interface SliderProps {
  /** The value, when the host owns the state. Pair with `onValueChange`. */
  value?: number;
  /** Where the slider starts when it manages its own state. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the new value, as a number. */
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  /** The accessible name, when there is no visible `label`. */
  "aria-label"?: string;
  style?: ViewStyle;
}

const decimals = (n: number) => {
  const [, exponent] = String(n).split("e-");
  if (exponent) return Number(exponent);
  const [, fraction = ""] = String(n).split(".");
  return fraction.length;
};

/** `n` on the nearest multiple of `step` from `min`, without float noise. */
export function snapValue(n: number, min: number, step: number): number {
  const precision = Math.max(decimals(step), decimals(min));
  return Number((min + Math.round((n - min) / step) * step).toFixed(precision));
}

export interface TrackGesture {
  /** A finger landed `x` points from the track's left edge, `width` wide. */
  onStart: (x: number, width: number) => void;
  /** It moved to `x`, `dx` from where it landed. */
  onMove: (x: number, width: number, dx: number) => void;
  onEnd: () => void;
}

/**
 * The drag on a slider's track: a `PanResponder` that keeps the gesture once
 * it has it, so a scroll view around the slider cannot take it mid-drag.
 * Positions are read as where the finger landed plus how far it moved, which
 * holds however the touch's target changes under the finger.
 */
export function useTrackGesture(
  disabled: boolean,
  handlers: TrackGesture,
): { panHandlers: GestureResponderHandlers; onLayout: (event: LayoutChangeEvent) => void } {
  const width = useRef(0);
  const origin = useRef(0);
  // The latest closures, for the responder created once.
  const latest = useRef({ disabled, handlers });
  latest.current = { disabled, handlers };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.disabled,
        // Horizontal drags move a thumb; vertical ones still scroll the page.
        onMoveShouldSetPanResponder: (_, g) =>
          !latest.current.disabled && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          origin.current = event.nativeEvent.locationX;
          latest.current.handlers.onStart(origin.current, width.current);
        },
        onPanResponderMove: (_, g) =>
          latest.current.handlers.onMove(origin.current + g.dx, width.current, g.dx),
        onPanResponderRelease: () => latest.current.handlers.onEnd(),
        onPanResponderTerminate: () => latest.current.handlers.onEnd(),
      }),
    [],
  );
  return {
    panHandlers: responder.panHandlers,
    onLayout: (event) => {
      width.current = event.nativeEvent.layout.width;
    },
  };
}

/** The value at `x` points along a track `width` wide. */
export function valueAt(x: number, width: number, min: number, max: number): number {
  if (width <= 0) return min;
  return min + Math.min(1, Math.max(0, x / width)) * (max - min);
}

/**
 * Slider.module.scss's thumb: 16pt, brand-ringed, a little larger while
 * dragged. Touches pass through it to the track; other view props (a
 * thumb's accessibility) go on the view.
 */
export function SliderThumb({
  percent,
  active,
  style,
  ...rest
}: ViewProps & { percent: number; active: boolean; style?: ViewStyle }) {
  const theme = useTheme();
  const size = theme.space("16");
  return (
    <View
      pointerEvents="none"
      {...rest}
      style={[
        {
          position: "absolute",
          top: "50%",
          left: `${percent}%`,
          width: size,
          height: size,
          marginTop: -size / 2,
          marginLeft: -size / 2,
          borderRadius: 9999,
          borderWidth: theme.space("2"),
          borderColor: theme.color("brand-solid-medium"),
          backgroundColor: theme.color("brand-on-solid-strong"),
          transform: [{ scale: active ? 1.2 : 1 }],
          ...theme.shadow("s"),
        },
        style,
      ]}
    />
  );
}

/** The 4pt track, filled from `from` to `to` percent. */
export function SliderTrack({ from, to }: { from: number; to: number }) {
  const theme = useTheme();
  const height = theme.space("4");
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        height,
        marginTop: -height / 2,
        borderRadius: 9999,
        overflow: "hidden",
        backgroundColor: theme.color("neutral-alpha-medium"),
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${from}%`,
          width: `${to - from}%`,
          backgroundColor: theme.color("brand-solid-medium"),
        }}
      />
    </View>
  );
}

/**
 * Core's `Slider`: one thumb on a track. Drag anywhere on the track to move
 * it; screen readers adjust it by `step` with a swipe up or down.
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  disabled = false,
  "aria-label": ariaLabel,
  style,
}: SliderProps) {
  const theme = useTheme();
  const [raw, setValue] = useControlledValue(value, defaultValue ?? min, onValueChange);
  const current = Math.min(max, Math.max(min, raw));
  const [dragging, setDragging] = useState(false);
  // What was last reported, so moves that land before the next render compare against it.
  const latest = useRef(current);
  latest.current = current;

  const set = (n: number) => {
    const next = Math.min(max, Math.max(min, snapValue(n, min, step)));
    if (next === latest.current) return;
    latest.current = next;
    setValue(next);
  };
  const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const height = theme.space("40");

  const gesture = useTrackGesture(disabled, {
    onStart: (x, width) => {
      setDragging(true);
      set(valueAt(x, width, min, max));
    },
    onMove: (x, width) => set(valueAt(x, width, min, max)),
    onEnd: () => setDragging(false),
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
              {current}
            </Text>
          )}
        </Row>
      )}
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={ariaLabel ?? label}
        accessibilityValue={{ min, max, now: current }}
        aria-disabled={disabled}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event: AccessibilityActionEvent) => {
          if (disabled) return;
          if (event.nativeEvent.actionName === "increment") set(latest.current + step);
          if (event.nativeEvent.actionName === "decrement") set(latest.current - step);
        }}
        hitSlop={touchSlop(theme, height, Number.POSITIVE_INFINITY)}
        onLayout={gesture.onLayout}
        {...gesture.panHandlers}
        style={{ height, justifyContent: "center", opacity: disabled ? 0.4 : 1 }}
      >
        <SliderTrack from={0} to={percent} />
        <SliderThumb percent={percent} active={dragging} />
      </View>
    </View>
  );
}

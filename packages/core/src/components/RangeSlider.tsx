"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Column } from "./Column";
import styles from "./RangeSlider.module.scss";
import { Row } from "./Row";
import { Text } from "./Text";

interface RangeSliderProps
  extends Omit<React.ComponentProps<typeof Column>, "onChange" | "defaultValue" | "children"> {
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
  /**
   * Submits both values with a form: one name for both (start first), or a
   * name for each, such as `["minPrice", "maxPrice"]`.
   */
  name?: string | [string, string];
  disabled?: boolean;
}

type Thumb = 0 | 1;

/** A press on two stacked thumbs grabs whichever the pointer then moves towards. */
type Grab = Thumb | "either";

const THUMBS: Thumb[] = [0, 1];

const decimals = (n: number) => {
  const [, exponent] = String(n).split("e-");
  if (exponent) return Number(exponent);
  const [, fraction = ""] = String(n).split(".");
  return fraction.length;
};

/**
 * RangeSlider: two thumbs on one track, selecting a `[start, end]` range,
 * such as a price filter.
 *
 * Each thumb is a `slider` with its own name ("Minimum" and "Maximum" unless
 * `thumbLabels` says otherwise) whose bounds are the other thumb, so the two
 * never cross. Arrow keys move a thumb by `step`, Page Up and Page Down by a
 * tenth of the range, Home and End to the ends of what it can reach; a press
 * on the track moves the nearer thumb there, and either thumb drags.
 */
const RangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  (
    {
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
      name,
      disabled = false,
      className,
      ...flex
    },
    ref,
  ) => {
    const labelId = useId();
    const trackRef = useRef<HTMLDivElement>(null);
    const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [uncontrolled, setUncontrolled] = useState<[number, number]>(
      () => defaultValue ?? [min, max],
    );
    const [dragging, setDragging] = useState<Grab | null>(null);
    const grabRef = useRef<Grab | null>(null);
    const controlled = value !== undefined;
    const raw = controlled ? value : uncontrolled;

    const clamp = (n: number) => Math.min(max, Math.max(min, n));
    const start = clamp(Math.min(raw[0], raw[1]));
    const end = clamp(Math.max(raw[0], raw[1]));
    const values: [number, number] = [start, end];

    // What was last reported, so pointer moves that land before the next
    // render still measure against where the other thumb is now.
    const latest = useRef(values);
    latest.current = values;

    // The range a thumb can move within: up to the other thumb, less the gap.
    const bounds = (thumb: Thumb, [from, to]: [number, number] = latest.current) =>
      thumb === 0
        ? [min, Math.max(min, to - minDistance)]
        : [Math.min(max, from + minDistance), max];

    const precision = Math.max(decimals(step), decimals(min));
    const snap = (n: number) =>
      Number((min + Math.round((n - min) / step) * step).toFixed(precision));

    // Moving one thumb clamps it between its bounds; it never pushes the other.
    const move = (thumb: Thumb, to: number, snapped = true) => {
      const [from, until] = latest.current;
      const [low, high] = bounds(thumb);
      const target = Math.min(high, Math.max(low, snapped ? snap(to) : to));
      const next: [number, number] = thumb === 0 ? [target, until] : [from, target];
      if (next[0] === from && next[1] === until) return;
      latest.current = next;
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    };

    // Read on every gesture rather than on render, so it follows a `dir`
    // set anywhere above.
    const isRtl = () => {
      const track = trackRef.current;
      return Boolean(track && getComputedStyle(track).direction === "rtl");
    };

    const valueAt = (clientX: number) => {
      const track = trackRef.current;
      if (!track) return null;
      const rect = track.getBoundingClientRect();
      if (rect.width <= 0) return null;
      const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return min + (isRtl() ? 1 - fraction : fraction) * (max - min);
    };

    const pageStep = Math.max(step, Math.round((max - min) / 10 / step) * step);

    const handleKeyDown = (thumb: Thumb) => (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const current = latest.current[thumb];
      const forward = isRtl() ? "ArrowLeft" : "ArrowRight";
      const back = isRtl() ? "ArrowRight" : "ArrowLeft";
      switch (event.key) {
        case "ArrowUp":
        case forward:
          move(thumb, current + step);
          break;
        case "ArrowDown":
        case back:
          move(thumb, current - step);
          break;
        case "PageUp":
          move(thumb, current + pageStep);
          break;
        case "PageDown":
          move(thumb, current - pageStep);
          break;
        case "Home":
          move(thumb, bounds(thumb)[0], false);
          break;
        case "End":
          move(thumb, bounds(thumb)[1], false);
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    const grab = (next: Grab | null) => {
      grabRef.current = next;
      setDragging(next);
    };

    // The latest closures, for the document listeners a drag adds once.
    const moveRef = useRef(move);
    moveRef.current = move;
    const valueAtRef = useRef(valueAt);
    valueAtRef.current = valueAt;

    // Pointer events cover mouse, pen and touch in one path. Listening on the
    // document keeps the drag going when the pointer leaves the track.
    const active = dragging !== null;
    useEffect(() => {
      if (!active) return;
      const onMove = (event: PointerEvent) => {
        const to = valueAtRef.current(event.clientX);
        let thumb = grabRef.current;
        if (to === null || thumb === null) return;
        if (thumb === "either") {
          const [from] = latest.current;
          if (to === from) return;
          thumb = to < from ? 0 : 1;
          grabRef.current = thumb;
          setDragging(thumb);
          thumbRefs.current[thumb]?.focus();
        }
        moveRef.current(thumb, to);
      };
      const onUp = () => {
        grabRef.current = null;
        setDragging(null);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      return () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };
    }, [active]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      const to = valueAt(event.clientX);
      if (to === null) return;
      // Keeps focus on a thumb rather than letting the press move it to the page.
      event.preventDefault();

      // A press on a thumb grabs it where it is. On two stacked thumbs the
      // first move decides which, since only one of them can go each way.
      const pressed = THUMBS.find((thumb) => thumbRefs.current[thumb] === event.target);
      if (pressed !== undefined) {
        thumbRefs.current[pressed]?.focus();
        grab(start === end ? "either" : pressed);
        return;
      }

      // A press on the track moves the nearer thumb there; level with both,
      // the one on the side of the press.
      const nearer = Math.abs(to - start) - Math.abs(to - end);
      const thumb: Thumb = nearer < 0 || (nearer === 0 && to < start) ? 0 : 1;
      thumbRefs.current[thumb]?.focus();
      move(thumb, to);
      grab(thumb);
    };

    const percent = (n: number) => (max > min ? ((n - min) / (max - min)) * 100 : 0);
    const names = typeof name === "string" ? [name, name] : name;
    const named = flex["aria-label"] !== undefined || flex["aria-labelledby"] !== undefined;

    return (
      <Column
        fillWidth
        gap="8"
        {...flex}
        ref={ref}
        className={classNames(styles.container, className)}
        role="group"
        // The visible label names the pair, unless the caller named it another way.
        aria-labelledby={flex["aria-labelledby"] ?? (label && !named ? labelId : undefined)}
      >
        {(label || showValue) && (
          <Row fillWidth horizontal="between" vertical="center">
            {label && (
              <Text id={labelId} variant="label-default-s" onBackground="neutral-weak">
                {label}
              </Text>
            )}
            {showValue && (
              <Text variant="label-default-s" onBackground="neutral-medium">
                {formatValue(start)} – {formatValue(end)}
              </Text>
            )}
          </Row>
        )}
        <Row
          ref={trackRef}
          fillWidth
          height="40"
          className={classNames(styles.wrapper, {
            [styles.disabled]: disabled,
            [styles.dragging]: active,
          })}
          onPointerDown={handlePointerDown}
        >
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{
                insetInlineStart: `${percent(start)}%`,
                width: `${percent(end) - percent(start)}%`,
              }}
            />
          </div>
          {THUMBS.map((thumb) => (
            <div
              key={thumb}
              ref={(node) => {
                thumbRefs.current[thumb] = node;
              }}
              role="slider"
              tabIndex={disabled ? undefined : 0}
              aria-label={thumbLabels[thumb]}
              aria-valuemin={bounds(thumb, values)[0]}
              aria-valuemax={bounds(thumb, values)[1]}
              aria-valuenow={values[thumb]}
              aria-valuetext={formatValue(values[thumb])}
              aria-disabled={disabled || undefined}
              className={classNames(styles.thumb, { [styles.active]: dragging === thumb })}
              // The thumb being dragged sits on top of the other one.
              style={{
                insetInlineStart: `${percent(values[thumb])}%`,
                zIndex: dragging === thumb ? 3 : 2,
              }}
              onKeyDown={handleKeyDown(thumb)}
            />
          ))}
          {names && (
            <>
              <input type="hidden" name={names[0]} value={start} disabled={disabled} />
              <input type="hidden" name={names[1]} value={end} disabled={disabled} />
            </>
          )}
        </Row>
      </Column>
    );
  },
);

RangeSlider.displayName = "RangeSlider";

export type { RangeSliderProps };
export { RangeSlider };

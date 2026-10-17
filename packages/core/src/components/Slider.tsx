"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { useControllableState } from "../internal/useControllableState";
import { Column } from "./Column";
import { Row } from "./Row";
import styles from "./Slider.module.scss";
import { Text } from "./Text";

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue"> {
  /** The value, when the host owns the state. Pair with `onValueChange`. */
  value?: number;
  /** Where the slider starts when it manages its own state. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the new value, as a number, on every step of a drag. */
  onValueChange?: (value: number) => void;
  /** Called with the value once a change is done: on pointer release, and
   *  after each key that moves the thumb. For work too heavy for every step. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** The keys a range input moves its thumb with. */
const COMMIT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      onChange,
      onPointerUp,
      onKeyUp,
      onMouseDown,
      min = 0,
      max = 100,
      step = 1,
      label,
      showValue = false,
      disabled = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const sliderRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const labelId = useId();
    const [current, setCurrent] = useControllableState({
      value,
      defaultValue: defaultValue ?? min,
      onChange: onValueChange,
    });

    const percentage = ((current - min) / (max - min)) * 100;

    // The native `onChange` hears the range input's own event, as with any
    // `<input type="range">`; `onValueChange` hears the number.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrent(parseFloat(e.target.value));
      onChange?.(e);
    };

    const commit = (e: React.SyntheticEvent<HTMLInputElement>) =>
      onValueCommit?.(parseFloat(e.currentTarget.value));

    const handlePointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
      onPointerUp?.(e);
      if (!disabled) commit(e);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyUp?.(e);
      if (!disabled && COMMIT_KEYS.has(e.key)) commit(e);
    };

    useEffect(() => {
      if (isDragging) {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
      }
    }, [isDragging]);

    return (
      <Column fillWidth gap="8" className={classNames(styles.container, className)} style={style}>
        {(label || showValue) && (
          <Row fillWidth horizontal="between" vertical="center">
            {label && (
              <Text id={labelId} textVariant="label-default-s" onBackground="neutral-weak">
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
        <Row
          fillWidth
          height="40"
          className={classNames(styles.sliderWrapper, {
            [styles.disabled]: disabled,
            [styles.dragging]: isDragging,
          })}
        >
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${percentage}%` }} />
          </div>
          <input
            ref={ref || sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={current}
            onChange={handleChange}
            onPointerUp={handlePointerUp}
            onKeyUp={handleKeyUp}
            onMouseDown={(e) => {
              setIsDragging(true);
              onMouseDown?.(e);
            }}
            disabled={disabled}
            className={styles.input}
            // The visible label names the input, unless the caller named it
            // another way: aria-labelledby would override an aria-label.
            aria-labelledby={label && !props["aria-label"] ? labelId : undefined}
            {...props}
          />
          <div className={styles.thumb} style={{ left: `${percentage}%` }} />
        </Row>
      </Column>
    );
  },
);

Slider.displayName = "Slider";

export type { SliderProps };
export { Slider };

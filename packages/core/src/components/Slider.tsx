"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Column } from "./Column";
import { Row } from "./Row";
import styles from "./Slider.module.scss";
import { Text } from "./Text";

interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** The value, when the host owns the state. Pair with `onChange`. */
  value?: number;
  /** Where the slider starts when it manages its own state. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the new value, as a number. */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      value,
      defaultValue,
      onChange,
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
    const controlled = value !== undefined;
    const [uncontrolled, setUncontrolled] = useState(defaultValue ?? min);
    const current = controlled ? value : uncontrolled;

    // With min === max there is no range to fill: 0 / 0 made the width NaN%.
    const percentage = max > min ? ((current - min) / (max - min)) * 100 : 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!controlled) setUncontrolled(newValue);
      onChange?.(newValue);
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
              <Text id={labelId} variant="label-default-s" onBackground="neutral-weak">
                {label}
              </Text>
            )}
            {showValue && (
              <Text variant="label-default-s" onBackground="neutral-medium">
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
            onMouseDown={() => setIsDragging(true)}
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

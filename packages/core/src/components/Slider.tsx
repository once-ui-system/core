"use client";

import React, { forwardRef, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import { Column, Row, Text } from ".";
import styles from "./Slider.module.scss";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
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

    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    };

    useEffect(() => {
      if (isDragging) {
        const handleMouseUp = () => setIsDragging(false);
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
      }
    }, [isDragging]);

    return (
      <Column
        fillWidth
        gap="8"
        className={classNames(styles.container, className)}
        style={style}
      >
        {(label || showValue) && (
          <Row fillWidth horizontal="between" vertical="center">
            {label && (
              <Text variant="label-default-s" onBackground="neutral-weak">
                {label}
              </Text>
            )}
            {showValue && (
              <Text variant="label-default-s" onBackground="neutral-medium">
                {value}
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
            <div
              className={styles.fill}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            ref={ref || sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            disabled={disabled}
            className={styles.input}
            {...props}
          />
          <div
            className={styles.thumb}
            style={{ left: `${percentage}%` }}
          />
        </Row>
      </Column>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
export type { SliderProps };

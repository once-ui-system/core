"use client";

import { cva } from "class-variance-authority";
import type { ChangeEvent, CSSProperties, InputHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Row } from "./Row";
import { Text } from "./Text";

export const sliderVariants = cva(
  "group/slider relative flex items-center w-full h-40 select-none",
  {
    variants: {
      disabled: {
        true: "opacity-40 cursor-not-allowed",
        false: "cursor-grab active:cursor-grabbing",
      },
      dragging: {
        true: "cursor-grabbing",
        false: "",
      },
    },
    defaultVariants: {
      disabled: false,
      dragging: false,
    },
  },
);

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
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

    const percentage =
      max > min ? Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)) : 0;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    };

    useEffect(() => {
      if (isDragging) {
        const handleDragEnd = () => setIsDragging(false);
        window.addEventListener("mouseup", handleDragEnd);
        window.addEventListener("touchend", handleDragEnd);
        return () => {
          window.removeEventListener("mouseup", handleDragEnd);
          window.removeEventListener("touchend", handleDragEnd);
        };
      }
    }, [isDragging]);

    return (
      <Column fillWidth gap="8" className={cn("select-none isolate", className)} style={style}>
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
          vertical="center"
          className={cn(sliderVariants({ disabled, dragging: isDragging }))}
        >
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-4 bg-neutral-alpha-medium rounded-full overflow-hidden pointer-events-none">
            <div
              className="absolute top-0 left-0 h-full bg-brand-solid-medium pointer-events-none transition-[width] duration-75"
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
            onMouseDown={() => !disabled && setIsDragging(true)}
            onTouchStart={() => !disabled && setIsDragging(true)}
            disabled={disabled}
            aria-label={label || (props["aria-label"] as string) || "Slider"}
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            className="peer absolute top-0 left-0 w-full h-full opacity-0 cursor-inherit z-[2] m-0 disabled:cursor-not-allowed"
            {...props}
          />
          <div
            className={cn(
              "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-brand-on-solid-strong border-2 border-solid border-brand-solid-medium rounded-full pointer-events-none transition-transform duration-100 ease-out shadow-s",
              !disabled && "group-hover/slider:scale-125",
              isDragging && "scale-125 cursor-grabbing",
              "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-brand-alpha-medium peer-focus-visible:outline-offset-2",
            )}
            style={{ left: `calc(${percentage}% + ${(0.5 - percentage / 100) * 16}px)` }}
          />
        </Row>
      </Column>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };

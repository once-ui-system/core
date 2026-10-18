"use client";

import classNames from "clsx";
import React, { forwardRef, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { RangeSlider, type RangeSliderProps } from "../internal/RangeSlider.js";
import { useControllableState } from "../internal/useControllableState.js";
import type { TShirtSizes } from "../types.js";
import { Column } from "./Column.js";
import { useFieldSize } from "./FormContext.js";
import { Row } from "./Row.js";
import styles from "./Slider.module.scss";
import { Text } from "./Text.js";

/** What both modes take. */
interface SliderFieldProps {
  min?: number;
  max?: number;
  /** Every value lands on a multiple of `step` from `min`. */
  step?: number;
  /** Visible label that names the slider (or the pair of thumbs). */
  label?: string;
  /** Show the value (or the range) beside the label. */
  showValue?: boolean;
  disabled?: boolean;
  /** Draw the slider in the error state and mark it invalid. */
  error?: boolean;
  /** A message below the slider, which describes it; it also sets the error state. */
  errorMessage?: ReactNode;
  /** Thumb and track size. Defaults to the surrounding `Form`'s size, else `"m"` (the 2.x look). */
  size?: TShirtSizes;
  className?: string;
  style?: React.CSSProperties;
}

/** One thumb on a native range input: the default. */
interface SingleSliderProps
  extends SliderFieldProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "value" | "defaultValue" | "size" | keyof SliderFieldProps
    > {
  /** Two thumbs selecting a `[start, end]` tuple. Leave it out for one value. */
  range?: false;
  /** The value, when the host owns the state. Pair with `onValueChange`. */
  value?: number;
  /** Where the slider starts when it manages its own state. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the new value, as a number, on every step of a drag. */
  onValueChange?: (value: number) => void;
  /** Called with the value once a change is done: on pointer release, and
   *  after each key that moves the thumb. For work too heavy for every step. */
  onValueCommit?: (value: number) => void;
}

/**
 * Two thumbs on one track (2.x's RangeSlider), selecting a `[start, end]`
 * range such as a price filter. The root is a `group` named by the label;
 * each thumb is a `slider` named by `thumbLabels`.
 */
interface RangeModeSliderProps
  extends SliderFieldProps,
    Omit<
      RangeSliderProps,
      | "invalid"
      | "describedBy"
      | "sizeClassName"
      | "footer"
      | "size"
      | "value"
      | "defaultValue"
      | "onValueChange"
      | "minDistance"
      | "formatValue"
      | "thumbLabels"
      | "name"
      | keyof SliderFieldProps
    > {
  range: true;
  /** The selected `[start, end]`, when the host owns the state. Pair with `onValueChange`. */
  value?: [number, number];
  /** The range selected first when the slider manages its own state. Defaults to `[min, max]`. */
  defaultValue?: [number, number];
  /** Called with the new `[start, end]`, start never above end. */
  onValueChange?: (value: [number, number]) => void;
  /** The smallest gap the two thumbs keep between them. */
  minDistance?: number;
  /** How a value reads in the readout and to a screen reader, such as `(v) => \`$${v}\``. */
  formatValue?: (value: number) => string;
  /** The thumbs' accessible names, start first. */
  thumbLabels?: [string, string];
  /**
   * Submits both values with a form: one name for both (start first), or a
   * name for each, such as `["minPrice", "maxPrice"]`.
   */
  name?: string | [string, string];
}

type SliderProps = SingleSliderProps | RangeModeSliderProps;

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

const SingleSlider = forwardRef<
  HTMLInputElement,
  SingleSliderProps & { sizeClassName?: string; footer?: ReactNode; describedBy?: string }
>(
  (
    {
      range: _range,
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
      error = false,
      errorMessage: _errorMessage,
      size: _size,
      sizeClassName,
      footer,
      describedBy,
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
      <Column
        fillWidth
        gap="8"
        className={classNames(
          styles.container,
          sizeClassName,
          { [styles.error]: error },
          className,
        )}
        style={style}
      >
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
            aria-invalid={error || undefined}
            aria-describedby={
              [props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined
            }
            {...props}
          />
          <div className={styles.thumb} style={{ left: `${percentage}%` }} />
        </Row>
        {footer}
      </Column>
    );
  },
);

SingleSlider.displayName = "SingleSlider";

/**
 * A slider: one thumb on a native range input, or with `range` two thumbs
 * selecting a `[start, end]` tuple (2.x's RangeSlider, same props). Both take
 * `error` / `errorMessage` and a `size`, which a `Form` sets for every field.
 */
const SliderImpl = forwardRef<HTMLElement, SliderProps>(
  // The defaults both modes apply, written where the spec reads them.
  (
    { min = 0, max = 100, step = 1, showValue = false, disabled = false, error = false, ...others },
    ref,
  ) => {
    const props = { ...others, min, max, step, showValue, disabled, error } as SliderProps;
    const messageId = useId();
    const size = useFieldSize(props.size);
    const invalid = Boolean(props.error || props.errorMessage);
    const footer = props.errorMessage ? (
      <Text
        id={messageId}
        className={styles.message}
        textVariant="body-default-s"
        onBackground="danger-weak"
      >
        {props.errorMessage}
      </Text>
    ) : null;
    const shared = {
      sizeClassName: size === "m" ? undefined : styles[size],
      footer,
      describedBy: props.errorMessage ? messageId : undefined,
    };

    if (props.range) {
      const { range: _range, error: _error, errorMessage: _message, size: _size, ...rest } = props;
      return (
        <RangeSlider
          {...rest}
          {...shared}
          invalid={invalid}
          ref={ref as React.Ref<HTMLDivElement>}
        />
      );
    }
    return (
      <SingleSlider
        {...props}
        {...shared}
        error={invalid}
        ref={ref as React.Ref<HTMLInputElement>}
      />
    );
  },
);

SliderImpl.displayName = "Slider";

/**
 * One signature per mode, so the ref is the element each renders: the range
 * input, or the range's group. The single mode is last, which is what
 * `React.ComponentProps<typeof Slider>` reads.
 */
interface SliderComponent {
  (props: RangeModeSliderProps & React.RefAttributes<HTMLDivElement>): ReactNode;
  (props: SingleSliderProps & React.RefAttributes<HTMLInputElement>): ReactNode;
  displayName?: string;
}

const Slider = SliderImpl as unknown as SliderComponent;

export type { SliderProps };
export { Slider };

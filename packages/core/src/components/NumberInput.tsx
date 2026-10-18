"use client";

import classNames from "clsx";
import React, { forwardRef, useState } from "react";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import styles from "./NumberInput.module.scss";

interface NumberInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type" | "value" | "defaultValue" | "onChange"> {
  value?: number;
  /** The starting number when there is no `value`. A string is parsed. */
  defaultValue?: number | string;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  padStart?: number;
}

const format = (value: number | undefined, padStart?: number) =>
  value === undefined ? "" : padStart ? value.toString().padStart(padStart, "0") : value.toString();

/** Whether the text in the field already reads as `value`: "1." and "1.50" are 1 and 1.5. */
const shows = (text: string, value: number | undefined) =>
  value === undefined ? text === "" : parseFloat(text) === value;

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, defaultValue, onChange, min, max, step = 1, padStart, ...props }, ref) => {
    // `defaultValue` used to fall through to the native input next to `value`:
    // React warned about a controlled-and-uncontrolled field, and the default
    // never showed.
    const [localValue, setLocalValue] = useState<string>(() => {
      if (value !== undefined) return format(value, padStart);
      const initial = typeof defaultValue === "string" ? parseFloat(defaultValue) : defaultValue;
      return format(initial === undefined || Number.isNaN(initial) ? undefined : initial, padStart);
    });

    /**
     * Follow `value` after mount. The text used to be seeded from it once and
     * never again, so a value changed from outside (an undo, a reset, a drag
     * elsewhere that edits the same number) left the field showing the old
     * one, and apps remounted it with a `key` to catch up.
     *
     * Only a CHANGE of the prop is followed, and only when the text does not
     * already read as the new value. That is what keeps typing intact: the
     * echo of the user's own keystroke ("1." reports 1, the parent passes 1
     * back) matches the text and leaves it alone, and a partial entry that
     * reports nothing ("-", "") never changes the prop at all. Adjusted
     * during render rather than in an effect, so the field never paints the
     * stale text first.
     */
    const [followed, setFollowed] = useState(value);
    if (!Object.is(value, followed)) {
      setFollowed(value);
      if (!shows(localValue, value)) {
        setLocalValue(format(value, padStart));
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);

      const numValue = parseFloat(newValue);
      if (!isNaN(numValue) && onChange) {
        onChange(numValue);
      }
    };

    const updateValue = (newValue: number) => {
      setLocalValue(format(newValue, padStart));
      onChange?.(newValue);
    };

    const increment = () => {
      const currentValue = parseFloat(localValue) || 0;
      const newValue = currentValue + step;
      if (max === undefined || newValue <= max) {
        updateValue(newValue);
      }
    };

    const decrement = () => {
      const currentValue = parseFloat(localValue) || 0;
      const newValue = currentValue - step;
      if (min === undefined || newValue >= min) {
        updateValue(newValue);
      }
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="number"
        value={localValue}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        // The field itself steps with the arrow keys, so the stepper buttons
        // are for the pointer only and stay out of the Tab order: two extra
        // stops per field made a form of numbers three times as long to tab.
        suffix={
          <>
            <Flex position="static" minWidth={1.25}></Flex>
            <Column
              position="absolute"
              right="0"
              top="0"
              borderLeft="neutral-medium"
              fillHeight
              background="neutral-alpha-weak"
            >
              <Flex
                fillHeight
                position="static"
                borderBottom="neutral-medium"
                transition="micro-medium"
                vertical="center"
                paddingX="4"
                className={classNames(styles.stepper)}
              >
                <IconButton
                  icon="chevronUp"
                  variant="ghost"
                  size="s"
                  onClick={increment}
                  aria-label="Increment value"
                  tabIndex={-1}
                />
              </Flex>
              <Flex
                fillHeight
                position="static"
                vertical="center"
                transition="micro-medium"
                paddingX="4"
                className={classNames(styles.stepper)}
              >
                <IconButton
                  icon="chevronDown"
                  variant="ghost"
                  size="s"
                  onClick={decrement}
                  aria-label="Decrement value"
                  tabIndex={-1}
                />
              </Flex>
            </Column>
          </>
        }
        className={styles.numberInput}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

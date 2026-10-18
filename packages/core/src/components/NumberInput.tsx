"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, useState } from "react";
import { Column } from "./Column";
import { Flex } from "./Flex";
import { useFieldSize } from "./FormContext";
import { IconButton } from "./IconButton";
import { Input } from "./Input";
import styles from "./NumberInput.module.scss";
import { Row } from "./Row";

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

/** Decimal places in a number, so a step can be rounded back onto its grid. */
const decimals = (n: number) => {
  const [, exponent] = String(n).split("e-");
  if (exponent) return Number(exponent);
  return (String(n).split(".")[1] ?? "").length;
};

/** `from + by` without floating-point noise: 0.2 + 0.1 is 0.3, not 0.30000000000000004. */
const add = (from: number, by: number) =>
  Number((from + by).toFixed(Math.max(decimals(from), decimals(by))));

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

    // A 32px field has no room for two steppers stacked: each would get 15px.
    // At xxs they sit side by side instead, down then up.
    const compact = useFieldSize(props.size) === "xxs";

    /**
     * Step by `by`, clamped to `min`/`max`. A step that would pass a bound
     * used to do nothing, so 8 with step 5 and max 10 could never reach 10;
     * now it lands on the bound. A step from an empty field starts from 0, or
     * from `min` when 0 is below it. Nothing is reported when the value would
     * not change (already at the bound).
     */
    const stepBy = (by: number) => {
      const parsed = parseFloat(localValue);
      const empty = Number.isNaN(parsed);
      if (empty && min !== undefined && 0 < min && by > 0) {
        updateValue(min);
        return;
      }
      const currentValue = empty ? 0 : parsed;
      let newValue = add(currentValue, by);
      if (max !== undefined && newValue > max) newValue = max;
      if (min !== undefined && newValue < min) newValue = min;
      if (!empty && newValue === currentValue) return;
      updateValue(newValue);
    };

    const increment = () => stepBy(step);

    const decrement = () => stepBy(-step);

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
          compact ? (
            <>
              {/* Room for the steppers (two 28px cells and their borders),
                  less the suffix's own 8px. */}
              <Flex position="static" minWidth={3.25}></Flex>
              <Row
                className={styles.steppersRow}
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
                  borderRight="neutral-medium"
                  transition="micro-medium"
                  vertical="center"
                  paddingX="4"
                  className={classNames(styles.stepper)}
                >
                  <IconButton
                    icon="chevronDown"
                    variant="ghost"
                    size="xs"
                    onClick={decrement}
                    aria-label="Decrement value"
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
                    icon="chevronUp"
                    variant="ghost"
                    size="xs"
                    onClick={increment}
                    aria-label="Increment value"
                    tabIndex={-1}
                  />
                </Flex>
              </Row>
            </>
          ) : (
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
          )
        }
        className={styles.numberInput}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

export { NumberInput };

import { forwardRef, useState } from "react";
import { Platform } from "react-native";
import { Row } from "./Flex";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import type { RefComponent, TextInputRef } from "./refs";

export interface NumberInputProps
  extends Omit<InputProps, "value" | "defaultValue" | "onValueChange" | "suffix"> {
  value?: number;
  /** The starting number when there is no `value`. A string is parsed. */
  defaultValue?: number | string;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Pads the shown number with leading zeros to this many digits, as `07`. */
  padStart?: number;
}

const format = (value: number | undefined, padStart?: number) =>
  value === undefined ? "" : padStart ? value.toString().padStart(padStart, "0") : value.toString();

/** Whether the text in the field already reads as `value`: "1." and "1.50" are 1 and 1.5. */
const shows = (text: string, value: number | undefined) =>
  value === undefined ? text === "" : Number.parseFloat(text) === value;

const decimals = (n: number) => (String(n).split(".")[1] ?? "").length;

/**
 * Core's `NumberInput`: an `Input` for a number, with − and + buttons that
 * step it by `step` within `min` and `max`. The keyboard is a number pad,
 * with a minus key when `min` allows negatives.
 */
export const NumberInput: RefComponent<NumberInputProps, TextInputRef> = forwardRef<
  TextInputRef,
  NumberInputProps
>(function NumberInput(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    padStart,
    disabled,
    onChangeText,
    ...props
  },
  ref,
) {
  const [localValue, setLocalValue] = useState<string>(() => {
    if (value !== undefined) return format(value, padStart);
    const initial =
      typeof defaultValue === "string" ? Number.parseFloat(defaultValue) : defaultValue;
    return format(initial === undefined || Number.isNaN(initial) ? undefined : initial, padStart);
  });

  // Follow a change of `value` from outside, unless the text already reads
  // as it: the echo of the user's own keystroke ("1." reports 1) is left
  // alone. Adjusted during render, as in core, so the stale text never shows.
  const [followed, setFollowed] = useState(value);
  if (!Object.is(value, followed)) {
    setFollowed(value);
    if (!shows(localValue, value)) setLocalValue(format(value, padStart));
  }

  const handleChange = (text: string) => {
    setLocalValue(text);
    onChangeText?.(text);
    const number = Number.parseFloat(text);
    if (!Number.isNaN(number)) onValueChange?.(number);
  };

  const current = Number.parseFloat(localValue) || 0;
  // Rounded to the step's decimals, so 0.1 + 0.2 shows as 0.3.
  const stepped = (delta: number) =>
    Number((current + delta).toFixed(Math.max(decimals(step), decimals(current))));
  const up = stepped(step);
  const down = stepped(-step);
  const canUp = max === undefined || up <= max;
  const canDown = min === undefined || down >= min;

  const update = (next: number) => {
    setLocalValue(format(next, padStart));
    onValueChange?.(next);
  };

  const negative = min === undefined || min < 0;

  return (
    <Input
      keyboardType={
        negative ? (Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric") : "decimal-pad"
      }
      {...props}
      ref={ref}
      disabled={disabled}
      value={localValue}
      onChangeText={handleChange}
      suffix={
        <Row gap="4" vertical="center">
          <IconButton
            icon="minus"
            variant="tertiary"
            size="l"
            aria-label="Decrement value"
            disabled={disabled || !canDown}
            onPress={() => update(down)}
          />
          <IconButton
            icon="plus"
            variant="tertiary"
            size="l"
            aria-label="Increment value"
            disabled={disabled || !canUp}
            onPress={() => update(up)}
          />
        </Row>
      }
    />
  );
});

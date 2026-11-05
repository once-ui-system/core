import { useState } from "react";

/**
 * `checked` when the caller controls it, otherwise local state seeded from
 * `defaultChecked`; `onCheckedChange` gets the state it moves to. Controlled
 * means `checked` is set, as in core 3.0, not that a handler is passed.
 */
export function useControllable(
  checked: boolean | undefined,
  defaultChecked: boolean,
  onCheckedChange?: (checked: boolean) => void,
): [boolean, () => void] {
  const [local, setLocal] = useState(defaultChecked);
  const value = checked ?? local;
  return [
    value,
    () => {
      if (checked === undefined) setLocal(!value);
      onCheckedChange?.(!value);
    },
  ];
}

/** The same for a value (`value` / `defaultValue` / `onValueChange`). */
export function useControlledValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [local, setLocal] = useState(defaultValue);
  const current = value ?? local;
  return [
    current,
    (next) => {
      if (value === undefined) setLocal(next);
      onValueChange?.(next);
    },
  ];
}

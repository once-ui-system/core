import { useState } from "react";

/** `checked` when the caller controls it, otherwise local state seeded from `defaultChecked`. */
export function useControllable(
  checked: boolean | undefined,
  defaultChecked: boolean,
  onToggle?: (checked: boolean) => void,
): [boolean, () => void] {
  const [local, setLocal] = useState(defaultChecked);
  const value = checked ?? local;
  return [
    value,
    () => {
      if (checked === undefined) setLocal(!value);
      onToggle?.(!value);
    },
  ];
}

/** The same for a value: `value` when the caller controls it, otherwise local state. */
export function useControlledValue<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (next: T) => void] {
  const [local, setLocal] = useState(defaultValue);
  const current = value ?? local;
  return [
    current,
    (next) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
  ];
}

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

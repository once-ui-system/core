"use client";

import { createContext, useContext } from "react";

/**
 * What a RadioGroup tells the RadioButtons inside it. Internal: not exported
 * from the package.
 */
interface RadioGroupContextValue {
  /** The selected radio's value; undefined while none is selected. */
  value: string | undefined;
  name: string | undefined;
  disabled: boolean;
  /** The value of the one radio in the page's Tab order. */
  tabbable: string | undefined;
  select: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupItemProps<Args extends unknown[]> {
  value: string | undefined;
  checked: boolean | undefined;
  name: string | undefined;
  disabled: boolean | undefined;
  onToggle: ((...args: Args) => void) | undefined;
}

/**
 * Inside a RadioGroup, the group owns a RadioButton's checked state, name,
 * disabled state and place in the Tab order, and the button's own `onToggle`
 * still runs when it is picked. Outside one, or with no `value` to match,
 * the button's own props stand.
 *
 * `focusProps` go on the element that takes focus: its roving `tabIndex`, and
 * the value the group's arrow keys read back from it.
 */
export function useRadioGroupItem<Args extends unknown[]>(props: RadioGroupItemProps<Args>) {
  const group = useContext(RadioGroupContext);
  const { value } = props;
  if (!group || value === undefined) return { ...props, focusProps: undefined };

  const disabled = group.disabled || Boolean(props.disabled);
  return {
    value,
    checked: group.value === value,
    name: group.name ?? props.name,
    disabled,
    onToggle: (...args: Args) => {
      group.select(value);
      props.onToggle?.(...args);
    },
    focusProps: {
      tabIndex: !disabled && group.tabbable === value ? 0 : -1,
      "data-value": value,
    },
  };
}

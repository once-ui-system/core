"use client";

import type React from "react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CONTROL_TEXT,
  type ControlChromeProps,
  describedBy,
  useControlChrome,
} from "../internal/controlChrome.js";
import { useFieldsetDisabled } from "../internal/fieldsetDisabled.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Column } from "./Column.js";
import { FormFieldContext } from "./FormContext.js";
import type { IconButtonProps } from "./IconButton.js";
import { RadioButton } from "./RadioButton.js";
import { RadioGroupContext } from "./RadioGroupContext.js";
import { Row } from "./Row.js";
import { Text } from "./Text.js";

interface RadioGroupOption {
  /** What the group's `value` and `onValueChange` carry, and what a form submits. */
  value: string;
  label: ReactNode;
  description?: ReactNode;
  /** Visible, not selectable, skipped by the arrow keys. */
  disabled?: boolean;
  /** A help button beside the label, as on RadioButton. */
  iconButtonProps?: IconButtonProps;
}

interface RadioGroupProps
  extends Omit<React.ComponentProps<typeof Column>, "onChange" | "defaultValue" | "children">,
    ControlChromeProps {
  /** One RadioButton per option, in order. RadioButton `children` render after them. */
  options?: RadioGroupOption[];
  /** The selected option's `value`, when the host owns the state. Pair with `onValueChange`. */
  value?: string;
  /** The option selected first when the group manages its own state. Without it, none is. */
  defaultValue?: string;
  /** Called with the newly selected `value`. Not called for the option already selected. */
  onValueChange?: (value: string) => void;
  /** Submitted with the selected `value` when the group is inside a form. */
  name?: string;
  /** Visible label that names the group. Without one, name it with `aria-label`. */
  label?: ReactNode;
  /** Helper text under the label, read out as the group's description. */
  description?: ReactNode;
  /** Disables every radio in the group. */
  disabled?: boolean;
  /** Stacks the radios (`vertical`) or lays them out in a wrapping row (`horizontal`). */
  orientation?: "horizontal" | "vertical";
  /**
   * RadioButtons with a `value`, in any layout: the escape hatch for radios
   * `options` cannot describe, such as radio cards in a Grid. The group owns
   * their checked state, `name`, `disabled` and focus.
   */
  children?: ReactNode;
}

// Layout effects warn during a server render; the roving focus only needs one in the browser.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** This group's own enabled radios, in DOM order; a nested group's radios are not ours. */
const enabledRadios = (group: HTMLElement): HTMLElement[] =>
  Array.from(group.querySelectorAll<HTMLElement>('[role="radio"][data-value]')).filter(
    (radio) =>
      radio.closest('[role="radiogroup"]') === group &&
      radio.getAttribute("aria-disabled") !== "true",
  );

/** Whether a node draws anything, so an empty label gets no element and no reference. */
const renders = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

/**
 * RadioGroup: one choice from a set of RadioButtons, as a single form field.
 *
 * Pass `options`, or RadioButton children for layouts options cannot describe.
 * The group is a `radiogroup` named by its `label` (or `aria-label`); only the
 * selected radio is in the page's Tab order, and the arrow keys move both
 * focus and the selection, wrapping at the ends, as native radios do.
 */
const RadioGroup = ({
  ref,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  label,
  description,
  disabled: disabledProp = false,
  orientation = "vertical",
  size,
  error,
  errorMessage,
  children,
  onKeyDown,
  ...flex
}: RadioGroupProps) => {
  const disabled = useFieldsetDisabled(disabledProp);
  const labelId = useId();
  const descriptionId = useId();
  const chrome = useControlChrome({ size, error, errorMessage });
  // Left to the theme's density, the radios are too.
  const fieldDefaults = useMemo(
    () => ({ size: chrome.auto ? undefined : chrome.size }),
    [chrome.auto, chrome.size],
  );
  const groupRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: onValueChange as ((next: string | undefined) => void) | undefined,
  });

  // Exactly one radio must be reachable with the Tab key: the selected one,
  // or the first enabled radio while none is selected (or the selected one is
  // disabled). Options give the answer for the server render; children are
  // only known once they are in the DOM.
  const [fallback, setFallback] = useState<string | undefined>(() => {
    if (!options || disabled) return undefined;
    const enabled = options.filter((option) => !option.disabled);
    return enabled.some((option) => option.value === current) ? undefined : enabled[0]?.value;
  });

  useIsomorphicLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const radios = enabledRadios(group);
    const reachable = radios.some((radio) => radio.getAttribute("aria-checked") === "true");
    const next = reachable ? undefined : radios[0]?.dataset.value;
    if (next !== fallback) setFallback(next);
  });

  const select = useCallback(
    (next: string) => {
      if (disabled || next === current) return;
      setCurrent(next);
    },
    [disabled, current, setCurrent],
  );

  const context = useMemo(
    () => ({
      value: current,
      name,
      disabled,
      tabbable: fallback ?? current,
      select,
      invalid: chrome.invalid,
    }),
    [current, name, disabled, fallback, select, chrome.invalid],
  );

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      groupRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const group = groupRef.current;
    if (event.defaultPrevented || !group) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const radios = enabledRadios(group);
    const index = radios.indexOf(event.target as HTMLElement);
    if (index === -1) return;

    // Native radios: Down and Right go to the next radio, Up and Left to the
    // previous one, whatever the layout; Left and Right swap in RTL.
    const rtl = group.closest("[dir]")?.getAttribute("dir") === "rtl";
    let delta: number;
    if (event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      delta = 1;
    } else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      delta = -1;
    } else {
      return;
    }

    event.preventDefault();
    const radio = radios[(index + delta + radios.length) % radios.length];
    radio.focus();
    // Selection follows focus, as in every radio group.
    const radioValue = radio.dataset.value;
    if (radioValue !== undefined) select(radioValue);
  };

  const hasLabel = renders(label);
  const hasDescription = renders(description);
  const named = flex["aria-label"] !== undefined || flex["aria-labelledby"] !== undefined;
  const radios = (
    <>
      {options?.map((option) => (
        <RadioButton
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
          iconButtonProps={option.iconButtonProps}
        />
      ))}
      {children}
    </>
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <Column
        gap="12"
        {...flex}
        ref={setRefs}
        role="radiogroup"
        // The visible label names the group, unless the caller named it
        // another way: aria-labelledby would override an aria-label.
        aria-labelledby={flex["aria-labelledby"] ?? (hasLabel && !named ? labelId : undefined)}
        aria-describedby={describedBy(
          flex["aria-describedby"] ?? (hasDescription ? descriptionId : undefined),
          chrome.showsError && chrome.errorId,
        )}
        aria-invalid={chrome.invalid || undefined}
        aria-orientation={orientation}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
      >
        {(hasLabel || hasDescription) && (
          <Column gap="4">
            {hasLabel && (
              <Text id={labelId} textVariant="label-strong-s" onBackground="neutral-strong">
                {label}
              </Text>
            )}
            {hasDescription && (
              <Text id={descriptionId} textVariant="body-default-s" onBackground="neutral-weak">
                {description}
              </Text>
            )}
          </Column>
        )}
        {/* The group's size reaches each radio the way a Form's does. */}
        <FormFieldContext.Provider value={fieldDefaults}>
          {orientation === "horizontal" ? (
            <Row gap="24" wrap>
              {radios}
            </Row>
          ) : (
            <Column gap="16">{radios}</Column>
          )}
        </FormFieldContext.Provider>
        {chrome.showsError && (
          <Text
            id={chrome.errorId}
            textVariant={CONTROL_TEXT[chrome.size].body}
            onBackground="danger-weak"
          >
            {errorMessage}
          </Text>
        )}
      </Column>
    </RadioGroupContext.Provider>
  );
};

RadioGroup.displayName = "RadioGroup";

export type { RadioGroupOption, RadioGroupProps };
export { RadioGroup };

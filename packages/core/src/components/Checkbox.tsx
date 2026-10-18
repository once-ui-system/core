"use client";

import classNames from "clsx";
import React, { useId } from "react";
import type { LeafProps } from "../interfaces.js";
import {
  type ControlChromeProps,
  describedBy,
  useControlChrome,
} from "../internal/controlChrome.js";
import { useFieldsetDisabled } from "../internal/fieldsetDisabled.js";
import { splitAria, useHiddenInput } from "../internal/hiddenInput.js";
import { useControllableState } from "../internal/useControllableState.js";
import { takeLeafProps } from "../utils/leafLayout.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails.js";
import styles from "./SharedInteractiveStyles.module.scss";

interface CheckboxProps
  extends LeafProps,
    Omit<
      InteractiveDetailsProps,
      "onClick" | "labelId" | "descriptionId" | "size" | "errorMessage" | "errorId"
    >,
    ControlChromeProps,
    // `onToggle` is the DOM's `toggle` event of popovers and `<details>`,
    // which an input never fires.
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "checked" | "defaultChecked" | "onToggle" | "size" | keyof LeafProps
    > {
  /** Ticked or not, controlled. Leave it out to let the checkbox keep its
   *  own state, starting from `defaultChecked`. */
  checked?: boolean;
  /** The starting state of an uncontrolled checkbox (no `checked`). */
  defaultChecked?: boolean;
  indeterminate?: boolean;
  /** Called with the state the checkbox moves to: `true` when it becomes
   *  ticked. */
  onCheckedChange?: (checked: boolean) => void;
  hoverable?: boolean;
}

const Checkbox = ({
  ref,
  style,
  className,
  checked: checkedProp,
  defaultChecked = false,
  indeterminate = false,
  onCheckedChange,
  onChange,
  onFocus,
  onBlur,
  disabled: disabledProp,
  hoverable = true,
  label,
  description,
  iconButtonProps,
  id,
  size: sizeProp,
  error,
  errorMessage,
  fillWidth,
  ...others
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const [leaf, rest] = takeLeafProps(others);
  const disabled = useFieldsetDisabled(disabledProp);
  const [isChecked, setIsChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const { setRef, activate, relay } = useHiddenInput(ref);
  const { aria, native } = splitAria(rest);
  const chrome = useControlChrome({ size: sizeProp, error, errorMessage });
  const labelId = useId();
  const descriptionId = useId();
  const hasLabel = Boolean(label);

  // Every change goes through the native input, so its `onChange` hears
  // the same event a plain checkbox would send.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setIsChecked(event.target.checked);
    onChange?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <Flex
      {...leaf}
      fillWidth={fillWidth}
      vertical="center"
      gap="16"
      className={classNames(styles.container, className, styles[chrome.size], {
        [styles.error]: chrome.invalid,
        [styles.disabled]: disabled,
        [styles.noHover]: !hoverable,
      })}
      style={style}
    >
      {/* Carries the value for form submission only. The box below is the
            control people reach, so this stays out of the accessibility tree
            rather than standing beside it as a second, unlabelled checkbox. */}
      <input
        {...native}
        type="checkbox"
        ref={setRef}
        aria-hidden="true"
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.hidden}
        tabIndex={-1}
      />
      <Flex
        style={{
          borderRadius: "min(var(--static-space-4), var(--radius-xs))",
        }}
        role="checkbox"
        tabIndex={0}
        cursor={disabled ? "not-allowed" : undefined}
        horizontal="center"
        vertical="center"
        radius="xs"
        aria-checked={indeterminate ? "mixed" : isChecked}
        {...aria}
        // Named by the label text alone (not the description or help
        // button beside it); `aria-label` only when there is no label.
        aria-labelledby={hasLabel ? labelId : undefined}
        aria-label={hasLabel ? undefined : (aria["aria-label"] as string | undefined)}
        aria-describedby={describedBy(
          hasLabel && description
            ? descriptionId
            : (aria["aria-describedby"] as string | undefined),
          chrome.showsError && chrome.errorId,
        )}
        aria-invalid={chrome.invalid || undefined}
        aria-disabled={disabled}
        onClick={disabled ? undefined : activate}
        onKeyDown={handleKeyDown}
        onFocus={relay(onFocus)}
        onBlur={relay(onBlur)}
        className={classNames(styles.element, {
          [styles.checked]: isChecked || indeterminate,
          [styles.disabled]: disabled,
        })}
      >
        {isChecked && !indeterminate && (
          <Flex className={styles.icon}>
            <Icon onSolid="brand-strong" name="checkbox" size="xs" />
          </Flex>
        )}
        {indeterminate && (
          <Flex className={styles.icon}>
            <Icon onSolid="brand-strong" name="minus" size="xs" />
          </Flex>
        )}
      </Flex>
      {(label || chrome.showsError) && (
        <InteractiveDetails
          disabled={disabled}
          label={label}
          description={description}
          iconButtonProps={iconButtonProps}
          id={id}
          labelId={labelId}
          descriptionId={descriptionId}
          size={chrome.size}
          errorMessage={chrome.showsError ? errorMessage : undefined}
          errorId={chrome.errorId}
          onClick={disabled ? () => {} : activate}
        />
      )}
    </Flex>
  );
};

Checkbox.displayName = "Checkbox";

export type { CheckboxProps };
export { Checkbox };

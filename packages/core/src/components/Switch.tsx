"use client";

import classNames from "clsx";
import React, { useId } from "react";
import type { LeafProps } from "../interfaces.js";
import {
  type ControlChromeProps,
  describedBy,
  useControlChrome,
} from "../internal/controlChrome.js";
import { splitAria, useHiddenInput } from "../internal/hiddenInput.js";
import { useControllableState } from "../internal/useControllableState.js";
import { takeLeafProps } from "../utils/leafLayout.js";
import { Flex } from "./Flex.js";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails.js";
import commonStyles from "./SharedInteractiveStyles.module.scss";
import { Spinner } from "./Spinner.js";
import styles from "./Switch.module.scss";

interface SwitchProps
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
  /** On or off, controlled. Leave it out to let the switch keep its own
   *  state, starting from `defaultChecked`. */
  checked?: boolean;
  /** The starting state of an uncontrolled switch (no `checked`). */
  defaultChecked?: boolean;
  loading?: boolean;
  name?: string;
  value?: string;
  disabled?: boolean;
  reverse?: boolean;
  /** Called with the state the switch moves to: `true` when it turns on. */
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = ({
  ref,
  className,
  style,
  checked: checkedProp,
  defaultChecked = false,
  reverse = false,
  loading = false,
  onCheckedChange,
  onChange,
  onFocus,
  onBlur,
  disabled,
  label,
  description,
  iconButtonProps,
  id,
  size: sizeProp,
  error,
  errorMessage,
  fillWidth,
  ...others
}: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const [leaf, rest] = takeLeafProps(others);
  const chrome = useControlChrome({ size: sizeProp, error, errorMessage });
  const labelId = useId();
  const descriptionId = useId();
  const hasLabel = Boolean(label);
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const { inputRef, setRef, activate, relay } = useHiddenInput(ref);
  const { aria, native } = splitAria(rest);
  const ariaLabel = (aria["aria-label"] as string | undefined) ?? "Toggle switch";

  // Every change goes through the native input, so its `onChange` hears
  // the same event a plain checkbox would send.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    setChecked(event.target.checked);
    onChange?.(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // The input's own click bubbles here too: it already changed.
    if (disabled || event.target === inputRef.current) return;
    activate();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      activate();
    }
  };

  return (
    <Flex
      {...leaf}
      gap="16"
      vertical="center"
      horizontal={reverse ? "between" : undefined}
      fillWidth={fillWidth ?? reverse}
      className={classNames(styles.container, className, styles[chrome.size], {
        [styles.auto]: chrome.auto,
        [styles.error]: chrome.invalid,
        [styles.reverse]: reverse,
        [styles.disabled]: disabled,
      })}
      style={style}
      onClick={handleClick}
    >
      {/* Carries the value for form submission only. The thumb below is the
            control people reach, so this stays out of the accessibility tree
            rather than standing beside it as a second, unnamed switch. */}
      <input
        {...native}
        ref={setRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className={commonStyles.hidden}
        tabIndex={-1}
        aria-hidden="true"
      />
      <Flex
        cursor={disabled ? "not-allowed" : undefined}
        className={classNames(styles.switch, {
          [styles.checked]: checked,
          [styles.disabled]: disabled,
        })}
      >
        {/* The element that takes focus is the switch. It is named by the
              visible label when there is one; `aria-label`
              only stands in when there is nothing on screen to point at. */}
        <div
          {...aria}
          role="switch"
          aria-checked={checked}
          aria-labelledby={hasLabel ? labelId : undefined}
          aria-label={hasLabel ? undefined : ariaLabel}
          aria-describedby={describedBy(
            hasLabel && description
              ? descriptionId
              : (aria["aria-describedby"] as string | undefined),
            chrome.showsError && chrome.errorId,
          )}
          aria-invalid={chrome.invalid || undefined}
          aria-disabled={disabled}
          onKeyDown={handleKeyDown}
          onFocus={relay(onFocus)}
          onBlur={relay(onBlur)}
          tabIndex={disabled ? -1 : 0}
          className={classNames(styles.element, {
            [styles.checked]: checked,
            [styles.disabled]: disabled,
          })}
        >
          {loading && <Spinner size="xs" />}
        </div>
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
          auto={chrome.auto}
          errorMessage={chrome.showsError ? errorMessage : undefined}
          errorId={chrome.errorId}
          onClick={() => {}}
        />
      )}
    </Flex>
  );
};

Switch.displayName = "Switch";

export { Switch };

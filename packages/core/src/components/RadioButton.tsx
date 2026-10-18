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
import { useRadioGroupItem } from "./RadioGroupContext.js";
import styles from "./SharedInteractiveStyles.module.scss";

interface RadioButtonProps
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
  /** Chosen or not, controlled. Leave it out to let the radio keep its own
   *  state, starting from `defaultChecked`. */
  checked?: boolean;
  /** The starting state of an uncontrolled radio (no `checked`). */
  defaultChecked?: boolean;
  name?: string;
  value?: string;
  disabled?: boolean;
  /** Called with the state the radio moves to: `true` when it becomes the
   *  chosen one. As with a native radio, picking it again does nothing. */
  onCheckedChange?: (checked: boolean) => void;
  hoverable?: boolean;
}

/** The chosen dot, per size: m is 2.x's 12. */
const DOT = { s: "8", m: "12", l: "16" } as const;

const RadioButton = ({
  ref,
  style,
  className,
  checked: checkedProp,
  defaultChecked = false,
  name: nameProp,
  value,
  onCheckedChange: onCheckedChangeProp,
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
}: RadioButtonProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const [leaf, rest] = takeLeafProps(others);
  // A RadioGroup around this button owns these; outside one, the props do.
  const {
    checked: groupChecked,
    name,
    onCheckedChange,
    disabled,
    invalid: groupInvalid,
    focusProps,
  } = useRadioGroupItem({
    value,
    checked: checkedProp,
    name: nameProp,
    disabled: disabledProp,
    onCheckedChange: onCheckedChangeProp,
  });

  const [isChecked, setIsChecked] = useControllableState({
    value: groupChecked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const { setRef, activate, relay } = useHiddenInput(ref);
  const { aria, native } = splitAria(rest);
  const chrome = useControlChrome({ size: sizeProp, error, errorMessage });
  // The group's error marks its radios; the group's message stays the group's.
  const invalid = chrome.invalid || groupInvalid;
  const labelId = useId();
  const descriptionId = useId();
  const hasLabel = Boolean(label);

  // Every change goes through the native input, so its `onChange` hears
  // the same event a plain radio would send.
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
      zIndex={1}
      className={classNames(styles.container, className, styles[chrome.size], {
        [styles.error]: invalid,
        [styles.disabled]: disabled,
        [styles.noHover]: !hoverable,
      })}
      style={style}
    >
      {/* Carries the value for form submission only. The circle below is
            the control people reach, so this stays out of the accessibility
            tree rather than standing beside it as a second, unlabelled radio. */}
      <input
        {...native}
        type="radio"
        ref={setRef}
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className={styles.hidden}
        tabIndex={-1}
        aria-hidden="true"
      />
      <Flex
        role="radio"
        {...aria}
        aria-checked={isChecked}
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
        aria-invalid={invalid || undefined}
        aria-disabled={disabled}
        horizontal="center"
        vertical="center"
        radius="full"
        onClick={disabled ? undefined : activate}
        onKeyDown={handleKeyDown}
        onFocus={relay(onFocus)}
        onBlur={relay(onBlur)}
        tabIndex={disabled ? -1 : 0}
        {...focusProps}
        cursor={disabled ? "not-allowed" : undefined}
        style={style}
        className={classNames(styles.element, {
          [styles.checked]: isChecked,
          [styles.disabled]: disabled,
        })}
      >
        {isChecked && (
          <Flex
            style={{
              backgroundColor: "var(--neutral-on-solid-strong)",
            }}
            radius="full"
            width={DOT[chrome.size]}
            height={DOT[chrome.size]}
            className={styles.icon}
          />
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

RadioButton.displayName = "RadioButton";

export type { RadioButtonProps };
export { RadioButton };

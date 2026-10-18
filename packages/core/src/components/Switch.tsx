"use client";

import classNames from "clsx";
import React, { forwardRef, useCallback, useId, useRef, useState } from "react";
import { assignRefs, retarget } from "../internal/toggleInput";
import { useControlLabel } from "./ControlLabelContext";
import { Flex } from "./Flex";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails";
import commonStyles from "./SharedInteractiveStyles.module.scss";
import { Spinner } from "./Spinner";
import styles from "./Switch.module.scss";

interface SwitchProps
  extends Omit<InteractiveDetailsProps, "onClick" | "labelId" | "descriptionId">,
    // `onToggle` is this component's own; the DOM's is the `toggle` event of
    // popovers and `<details>`, which an input never fires.
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onToggle"> {
  style?: React.CSSProperties;
  className?: string;
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
  ariaLabel?: string;
  /** Called with the state the switch moves to: `true` when it turns on.
   *  A callback that takes no argument still works. */
  onToggle?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      reverse = false,
      loading = false,
      onToggle,
      ariaLabel = "Toggle switch",
      "aria-label": nativeAriaLabel,
      disabled,
      name,
      value,
      label,
      description,
      iconButtonProps,
      id,
      onChange,
      onBlur,
      onFocus,
      ...inputProps
    },
    ref,
  ) => {
    const labelId = useId();
    // Inside a Setting row, the row's label names a switch that has none.
    const outerLabelId = useControlLabel();
    const descriptionId = useId();
    const hasLabel = Boolean(label);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => assignRefs(node, inputRef, ref),
      [ref],
    );
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const toggle = () => {
      if (disabled) return;
      const next = !checked;
      if (!isControlled) setUncontrolledChecked(next);
      onToggle?.(next);
    };

    // The switch clicks the hidden input, so its `change` event (and a
    // caller's `onChange`, e.g. react-hook-form's) fires with the new state.
    const activate = () => {
      if (disabled) return;
      if (inputRef.current) inputRef.current.click();
      else toggle();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      toggle();
      onChange?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        activate();
      }
    };

    return (
      <Flex
        gap="16"
        vertical="center"
        horizontal={reverse ? "between" : undefined}
        fillWidth={reverse}
        className={classNames(styles.container, className, {
          [styles.reverse]: reverse,
          [styles.disabled]: disabled,
        })}
        onClick={(event) => {
          // The input's own click bubbles up here; it has already toggled.
          if (event.target !== inputRef.current) activate();
        }}
      >
        {/* Carries the value for form submission only. The thumb below is the
            control people reach, so this stays out of the accessibility tree
            rather than standing beside it as a second, unnamed switch. */}
        <input
          {...inputProps}
          ref={setInputRef}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={handleInputChange}
          disabled={disabled}
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
              visible label when there is one; `aria-label` (or `ariaLabel`)
              only stands in when there is nothing on screen to point at. */}
          <div
            role="switch"
            aria-checked={checked}
            aria-labelledby={hasLabel ? labelId : nativeAriaLabel ? undefined : outerLabelId}
            aria-label={
              hasLabel || (!nativeAriaLabel && outerLabelId)
                ? undefined
                : (nativeAriaLabel ?? ariaLabel)
            }
            aria-describedby={hasLabel && description ? descriptionId : undefined}
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
            onFocus={onFocus && ((event) => onFocus(retarget(event, inputRef.current)))}
            onBlur={onBlur && ((event) => onBlur(retarget(event, inputRef.current)))}
            tabIndex={disabled ? -1 : 0}
            className={classNames(styles.element, {
              [styles.checked]: checked,
              [styles.disabled]: disabled,
            })}
          >
            {loading && <Spinner size="xs" />}
          </div>
        </Flex>
        {label && (
          <InteractiveDetails
            disabled={disabled}
            label={label}
            description={description}
            iconButtonProps={iconButtonProps}
            id={id}
            labelId={labelId}
            descriptionId={descriptionId}
            onClick={() => {}}
          />
        )}
      </Flex>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };

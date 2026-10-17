"use client";

import classNames from "clsx";
import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { assignRefs, retarget } from "../internal/toggleInput";
import { Flex } from "./Flex";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails";
import { useRadioGroupItem } from "./RadioGroupContext";
import styles from "./SharedInteractiveStyles.module.scss";

interface RadioButtonProps
  extends Omit<InteractiveDetailsProps, "onClick" | "labelId" | "descriptionId">,
    // `onToggle` is this component's own; the DOM's is the `toggle` event of
    // popovers and `<details>`, which an input never fires.
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onToggle"> {
  style?: React.CSSProperties;
  className?: string;
  /** Chosen or not, controlled. Leave it out to let the radio keep its own
   *  state, starting from `defaultChecked`. */
  checked?: boolean;
  /** The starting state of an uncontrolled radio (no `checked`). */
  defaultChecked?: boolean;
  name?: string;
  value?: string;
  disabled?: boolean;
  /** Called with the state the radio moves to: `true` when it becomes the
   *  chosen one. A callback that takes no argument still works. */
  onToggle?: (checked: boolean) => void;
  hoverable?: boolean;
}

const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  (
    {
      style,
      className,
      checked: checkedProp,
      defaultChecked = false,
      name: nameProp,
      value,
      onToggle: onToggleProp,
      disabled: disabledProp,
      hoverable = true,
      "aria-label": ariaLabel,
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
    // A RadioGroup around this button owns these; outside one, the props do.
    const {
      checked: controlledIsChecked,
      name,
      onToggle,
      disabled,
      focusProps,
    } = useRadioGroupItem({
      value,
      checked: checkedProp,
      name: nameProp,
      disabled: disabledProp,
      onToggle: onToggleProp,
    });

    const [isChecked, setIsChecked] = useState(controlledIsChecked ?? defaultChecked);
    const labelId = useId();
    const descriptionId = useId();
    const hasLabel = Boolean(label);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => assignRefs(node, inputRef, ref),
      [ref],
    );

    useEffect(() => {
      if (controlledIsChecked !== undefined) {
        setIsChecked(controlledIsChecked);
      }
    }, [controlledIsChecked]);

    const toggleItem = () => {
      if (disabled) return;
      const next = !(controlledIsChecked !== undefined ? controlledIsChecked : isChecked);
      // Uncontrolled, the radio keeps its own state whether or not anyone
      // listens; controlled, the caller's `checked` is the only truth.
      if (controlledIsChecked === undefined) setIsChecked(next);
      onToggle?.(next);
    };

    // Choosing the radio clicks the hidden input, so its `change` event (and a
    // caller's `onChange`, e.g. react-hook-form's) fires with the new state. A
    // chosen radio fires no `change` when clicked, so un-choosing stays direct.
    const activate = () => {
      if (disabled) return;
      const current = controlledIsChecked !== undefined ? controlledIsChecked : isChecked;
      if (inputRef.current && !current) inputRef.current.click();
      else toggleItem();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      toggleItem();
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
        vertical="center"
        gap="16"
        zIndex={1}
        className={classNames(styles.container, className, {
          [styles.disabled]: disabled,
          [styles.noHover]: !hoverable,
        })}
        style={style}
      >
        {/* Carries the value for form submission only. The circle below is
            the control people reach, so this stays out of the accessibility
            tree rather than standing beside it as a second, unlabelled radio. */}
        <input
          {...inputProps}
          type="radio"
          ref={setInputRef}
          name={name}
          value={value}
          checked={controlledIsChecked !== undefined ? controlledIsChecked : isChecked}
          onChange={handleInputChange}
          disabled={disabled}
          className={styles.hidden}
          tabIndex={-1}
          aria-hidden="true"
        />
        <Flex
          role="radio"
          aria-checked={controlledIsChecked !== undefined ? controlledIsChecked : isChecked}
          // Named by the label text alone (not the description or help
          // button beside it); `aria-label` only when there is no label.
          aria-labelledby={hasLabel ? labelId : undefined}
          aria-label={hasLabel ? undefined : ariaLabel}
          aria-describedby={hasLabel && description ? descriptionId : undefined}
          aria-disabled={disabled}
          horizontal="center"
          vertical="center"
          radius="full"
          onClick={activate}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          {...focusProps}
          onFocus={onFocus && ((event) => onFocus(retarget(event, inputRef.current)))}
          onBlur={onBlur && ((event) => onBlur(retarget(event, inputRef.current)))}
          cursor={disabled ? "not-allowed" : undefined}
          style={style}
          className={classNames(styles.element, {
            [styles.checked]: controlledIsChecked !== undefined ? controlledIsChecked : isChecked,
            [styles.disabled]: disabled,
          })}
        >
          {(controlledIsChecked !== undefined ? controlledIsChecked : isChecked) && (
            <Flex
              style={{
                backgroundColor: "var(--neutral-on-solid-strong)",
              }}
              radius="full"
              width="12"
              height="12"
              className={styles.icon}
            />
          )}
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
            onClick={activate}
          />
        )}
      </Flex>
    );
  },
);

RadioButton.displayName = "RadioButton";

export type { RadioButtonProps };
export { RadioButton };

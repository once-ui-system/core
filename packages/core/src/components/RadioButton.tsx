"use client";

import classNames from "clsx";
import React, { forwardRef, useId } from "react";
import { splitAria, useHiddenInput } from "../internal/hiddenInput";
import { useControllableState } from "../internal/useControllableState";
import { Flex } from "./Flex";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails";
import { useRadioGroupItem } from "./RadioGroupContext";
import styles from "./SharedInteractiveStyles.module.scss";

interface RadioButtonProps
  extends Omit<InteractiveDetailsProps, "onClick" | "labelId" | "descriptionId">,
    // `onToggle` is the DOM's `toggle` event of popovers and `<details>`,
    // which an input never fires.
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onToggle"> {
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
   *  chosen one. As with a native radio, picking it again does nothing. */
  onCheckedChange?: (checked: boolean) => void;
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
      ...rest
    },
    ref,
  ) => {
    // A RadioGroup around this button owns these; outside one, the props do.
    const {
      checked: groupChecked,
      name,
      onCheckedChange,
      disabled,
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
          aria-describedby={
            hasLabel && description
              ? descriptionId
              : (aria["aria-describedby"] as string | undefined)
          }
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
            onClick={disabled ? () => {} : activate}
          />
        )}
      </Flex>
    );
  },
);

RadioButton.displayName = "RadioButton";

export type { RadioButtonProps };
export { RadioButton };

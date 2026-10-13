"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useId, useState } from "react";
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
      ...props
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
    const hasLabel = Boolean(props.label);

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

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem();
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
          type="radio"
          ref={ref}
          name={name}
          value={value}
          checked={controlledIsChecked !== undefined ? controlledIsChecked : isChecked}
          onChange={toggleItem}
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
          aria-describedby={hasLabel && props.description ? descriptionId : undefined}
          aria-disabled={disabled}
          horizontal="center"
          vertical="center"
          radius="full"
          onClick={toggleItem}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          {...focusProps}
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
        {props.label && (
          <InteractiveDetails
            disabled={disabled}
            {...props}
            labelId={labelId}
            descriptionId={descriptionId}
            onClick={toggleItem}
          />
        )}
      </Flex>
    );
  },
);

RadioButton.displayName = "RadioButton";

export type { RadioButtonProps };
export { RadioButton };

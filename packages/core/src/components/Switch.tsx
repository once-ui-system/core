"use client";

import classNames from "clsx";
import React, { forwardRef, useId, useState } from "react";

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
      "aria-label": ariaLabel = "Toggle switch",
      disabled,
      name,
      value,
      ...props
    },
    ref,
  ) => {
    const labelId = useId();
    const descriptionId = useId();
    const hasLabel = Boolean(props.label);
    const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const toggle = () => {
      if (disabled) return;
      const next = !checked;
      if (!isControlled) setUncontrolledChecked(next);
      onToggle?.(next);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        toggle();
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
        onClick={toggle}
      >
        {/* Carries the value for form submission only. The thumb below is the
            control people reach, so this stays out of the accessibility tree
            rather than standing beside it as a second, unnamed switch. */}
        <input
          ref={ref}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          onChange={toggle}
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
            role="switch"
            aria-checked={checked}
            aria-labelledby={hasLabel ? labelId : undefined}
            aria-label={hasLabel ? undefined : ariaLabel}
            aria-describedby={hasLabel && props.description ? descriptionId : undefined}
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            className={classNames(styles.element, {
              [styles.checked]: checked,
              [styles.disabled]: disabled,
            })}
          >
            {loading && <Spinner size="xs" />}
          </div>
        </Flex>
        {props.label && (
          <InteractiveDetails
            disabled={disabled}
            {...props}
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

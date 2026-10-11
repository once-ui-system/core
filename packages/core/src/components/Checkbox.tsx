"use client";

import classNames from "clsx";
import React, { forwardRef, useEffect, useId, useState } from "react";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails";
import styles from "./SharedInteractiveStyles.module.scss";

interface CheckboxProps
  extends Omit<InteractiveDetailsProps, "onClick" | "labelId" | "descriptionId">,
    // `onToggle` is this component's own; the DOM's is the `toggle` event of
    // popovers and `<details>`, which an input never fires.
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "onToggle"> {
  /** Ticked or not, controlled. Leave it out to let the checkbox keep its
   *  own state, starting from `defaultChecked`. */
  checked?: boolean;
  /** The starting state of an uncontrolled checkbox (no `checked`). */
  defaultChecked?: boolean;
  indeterminate?: boolean;
  /** Called with the state the checkbox moves to: `true` when it becomes
   *  ticked. A callback that takes no argument still works. */
  onToggle?: (checked: boolean) => void;
  hoverable?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      style,
      className,
      checked: controlledIsChecked,
      defaultChecked = false,
      indeterminate = false,
      onToggle,
      disabled,
      hoverable = true,
      name,
      value,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
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
      // Uncontrolled, the checkbox keeps its own state whether or not anyone
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
        className={classNames(styles.container, className, {
          [styles.disabled]: disabled,
          [styles.noHover]: !hoverable,
        })}
        style={style}
      >
        {/* Carries the value for form submission only. The box below is the
            control people reach, so this stays out of the accessibility tree
            rather than standing beside it as a second, unlabelled checkbox. */}
        <input
          type="checkbox"
          ref={ref}
          name={name}
          value={value}
          aria-hidden="true"
          aria-checked={
            indeterminate
              ? "mixed"
              : controlledIsChecked !== undefined
                ? controlledIsChecked
                : isChecked
          }
          checked={controlledIsChecked !== undefined ? controlledIsChecked : isChecked}
          onChange={toggleItem}
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
          aria-checked={
            indeterminate
              ? "mixed"
              : controlledIsChecked !== undefined
                ? controlledIsChecked
                : isChecked
          }
          // Named by the label text alone (not the description or help
          // button beside it); `aria-label` only when there is no label.
          aria-labelledby={hasLabel ? labelId : undefined}
          aria-label={hasLabel ? undefined : ariaLabel}
          aria-describedby={hasLabel && props.description ? descriptionId : undefined}
          aria-disabled={disabled}
          onClick={toggleItem}
          onKeyDown={handleKeyDown}
          className={classNames(styles.element, {
            [styles.checked]:
              controlledIsChecked !== undefined ? controlledIsChecked || indeterminate : isChecked,
            [styles.disabled]: disabled,
          })}
        >
          {(controlledIsChecked !== undefined ? controlledIsChecked : isChecked) &&
            !indeterminate && (
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

Checkbox.displayName = "Checkbox";

export type { CheckboxProps };
export { Checkbox };

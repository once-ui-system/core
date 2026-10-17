"use client";

import classNames from "clsx";
import React, { forwardRef, useId } from "react";
import { splitAria, useHiddenInput } from "../internal/hiddenInput";
import { useControllableState } from "../internal/useControllableState";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { InteractiveDetails, InteractiveDetailsProps } from "./InteractiveDetails";
import styles from "./SharedInteractiveStyles.module.scss";

interface CheckboxProps
  extends Omit<InteractiveDetailsProps, "onClick" | "labelId" | "descriptionId">,
    // `onToggle` is the DOM's `toggle` event of popovers and `<details>`,
    // which an input never fires.
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onToggle"> {
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

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      style,
      className,
      checked: checkedProp,
      defaultChecked = false,
      indeterminate = false,
      onCheckedChange,
      onChange,
      onFocus,
      onBlur,
      disabled,
      hoverable = true,
      label,
      description,
      iconButtonProps,
      id,
      ...rest
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = useControllableState({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    });
    const { setRef, activate, relay } = useHiddenInput(ref);
    const { aria, native } = splitAria(rest);
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
          aria-describedby={
            hasLabel && description
              ? descriptionId
              : (aria["aria-describedby"] as string | undefined)
          }
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

Checkbox.displayName = "Checkbox";

export type { CheckboxProps };
export { Checkbox };

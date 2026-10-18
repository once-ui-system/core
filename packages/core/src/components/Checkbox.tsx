"use client";

import classNames from "clsx";
import React, { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { assignRefs, retarget } from "../internal/toggleInput";
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

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
      // Uncontrolled, the checkbox keeps its own state whether or not anyone
      // listens; controlled, the caller's `checked` is the only truth.
      if (controlledIsChecked === undefined) setIsChecked(next);
      onToggle?.(next);
    };

    // The box and label click the hidden input, so its `change` event (and a
    // caller's `onChange`, e.g. react-hook-form's) fires with the new state.
    const activate = () => {
      if (disabled) return;
      if (inputRef.current) inputRef.current.click();
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
          {...inputProps}
          type="checkbox"
          ref={setInputRef}
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
          onChange={handleInputChange}
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
          aria-describedby={hasLabel && description ? descriptionId : undefined}
          aria-disabled={disabled}
          onClick={activate}
          onKeyDown={handleKeyDown}
          onFocus={onFocus && ((event) => onFocus(retarget(event, inputRef.current)))}
          onBlur={onBlur && ((event) => onBlur(retarget(event, inputRef.current)))}
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

Checkbox.displayName = "Checkbox";

export type { CheckboxProps };
export { Checkbox };

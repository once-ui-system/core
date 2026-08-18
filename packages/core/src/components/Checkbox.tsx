"use client";

import { cva } from "class-variance-authority";
import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { forwardRef, useEffect, useId, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { InteractiveDetails, type InteractiveDetailsProps } from "./InteractiveDetails";

export const checkboxVariants = cva(
  "relative flex items-center justify-center w-20 h-20 min-w-20 min-h-20 rounded-xs border border-solid transition-colors duration-micro-medium outline-none",
  {
    variants: {
      checked: {
        true: "bg-brand-solid-medium border-brand-solid-medium text-brand-on-solid-strong shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--solid-inset-color-brand)]",
        false: "bg-surface border-neutral-border-medium",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
);

export interface CheckboxProps
  extends Omit<InteractiveDetailsProps, "onClick">,
    InputHTMLAttributes<HTMLInputElement> {
  isChecked?: boolean;
  isIndeterminate?: boolean;
  onToggle?: () => void;
  hoverable?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      style,
      className,
      isChecked: controlledIsChecked,
      isIndeterminate = false,
      onToggle,
      disabled = false,
      hoverable = true,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = useState(controlledIsChecked || false);
    const checkboxId = useId();

    useEffect(() => {
      if (controlledIsChecked !== undefined) {
        setIsChecked(controlledIsChecked);
      }
    }, [controlledIsChecked]);

    const toggleItem = () => {
      if (disabled) return;
      if (onToggle) {
        onToggle();
      } else {
        setIsChecked(!isChecked);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem();
      }
    };

    const isEffectiveChecked = controlledIsChecked !== undefined ? controlledIsChecked : isChecked;

    const containerClasses = cn(
      "group relative flex items-center gap-16 select-none isolate",
      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      className,
    );

    const elementClasses = cn(
      checkboxVariants({
        checked: isEffectiveChecked || isIndeterminate,
        disabled,
      }),
      hoverable &&
        !disabled && [
          "group-hover:before:content-[''] group-hover:before:absolute group-hover:before:top-1/2 group-hover:before:left-1/2 group-hover:before:-translate-x-1/2 group-hover:before:-translate-y-1/2 group-hover:before:w-40 group-hover:before:h-40 group-hover:before:bg-brand-alpha-medium group-hover:before:rounded-full group-hover:before:-z-10",
          "focus-visible:before:content-[''] focus-visible:before:absolute focus-visible:before:top-1/2 focus-visible:before:left-1/2 focus-visible:before:-translate-x-1/2 focus-visible:before:-translate-y-1/2 focus-visible:before:w-40 focus-visible:before:h-40 focus-visible:before:bg-brand-alpha-medium focus-visible:before:rounded-full focus-visible:before:-z-10",
        ],
    );

    return (
      <Flex vertical="center" gap="16" className={containerClasses} style={style}>
        <input
          type="checkbox"
          ref={ref}
          aria-checked={isIndeterminate ? "mixed" : isEffectiveChecked}
          checked={isEffectiveChecked}
          onChange={toggleItem}
          disabled={disabled}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
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
          aria-checked={isIndeterminate ? "mixed" : isEffectiveChecked}
          aria-labelledby={checkboxId}
          onClick={toggleItem}
          onKeyDown={handleKeyDown}
          className={elementClasses}
        >
          {isEffectiveChecked && !isIndeterminate && (
            <Flex className="scale-100 transition-transform">
              <Icon onSolid="brand-strong" name="checkbox" size="xs" />
            </Flex>
          )}
          {isIndeterminate && (
            <Flex className="scale-100 transition-transform">
              <Icon onSolid="brand-strong" name="minus" size="xs" />
            </Flex>
          )}
        </Flex>
        {props.label && (
          <InteractiveDetails disabled={disabled} id={checkboxId} {...props} onClick={toggleItem} />
        )}
      </Flex>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };

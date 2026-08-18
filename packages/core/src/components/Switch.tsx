"use client";

import { cva } from "class-variance-authority";
import type { InputHTMLAttributes, KeyboardEvent } from "react";
import { forwardRef, useEffect, useId, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";
import { InteractiveDetails, type InteractiveDetailsProps } from "./InteractiveDetails";
import { Spinner } from "./Spinner";

export const switchVariants = cva(
  "relative flex items-center w-40 min-w-40 h-24 rounded-l-nest-4 border border-solid transition-colors duration-micro-medium outline-none",
  {
    variants: {
      checked: {
        true: "bg-brand-solid-medium border-[color:var(--solid-border-color-brand)] group-hover:bg-brand-solid-strong shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--solid-inset-color-brand)]",
        false:
          "bg-neutral-solid-medium border-[color:var(--solid-border-color-neutral)] group-hover:bg-neutral-solid-strong shadow-[inset_0_0_0_var(--solid-inset-color-brand)]",
      },
      disabled: {
        true: "opacity-40 cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      checked: false,
      disabled: false,
    },
  },
);

export interface SwitchProps
  extends Omit<InteractiveDetailsProps, "onClick">,
    InputHTMLAttributes<HTMLInputElement> {
  isChecked?: boolean;
  onToggle?: () => void;
  loading?: boolean;
  reverse?: boolean;
  ariaLabel?: string;
  hoverable?: boolean;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      style,
      className,
      isChecked: controlledIsChecked,
      reverse = false,
      loading = false,
      onToggle,
      ariaLabel = "Toggle switch",
      disabled = false,
      hoverable = true,
      name,
      value,
      ...props
    },
    ref,
  ) => {
    const [isChecked, setIsChecked] = useState(controlledIsChecked || false);
    const switchId = useId();

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

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem();
      }
    };

    const isEffectiveChecked = controlledIsChecked !== undefined ? controlledIsChecked : isChecked;

    const containerClasses = cn(
      "group relative flex items-center gap-16 select-none isolate",
      reverse && "flex-row-reverse justify-between w-full",
      disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      className,
    );

    const switchTrackClasses = cn(
      switchVariants({
        checked: isEffectiveChecked,
        disabled,
      }),
    );

    const thumbClasses = cn(
      "z-[1] absolute top-1/2 -translate-y-1/2 w-16 h-16 rounded-l bg-brand-on-solid-strong flex items-center justify-center transition-all duration-300 outline-none group-active:-translate-y-1/2 group-active:scale-x-125",
      isEffectiveChecked ? "left-[calc(100%-20px)] origin-right" : "left-4 origin-left",
      hoverable &&
        !disabled && [
          !isEffectiveChecked &&
            "group-hover:before:content-[''] group-hover:before:absolute group-hover:before:top-1/2 group-hover:before:left-1/2 group-hover:before:-translate-x-1/2 group-hover:before:-translate-y-1/2 group-hover:before:w-40 group-hover:before:h-40 group-hover:before:bg-brand-alpha-medium group-hover:before:rounded-full group-hover:before:-z-10",
          "focus-visible:before:content-[''] focus-visible:before:absolute focus-visible:before:top-1/2 focus-visible:before:left-1/2 focus-visible:before:-translate-x-1/2 focus-visible:before:-translate-y-1/2 focus-visible:before:w-40 focus-visible:before:h-40 focus-visible:before:bg-brand-alpha-medium focus-visible:before:rounded-full focus-visible:before:-z-10",
        ],
    );

    return (
      <Flex
        vertical="center"
        gap="16"
        horizontal={reverse ? "between" : undefined}
        fillWidth={reverse}
        className={containerClasses}
        style={style}
      >
        <input
          type="checkbox"
          ref={ref}
          name={name}
          value={value}
          aria-checked={isEffectiveChecked}
          checked={isEffectiveChecked}
          onChange={toggleItem}
          disabled={disabled}
          className="absolute opacity-0 pointer-events-none w-0 h-0"
          tabIndex={-1}
        />
        <Flex
          role="switch"
          aria-checked={isEffectiveChecked}
          aria-label={props.label ? undefined : ariaLabel}
          aria-labelledby={props.label ? switchId : undefined}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          cursor={disabled ? "not-allowed" : undefined}
          onClick={toggleItem}
          onKeyDown={handleKeyDown}
          className={switchTrackClasses}
        >
          <div className={thumbClasses}>{loading && <Spinner size="xs" />}</div>
        </Flex>
        {props.label && (
          <InteractiveDetails disabled={disabled} id={switchId} {...props} onClick={toggleItem} />
        )}
      </Flex>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };

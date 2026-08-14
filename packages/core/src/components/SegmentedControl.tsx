"use client";

import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";
import { Scroller, type ScrollerProps } from "./Scroller";
import { ToggleButton, type ToggleButtonProps } from "./ToggleButton";

export interface ButtonOption extends Omit<ToggleButtonProps, "selected"> {
  value: string;
}

export interface SegmentedControlProps extends Omit<ScrollerProps, "onToggle"> {
  buttons: ButtonOption[];
  onToggle: (value: string, event?: MouseEvent<HTMLButtonElement>) => void;
  defaultSelected?: string;
  fillWidth?: boolean;
  selected?: string;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      buttons,
      onToggle,
      defaultSelected,
      fillWidth = true,
      selected,
      compact = false,
      className,
      style,
      ...scrollerProps
    },
    ref,
  ) => {
    const [internalSelected, setInternalSelected] = useState<string>(() => {
      if (selected !== undefined) return selected;
      if (defaultSelected !== undefined) return defaultSelected;
      return buttons[0]?.value || "";
    });

    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
      if (selected !== undefined) {
        setInternalSelected(selected);
      }
    }, [selected]);

    const handleButtonClick = (
      clickedButton: ButtonOption,
      event: MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation();
      const newSelected = clickedButton.value;
      setInternalSelected(newSelected);
      onToggle(newSelected, event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      const focusedIndex = buttonRefs.current.indexOf(document.activeElement as HTMLButtonElement);

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          event.preventDefault();
          const prevIndex =
            focusedIndex === -1
              ? buttons.length - 1
              : focusedIndex > 0
                ? focusedIndex - 1
                : buttons.length - 1;
          buttonRefs.current[prevIndex]?.focus();
          break;
        }
        case "ArrowRight":
        case "ArrowDown": {
          event.preventDefault();
          const nextIndex =
            focusedIndex === -1 ? 0 : focusedIndex < buttons.length - 1 ? focusedIndex + 1 : 0;
          buttonRefs.current[nextIndex]?.focus();
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < buttons.length) {
            const focusedButton = buttons[focusedIndex];
            setInternalSelected(focusedButton.value);
            onToggle(focusedButton.value);
          }
          break;
        }
        default:
          return;
      }
    };

    const selectedIndex = buttons.findIndex((button) => button.value === internalSelected);

    return (
      <Scroller
        ref={ref}
        direction="row"
        fillWidth={fillWidth}
        minWidth={0}
        {...scrollerProps}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        <Flex
          fillWidth={fillWidth}
          gap={compact ? "-1" : "2"}
          padding={compact ? "0" : "4"}
          radius="l"
          border={compact ? undefined : "neutral-alpha-weak"}
        >
          {buttons.map((button, index) => {
            const {
              value,
              onClick: buttonOnClick,
              style: buttonStyle,
              className: buttonClassName,
              ...buttonRest
            } = button;

            const isSelected = index === selectedIndex;

            return (
              <ToggleButton
                ref={(el) => {
                  buttonRefs.current[index] = el as HTMLButtonElement;
                }}
                variant={compact ? "outline" : "ghost"}
                radius={
                  compact
                    ? index === 0
                      ? "left"
                      : index === buttons.length - 1
                        ? "right"
                        : "none"
                    : undefined
                }
                key={value}
                selected={isSelected}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  buttonOnClick?.(event);
                  handleButtonClick(button, event);
                }}
                role="tab"
                className={cn(className, buttonClassName)}
                style={{
                  opacity: !isSelected && !compact ? 0.6 : 1,
                  ...style,
                  ...buttonStyle,
                }}
                aria-selected={isSelected}
                aria-controls={`panel-${value}`}
                tabIndex={isSelected ? 0 : -1}
                fillWidth={fillWidth}
                {...buttonRest}
              />
            );
          })}
        </Flex>
      </Scroller>
    );
  },
);

SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };

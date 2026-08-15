"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Flex, Scroller, ToggleButton, type ToggleButtonProps } from ".";

interface ButtonOption extends Omit<ToggleButtonProps, "selected"> {
  value: string;
}

interface SegmentedControlProps extends Omit<React.ComponentProps<typeof Scroller>, "onToggle"> {
  buttons: ButtonOption[];
  onToggle: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void;
  defaultSelected?: string;
  fillWidth?: boolean;
  selected?: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation();
      const newSelected = clickedButton.value;
      setInternalSelected(newSelected);
      onToggle(newSelected, event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const focusedIndex = buttonRefs.current.indexOf(document.activeElement as HTMLButtonElement);

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          event.preventDefault();
          const prevIndex =
            focusedIndex === -1
              ? buttons.length - 1 // If nothing is focused, focus the last item
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
            focusedIndex === -1
              ? 0 // If nothing is focused, focus the first item
              : focusedIndex < buttons.length - 1
                ? focusedIndex + 1
                : 0;
          buttonRefs.current[nextIndex]?.focus();
          break;
        }
        case "Enter":
        case " ": // Space key
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < buttons.length) {
            const focusedButton = buttons[focusedIndex];
            setInternalSelected(focusedButton.value);
            onToggle(focusedButton.value);
          }
          break;
        default:
          return;
      }
    };

    const selectedIndex = buttons.findIndex((button) => button.value === internalSelected);

    return (
      <Scroller
        direction="row"
        fillWidth={fillWidth}
        minWidth={0}
        {...scrollerProps}
        ref={ref}
        className={className}
        style={style}
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
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  buttonOnClick?.(event);
                  handleButtonClick(button, event);
                }}
                role="tab"
                className={buttonClassName}
                style={{
                  opacity: !isSelected && !compact ? 0.6 : 1,
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

export type { ButtonOption, SegmentedControlProps };
export { SegmentedControl };

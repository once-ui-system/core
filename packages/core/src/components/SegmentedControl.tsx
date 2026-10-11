"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { revealInStrip } from "../internal/reveal";
import { Flex } from "./Flex";
import { Scroller } from "./Scroller";
import { ToggleButton, ToggleButtonProps } from "./ToggleButton";

interface ButtonOption extends Omit<ToggleButtonProps, "selected"> {
  value: string;
}

interface SegmentedControlProps
  extends Omit<React.ComponentProps<typeof Scroller>, "onChange" | "defaultValue"> {
  buttons: ButtonOption[];
  onChange: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void;
  defaultValue?: string;
  fillWidth?: boolean;
  value?: string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      buttons,
      onChange,
      defaultValue,
      fillWidth = true,
      value,
      compact = false,
      className,
      style,
      // The tablist's name and description go to the tablist, below.
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...scrollerProps
    },
    ref,
  ) => {
    const [internalSelected, setInternalSelected] = useState<string>(() => {
      if (value !== undefined) return value;
      if (defaultValue !== undefined) return defaultValue;
      return buttons[0]?.value || "";
    });

    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
      if (value !== undefined) {
        setInternalSelected(value);
      }
    }, [value]);

    const handleButtonClick = (
      clickedButton: ButtonOption,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.stopPropagation();
      const newSelected = clickedButton.value;
      setInternalSelected(newSelected);
      onChange(newSelected, event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const focusedIndex = buttonRefs.current.findIndex((ref) => ref === document.activeElement);

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          const prevIndex =
            focusedIndex === -1
              ? buttons.length - 1 // If nothing is focused, focus the last item
              : focusedIndex > 0
                ? focusedIndex - 1
                : buttons.length - 1;
          buttonRefs.current[prevIndex]?.focus();
          break;
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          const nextIndex =
            focusedIndex === -1
              ? 0 // If nothing is focused, focus the first item
              : focusedIndex < buttons.length - 1
                ? focusedIndex + 1
                : 0;
          buttonRefs.current[nextIndex]?.focus();
          break;
        case "Enter":
        case " ": // Space key
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < buttons.length) {
            const focusedButton = buttons[focusedIndex];
            setInternalSelected(focusedButton.value);
            onChange(focusedButton.value);
          }
          break;
        default:
          return;
      }
    };

    const selectedIndex = buttons.findIndex((button) => button.value === internalSelected);

    // When the options scroll, the selected one is brought into view at mount
    // and on every change, rather than starting under the Next button. The
    // strip is the Scroller's scrolling row, which holds the buttons' row.
    useEffect(() => {
      const selected = buttonRefs.current[selectedIndex];
      if (!selected) return;
      revealInStrip(
        selected,
        selected.parentElement?.parentElement ?? null,
        document.activeElement === selected,
      );
    }, [selectedIndex]);

    return (
      <Scroller
        ref={ref}
        direction="row"
        fillWidth={fillWidth}
        minWidth={0}
        {...scrollerProps}
        onKeyDown={handleKeyDown}
      >
        {/* The tablist is the row of tabs, not the Scroller around it: once
            the options overflow, the Scroller also holds its scroll buttons,
            and a tablist may own only tabs. */}
        <Flex
          role="tablist"
          aria-orientation="horizontal"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          fillWidth={fillWidth}
          // Never narrower than its options: when they overflow, the border
          // goes round all of them and scrolls with them, instead of ending
          // at the edge of the strip with the last options outside it.
          style={{ minWidth: "max-content" }}
          gap={compact ? "-1" : "2"}
          padding={compact ? "0" : "4"}
          radius="l"
          border={compact ? undefined : "neutral-alpha-weak"}
        >
          {buttons.map((button, index) => {
            return (
              <ToggleButton
                ref={(el) => {
                  buttonRefs.current[index] = el as HTMLButtonElement;
                }}
                variant={compact ? "outline" : "ghost"}
                corners={
                  compact
                    ? index === 0
                      ? "left"
                      : index === buttons.length - 1
                        ? "right"
                        : "none"
                    : undefined
                }
                key={button.value}
                selected={index === selectedIndex}
                onClick={(event) => handleButtonClick(button, event)}
                role="tab"
                className={className}
                style={{ opacity: index !== selectedIndex && !compact ? 0.6 : 1, ...style }}
                aria-selected={index === selectedIndex}
                // No made-up `aria-controls`: it pointed at `panel-<value>`,
                // which nothing renders. A button that does control a panel
                // passes the panel's id as `aria-controls`, spread below.
                tabIndex={index === selectedIndex ? 0 : -1}
                fillWidth={fillWidth}
                {...button}
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

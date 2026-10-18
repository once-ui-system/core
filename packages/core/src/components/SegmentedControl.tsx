"use client";

import { useEffect, useRef } from "react";
import { revealInStrip } from "../internal/reveal.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Flex } from "./Flex.js";
import { Scroller } from "./Scroller.js";
import { ToggleButton, ToggleButtonProps } from "./ToggleButton.js";

interface ButtonOption extends Omit<ToggleButtonProps, "selected"> {
  value: string;
}

interface SegmentedControlProps
  extends Omit<React.ComponentProps<typeof Scroller>, "onChange" | "defaultValue"> {
  buttons: ButtonOption[];
  /** The selected button's `value`, controlled. Leave it out to let the
   *  control keep its own state, starting from `defaultValue`. */
  value?: string;
  /** The button selected first when uncontrolled. Without it, the first one. */
  defaultValue?: string;
  /** Called with the picked button's `value` (and the click, when it was one)
   *  on every pick. */
  onValueChange?: (value: string, event?: React.MouseEvent<HTMLButtonElement>) => void;
  /** Disables every button. */
  disabled?: boolean;
  fillWidth?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SegmentedControl = ({
  ref,
  buttons,
  onValueChange,
  defaultValue,
  disabled = false,
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
}: SegmentedControlProps) => {
  const [internalSelected, setInternalSelected] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? buttons[0]?.value ?? "",
  });

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (next: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    setInternalSelected(next);
    if (event) onValueChange?.(next, event);
    else onValueChange?.(next);
  };

  const handleButtonClick = (
    clickedButton: ButtonOption,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    pick(clickedButton.value, event);
  };

  /**
   * The next enabled segment from `from` in `direction`, wrapping. A disabled
   * button cannot take focus, so stepping onto one used to leave focus where
   * it was and every segment past it out of reach.
   */
  const enabledFrom = (from: number, direction: 1 | -1) => {
    for (let offset = 1; offset <= buttons.length; offset++) {
      const index = (from + direction * offset + buttons.length * offset) % buttons.length;
      if (!buttons[index]?.disabled) return index;
    }
    return -1;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = buttonRefs.current.findIndex((ref) => ref === document.activeElement);

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        // If nothing is focused, focus the last item
        buttonRefs.current[enabledFrom(focusedIndex === -1 ? 0 : focusedIndex, -1)]?.focus();
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        // If nothing is focused, focus the first item
        buttonRefs.current[
          enabledFrom(focusedIndex === -1 ? buttons.length - 1 : focusedIndex, 1)
        ]?.focus();
        break;
      case "Enter":
      case " ": // Space key
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < buttons.length) {
          const focusedButton = buttons[focusedIndex];
          if (!focusedButton.disabled) pick(focusedButton.value);
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
        {buttons.map(({ onClick, ...button }, index) => {
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
              // The option's own `onClick` runs as well; spread below, it
              // used to replace this one and the segment stopped selecting.
              onClick={(event) => {
                onClick?.(event);
                handleButtonClick({ ...button, onClick }, event);
              }}
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
              disabled={disabled || button.disabled}
            />
          );
        })}
      </Flex>
    </Scroller>
  );
};

SegmentedControl.displayName = "SegmentedControl";

export type { ButtonOption, SegmentedControlProps };
export { SegmentedControl };

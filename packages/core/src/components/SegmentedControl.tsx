"use client";

import classNames from "clsx";
import { type ReactNode, useEffect, useRef } from "react";
import { revealInStrip } from "../internal/revealInStrip.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Flex } from "./Flex.js";
import { Scroller } from "./Scroller.js";
import styles from "./SegmentedControl.module.scss";
import { Text } from "./Text.js";
import { ToggleButton, ToggleButtonProps } from "./ToggleButton.js";

interface ButtonOption extends Omit<ToggleButtonProps, "selected"> {
  value: string;
  /** A second, dimmer line under the label. The option grows to fit both. */
  description?: ReactNode;
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
  /**
   * What the segments are to assistive technology. `"tabs"` (the default) is
   * a tab strip: arrows move focus, Enter or Space selects. `"radio"` is one
   * choice from a set, for a setting rather than a view switch: a
   * `radiogroup` of `radio`s, where the arrows move focus and select, as
   * native radios do. Name it with `aria-label` or `aria-labelledby`.
   */
  semantics?: "tabs" | "radio";
  /**
   * `false` lays the options out in a plain row that shares the width (equally
   * with `fillWidth`) and truncates a label that does not fit, instead of a
   * strip that scrolls. For a narrow sidebar, where two or three options
   * scrolling behind a Next button clip the last one. Defaults to `true`.
   */
  scroll?: boolean;
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
  semantics = "tabs",
  scroll = true,
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

  const radio = semantics === "radio";

  /** Focus a segment; in a radio group, moving is choosing. */
  const moveTo = (index: number) => {
    buttonRefs.current[index]?.focus();
    const button = buttons[index];
    if (!radio || !button || button.value === internalSelected) return;
    pick(button.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const focusedIndex = buttonRefs.current.findIndex((ref) => ref === document.activeElement);

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        // If nothing is focused, focus the last item
        moveTo(enabledFrom(focusedIndex === -1 ? 0 : focusedIndex, -1));
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        // If nothing is focused, focus the first item
        moveTo(enabledFrom(focusedIndex === -1 ? buttons.length - 1 : focusedIndex, 1));
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

  const tablist = (
    <Flex
      role={radio ? "radiogroup" : "tablist"}
      aria-orientation={radio ? undefined : "horizontal"}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      fillWidth={fillWidth}
      // Scrolling, never narrower than its options: when they overflow, the
      // border goes round all of them and scrolls with them, instead of
      // ending at the edge of the strip with the last options outside it.
      // Not scrolling, it may shrink, and the options with it.
      style={scroll ? { minWidth: "max-content" } : { minWidth: 0 }}
      gap={compact ? "-1" : "2"}
      padding={compact ? "0" : "4"}
      radius="l"
      border={compact ? undefined : "neutral-alpha-weak"}
    >
      {buttons.map(({ onClick, description, ...button }, index) => {
        const content = button.label ?? button.children;
        // A description, or a label that may have to truncate, needs its own
        // box inside the button; a plain scrolling option, or an icon-only
        // one, renders as before.
        const wrapped =
          description !== undefined || (!scroll && content != null && content !== "") ? (
            <span
              className={styles.text}
              style={{
                alignItems:
                  button.horizontal === "start"
                    ? "flex-start"
                    : button.horizontal === "end"
                      ? "flex-end"
                      : "center",
              }}
            >
              <span className={styles.label}>{content}</span>
              {/* Between flex items the space draws nothing, and keeps the
                    two lines apart in the tab's name: "Fast Quick answers". */}
              {description !== undefined && " "}
              {description !== undefined && (
                <Text
                  as="span"
                  textVariant="body-default-xs"
                  onBackground="neutral-weak"
                  className={styles.label}
                >
                  {description}
                </Text>
              )}
            </span>
          ) : undefined;
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
            role={radio ? "radio" : "tab"}
            className={classNames(className, {
              [styles.shrink]: !scroll,
              [styles.share]: !scroll && fillWidth,
              [styles.twoLine]: description !== undefined,
            })}
            style={{ opacity: index !== selectedIndex && !compact ? 0.6 : 1, ...style }}
            aria-selected={radio ? undefined : index === selectedIndex}
            aria-checked={radio ? index === selectedIndex : undefined}
            // No made-up `aria-controls`: it pointed at `panel-<value>`,
            // which nothing renders. A button that does control a panel
            // passes the panel's id as `aria-controls`, spread below.
            tabIndex={index === selectedIndex ? 0 : -1}
            fillWidth={fillWidth}
            {...button}
            disabled={disabled || button.disabled}
            {...(wrapped && { label: wrapped, children: undefined })}
          />
        );
      })}
    </Flex>
  );

  if (!scroll) {
    // The Scroller's own props mean nothing without it.
    const { fadeColor: _fade, onItemClick: _item, labels: _labels, ...flexProps } = scrollerProps;
    return (
      <Flex ref={ref} fillWidth={fillWidth} minWidth={0} {...flexProps} onKeyDown={handleKeyDown}>
        {tablist}
      </Flex>
    );
  }

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
      {tablist}
    </Scroller>
  );
};

SegmentedControl.displayName = "SegmentedControl";

export type { ButtonOption, SegmentedControlProps };
export { SegmentedControl };

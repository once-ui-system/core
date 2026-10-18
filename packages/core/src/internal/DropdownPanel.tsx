"use client";

import React, { forwardRef, ReactNode, SyntheticEvent } from "react";
import { Column } from "../components/Column";
import { Row } from "../components/Row";

interface DropdownPanelProps extends Omit<React.ComponentProps<typeof Row>, "onSelect"> {
  selectedOption?: string;
  children?: ReactNode;
  onEscape?: () => void;
  onSelect?: (event: string) => void;
  disabled?: boolean;
}

/**
 * The panel a Dropdown's content sits in: the bordered surface, and selection
 * read from the `data-value` of what was clicked. Internal since 3.0, when the
 * name `Dropdown` went to the trigger-and-panel component (2.x
 * DropdownWrapper). For a panel of your own, use a Column with
 * `border="neutral-medium"` and `background="surface"`.
 */
const DropdownPanel = forwardRef<HTMLDivElement, DropdownPanelProps>(
  ({ selectedOption, className, children, onEscape, onSelect, disabled = false, ...flex }, ref) => {
    const handleSelect = (event: SyntheticEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Only handle clicks on elements that have a data-value attribute
      const target = event.target as HTMLElement;
      const value =
        target.getAttribute("data-value") ||
        target.closest("[data-value]")?.getAttribute("data-value");

      if (onSelect && value) {
        onSelect(value);
      }
    };

    return (
      <Row
        ref={ref}
        role="listbox"
        onClick={handleSelect}
        border="neutral-medium"
        background="surface"
        className={disabled ? "cursor-not-allowed" : undefined}
        style={{ opacity: disabled ? 0.6 : undefined }}
        // Only when it is: "false" is the default, and on a panel with no
        // role of its own (DropdownWrapper's is "none") the attribute would
        // still expose it, as an element the listbox around it cannot own.
        aria-disabled={disabled || undefined}
        {...flex}
      >
        <Column flex={1} overflowY="auto" gap="2">
          {children}
        </Column>
      </Row>
    );
  },
);

DropdownPanel.displayName = "DropdownPanel";

export type { DropdownPanelProps };
export { DropdownPanel };

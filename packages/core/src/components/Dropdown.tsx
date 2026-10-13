"use client";

import React, { forwardRef, ReactNode, SyntheticEvent } from "react";
import { Column } from "./Column";
import { Row } from "./Row";

interface DropdownProps extends Omit<React.ComponentProps<typeof Row>, "onSelect"> {
  selectedOption?: string;
  children?: ReactNode;
  onEscape?: () => void;
  onSelect?: (event: string) => void;
  disabled?: boolean;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
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

Dropdown.displayName = "Dropdown";

export type { DropdownProps };
export { Dropdown };

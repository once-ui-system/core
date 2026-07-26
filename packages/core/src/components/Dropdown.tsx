"use client";

import React, { ReactNode, forwardRef, SyntheticEvent } from "react";
import { Column, Row } from ".";

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
        aria-disabled={disabled}
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

export { Dropdown };
export type { DropdownProps };

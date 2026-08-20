"use client";

import { forwardRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cn } from "../classes/utils";
import { Column } from "./Column";
import { Row, type RowProps } from "./Row";

export interface DropdownProps extends Omit<RowProps, "onSelect"> {
  selectedOption?: string;
  children?: ReactNode;
  onEscape?: () => void;
  onSelect?: (event: string) => void;
  disabled?: boolean;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      selectedOption,
      className,
      children,
      onEscape,
      onSelect,
      disabled = false,
      border = "neutral-medium",
      background = "surface",
      onClick,
      onKeyDown,
      style,
      ...flex
    },
    ref,
  ) => {
    const handleSelect = (event: MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      // Only handle clicks on elements that have a data-value attribute
      const target = event.target as HTMLElement;
      const value =
        target.getAttribute("data-value") ||
        target.closest("[data-value]")?.getAttribute("data-value");

      if (onSelect && value) {
        onSelect(value);
      }

      onClick?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape" && onEscape) {
        onEscape();
      }
      onKeyDown?.(event);
    };

    return (
      <Row
        ref={ref}
        role="listbox"
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        border={border}
        background={background}
        cursor={disabled ? "not-allowed" : flex.cursor}
        className={cn(disabled && "cursor-not-allowed opacity-60", className)}
        style={style}
        aria-disabled={disabled}
        {...flex}
      >
        <Column fillWidth flex={1} overflowY="auto" gap="2">
          {children}
        </Column>
      </Row>
    );
  },
);

Dropdown.displayName = "Dropdown";

export { Dropdown };

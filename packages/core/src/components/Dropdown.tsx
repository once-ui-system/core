"use client";

import React, { ReactNode, forwardRef, SyntheticEvent } from "react";
import { Flex } from ".";

interface DropdownProps extends Omit<React.ComponentProps<typeof Flex>, "onSelect"> {
  selectedOption?: string;
  children?: ReactNode;
  onEscape?: () => void;
  onSelect?: (event: string) => void;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ selectedOption, className, children, onEscape, onSelect, ...rest }, ref) => {
    const handleSelect = (event: SyntheticEvent<HTMLDivElement>) => {
      // Only handle clicks on elements that have a data-value attribute
      const target = event.target as HTMLElement;
      const value = target.getAttribute("data-value") || target.closest('[data-value]')?.getAttribute("data-value");
      
      if (onSelect && value) {
        onSelect(value);
      }
    };

    return (
      <Flex
        ref={ref}
        role="listbox"
        onClick={handleSelect}
        flex={1}
        border="neutral-medium"
        background="surface"
        overflow="hidden"
        {...rest}
      >
        <Flex flex={1} overflowY="auto" direction="column" gap="2">
          {children}
        </Flex>
      </Flex>
    );
  },
);

Dropdown.displayName = "Dropdown";

export { Dropdown };
export type { DropdownProps };

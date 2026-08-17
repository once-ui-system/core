"use client";

import type { Placement } from "@floating-ui/react-dom";
import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
} from "react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { cn } from "../classes/utils";
import {
  ArrowNavigation,
  Column,
  DropdownWrapper,
  type DropdownWrapperProps,
  Flex,
  Icon,
  IconButton,
  Input,
  type InputProps,
  Option,
  type OptionProps,
  useArrowNavigationContext,
} from "./index";

export type SelectOptionType = Omit<OptionProps, "selected">;

export interface SelectProps
  extends Omit<InputProps, "onSelect" | "value">,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  options: SelectOptionType[];
  value?: string | string[];
  emptyState?: ReactNode;
  onSelect?: (value: string | string[]) => void;
  placement?: Placement;
  searchable?: boolean;
  className?: string;
  style?: CSSProperties;
  fillWidth?: boolean;
  multiple?: boolean;
}

interface SearchInputProps {
  searchInputId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsDropdownOpen: (open: boolean) => void;
  handleClearSearch: (e: MouseEvent) => void;
  handleBlur: (e: FocusEvent<HTMLInputElement>) => void;
  selectRef: RefObject<HTMLDivElement | null>;
}

// Inner component that uses the arrow navigation context
const SearchInput = ({
  searchInputId,
  searchQuery,
  setSearchQuery,
  setIsDropdownOpen,
  handleClearSearch,
  handleBlur,
  selectRef,
}: SearchInputProps) => {
  const { handleKeyDown: navKeyDown } = useArrowNavigationContext();

  return (
    <Input
      data-scaling="90"
      id={`select-search-${searchInputId}`}
      placeholder="Search"
      height="s"
      hasSuffix={
        searchQuery ? (
          <IconButton
            tooltip="Clear"
            tooltipPosition="left"
            icon="close"
            variant="ghost"
            size="s"
            onClick={handleClearSearch}
          />
        ) : undefined
      }
      hasPrefix={<Icon name="search" size="xs" />}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDropdownOpen(true);
      }}
      onFocus={(e) => {
        e.stopPropagation();
        setIsDropdownOpen(true);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        // Handle arrow keys and Enter for navigation
        if (["ArrowDown", "ArrowUp", "Enter", "Home", "End"].includes(e.key)) {
          navKeyDown(e as unknown as KeyboardEvent<HTMLElement>);
          return;
        }

        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(false);
          setSearchQuery("");
          const mainInput = selectRef.current?.querySelector("input:not([id^='select-search'])");
          if (mainInput instanceof HTMLInputElement) {
            mainInput.focus();
          }
        }
      }}
      onBlur={(e) => {
        const relatedTarget = e.relatedTarget as Node;
        const isClickInDropdown = selectRef.current?.contains(relatedTarget);
        if (!isClickInDropdown) {
          handleBlur(e);
        }
      }}
    />
  );
};

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value = "",
      onSelect,
      searchable = false,
      emptyState = "No results",
      minHeight,
      minWidth,
      maxWidth,
      placement,
      className,
      fillWidth = true,
      style,
      multiple = false,
      ...rest
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(multiple ? [] : value);

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchInputId = useId();
    const [searchQuery, setSearchQuery] = useState("");
    const selectRef = useRef<HTMLDivElement | null>(null);

    // Track if we should skip the next focus event
    const skipNextFocusRef = useRef(false);
    // Track if we just selected an option to prevent reopening
    const justSelectedRef = useRef(false);

    const handleFocus = () => {
      // Allow reopening the dropdown even after selection
      setIsDropdownOpen(true);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      // Don't close dropdown if focus is moving to an element within the select component
      if (selectRef.current && !selectRef.current.contains(event.relatedTarget as Node)) {
        // Only close if we're not moving to the dropdown or its children
        const isMovingToDropdown =
          event.relatedTarget && (event.relatedTarget as Element).closest("[data-dropdown]");

        if (!isMovingToDropdown) {
          setIsDropdownOpen(false);
        }
      }
    };

    const handleSelect = (selectedValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        const newValues = currentValues.includes(selectedValue)
          ? currentValues.filter((v) => v !== selectedValue)
          : [...currentValues, selectedValue];
        setInternalValue(newValues);
        onSelect?.(newValues);
      } else {
        setInternalValue(selectedValue);
        onSelect?.(selectedValue);
        setIsDropdownOpen(false);
      }
      justSelectedRef.current = true;
    };

    const handleClearSearch = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSearchQuery("");
      const input = selectRef.current?.querySelector("input");
      if (input) {
        input.focus();
      }
    };

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === currentValue) || null;

    // For multiple mode, get display text
    const getDisplayText = () => {
      if (multiple) {
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        if (selectedValues.length === 0) return "";
        if (selectedValues.length === 1) {
          const option = options.find((opt) => opt.value === selectedValues[0]);
          return String(option?.label || selectedValues[0]);
        }
        return `${selectedValues.length} options selected`;
      }
      return selectedOption?.label ? String(selectedOption.label) : "";
    };

    useEffect(() => {
      if (isDropdownOpen) {
        // Reset skip flag when dropdown opens
        skipNextFocusRef.current = false;

        // If searchable is true, focus the search input
        if (searchable) {
          setTimeout(() => {
            const searchInput = selectRef.current?.querySelector(
              `#select-search-${searchInputId}`,
            ) as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 0);
        }
      }
    }, [isDropdownOpen, searchable, searchInputId]);

    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
      searchable
        ? option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

    return (
      <DropdownWrapper
        fillWidth={fillWidth}
        minWidth={minWidth}
        maxWidth={maxWidth}
        ref={(node) => {
          selectRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        isOpen={isDropdownOpen}
        onOpenChange={setIsDropdownOpen}
        placement={placement}
        closeAfterClick={false}
        disableTriggerClick={true}
        style={style}
        trigger={
          <Input
            {...rest}
            style={{
              textOverflow: "ellipsis",
              ...style,
            }}
            cursor="interactive"
            value={getDisplayText()}
            onFocus={handleFocus}
            readOnly
            className={cn("w-full", className)}
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          />
        }
        dropdown={
          <Column fillWidth padding="4" data-dropdown="true">
            <ArrowNavigation
              layout="column"
              itemCount={filteredOptions.length}
              onSelect={(index) => {
                if (index >= 0 && index < filteredOptions.length) {
                  handleSelect(filteredOptions[index].value);
                }
              }}
              onEscape={() => setIsDropdownOpen(false)}
              autoFocus={!searchable}
              disabled={false}
            >
              {searchable && (
                <SearchInput
                  searchInputId={searchInputId}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setIsDropdownOpen={setIsDropdownOpen}
                  handleClearSearch={handleClearSearch}
                  handleBlur={handleBlur}
                  selectRef={selectRef}
                />
              )}

              <Column fillWidth paddingTop="4" gap="2">
                {filteredOptions.map((option) => (
                  <Option
                    key={option.value}
                    {...option}
                    onClick={() => {
                      option.onClick?.(option.value);
                      handleSelect(option.value);
                      setIsDropdownOpen(false);
                    }}
                    selected={
                      multiple
                        ? Array.isArray(currentValue) && currentValue.includes(option.value)
                        : option.value === currentValue
                    }
                    tabIndex={-1}
                    hasPrefix={
                      multiple ? (
                        Array.isArray(currentValue) && currentValue.includes(option.value) ? (
                          <Icon name="check" size="xs" onBackground="neutral-weak" />
                        ) : Array.isArray(currentValue) && currentValue.length > 0 ? (
                          <Flex minWidth="20" />
                        ) : undefined
                      ) : undefined
                    }
                  />
                ))}
                {searchQuery && filteredOptions.length === 0 && (
                  <Flex fillWidth center paddingX="16" paddingY="32">
                    {emptyState}
                  </Flex>
                )}
              </Column>
            </ArrowNavigation>
          </Column>
        }
      />
    );
  },
);

Select.displayName = "Select";

export { Select };

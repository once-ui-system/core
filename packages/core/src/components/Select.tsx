"use client";

import React, { useState, useRef, useEffect, forwardRef, ReactNode, useId } from "react";
import classNames from "classnames";
import {
  DropdownWrapper,
  Flex,
  Icon,
  IconButton,
  Input,
  InputProps,
  Option,
  OptionProps,
  DropdownWrapperProps,
  Column,
  ArrowNavigation,
  useArrowNavigationContext,
} from ".";
import inputStyles from "./Input.module.scss";
import { Placement } from "@floating-ui/react-dom";

type SelectOptionType = Omit<OptionProps, "selected">;

interface SelectProps
  extends Omit<InputProps, "onSelect" | "value">,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  options: SelectOptionType[];
  value?: string | string[];
  emptyState?: ReactNode;
  onSelect?: (value: any) => void;
  placement?: Placement;
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fillWidth?: boolean;
  multiple?: boolean;
}

// Inner component that uses the arrow navigation context
const SearchInput: React.FC<{
  searchInputId: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsDropdownOpen: (open: boolean) => void;
  handleClearSearch: (e: React.MouseEvent) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  selectRef: React.RefObject<HTMLDivElement | null>;
}> = ({
  searchInputId,
  searchQuery,
  setSearchQuery,
  setIsDropdownOpen,
  handleClearSearch,
  handleBlur,
  selectRef,
}) => {
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
      onKeyDown={(e) => {
        // Handle arrow keys and Enter for navigation
        if (["ArrowDown", "ArrowUp", "Enter", "Home", "End"].includes(e.key)) {
          navKeyDown(e as any);
          return;
        }
        
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(false);
          setSearchQuery("");
          const mainInput = selectRef.current?.querySelector(
            "input:not([id^='select-search'])",
          );
          if (mainInput instanceof HTMLInputElement) {
            mainInput.focus();
          }
        }
      }}
      onBlur={(e) => {
        const relatedTarget = e.relatedTarget as Node;
        const isClickInDropdown =
          selectRef.current && selectRef.current.contains(relatedTarget);
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
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(false);

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
    const clearButtonRef = useRef<HTMLButtonElement>(null);

    // Track if we should skip the next focus event
    const skipNextFocusRef = useRef(false);
    // Track if we just selected an option to prevent reopening
    const justSelectedRef = useRef(false);

    const handleFocus = () => {
      // Allow reopening the dropdown even after selection
      setIsFocused(true);
      setIsDropdownOpen(true);
      // Set highlighted index to first option or current selection
      const currentIndex = options.findIndex((option) =>
        multiple
          ? Array.isArray(currentValue) && currentValue.includes(option.value)
          : option.value === currentValue,
      );
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // Don't close dropdown if focus is moving to an element within the select component
      if (selectRef.current && !selectRef.current.contains(event.relatedTarget as Node)) {
        // Only close if we're not moving to the dropdown or its children
        const isMovingToDropdown =
          event.relatedTarget && (event.relatedTarget as Element).closest("[data-dropdown]");

        if (!isMovingToDropdown) {
          setIsFocused(false);
          setIsDropdownOpen(false);
        }
      }
    };

    const handleSelect = (value: string) => {
      if (multiple) {
        const currentValues = Array.isArray(currentValue) ? currentValue : [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        setInternalValue(newValues);
        onSelect?.(newValues);
      } else {
        setInternalValue(value);
        onSelect?.(value);
        setIsDropdownOpen(false);
      }
      justSelectedRef.current = true;
    };

    const handleClearSearch = (e: React.MouseEvent) => {
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
      } else {
        return selectedOption?.label ? String(selectedOption.label) : "";
      }
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
        style={{
          ...style,
        }}
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
            className={classNames("fill-width", {
              [inputStyles.filled]: isFilled,
              [inputStyles.focused]: isFocused,
              className,
            })}
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
                {filteredOptions.map((option, index) => (
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

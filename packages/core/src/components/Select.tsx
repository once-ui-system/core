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
} from ".";
import inputStyles from "./Input.module.scss";
import { Placement } from "@floating-ui/react-dom";

type SelectOptionType = Omit<OptionProps, "selected">;

interface SelectProps
  extends Omit<InputProps, "onSelect" | "value">,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  options: SelectOptionType[];
  value?: string;
  emptyState?: ReactNode;
  onSelect?: (value: string) => void;
  placement?: Placement;
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fillWidth?: boolean;
}

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
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isFilled, setIsFilled] = useState(false);
    
    const [internalValue, setInternalValue] = useState(value);
    
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(() => {
      if (!options?.length || !value) return null;
      return options.findIndex((option) => option.value === value);
    });
    const searchInputId = useId();
    const [searchQuery, setSearchQuery] = useState("");
    const selectRef = useRef<HTMLDivElement | null>(null);
    const clearButtonRef = useRef<HTMLButtonElement>(null);

    const handleFocus = () => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      setIsFocused(true);
      setIsDropdownOpen(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (selectRef.current && !selectRef.current.contains(event.relatedTarget as Node)) {
        setIsFocused(false);
        setIsDropdownOpen(false);
      }
    };

    const handleSelect = (value: string) => {
      setInternalValue(value);
      
      if (onSelect) onSelect(value);
      
      // Set flags to prevent reopening after selection
      justSelectedRef.current = true;
      skipNextFocusRef.current = true;
      
      // Close the dropdown and update state
      setIsDropdownOpen(false);
      setIsFilled(true);
      setSearchQuery(""); // Clear search query when an option is selected
      
      const index = options.findIndex(option => option.value === value);
      if (index !== -1) {
        setHighlightedIndex(index);
      }

      if (!searchable) {
        const input = selectRef.current?.querySelector("input");
        if (input instanceof HTMLInputElement) input.blur();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      
      if (!isDropdownOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        setIsDropdownOpen(true);
        return;
      }

      switch (event.key) {
        case "Escape":
          setIsDropdownOpen(false);
          // Keep focus on the input
          event.currentTarget.focus();
          break;

        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault();
          
          // If dropdown is closed, just open it without navigating
          if (!isDropdownOpen) {
            setIsDropdownOpen(true);
            return;
          }
          
          // If dropdown is open, navigate through options
          const filteredOptions = options.filter((option) =>
            searchable ? option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()) : true
          );
          
          if (filteredOptions.length === 0) return;
          
          if (event.key === "ArrowDown") {
            setHighlightedIndex((prevIndex) => {
              const newIndex =
                prevIndex === null || prevIndex >= filteredOptions.length - 1 ? 0 : prevIndex + 1;
              return newIndex;
            });
          } else {
            setHighlightedIndex((prevIndex) => {
              const newIndex =
                prevIndex === null || prevIndex <= 0 ? filteredOptions.length - 1 : prevIndex - 1;
              return newIndex;
            });
          }
          break;

        case "Enter":
          event.preventDefault();
          if (isDropdownOpen) {
            if (highlightedIndex !== null) {
              const filteredOptions = options.filter((option) =>
                searchable ? option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()) : true
              );
              
              if (filteredOptions.length > 0 && highlightedIndex < filteredOptions.length) {
                handleSelect(filteredOptions[highlightedIndex].value);
              }
            }
            setIsDropdownOpen(false);
          } else {
            setIsDropdownOpen(true);
          }
          break;

        default:
          break;
      }
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
    
    // Track if we just selected an option to prevent reopening
    const justSelectedRef = useRef(false);
    // Track if we should skip the next focus event
    const skipNextFocusRef = useRef(false);
    
    useEffect(() => {
      // Only focus the search input when the dropdown is first opened
      // and we didn't just select an option
      if (isDropdownOpen && searchable && !justSelectedRef.current) {
        const timeoutId = setTimeout(() => {
          // Don't focus if we're skipping the next focus event
          if (skipNextFocusRef.current) {
            skipNextFocusRef.current = false;
            return;
          }
          
          const searchInput = selectRef.current?.querySelector(`#select-search-${searchInputId}`);
          if (searchInput instanceof HTMLInputElement) {
            const scrollX = window.scrollX;
            const scrollY = window.scrollY;
            searchInput.focus();
            window.scrollTo(scrollX, scrollY);
          }
        }, 50);
        
        return () => clearTimeout(timeoutId);
      }
      
      // Reset flags when dropdown closes
      if (!isDropdownOpen) {
        justSelectedRef.current = false;
        skipNextFocusRef.current = false;
      }
    }, [isDropdownOpen, searchable, searchInputId]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // Check if click is inside the select component or its dropdown portal
        const isClickInsideSelect = selectRef.current && selectRef.current.contains(event.target as Node);
        const isClickInsideClearButton = clearButtonRef.current && clearButtonRef.current.contains(event.target as Node);
        
        // Check if click is inside any dropdown portal in the document
        // This handles clicks inside the dropdown that's rendered in the portal
        const isClickInsideDropdownPortal = !!document.querySelector('.dropdown-portal')?.contains(event.target as Node);
        
        if (!isClickInsideSelect && !isClickInsideClearButton && !isClickInsideDropdownPortal) {
          setIsDropdownOpen(false);
        }
      };

      const handleFocusOut = (event: FocusEvent) => {
        if (event.target instanceof HTMLInputElement) {
          handleBlur(event as unknown as React.FocusEvent<HTMLInputElement>);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("focusout", handleFocusOut);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("focusout", handleFocusOut);
      };
    }, []);

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
        style={{
          ...style
        }}
        trigger={
          <Input
            {...rest}
            style={{
              textOverflow: "ellipsis",
              ...style,
            }}
            cursor="interactive"
            value={selectedOption?.label ? String(selectedOption.label) : ""}
            onFocus={handleFocus}
            onClick={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
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
          <Column fillWidth padding="4">
            {searchable && (
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
                  if (e.key === "Escape") {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropdownOpen(false);
                    setSearchQuery("");
                    const mainInput = selectRef.current?.querySelector("input:not([id^='select-search'])");
                    if (mainInput instanceof HTMLInputElement) {
                      mainInput.focus();
                    }
                  } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const filteredOptions = options.filter((option) =>
                      option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    if (filteredOptions.length === 0) return;
                    
                    if (e.key === "ArrowDown") {
                      setHighlightedIndex((prevIndex) => {
                        const newIndex =
                          prevIndex === null || prevIndex >= filteredOptions.length - 1 ? 0 : prevIndex + 1;
                        return newIndex;
                      });
                    } else {
                      setHighlightedIndex((prevIndex) => {
                        const newIndex =
                          prevIndex === null || prevIndex <= 0 ? filteredOptions.length - 1 : prevIndex - 1;
                        return newIndex;
                      });
                    }
                  } else if (e.key === "Enter" && highlightedIndex !== null) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const filteredOptions = options.filter((option) =>
                      option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    
                    if (filteredOptions.length > 0 && highlightedIndex < filteredOptions.length) {
                      handleSelect(filteredOptions[highlightedIndex].value);
                    }
                  }
                }}
                onBlur={(e) => {
                  const relatedTarget = e.relatedTarget as Node;
                  const isClickInDropdown = selectRef.current && selectRef.current.contains(relatedTarget);
                  if (!isClickInDropdown) {
                    handleBlur(e);
                  }
                }}
              />
            )}
            <Column fillWidth padding="4" gap="2">
              {options
                .filter((option) =>
                  option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((option, index) => (
                  <Option
                    key={option.value}
                    {...option}
                    onClick={() => {
                      option.onClick?.(option.value);
                      handleSelect(option.value);
                      setIsDropdownOpen(false);
                    }}
                    selected={option.value === value}
                    highlighted={index === highlightedIndex}
                    tabIndex={-1}
                  />
                ))}
              {searchQuery &&
                options.filter((option) =>
                  option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase()),
                ).length === 0 && (
                  <Flex fillWidth center paddingX="16" paddingY="32">
                    {emptyState}
                  </Flex>
                )}
            </Column>
          </Column>
        }
      />
    );
  },
);

Select.displayName = "Select";
export { Select };

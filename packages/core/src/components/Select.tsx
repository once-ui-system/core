"use client";

import classNames from "clsx";
import type React from "react";
import { forwardRef, type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import type { Placement } from "../types";
import { Column } from "./Column";
import {
  DropdownComboboxContext,
  DropdownTriggerContext,
  useDropdownCombobox,
} from "./DropdownTriggerContext";
import { DropdownWrapper, type DropdownWrapperProps } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import inputStyles from "./Input.module.scss";
import { Option, type OptionProps } from "./Option";

type SelectOptionType = Omit<OptionProps, "selected">;

interface SelectProps
  extends Omit<InputProps, "onSelect" | "value">,
    Pick<DropdownWrapperProps, "minHeight" | "minWidth" | "maxWidth"> {
  options: SelectOptionType[];
  value?: string | string[];
  emptyState?: ReactNode;
  onSelect?: (value: string | string[]) => void;
  placement?: Placement;
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fillWidth?: boolean;
  multiple?: boolean;
}

/**
 * The field: a combobox, which keeps focus while its list is open and points
 * at the active option with `aria-activedescendant`.
 *
 * Its own component because it has to render inside DropdownWrapper's trigger
 * to report that option to the panel, which keeps it scrolled into view. It
 * also hides the trigger context from what it contains, so a Button in its
 * prefix or suffix stays a plain control instead of announcing the list too.
 */
const SelectField = forwardRef<HTMLInputElement, InputProps & { activeIndex: number }>(
  ({ activeIndex, ...props }, ref) => {
    useDropdownCombobox(activeIndex);
    return (
      <DropdownTriggerContext.Provider value={null}>
        <Input ref={ref} {...props} />
      </DropdownTriggerContext.Provider>
    );
  },
);

SelectField.displayName = "SelectField";

/**
 * The query field of a searchable Select, at the top of the open panel. It is
 * a combobox of its own over the same listbox: typing filters it, and the
 * list keys move the active option while focus stays here, so the query can
 * be refined at any point.
 */
const SearchInput = forwardRef<
  HTMLInputElement,
  {
    id: string;
    searchQuery: string;
    onQueryChange: (query: string) => void;
    onOpen: () => void;
    onClear: (e: React.MouseEvent) => void;
    onEscape: () => void;
    onListKey: (e: React.KeyboardEvent<HTMLInputElement>) => boolean;
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    selectRef: React.RefObject<HTMLDivElement | null>;
    listboxId: string;
    activeOptionId?: string;
  }
>(
  (
    {
      id,
      searchQuery,
      onQueryChange,
      onOpen,
      onClear,
      onEscape,
      onListKey,
      handleBlur,
      selectRef,
      listboxId,
      activeOptionId,
    },
    ref,
  ) => (
    <Input
      ref={ref}
      data-scaling="90"
      id={id}
      placeholder="Search"
      aria-label="Search"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded
      aria-controls={listboxId}
      aria-activedescendant={activeOptionId}
      size="s"
      suffix={
        searchQuery ? (
          <IconButton
            tooltip="Clear"
            tooltipPosition="left"
            icon="close"
            variant="ghost"
            size="s"
            onClick={onClear}
          />
        ) : undefined
      }
      prefix={<Icon name="search" size="xs" />}
      value={searchQuery}
      onChange={(e) => onQueryChange(e.target.value)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onOpen();
      }}
      onFocus={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onKeyDown={(e) => {
        if (onListKey(e)) return;

        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          onEscape();
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
  ),
);

SearchInput.displayName = "SearchInput";

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
    /**
     * Focus for the whole control, not the trigger.
     *
     * Opening the dropdown moves focus off the trigger and into the menu, so
     * the trigger's own blur fires mid-interaction with `relatedTarget` inside
     * the dropdown — which the handler below correctly ignores, leaving any
     * state keyed to the trigger stuck on. Capture-phase listeners on the
     * wrapper see focus enter and leave the control as a whole, which is the
     * thing a focus ring should actually track.
     */
    const [isFocused, setIsFocused] = useState(false);

    const [internalValue, setInternalValue] = useState(multiple ? [] : value);

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchInputId = useId();
    const baseId = useId();
    const listboxId = `${baseId}-listbox`;
    const optionIdPrefix = `${baseId}-option-`;
    const [searchQuery, setSearchQuery] = useState("");
    /**
     * The option the list keys have moved to, as an index into the filtered
     * options; null until they move, which means "where the list opens" (see
     * `openIndex`). Reset on every open and every change to the query.
     */
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const selectRef = useRef<HTMLDivElement | null>(null);
    const fieldRef = useRef<HTMLInputElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    /**
     * Set while focus is on its way back to the trigger from a dropdown that
     * just closed.
     *
     * Closing hands focus back to the field (DropdownWrapper and FocusTrap
     * both restore it), and the field opens on focus, so every pick, Escape
     * and outside click reopened the list it had just closed. This replaced
     * a `justSelectedRef` that was written on every pick and never read.
     *
     * The flag is consumed by that returning focus. If focus goes elsewhere
     * instead, the next key or pointer press anywhere clears it, so a later
     * Tab or click into the field still opens it. Those listeners exist only
     * while the flag is set, and they are added after the press that closed
     * the list has passed the document, so that press cannot clear it.
     */
    const returningFocusRef = useRef(false);
    const stopExpectingFocusRef = useRef<(() => void) | null>(null);
    const isOpenRef = useRef(isDropdownOpen);
    isOpenRef.current = isDropdownOpen;

    const expectReturningFocus = useCallback(() => {
      stopExpectingFocusRef.current?.();
      returningFocusRef.current = true;
      const stop = () => {
        returningFocusRef.current = false;
        stopExpectingFocusRef.current = null;
        document.removeEventListener("keydown", stop, true);
        document.removeEventListener("pointerdown", stop, true);
      };
      document.addEventListener("keydown", stop, true);
      document.addEventListener("pointerdown", stop, true);
      stopExpectingFocusRef.current = stop;
    }, []);

    useEffect(() => () => stopExpectingFocusRef.current?.(), []);

    /** Every open and close goes through here, so no close path can miss the flag. */
    const setOpen = useCallback(
      (open: boolean) => {
        if (!open && isOpenRef.current) {
          expectReturningFocus();
        }
        if (open !== isOpenRef.current) {
          setActiveIndex(null);
        }
        setIsDropdownOpen(open);
      },
      [expectReturningFocus],
    );

    const handleFocus = () => {
      if (returningFocusRef.current) {
        stopExpectingFocusRef.current?.();
        return;
      }
      setOpen(true);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      // Don't close dropdown if focus is moving to an element within the select component
      if (selectRef.current && !selectRef.current.contains(event.relatedTarget as Node)) {
        // Only close if we're not moving to the dropdown or its children
        const isMovingToDropdown =
          event.relatedTarget && (event.relatedTarget as Element).closest("[data-dropdown]");

        if (!isMovingToDropdown) {
          setOpen(false);
        }
      }
    };

    /**
     * Focus leaves this control without ever firing a blur it can hear.
     *
     * Picking an option moves focus onto a button inside the dropdown, and
     * closing the menu removes that button from the document — and removing a
     * focused element fires no `focusout`, it just resets focus to `body`.
     * Traced in Chromium: `focusin INPUT`, `focusout INPUT -> BUTTON`, and then
     * nothing at all while `document.activeElement` quietly became `BODY`. A
     * blur listener, on the trigger or on the wrapper, cannot see that.
     *
     * So the exit is watched at the document instead, on the two events that do
     * fire: focus landing somewhere else, and a pointer going down somewhere
     * else. Only mounted while focused, so an unfocused Select costs nothing.
     */
    useEffect(() => {
      if (!isFocused) return;
      const leaveIfOutside = (event: Event) => {
        const target = event.target as Node | null;
        if (target && selectRef.current?.contains(target)) return;
        setIsFocused(false);
      };
      document.addEventListener("focusin", leaveIfOutside);
      document.addEventListener("pointerdown", leaveIfOutside);
      return () => {
        document.removeEventListener("focusin", leaveIfOutside);
        document.removeEventListener("pointerdown", leaveIfOutside);
      };
    }, [isFocused]);

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
        setOpen(false);
      }
    };

    const handleQueryChange = (query: string) => {
      setSearchQuery(query);
      setActiveIndex(null);
    };

    const handleClearSearch = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleQueryChange("");
      // Back to the query field the button sits in, to type the next query.
      searchRef.current?.focus();
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
        // If searchable is true, focus the search input
        if (searchable) {
          setTimeout(() => {
            searchRef.current?.focus();
          }, 0);
        }
      }
    }, [isDropdownOpen, searchable]);

    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
      searchable
        ? option.label?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    );

    const isSelected = (option: SelectOptionType) =>
      multiple
        ? Array.isArray(currentValue) && currentValue.includes(option.value)
        : option.value === currentValue;

    /**
     * What leads an option: the check mark a multiple Select adds (or a
     * spacer the mark's width, once something is checked), then the option's
     * own prefix. The option's prefix used to be overwritten in both modes,
     * so a swatch or icon set on an option never showed.
     */
    const optionPrefix = (option: SelectOptionType) => {
      const mark = !multiple ? undefined : isSelected(option) ? (
        <Icon name="check" size="xs" onBackground="neutral-weak" />
      ) : Array.isArray(currentValue) && currentValue.length > 0 ? (
        <Flex minWidth="20" />
      ) : undefined;
      if (!mark || !option.prefix) return mark ?? option.prefix;
      return (
        <Flex gap="8" vertical="center">
          {mark}
          {option.prefix}
        </Flex>
      );
    };

    /**
     * Where the list opens: on the option it is already showing, else on its
     * first enabled one — the rule DropdownWrapper applies to every list.
     */
    const openIndex = () => {
      const selected = filteredOptions.findIndex(
        (option) => !option.disabled && isSelected(option),
      );
      return selected >= 0 ? selected : filteredOptions.findIndex((option) => !option.disabled);
    };

    const currentActive = !isDropdownOpen
      ? -1
      : activeIndex !== null && activeIndex < filteredOptions.length
        ? activeIndex
        : openIndex();
    const optionId = (index: number) => `${optionIdPrefix}${index}`;
    const activeOptionId = currentActive >= 0 ? optionId(currentActive) : undefined;

    /** The next enabled option from `from`, `step` at a time, wrapping round. */
    const nextEnabled = (from: number, step: 1 | -1) => {
      const count = filteredOptions.length;
      for (let n = 1; n <= count; n++) {
        const index = (((from + step * n) % count) + count) % count;
        if (!filteredOptions[index].disabled) return index;
      }
      return from;
    };

    const pick = (index: number) => {
      const option = filteredOptions[index];
      if (!option || option.disabled) return;
      option.onClick?.(option.value);
      handleSelect(option.value);
    };

    /**
     * The keys both fields share: they open the list, move its active option
     * and pick it, while focus stays in the field. Returns whether the key
     * was one of them.
     */
    const handleListKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;
      if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") {
        if (key !== "Enter") return false;
        event.preventDefault();
        if (!isDropdownOpen) setOpen(true);
        else if (currentActive >= 0) pick(currentActive);
        return true;
      }

      event.preventDefault();
      if (!isDropdownOpen) {
        setOpen(true);
        return true;
      }
      if (filteredOptions.length === 0) return true;
      if (key === "Home") setActiveIndex(nextEnabled(-1, 1));
      else if (key === "End") setActiveIndex(nextEnabled(filteredOptions.length, -1));
      else setActiveIndex(nextEnabled(currentActive, key === "ArrowDown" ? 1 : -1));
      return true;
    };

    const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      rest.onKeyDown?.(event);
      if (handleListKey(event)) return;

      if (event.key === " ") {
        // The field is read-only: Space opens it, then picks, as Enter does.
        event.preventDefault();
        if (!isDropdownOpen) setOpen(true);
        else if (currentActive >= 0) pick(currentActive);
      } else if (event.key === "Escape" && isDropdownOpen) {
        event.preventDefault();
        // Closes this list only, not a dialog it sits in.
        event.stopPropagation();
        setOpen(false);
      }
    };

    /** The listbox's name: the field's own. */
    const listboxLabel = rest["aria-label"] || rest.label || rest.placeholder || "Options";

    return (
      // Tells the wrapper its trigger is a combobox: no `role="button"` around
      // the field, and focus stays in it (see DropdownComboboxContext).
      <DropdownComboboxContext.Provider value={true}>
        <DropdownWrapper
          fillWidth={fillWidth}
          minWidth={minWidth}
          maxWidth={maxWidth}
          ref={(node) => {
            selectRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          onFocusCapture={() => setIsFocused(true)}
          open={isDropdownOpen}
          onOpenChange={setOpen}
          placement={placement}
          closeAfterClick={false}
          disableTriggerClick={true}
          style={{
            ...style,
          }}
          trigger={
            <SelectField
              {...rest}
              ref={fieldRef}
              activeIndex={currentActive}
              style={{
                textOverflow: "ellipsis",
                ...style,
              }}
              cursor="interactive"
              value={getDisplayText()}
              onFocus={handleFocus}
              // Focus alone cannot reopen a field that already has it: after a
              // pick, focus is back on the field with the list closed, and a
              // click there fires no focus event.
              onClick={(event: React.MouseEvent<HTMLInputElement>) => {
                rest.onClick?.(event);
                setOpen(true);
              }}
              onKeyDown={handleFieldKeyDown}
              readOnly
              // `{ className }` in the object put the literal string "className"
              // on the element when the prop was truthy and dropped the caller's
              // class entirely. It is a value, not a condition.
              className={classNames("fill-width", className, isFocused && inputStyles.focused)}
              role="combobox"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-controls={isDropdownOpen ? listboxId : undefined}
              aria-activedescendant={activeOptionId}
            />
          }
          dropdown={
            <Column fillWidth padding="4" data-dropdown="true">
              {searchable && (
                <SearchInput
                  ref={searchRef}
                  id={`select-search-${searchInputId}`}
                  searchQuery={searchQuery}
                  onQueryChange={handleQueryChange}
                  onOpen={() => setOpen(true)}
                  onClear={handleClearSearch}
                  onEscape={() => {
                    setOpen(false);
                    handleQueryChange("");
                    fieldRef.current?.focus();
                  }}
                  onListKey={handleListKey}
                  handleBlur={handleBlur}
                  selectRef={selectRef}
                  listboxId={listboxId}
                  activeOptionId={activeOptionId}
                />
              )}

              <Column
                id={listboxId}
                role="listbox"
                aria-label={listboxLabel}
                aria-multiselectable={multiple || undefined}
                fillWidth
                paddingTop="4"
                gap="2"
                // The highlight follows the pointer, as it did when the options
                // took focus, so the active option is the one under it.
                onMouseOver={(event: React.MouseEvent<HTMLDivElement>) => {
                  const option = (event.target as Element).closest('[role="option"]');
                  if (!option?.id.startsWith(optionIdPrefix)) return;
                  const index = Number(option.id.slice(optionIdPrefix.length));
                  if (index !== currentActive && !filteredOptions[index]?.disabled) {
                    setActiveIndex(index);
                  }
                }}
              >
                {filteredOptions.map((option, index) => (
                  <Option
                    key={option.value}
                    {...option}
                    id={optionId(index)}
                    // handleSelect closes a single Select. A multiple one stays
                    // open to pick more, as it already did from the keyboard;
                    // a click used to close it too, and only looked open
                    // because the returning focus reopened it at once.
                    onClick={() => {
                      option.onClick?.(option.value);
                      handleSelect(option.value);
                    }}
                    selected={isSelected(option)}
                    highlighted={index === currentActive}
                    tabIndex={-1}
                    prefix={optionPrefix(option)}
                  />
                ))}
              </Column>
              {searchQuery && filteredOptions.length === 0 && (
                <Flex fillWidth center paddingX="16" paddingY="32">
                  {emptyState}
                </Flex>
              )}
            </Column>
          }
        />
      </DropdownComboboxContext.Provider>
    );
  },
);

Select.displayName = "Select";

export { Select };

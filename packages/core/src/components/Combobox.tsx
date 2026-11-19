"use client";

import classNames from "clsx";
import type React from "react";
import { type ReactNode, useCallback, useId, useRef, useState } from "react";
import { mergeLabels } from "../internal/labels.js";
import { useControllableState } from "../internal/useControllableState.js";
import type { Placement } from "../types.js";
import { Column } from "./Column.js";
import { Dropdown, type DropdownProps } from "./Dropdown.js";
import {
  DropdownComboboxContext,
  DropdownTriggerContext,
  useDropdownCombobox,
} from "./DropdownTriggerContext.js";
import { Flex } from "./Flex.js";
import { Input, type InputProps } from "./Input.js";
import { Option, type OptionProps } from "./Option.js";
import { Row } from "./Row.js";
import { Spinner } from "./Spinner.js";
import { Text } from "./Text.js";

/** A suggestion. Its text is `label` when that is a string, else `value`. */
type ComboboxOption = Omit<OptionProps, "selected" | "highlighted" | "onClick" | "href">;

/** The Combobox's own words, for a translated interface. */
interface ComboboxLabels {
  /** Read out and shown while `loading`. Defaults to `"Loading…"`. */
  loading?: string;
}

const DEFAULT_LABELS: Required<ComboboxLabels> = { loading: "Loading…" };

interface ComboboxProps
  extends Omit<
      InputProps,
      "value" | "defaultValue" | "onChange" | "onValueChange" | "onSelect" | "children"
    >,
    Pick<DropdownProps, "minHeight" | "minWidth" | "maxWidth"> {
  /** The suggestions. Typing filters them unless `filter` is false. */
  options: ComboboxOption[];
  /** The field's text, controlled. Any text is a value: a suggestion only fills it in. */
  value?: string;
  /** The starting text of an uncontrolled Combobox (no `value`). */
  defaultValue?: string;
  /** Receives the text on every keystroke and every pick. */
  onValueChange?: (value: string) => void;
  /** Called when a suggestion is picked, with the whole option. */
  onOptionSelect?: (option: ComboboxOption) => void;
  /** Whether the list is open, controlled. */
  open?: boolean;
  /** Whether the list starts open, uncontrolled (no `open`). */
  defaultOpen?: boolean;
  /** Receives every open and close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Which suggestions match the text. Default: the option's text contains
   * it, ignoring case. `false` shows `options` as given, for suggestions a
   * server already filtered.
   */
  filter?: ((option: ComboboxOption, query: string) => boolean) | false;
  /** Suggestions are on their way (a server search): a spinner row in the list. */
  loading?: boolean;
  /**
   * Shown in the list when the text matches nothing. Leave it out and the
   * list just closes, since free text is a valid answer.
   */
  emptyState?: ReactNode;
  placement?: Placement;
  labels?: ComboboxLabels;
}

const optionText = (option: ComboboxOption) =>
  typeof option.label === "string" ? option.label : option.value;

const containsQuery = (option: ComboboxOption, query: string) =>
  optionText(option).toLowerCase().includes(query.trim().toLowerCase());

/**
 * The editable field. Its own component because it renders inside
 * Dropdown's trigger, to report the active option to the panel (which keeps
 * it in view), and it hides the trigger context from what it contains.
 */
const ComboboxField = ({
  ref,
  activeIndex,
  ...props
}: InputProps & { activeIndex: number } & { ref?: React.Ref<HTMLInputElement> }) => {
  useDropdownCombobox(activeIndex);
  return (
    <DropdownTriggerContext.Provider value={null}>
      <Input ref={ref} {...props} />
    </DropdownTriggerContext.Provider>
  );
};

ComboboxField.displayName = "ComboboxField";

/**
 * A text field with suggestions: a city, a tag, a client's name, a model.
 * Unlike `Select`, any text is a value, and a suggestion only fills it in.
 * Focus stays in the field; the arrow keys move through the suggestions,
 * Enter takes the active one, Escape closes the list and then clears the
 * text. For server results, pass `filter={false}`, `loading` and the
 * options the server sent for the current text.
 */
const Combobox = ({
  ref,
  options,
  value,
  defaultValue = "",
  onValueChange,
  onOptionSelect,
  open,
  defaultOpen = false,
  onOpenChange,
  filter,
  loading = false,
  emptyState,
  minHeight,
  minWidth,
  maxWidth,
  placement,
  labels,
  className,
  fillWidth = true,
  ...rest
}: ComboboxProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const names = mergeLabels(DEFAULT_LABELS, labels);
  const [text, setText] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  /** The suggestion the arrow keys moved to, or null: Enter then keeps the typed text. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const matches =
    filter === false
      ? options
      : options.filter((option) => (filter ?? containsQuery)(option, text ?? ""));
  const showEmpty = Boolean(emptyState) && Boolean(text) && !loading && matches.length === 0;
  const hasPanel = matches.length > 0 || loading || showEmpty;
  const expanded = isOpen && hasPanel;
  const active =
    expanded && activeIndex !== null && activeIndex < matches.length ? activeIndex : -1;

  const setOpen = useCallback(
    (next: boolean) => {
      setActiveIndex(null);
      setIsOpen(next);
    },
    [setIsOpen],
  );

  const pick = (index: number) => {
    const option = matches[index];
    if (!option || option.disabled) return;
    setText(optionText(option));
    onOptionSelect?.(option);
    setOpen(false);
    fieldRef.current?.focus();
  };

  /** The next enabled suggestion from `from`, `step` at a time, wrapping round. */
  const nextEnabled = (from: number, step: 1 | -1) => {
    const count = matches.length;
    for (let n = 1; n <= count; n++) {
      const index = (((from + step * n) % count) + count) % count;
      if (!matches[index].disabled) return index;
    }
    return -1;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    rest.onKeyDown?.(event);
    const { key } = event;
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(key === "ArrowDown" ? nextEnabled(-1, 1) : nextEnabled(matches.length, -1));
        return;
      }
      if (matches.length === 0) return;
      const from = active >= 0 ? active : key === "ArrowDown" ? -1 : matches.length;
      setActiveIndex(nextEnabled(from, key === "ArrowDown" ? 1 : -1));
    } else if (key === "Enter") {
      if (active >= 0) {
        // Picking, not submitting the form the field sits in.
        event.preventDefault();
        pick(active);
      } else if (expanded) {
        setOpen(false);
      }
    } else if (key === "Escape") {
      if (expanded) {
        event.preventDefault();
        // Closes this list only, not a dialog it sits in.
        event.stopPropagation();
        setOpen(false);
      } else if (text) {
        event.preventDefault();
        event.stopPropagation();
        setText("");
      }
    } else if (key === "Tab") {
      setOpen(false);
    }
  };

  return (
    // The field is the control: no `role="button"` around it, focus stays in it.
    <DropdownComboboxContext.Provider value={true}>
      <Dropdown
        fillWidth={fillWidth}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        ref={(node) => {
          wrapperRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        open={expanded}
        onOpenChange={(next) => {
          if (!next) setOpen(false);
        }}
        placement={placement}
        closeAfterClick={false}
        disableTriggerClick
        trigger={
          <ComboboxField
            {...rest}
            ref={fieldRef}
            activeIndex={active}
            value={text ?? ""}
            onChange={(event) => {
              setText(event.target.value);
              setActiveIndex(null);
              setIsOpen(true);
            }}
            onClick={(event: React.MouseEvent<HTMLInputElement>) => {
              rest.onClick?.(event);
              if (!isOpen) setOpen(true);
            }}
            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
              rest.onBlur?.(event);
              const next = event.relatedTarget as Element | null;
              if (next && (wrapperRef.current?.contains(next) || next.closest("[data-dropdown]"))) {
                return;
              }
              setOpen(false);
            }}
            onKeyDown={handleKeyDown}
            className={classNames("fill-width", className)}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={expanded}
            aria-controls={expanded ? listboxId : undefined}
            aria-activedescendant={active >= 0 ? optionId(active) : undefined}
          />
        }
      >
        <Column fillWidth padding="4" data-dropdown="true">
          <Column
            id={listboxId}
            role="listbox"
            aria-label={rest["aria-label"] || rest.label || rest.placeholder || "Suggestions"}
            aria-busy={loading || undefined}
            fillWidth
            gap="2"
          >
            {matches.map((option, index) => (
              <Option
                key={option.value}
                {...option}
                id={optionId(index)}
                tabIndex={-1}
                highlighted={index === active}
                selected={optionText(option) === text}
                // Keeps focus in the field: a pick must not blur it first.
                onMouseDown={(event: React.MouseEvent<HTMLDivElement>) => event.preventDefault()}
                onMouseEnter={() => {
                  if (!option.disabled) setActiveIndex(index);
                }}
                onClick={() => pick(index)}
              />
            ))}
          </Column>
          {loading && (
            <Row gap="8" vertical="center" paddingX="12" paddingY="8" role="status">
              <Spinner size="s" />
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {names.loading}
              </Text>
            </Row>
          )}
          {showEmpty && (
            <Flex fillWidth center paddingX="16" paddingY="24">
              {emptyState}
            </Flex>
          )}
        </Column>
      </Dropdown>
    </DropdownComboboxContext.Provider>
  );
};

Combobox.displayName = "Combobox";

export type { ComboboxLabels, ComboboxOption, ComboboxProps };
export { Combobox };

"use client";

import React, { forwardRef, useCallback, useId, useRef } from "react";
import { useControllableState } from "../internal/useControllableState";
import { fieldLocale } from "../utils/calendarLocale";
import { DatePicker, type DatePickerLabels } from "./DatePicker";
import { DropdownComboboxContext } from "./DropdownTriggerContext";
import { DropdownWrapper } from "./DropdownWrapper";
import { Input } from "./Input";

interface DateInputProps
  extends Omit<React.ComponentProps<typeof Input>, "value" | "defaultValue" | "onValueChange"> {
  id: string;
  label?: string;
  placeholder?: string;
  /** The date, controlled. Leave it out to let the field keep its own,
   *  starting from `defaultValue`. */
  value?: Date;
  /** The starting date of an uncontrolled DateInput (no `value`). */
  defaultValue?: Date;
  /** Receives the date picked, and each time edit with `timePicker`. */
  onValueChange?: (date: Date) => void;
  /** Whether the picker is open, controlled. */
  open?: boolean;
  /** Whether the picker starts open, uncontrolled (no `open`). */
  defaultOpen?: boolean;
  /** Receives every open and close the field makes. */
  onOpenChange?: (open: boolean) => void;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  timePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /**
   * The locale the field's date and the calendar's month and weekday names
   * are in, as a BCP 47 tag such as "de" or "pt-BR". Without it (or with a
   * tag the platform does not accept) they are in US English, as before.
   */
  locale?: string;
  /** The calendar's buttons, fields and names, for a translated interface: see DatePicker. */
  labels?: DatePickerLabels;
}

const formatDate = (date: Date, timePicker: boolean, locale?: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...(timePicker && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };

  return date.toLocaleString(fieldLocale(locale), options);
};

/**
 * The field is a combobox that opens a date picker dialog (`aria-haspopup`
 * "dialog"). It used to be a read-only input inside DropdownWrapper's two
 * `role="button"` wrappers: an input inside a button (axe
 * "nested-interactive"), announced twice, with no popup state of its own.
 *
 * As with Select, DropdownWrapper learns at render that its trigger is a
 * combobox (DropdownComboboxContext), so no markup nests the field. Unlike
 * Select's list, the picker is a dialog: opening it moves focus onto its
 * selected day (DatePicker's `autoFocus`), and Escape or a pick brings focus
 * back to the field.
 */
export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  (
    {
      id,
      label,
      placeholder,
      value,
      defaultValue,
      onValueChange,
      open,
      defaultOpen = false,
      onOpenChange,
      error,
      minHeight,
      className,
      style,
      timePicker = false,
      minDate,
      maxDate,
      locale,
      labels,
      onClick,
      onKeyDown,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useControllableState({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
    });
    /**
     * The field shows the date it holds, so a `value` cleared from outside
     * clears it: the text used to follow `value` only while it was set.
     */
    const [date, setDate] = useControllableState<Date | undefined>({
      value,
      defaultValue,
      onChange: (next) => {
        if (next) onValueChange?.(next);
      },
    });
    const inputValue = date ? formatDate(date, timePicker, locale) : "";
    const fieldRef = useRef<HTMLInputElement>(null);
    const dialogId = `${useId()}-dialog`;

    const handleDateChange = useCallback(
      (next: Date) => {
        setDate(next);
        if (!timePicker) {
          setIsOpen(false);
        }
      },
      [setDate, setIsOpen, timePicker],
    );

    /**
     * Opens on a click, Enter, Space or ArrowDown, as a combobox does; not on
     * focus. Opening on focus moved a keyboard user tabbing through a form
     * into the picker, and reopened it each time focus came back to the field.
     */
    const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (!isOpen && ["Enter", " ", "ArrowDown"].includes(event.key)) {
        // Enter would otherwise submit a surrounding form.
        event.preventDefault();
        setIsOpen(true);
      } else if (isOpen && event.key === "Escape") {
        event.preventDefault();
        // Closes the picker only, not a dialog the field sits in.
        event.stopPropagation();
        setIsOpen(false);
      }
    };

    /**
     * Escape inside the picker closes it and hands focus back to the field.
     * One its month or year list already handled closed that list only: it
     * goes no further, or the trap around the picker would close it as well.
     */
    const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      if (event.defaultPrevented) return;
      event.preventDefault();
      setIsOpen(false);
      fieldRef.current?.focus({ preventScroll: true });
    };

    /** The dialog is named after the field. */
    const labelledBy = rest["aria-labelledby"];
    const dialogLabel = labelledBy ? undefined : rest["aria-label"] || label || placeholder;

    return (
      <DropdownComboboxContext.Provider value={true}>
        <DropdownWrapper
          ref={ref}
          trigger={
            <Input
              ref={fieldRef}
              style={{
                textOverflow: "ellipsis",
              }}
              id={id}
              label={label}
              placeholder={placeholder}
              value={inputValue}
              error={error}
              readOnly
              onClick={(event: React.MouseEvent<HTMLInputElement>) => {
                onClick?.(event);
                setIsOpen(true);
              }}
              onKeyDown={handleFieldKeyDown}
              role="combobox"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              aria-controls={isOpen ? dialogId : undefined}
              {...rest}
            />
          }
          dropdown={
            <DatePicker
              /*
               * Keyed on open state ONLY. Including value.getTime() here remounted
               * the whole picker on every time edit — each hour, minute or AM/PM
               * change fires onValueChange, which changes value, which changed the key.
               * The remount reset isTimeSelector, so the time panel vanished and
               * the calendar came back mid-edit. DatePicker already syncs to a
               * changed `value` in an effect, so the key never needed it.
               */
              key={`datepicker-${isOpen ? "open" : "closed"}`}
              id={dialogId}
              role="dialog"
              aria-modal="true"
              aria-label={dialogLabel}
              aria-labelledby={labelledBy}
              onKeyDown={handleDialogKeyDown}
              padding="20"
              value={date}
              onValueChange={handleDateChange}
              timePicker={timePicker}
              minDate={minDate}
              maxDate={maxDate}
              autoFocus={true}
              open={isOpen}
              locale={locale}
              labels={labels}
            />
          }
          fillWidth={false}
          minHeight={minHeight}
          open={isOpen}
          onOpenChange={setIsOpen}
          className={className}
          closeAfterClick={!timePicker}
          disableTriggerClick={true}
          style={{ ...style }}
          handleArrowNavigation={false}
        />
      </DropdownComboboxContext.Provider>
    );
  },
);

DateInput.displayName = "DateInput";

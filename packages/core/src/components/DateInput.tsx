"use client";

import React, { useCallback, useId, useRef } from "react";
import { useControllableState } from "../internal/useControllableState.js";
import { fieldLocale } from "../utils/calendarLocale.js";
import { DatePicker, type DatePickerLabels, type DateRange } from "./DatePicker.js";
import { Dropdown } from "./Dropdown.js";
import { DropdownComboboxContext } from "./DropdownTriggerContext.js";
import { Flex } from "./Flex.js";
import { Input } from "./Input.js";
import { Row } from "./Row.js";

interface SingleDateInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "value" | "defaultValue" | "onValueChange" | "ref"
  > {
  /** The ref reaches the field's dropdown wrapper. */
  ref?: React.Ref<HTMLDivElement>;
  id: string;
  /** Two fields, start and end, picking a `{ startDate, endDate }` range. */
  range?: false;
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
 * "dialog"). It used to be a read-only input inside Dropdown's two
 * `role="button"` wrappers: an input inside a button (axe
 * "nested-interactive"), announced twice, with no popup state of its own.
 *
 * As with Select, Dropdown learns at render that its trigger is a
 * combobox (DropdownComboboxContext), so no markup nests the field. Unlike
 * Select's list, the picker is a dialog: opening it moves focus onto its
 * selected day (DatePicker's `autoFocus`), and Escape or a pick brings focus
 * back to the field.
 */
const SingleDateInput = ({
  ref,
  range: _range,
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
}: SingleDateInputProps) => {
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
      <Dropdown
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
        fillWidth={false}
        minHeight={minHeight}
        open={isOpen}
        onOpenChange={setIsOpen}
        className={className}
        closeAfterClick={!timePicker}
        disableTriggerClick={true}
        style={{ ...style }}
        handleArrowNavigation={false}
      >
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
      </Dropdown>
    </DropdownComboboxContext.Provider>
  );
};

SingleDateInput.displayName = "SingleDateInput";

interface RangeDateInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "onChange" | "value" | "defaultValue" | "onValueChange" | "label" | "ref"
  > {
  /** The ref reaches the fields' dropdown wrapper. */
  ref?: React.Ref<HTMLDivElement>;
  id: string;
  range: true;
  /** The start field's placeholder and name. Default `"Start"`. */
  startLabel?: string;
  /** The end field's placeholder and name. Default `"End"`. */
  endLabel?: string;
  /** The range, controlled. Leave it out to let the fields keep their own,
   *  starting from `defaultValue`. */
  value?: DateRange;
  /** The starting range of an uncontrolled range input (no `value`). */
  defaultValue?: DateRange;
  /** Receives the range after each pick: the start alone, then both ends. */
  onValueChange?: (range: DateRange) => void;
  /** Whether the picker is open, controlled. */
  open?: boolean;
  /** Whether the picker starts open, uncontrolled (no `open`). */
  defaultOpen?: boolean;
  /** Receives every open and close the fields make. */
  onOpenChange?: (open: boolean) => void;
  minHeight?: number;
  /**
   * The locale the fields' dates and the calendar's month and weekday names
   * are in, as a BCP 47 tag such as "de" or "pt-BR". Without it (or with a
   * tag the platform does not accept) they are in US English, as before.
   */
  locale?: string;
  /** The calendar's buttons and names, for a translated interface: see DatePicker. */
  labels?: DatePickerLabels;
  minDate?: Date;
  maxDate?: Date;
}

interface LocalizedDateRange {
  startDate: string | null;
  endDate: string | null;
}

const formatDateRange = (range: DateRange, locale?: string): LocalizedDateRange => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return {
    startDate: range.startDate?.toLocaleDateString(fieldLocale(locale), options) || null,
    endDate: range.endDate?.toLocaleDateString(fieldLocale(locale), options) || null,
  };
};

/**
 * `<DateInput range>` (2.x's DateRangeInput): two fields, start and end, each a combobox that opens the same range picker
 * dialog: see DateInput. They used to sit inside Dropdown's two
 * `role="button"` wrappers (axe "nested-interactive"), and the picker inside
 * a listbox with no options.
 */
const RangeDateInput = ({
  ref,
  range: _range,
  id,
  startLabel = "Start",
  endLabel = "End",
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
  locale,
  labels,
  minDate,
  maxDate,
  onClick,
  onKeyDown,
  // Names the dialog. Spread onto both fields, it replaced their own
  // names and the start and end fields were announced alike.
  "aria-label": ariaLabel,
  ...rest
}: RangeDateInputProps) => {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [range, setRange] = useControllableState<DateRange | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next) onValueChange?.(next);
    },
  });
  const inputValue = range ? formatDateRange(range, locale) : { startDate: "", endDate: "" };
  const dialogId = `${useId()}-dialog`;
  /** The field that opened the picker, which gets focus back when it closes. */
  const openerRef = useRef<HTMLInputElement | null>(null);

  const handleDateChange = useCallback(
    (next: DateRange) => {
      setRange(next);
      if (next.endDate != undefined) {
        setIsOpen(false);
      }
    },
    [setRange, setIsOpen],
  );

  /** Opens on a click, Enter, Space or ArrowDown, not on focus: see DateInput. */
  const openFrom = (field: HTMLInputElement) => {
    openerRef.current = field;
    setIsOpen(true);
  };

  const handleFieldKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (!isOpen && ["Enter", " ", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      openFrom(event.currentTarget);
    } else if (isOpen && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
    }
  };

  const handleFieldClick = (event: React.MouseEvent<HTMLInputElement>) => {
    onClick?.(event);
    openFrom(event.currentTarget);
  };

  /** Escape inside the picker closes it and hands focus back to the field that opened it. */
  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    // A month or year list inside the picker closed itself.
    if (event.defaultPrevented) return;
    event.preventDefault();
    setIsOpen(false);
    openerRef.current?.focus({ preventScroll: true });
  };

  const field = {
    className: "cursor-interactive",
    style: {
      textOverflow: "ellipsis",
    },
    error,
    readOnly: true,
    onClick: handleFieldClick,
    onKeyDown: handleFieldKeyDown,
    role: "combobox",
    "aria-haspopup": "dialog",
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? dialogId : undefined,
  } as const;

  const trigger = (
    <Row fillWidth horizontal="center" gap="-1">
      <Input
        {...field}
        // One id per field: both used to take `id`, and so did the error and
        // description ids Input derives from it.
        id={`${id}-start`}
        corners={"left"}
        placeholder={startLabel}
        // The placeholder is all that shows of the label, and only while
        // the field is empty.
        aria-label={startLabel}
        value={inputValue.startDate ?? ""}
        {...rest}
      />
      <Input
        {...field}
        id={`${id}-end`}
        corners={"right"}
        placeholder={endLabel}
        aria-label={endLabel}
        value={inputValue.endDate ?? ""}
        {...rest}
      />
    </Row>
  );

  const dropdown = (
    <Flex
      padding="20"
      center={true}
      id={dialogId}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || `${startLabel} – ${endLabel}`}
      onKeyDown={handleDialogKeyDown}
    >
      <DatePicker
        range
        value={range}
        minDate={minDate}
        maxDate={maxDate}
        onValueChange={handleDateChange}
        autoFocus
        locale={locale}
        labels={labels}
      />
    </Flex>
  );

  return (
    <DropdownComboboxContext.Provider value={true}>
      <Dropdown
        ref={ref}
        fillWidth={false}
        trigger={trigger}
        minHeight={minHeight}
        open={isOpen}
        closeAfterClick={false}
        disableTriggerClick={true}
        className={className}
        style={{ ...style }}
        onOpenChange={setIsOpen}
        handleArrowNavigation={false}
      >
        {dropdown}
      </Dropdown>
    </DropdownComboboxContext.Provider>
  );
};

RangeDateInput.displayName = "RangeDateInput";

type DateInputProps = SingleDateInputProps | RangeDateInputProps;

/**
 * A field that opens a date picker: one date (and time, with `timePicker`),
 * or with `range` two fields, start and end, for a `{ startDate, endDate }`.
 */
export const DateInput = ({ ref, ...props }: DateInputProps) =>
  props.range ? <RangeDateInput {...props} ref={ref} /> : <SingleDateInput {...props} ref={ref} />;

DateInput.displayName = "DateInput";

export type { DateInputProps };

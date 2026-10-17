"use client";

import React, { forwardRef, useCallback, useId, useRef } from "react";
import { useControllableState } from "../internal/useControllableState";
import { fieldLocale } from "../utils/calendarLocale";
import type { DatePickerLabels } from "./DatePicker";
import { DateRange, DateRangePicker } from "./DateRangePicker";
import { DropdownComboboxContext } from "./DropdownTriggerContext";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Input } from "./Input";
import { Row } from "./Row";

interface DateRangeInputProps
  extends Omit<
    React.ComponentProps<typeof Input>,
    "onChange" | "value" | "defaultValue" | "onValueChange" | "label"
  > {
  id: string;
  startLabel: string;
  endLabel: string;
  /** The range, controlled. Leave it out to let the fields keep their own,
   *  starting from `defaultValue`. */
  value?: DateRange;
  /** The starting range of an uncontrolled DateRangeInput (no `value`). */
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
  className?: string;
  style?: React.CSSProperties;
  /**
   * The locale the fields' dates and the calendar's month and weekday names
   * are in, as a BCP 47 tag such as "de" or "pt-BR". Without it (or with a
   * tag the platform does not accept) they are in US English, as before.
   */
  locale?: string;
  /** The calendar's buttons and names, for a translated interface: see DatePicker. */
  labels?: DatePickerLabels;
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
 * Two fields, start and end, each a combobox that opens the same range picker
 * dialog: see DateInput. They used to sit inside DropdownWrapper's two
 * `role="button"` wrappers (axe "nested-interactive"), and the picker inside
 * a listbox with no options.
 */
const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  (
    {
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
        aria-label={rest["aria-label"] || `${startLabel} – ${endLabel}`}
        onKeyDown={handleDialogKeyDown}
      >
        <DateRangePicker
          value={range}
          onValueChange={handleDateChange}
          autoFocus
          locale={locale}
          labels={labels}
        />
      </Flex>
    );

    return (
      <DropdownComboboxContext.Provider value={true}>
        <DropdownWrapper
          ref={ref}
          fillWidth={false}
          trigger={trigger}
          minHeight={minHeight}
          dropdown={dropdown}
          open={isOpen}
          closeAfterClick={false}
          disableTriggerClick={true}
          className={className}
          style={{ ...style }}
          onOpenChange={setIsOpen}
          handleArrowNavigation={false}
        />
      </DropdownComboboxContext.Provider>
    );
  },
);

DateRangeInput.displayName = "DateRangeInput";

export { DateRangeInput };

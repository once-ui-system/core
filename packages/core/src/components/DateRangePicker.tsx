"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { CondensedTShirtSizes } from "../types";
import { DatePicker, type DatePickerLabels } from "./DatePicker";
import { Flex } from "./Flex";

export interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface DateRangePickerProps
  extends Omit<React.ComponentProps<typeof Flex>, "onChange" | "defaultValue"> {
  /** The range, controlled. Leave it out to let the picker keep its own,
   *  starting from `defaultValue`. */
  value?: DateRange;
  /** The starting range of an uncontrolled DateRangePicker (no `value`). */
  defaultValue?: DateRange;
  /** Receives the range after each pick: the start alone, then both ends. */
  onValueChange?: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  dual?: boolean;
  size?: CondensedTShirtSizes;
  /**
   * Moves focus onto the first calendar's start day (else its first day that
   * can be picked) as it appears, like DatePicker's `autoFocus`: for a picker
   * that has just been opened, as DateRangeInput's is.
   */
  autoFocus?: boolean;
  /**
   * The locale month and weekday names are shown in, as a BCP 47 tag such as
   * "de" or "pt-BR". Without it (or with a tag the platform does not accept)
   * the names are in English, as before.
   */
  locale?: string;
  /** Both calendars' buttons and names, for a translated interface: see DatePicker. */
  labels?: DatePickerLabels;
}

const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      minDate,
      maxDate,
      size = "m",
      dual,
      autoFocus,
      locale,
      labels,
      ...rest
    },
    ref,
  ) => {
    const initial = value ?? defaultValue;
    const [internalValue, setInternalValue] = useState<DateRange>({
      startDate: initial?.startDate || undefined,
      endDate: initial?.endDate || undefined,
    });

    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    // Initialize with the startDate's month and year if available, otherwise use current date
    const [currentMonth, setCurrentMonth] = useState(
      initial?.startDate ? initial.startDate.getMonth() : new Date().getMonth(),
    );
    const [currentYear, setCurrentYear] = useState(
      initial?.startDate ? initial.startDate.getFullYear() : new Date().getFullYear(),
    );

    useEffect(() => {
      if (value) {
        setInternalValue({
          startDate: value.startDate,
          endDate: value.endDate,
        });

        // Update the current month and year when value changes and has a startDate
        if (value.startDate) {
          setCurrentMonth(value.startDate.getMonth());
          setCurrentYear(value.startDate.getFullYear());
        }
      }
    }, [value]);

    const handleDateChange = (date: Date) => {
      if (!internalValue.startDate || (internalValue.startDate && internalValue.endDate)) {
        // Start new selection
        const newRange = {
          startDate: date,
          endDate: undefined,
        };
        setInternalValue(newRange);
        onValueChange?.(newRange);
      } else {
        const newRange = {
          startDate: internalValue.startDate,
          endDate: date,
        };

        if (newRange.startDate > date) {
          newRange.startDate = date;
          newRange.endDate = internalValue.startDate;
        }

        setInternalValue(newRange);
        onValueChange?.(newRange);
      }
    };

    const handleMonthChange = (increment: number) => {
      const newDate = new Date(currentYear, currentMonth + increment, 1);
      setCurrentMonth(newDate.getMonth());
      setCurrentYear(newDate.getFullYear());
      setInternalValue({
        startDate: internalValue.startDate,
        endDate: internalValue.endDate,
      });
    };

    const getSecondMonth = () => {
      const firstMonth = new Date(currentYear, currentMonth, 1);
      const secondMonth = new Date(firstMonth);
      secondMonth.setMonth(secondMonth.getMonth() + 1);
      return secondMonth;
    };

    const getPreviewRange = () => {
      if (!internalValue.startDate || internalValue.endDate || !hoveredDate) return null;
      return {
        startDate: internalValue.startDate,
        endDate: hoveredDate > internalValue.startDate ? hoveredDate : internalValue.startDate,
        isPreview: true,
      };
    };

    return (
      <Flex ref={ref} gap="24" {...rest}>
        <DatePicker
          value={internalValue.startDate}
          onValueChange={handleDateChange}
          range={getPreviewRange() || internalValue}
          minDate={minDate}
          maxDate={maxDate}
          size={size}
          nextMonth={dual ? false : true}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={handleMonthChange}
          onHover={setHoveredDate}
          autoFocus={autoFocus}
          locale={locale}
          labels={labels}
        />
        {dual && (
          <DatePicker
            value={internalValue.endDate}
            onValueChange={handleDateChange}
            range={getPreviewRange() || internalValue}
            minDate={minDate}
            maxDate={maxDate}
            previousMonth={false}
            size={size}
            currentMonth={getSecondMonth().getMonth()}
            currentYear={getSecondMonth().getFullYear()}
            onMonthChange={handleMonthChange}
            onHover={setHoveredDate}
            locale={locale}
            labels={labels}
          />
        )}
      </Flex>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };

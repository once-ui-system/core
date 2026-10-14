"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { CondensedTShirtSizes } from "../types";
import { DatePicker } from "./DatePicker";
import { Flex } from "./Flex";

export interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface DateRangePickerProps extends Omit<React.ComponentProps<typeof Flex>, "onChange"> {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
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
}

const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ value, onChange, minDate, maxDate, size = "m", dual, autoFocus, locale, ...rest }, ref) => {
    const [internalValue, setInternalValue] = useState<DateRange>({
      startDate: value?.startDate || undefined,
      endDate: value?.endDate || undefined,
    });

    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    // Initialize with the startDate's month and year if available, otherwise use current date
    const [currentMonth, setCurrentMonth] = useState(
      value?.startDate ? value.startDate.getMonth() : new Date().getMonth(),
    );
    const [currentYear, setCurrentYear] = useState(
      value?.startDate ? value.startDate.getFullYear() : new Date().getFullYear(),
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
        onChange?.(newRange);
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
        onChange?.(newRange);
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
          onChange={handleDateChange}
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
        />
        {dual && (
          <DatePicker
            value={internalValue.endDate}
            onChange={handleDateChange}
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
          />
        )}
      </Flex>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };

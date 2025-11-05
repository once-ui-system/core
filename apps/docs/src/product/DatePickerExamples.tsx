"use client";

import React, { useState } from "react";
import { DatePicker, DateRangePicker } from "@once-ui-system/core";
import type { DateRange } from "@once-ui-system/core";

// Basic DatePicker example with managed state
export function BasicDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  return <DatePicker value={selectedDate} onChange={handleDateChange} />;
}

// DatePicker with time picker example
export function DateTimePickerExample() {
  const [dateTime, setDateTime] = useState<Date | undefined>(new Date());

  const handleDateTimeChange = (newDateTime: Date) => {
    setDateTime(newDateTime);
  };

  return <DatePicker value={dateTime} onChange={handleDateTimeChange} timePicker />;
}

// DateRangePicker example
export function DateRangePickerExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  });

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return <DateRangePicker value={dateRange} onChange={handleRangeChange} />;
}

// DateRangePicker with custom styling example
export function DateRangePickerPresetsExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
  });

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <DateRangePicker
      value={dateRange}
      onChange={handleRangeChange}
      size="l"
      style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px" }}
    />
  );
}

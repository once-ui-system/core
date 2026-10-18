"use client";

import type { DateRange } from "@once-ui-system/core";
import { DatePicker } from "@once-ui-system/core";
import React from "react";
import { useNowState, useRangeFromToday } from "./useNow";

// Basic DatePicker example with managed state
export function BasicDatePickerExample() {
  const [selectedDate, setSelectedDate] = useNowState();

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  return <DatePicker value={selectedDate} onValueChange={handleDateChange} />;
}

// DatePicker with time picker example
export function DateTimePickerExample() {
  const [dateTime, setDateTime] = useNowState();

  const handleDateTimeChange = (newDateTime: Date) => {
    setDateTime(newDateTime);
  };

  return <DatePicker value={dateTime} onValueChange={handleDateTimeChange} timePicker />;
}

// DatePicker in another locale, with its own words translated through labels
export function LocalizedDatePickerExample() {
  const [selectedDate, setSelectedDate] = useNowState();

  return (
    <DatePicker
      value={selectedDate}
      onValueChange={setSelectedDate}
      timePicker
      locale="de"
      labels={{
        previousMonth: "Vorheriger Monat",
        nextMonth: "Nächster Monat",
        month: (month) => `Monat: ${month}, Monat ändern`,
        year: (year) => `Jahr: ${year}, Jahr ändern`,
        backToCalendar: "Zurück zum Kalender",
        hours: "Stunden",
        minutes: "Minuten",
      }}
    />
  );
}

// DateRangePicker example
export function DateRangePickerExample() {
  const [dateRange, setDateRange] = useRangeFromToday(7);

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return <DatePicker range value={dateRange} onValueChange={handleRangeChange} />;
}

// DateRangePicker with custom styling example
export function DateRangePickerPresetsExample() {
  const [dateRange, setDateRange] = useRangeFromToday(7);

  const handleRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <DatePicker
      range
      value={dateRange}
      onValueChange={handleRangeChange}
      size="l"
      style={{ border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px" }}
    />
  );
}

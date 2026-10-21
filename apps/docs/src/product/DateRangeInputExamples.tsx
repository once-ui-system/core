"use client";

import { Column, DateInput, DateRange, type FieldSize, Flex } from "@once-ui-system/core";
import React from "react";
import { useRangeFromToday } from "./useNow";

// Basic DateRangeInput example with managed state
export function BasicDateRangeInputExample({ size }: { size?: FieldSize } = {}) {
  const [dateRange, setDateRange] = useRangeFromToday(7);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  return (
    <Flex fillWidth padding="16" height="25rem" horizontal="center" vertical="start">
      <DateInput
        range
        id={size ? `basic-date-range-example-${size}` : "basic-date-range-example"}
        size={size}
        startLabel="Start"
        endLabel="End"
        value={dateRange}
        onValueChange={handleDateRangeChange}
      />
    </Flex>
  );
}

// DateRangeInput with custom labels
export function CustomLabelDateRangeInputExample() {
  const [dateRange, setDateRange] = useRangeFromToday(14);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  return (
    <Flex padding="16">
      <DateInput
        range
        id="custom-label-date-range-example"
        startLabel="Check-in"
        endLabel="Check-out"
        value={dateRange}
        onValueChange={handleDateRangeChange}
      />
    </Flex>
  );
}

// Component that combines all examples
export function DateRangeInputExamples() {
  return (
    <Column gap="32">
      <BasicDateRangeInputExample />
      <CustomLabelDateRangeInputExample />
    </Column>
  );
}

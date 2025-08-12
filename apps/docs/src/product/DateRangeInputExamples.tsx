"use client";

import React, { useState } from "react";
import { DateRangeInput, DateRange, Flex, Column } from "@once-ui-system/core";

// Basic DateRangeInput example with managed state
export function BasicDateRangeInputExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });
  
  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };
  
  return (
    <Flex fillWidth padding="16" height={25} horizontal="center" vertical="start">
      <DateRangeInput
        id="basic-date-range-example"
        startLabel="Start"
        endLabel="End"
        value={dateRange}
        onChange={handleDateRangeChange}
      />
    </Flex>
  );
}

// DateRangeInput with custom labels
export function CustomLabelDateRangeInputExample() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14))
  });
  
  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };
  
  return (
    <Flex padding="16">
      <DateRangeInput
        id="custom-label-date-range-example"
        startLabel="Check-in"
        endLabel="Check-out"
        value={dateRange}
        onChange={handleDateRangeChange}
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

"use client";

import React, { useState, useCallback, useEffect, forwardRef } from "react";
import { Input, DropdownWrapper, Flex, DateRange, DateRangePicker, Row } from ".";

interface DateRangeInputProps
  extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value" | "label"> {
  id: string;
  startLabel: string;
  endLabel: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface LocalizedDateRange {
  startDate: string | null;
  endDate: string | null;
}

const formatDateRange = (range: DateRange): LocalizedDateRange => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return {
    startDate: range.startDate?.toLocaleDateString("en-US", options) || null,
    endDate: range.endDate?.toLocaleDateString("en-US", options) || null,
  };
};

const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(({
  id,
  startLabel = "Start",
  endLabel = "End",
  value,
  onChange,
  error,
  minHeight,
  className,
  style,
  ...rest
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    value ? formatDateRange(value) : { startDate: "", endDate: "" },
  );
  useEffect(() => {
    if (value) {
      setInputValue(formatDateRange(value));
    }
  }, [value]);

  const handleDateChange = useCallback(
    (range: DateRange) => {
      setInputValue(formatDateRange(range));
      onChange?.(range);
      if (range.endDate != undefined) {
        setIsOpen(false);
      }
    },
    [onChange],
  );

  const handleInputClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const trigger = (
    <Row fillWidth horizontal="center" gap="-1">
      <Input
        className="cursor-interactive"
        style={{
          textOverflow: "ellipsis",
        }}
        corners={"left"}
        id={id}
        placeholder={startLabel}
        value={inputValue.startDate ?? ""}
        error={error}
        readOnly
        onFocus={handleInputFocus}
        {...rest}
      />
      <Input
        className="cursor-interactive"
        style={{
          textOverflow: "ellipsis",
        }}
        corners={"right"}
        id={id}
        placeholder={endLabel}
        value={inputValue.endDate ?? ""}
        error={error}
        readOnly
        onFocus={handleInputFocus}
        {...rest}
      />
    </Row>
  );

  const dropdown = (
    <Flex padding="20" center={true}>
      <DateRangePicker value={value} onChange={handleDateChange} />
    </Flex>
  );

  return (
    <DropdownWrapper
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
    />
  );
})

DateRangeInput.displayName = "DateRangeInput";
export { DateRangeInput };

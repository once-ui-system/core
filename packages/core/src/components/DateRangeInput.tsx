"use client";

import type { CSSProperties } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { type DateRange, DateRangePicker } from "./DateRangePicker";
import { DropdownWrapper } from "./DropdownWrapper";
import { Flex } from "./Flex";
import { Input, type InputProps } from "./Input";
import { Row } from "./Row";

export interface DateRangeInputProps extends Omit<InputProps, "onChange" | "value" | "label"> {
  id: string;
  startLabel?: string;
  endLabel?: string;
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  minHeight?: number;
  className?: string;
  style?: CSSProperties;
  minDate?: Date;
  maxDate?: Date;
}

export interface LocalizedDateRange {
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

const DateRangeInput = forwardRef<HTMLDivElement, DateRangeInputProps>(
  (
    {
      id,
      startLabel = "Start",
      endLabel = "End",
      value,
      onChange,
      error,
      minHeight,
      className,
      style,
      minDate,
      maxDate,
      ...rest
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState<LocalizedDateRange>(
      value ? formatDateRange(value) : { startDate: "", endDate: "" },
    );

    useEffect(() => {
      if (value) {
        setInputValue(formatDateRange(value));
      } else {
        setInputValue({ startDate: "", endDate: "" });
      }
    }, [value]);

    const handleDateChange = useCallback(
      (range: DateRange) => {
        setInputValue(formatDateRange(range));
        onChange?.(range);
        if (range.endDate !== undefined) {
          setIsOpen(false);
        }
      },
      [onChange],
    );

    const handleInputFocus = useCallback(() => {
      setIsOpen(true);
    }, []);

    const trigger = (
      <Row fillWidth horizontal="center" gap="-1">
        <Input
          id={`${id}-start`}
          placeholder={startLabel}
          aria-label={startLabel}
          value={inputValue.startDate ?? ""}
          error={error}
          readOnly
          cursor="interactive"
          radius="left"
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          className="cursor-pointer [&_input]:truncate"
          style={{
            textOverflow: "ellipsis",
          }}
          {...rest}
        />
        <Input
          id={`${id}-end`}
          placeholder={endLabel}
          aria-label={endLabel}
          value={inputValue.endDate ?? ""}
          error={error}
          readOnly
          cursor="interactive"
          radius="right"
          onFocus={handleInputFocus}
          onClick={handleInputFocus}
          className="cursor-pointer [&_input]:truncate"
          style={{
            textOverflow: "ellipsis",
          }}
          {...rest}
        />
      </Row>
    );

    const dropdown = (
      <Flex padding="20" center={true}>
        <DateRangePicker
          value={value}
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Flex>
    );

    return (
      <DropdownWrapper
        ref={ref}
        fillWidth={false}
        trigger={trigger}
        minHeight={minHeight}
        dropdown={dropdown}
        isOpen={isOpen}
        closeAfterClick={false}
        disableTriggerClick={true}
        className={className}
        style={style}
        onOpenChange={setIsOpen}
      />
    );
  },
);

DateRangeInput.displayName = "DateRangeInput";

export { DateRangeInput };

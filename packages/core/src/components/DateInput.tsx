"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Input, DropdownWrapper, DatePicker } from ".";

interface DateInputProps extends Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> {
  id: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  timePicker?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const formatDate = (date: Date, timePicker: boolean) => {
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

  return date.toLocaleString("en-US", options);
};

export const DateInput: React.FC<DateInputProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  minHeight,
  className,
  style,
  timePicker = false,
  minDate,
  maxDate,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ? formatDate(value, timePicker) : "");

  useEffect(() => {
    if (value) {
      setInputValue(formatDate(value, timePicker));
    }
  }, [value, timePicker]);

  const handleDateChange = useCallback(
    (date: Date) => {
      setInputValue(formatDate(date, timePicker));
      onChange?.(date);
      if (!timePicker) {
        setIsOpen(false);
      }
    },
    [onChange, timePicker],
  );

  const handleInputClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <DropdownWrapper
      trigger={
        <Input
          style={{
            textOverflow: "ellipsis",
          }}
          id={id}
          label={label}
          placeholder={placeholder}
          value={inputValue}
          error={error}
          readOnly
          onFocus={handleInputFocus}
          {...rest}
        />
      }
      dropdown={
        <DatePicker
          key={`datepicker-${isOpen ? "open" : "closed"}-${value?.getTime() || 0}`}
          padding="20"
          value={value}
          onChange={handleDateChange}
          timePicker={timePicker}
          minDate={minDate}
          maxDate={maxDate}
          autoFocus={true}
          isOpen={isOpen}
        />
      }
      fillWidth
      minHeight={minHeight}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      closeAfterClick={!timePicker}
      disableTriggerClick={true}
      style={{ ...style }}
      handleArrowNavigation={false}
    />
  );
};

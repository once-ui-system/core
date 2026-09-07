"use client";

import React, { useState, useCallback, useEffect, forwardRef } from "react";
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

export const DateInput = forwardRef<HTMLDivElement, DateInputProps>(({
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
}, ref) => {
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
      ref={ref}
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
          /*
           * Keyed on open state ONLY. Including value.getTime() here remounted
           * the whole picker on every time edit — each hour, minute or AM/PM
           * change fires onChange, which changes value, which changed the key.
           * The remount reset isTimeSelector, so the time panel vanished and
           * the calendar came back mid-edit. DatePicker already syncs to a
           * changed `value` in an effect, so the key never needed it.
           */
          key={`datepicker-${isOpen ? "open" : "closed"}`}
          padding="20"
          value={value}
          onChange={handleDateChange}
          timePicker={timePicker}
          minDate={minDate}
          maxDate={maxDate}
          autoFocus={true}
          open={isOpen}
        />
      }
      fillWidth={false}
      minHeight={minHeight}
      open={isOpen}
      onOpenChange={setIsOpen}
      className={className}
      closeAfterClick={!timePicker}
      disableTriggerClick={true}
      style={{ ...style }}
      handleArrowNavigation={false}
    />
  );
});

DateInput.displayName = "DateInput";

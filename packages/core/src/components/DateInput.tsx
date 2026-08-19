"use client";

import type { CSSProperties } from "react";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { DatePicker } from "./DatePicker";
import { DropdownWrapper } from "./DropdownWrapper";
import { Input, type InputProps } from "./Input";

export interface DateInputProps extends Omit<InputProps, "onChange" | "value"> {
  id: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  minHeight?: number;
  className?: string;
  style?: CSSProperties;
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

const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  (
    {
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
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value ? formatDate(value, timePicker) : "");

    useEffect(() => {
      if (value) {
        setInputValue(formatDate(value, timePicker));
      } else {
        setInputValue("");
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

    const handleInputFocus = useCallback(() => {
      setIsOpen(true);
    }, []);

    return (
      <DropdownWrapper
        ref={ref}
        trigger={
          <Input
            id={id}
            label={label}
            placeholder={placeholder}
            value={inputValue}
            error={error}
            readOnly
            cursor="interactive"
            onFocus={handleInputFocus}
            onClick={handleInputFocus}
            className={cn("cursor-pointer [&_input]:truncate", className)}
            style={{
              textOverflow: "ellipsis",
              ...style,
            }}
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
        fillWidth={false}
        minHeight={minHeight}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        className={className}
        closeAfterClick={!timePicker}
        disableTriggerClick={true}
        style={style}
        handleArrowNavigation={false}
      />
    );
  },
);

DateInput.displayName = "DateInput";

export { DateInput };

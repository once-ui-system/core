"use client";

import React, { useState } from "react";
import { 
  Input, 
  Icon, 
  IconButton, 
  ColorInput, 
  DateInput, 
  NumberInput, 
  OTPInput, 
  PasswordInput, 
  TagInput,
  Flex,
  Text,
  Kbd,
  useToast,
  Column
} from "@once-ui-system/core";

// Search input with managed state and conditional clear button
export function SearchInput() {
  const [searchValue, setSearchValue] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  
  const handleClear = () => {
    setSearchValue("");
  };
  
  return (
    <Input
      id="search-input"
      placeholder="Search"
      value={searchValue}
      onChange={handleChange}
      hasPrefix={<Icon name="search" size="xs" />}
      hasSuffix={
        searchValue.length > 0 ? (
          <IconButton
            variant="ghost"
            icon="close"
            size="s"
            onClick={handleClear}
            aria-label="Clear search"
            tooltip="Clear"
            tooltipPosition="left"
          />
        ) : null
      }
    />
  );
}

export function ValidationInputExample() {
  const [value, setValue] = useState("");

  const validateEmail = (email: any) => {
    if (!email) return null;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    
    return null;
  };

  return (
    <Input
      id="validation-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      validate={validateEmail}
      placeholder="Email"
    />
  );
}

// Color input example with managed state
export function ColorInputExample() {
  const [colorValue, setColorValue] = useState("#4287f5");
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorValue(e.target.value);
  };
  
  return (
    <ColorInput
      id="color-input-example"
      label="Brand Color"
      value={colorValue}
      onChange={handleColorChange}
    />
  );
}

// Date input example with managed state
export function DateInputExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };
  
  return (
    <DateInput
      hasPrefix={<Icon marginLeft="4" name="calendar" size="xs" />}
      id="date-input-example"
      placeholder="Select date"
      value={date}
      onChange={handleDateChange}
    />
  );
}

// Date and time input example
export function DateTimeInputExample() {
  const [dateTime, setDateTime] = useState<Date | undefined>(new Date());
  
  const handleDateTimeChange = (newDateTime: Date) => {
    setDateTime(newDateTime);
  };
  
  return (
    <DateInput
      id="date-time-input-example"
      label="Date & Time"
      value={dateTime}
      onChange={handleDateTimeChange}
      timePicker
    />
  );
}

// NumberInput example with min, max, and step
export function NumberInputExample() {
  const [value, setValue] = useState<number>(0);
  
  const handleChange = (newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <NumberInput
      id="number-input-example"
      label="Quantity"
      value={value}
      onChange={handleChange}
      min={0}
      max={100}
      step={1}
    />
  );
}

export function OTPInputExample({ autoFocus = true }: { autoFocus?: boolean }) {
  const { addToast } = useToast();
  
  const handleComplete = (code: string) => {
    addToast({
      variant: "success",
      message: `Verification code ${code} submitted successfully`
    });
  };
  
  return (
    <Column gap="16">
      <Text as="label" htmlFor="otp-input-example" variant="label-default-s" onBackground="neutral-weak">
        Verification Code
      </Text>
      <OTPInput
        id="otp-input-example"
        length={6}
        onComplete={handleComplete}
        autoFocus={autoFocus}
      />
    </Column>
  );
}

// Password Input example with toggle visibility
export function PasswordInputExample() {
  const [password, setPassword] = useState<string>('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  return (
    <PasswordInput
      id="password-input-example"
      value={password}
      onChange={handleChange}
      placeholder="Password"
    />
  );
}

// Tag Input example for adding multiple tags
export function TagInputExample() {
  const [tags, setTags] = useState<string[]>(['React', 'Next.js']);
  
  const handleChange = (newTags: string[]) => {
    setTags(newTags);
  };
  
  return (
    <TagInput
      id="tag-input-example"
      value={tags}
      onChange={handleChange}
      placeholder="Add interest"
      hasSuffix={<Kbd position="absolute" top="12" right="12">Enter</Kbd>}
    />
  );
}

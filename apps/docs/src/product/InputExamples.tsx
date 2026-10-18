"use client";

import React, { useState } from "react";
import { useNowState } from "./useNow";
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
  Text,
  Kbd,
  useToast,
  Column,
  Row,
  Button,
  Select,
  type FieldSize,
} from "@once-ui-system/core";

// Search input with managed state and conditional clear button
export function SearchInput({ size }: { size?: FieldSize } = {}) {
  const [searchValue, setSearchValue] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  
  const handleClear = () => {
    setSearchValue("");
  };
  
  return (
    <Input
      id={size ? `search-input-${size}` : "search-input"}
      size={size}
      placeholder="Search"
      value={searchValue}
      onChange={handleChange}
      prefix={<Icon name="search" size="xs" />}
      suffix={
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

export function CharacterCountExample() {
  const [bio, setBio] = useState<string>("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBio(e.target.value);
  };
  
  return (
    <Input
      id="character-count-input"
      placeholder="Bio"
      value={bio}
      onChange={handleChange}
      maxLength={100}
      characterCount
    />
  );
}

// Color input example with managed state
export function ColorInputExample({ size }: { size?: FieldSize } = {}) {
  const [colorValue, setColorValue] = useState("#4287f5");
  
  const handleColorChange = (value: string) => {
    setColorValue(value);
  };
  
  return (
    <ColorInput
      id={size ? `color-input-example-${size}` : "color-input-example"}
      size={size}
      label="Brand Color"
      value={colorValue}
      onChange={handleColorChange}
    />
  );
}

// Color input with alpha support
export function ColorInputAlphaExample() {
  const [colorValue, setColorValue] = useState("rgba(66, 135, 245, 0.8)");
  
  const handleColorChange = (value: string) => {
    setColorValue(value);
  };
  
  return (
    <ColorInput
      id="color-input-alpha-example"
      label="Brand Color"
      value={colorValue}
      onChange={handleColorChange}
      supportAlpha
    />
  );
}

// Date input example with managed state
export function DateInputExample({ size }: { size?: FieldSize } = {}) {
  const [date, setDate] = useNowState();
  
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };
  
  return (
    <DateInput
      prefix={<Icon marginLeft="4" name="calendar" size="xs" />}
      id={size ? `date-input-example-${size}` : "date-input-example"}
      size={size}
      placeholder="Select date"
      value={date}
      onChange={handleDateChange}
    />
  );
}

// Date and time input example
export function DateTimeInputExample() {
  const [dateTime, setDateTime] = useNowState();
  
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
export function NumberInputExample({ size = "xl" }: { size?: FieldSize } = {}) {
  const [value, setValue] = useState<number>(0);
  
  const handleChange = (newValue: number) => {
    setValue(newValue);
  };
  
  return (
    <NumberInput
      id={size === "xl" ? "number-input-example" : `number-input-example-${size}`}
      label="Quantity"
      size={size}
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
export function PasswordInputExample({ size }: { size?: FieldSize } = {}) {
  const [password, setPassword] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };
  
  return (
    <PasswordInput
      id={size ? `password-input-example-${size}` : "password-input-example"}
      size={size}
      value={password}
      onChange={handleChange}
      placeholder="Password"
    />
  );
}

// Tag Input example for adding multiple tags
export function TagInputExample({ size }: { size?: FieldSize } = {}) {
  const [tags, setTags] = useState<string[]>(["React", "Next.js"]);

  const handleChange = (newTags: string[]) => {
    setTags(newTags);
  };
  
  return (
    <TagInput
      id={size ? `tag-input-example-${size}` : "tag-input-example"}
      size={size}
      value={tags}
      onChange={handleChange}
      placeholder="Add interest"
      suffix={
        // The hint does not fit a 32px field beside the chips.
        size === "xxs" ? undefined : (
          <Kbd position="absolute" top="16" right="12">
            Enter
          </Kbd>
        )
      }
    />
  );
}

// A dashboard toolbar: every control 32px tall. Fields take size="xxs", the
// height of a size="s" Button.
export function ToolbarFieldsExample() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  return (
    <Row fillWidth gap="8" vertical="center" s={{ direction: "column" }}>
      <Input
        id="toolbar-search"
        size="xxs"
        label="Search orders"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        prefix={<Icon name="search" size="xs" onBackground="neutral-weak" />}
      />
      <Select
        id="toolbar-status"
        size="xxs"
        label="Status"
        value={status}
        onSelect={(next) => setStatus(next as string)}
        options={[
          { label: "All statuses", value: "all" },
          { label: "Paid", value: "paid" },
          { label: "Pending", value: "pending" },
          { label: "Refunded", value: "refunded" },
        ]}
      />
      <Button size="s" variant="secondary" prefixIcon="download">
        Export
      </Button>
    </Row>
  );
}

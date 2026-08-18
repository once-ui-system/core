"use client";

import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from "react";
import { forwardRef, useState } from "react";
import { Chip } from "./Chip";
import { Flex } from "./Flex";
import { Input, type InputProps } from "./Input";

export interface TagInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string[];
  onChange: (value: string[]) => void;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ value = [], onChange, label, placeholder, ...inputProps }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setInputValue(e.target.value);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed) {
          onChange([...value, trimmed]);
          setInputValue("");
        }
      }
    };

    const handleRemoveTag = (index: number) => {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
    };

    const handleFocus: FocusEventHandler<HTMLInputElement> = () => {
      setIsFocused(true);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
      setIsFocused(false);
    };

    return (
      <Input
        ref={ref}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-haspopup="listbox"
        aria-expanded={isFocused}
        {...inputProps}
      >
        {value.length > 0 && (
          <Flex gap="4" vertical="center" wrap paddingY="16" className="-my-8 mx-8">
            {value.map((tag, index) => (
              <Chip
                // biome-ignore lint/suspicious/noArrayIndexKey: tag order and duplicates allowed
                key={`${tag}-${index}`}
                label={tag}
                onRemove={() => handleRemoveTag(index)}
                aria-label={`Remove tag ${tag}`}
              />
            ))}
          </Flex>
        )}
      </Input>
    );
  },
);

TagInput.displayName = "TagInput";

export { TagInput };

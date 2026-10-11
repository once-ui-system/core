"use client";

import { ChangeEventHandler, forwardRef, KeyboardEventHandler, useState } from "react";
import { Chip } from "./Chip";
import { Flex } from "./Flex";
import { Input, InputProps } from "./Input";

interface TagInputProps extends Omit<InputProps, "onChange" | "value"> {
  value: string[];
  onChange: (value: string[]) => void;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ value, onChange, label, placeholder, ...inputProps }, ref) => {
    const [inputValue, setInputValue] = useState("");

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setInputValue(e.target.value);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (inputValue.trim()) {
          onChange([...value, inputValue.trim()]);
          setInputValue("");
        }
      }
    };

    const handleRemoveTag = (index: number) => {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);
    };

    return (
      <Input
        ref={ref}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        // No `aria-haspopup` or `aria-expanded`: they promised a listbox
        // that never existed, and a plain text field may not carry
        // `aria-expanded` at all.
        {...inputProps}
      >
        {value.length > 0 && (
          <Flex
            style={{
              margin: "calc(-1 * var(--static-space-8)) var(--static-space-8)",
            }}
            gap="4"
            vertical="center"
            wrap
            paddingY="16"
          >
            {value.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onRemove={() => handleRemoveTag(index)}
                // The name goes on the button that removes the tag. On the
                // Chip it named the chip itself, and every remove button was
                // just "Remove".
                iconButtonProps={{ "aria-label": `Remove tag ${tag}` }}
              />
            ))}
          </Flex>
        )}
      </Input>
    );
  },
);

TagInput.displayName = "TagInput";

export type { TagInputProps };
export { TagInput };

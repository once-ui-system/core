"use client";

import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  KeyboardEventHandler,
  useState,
} from "react";
import { Chip } from "./Chip";
import { Flex } from "./Flex";
import { Input, InputProps } from "./Input";

interface TagInputProps extends Omit<InputProps, "onChange" | "value" | "defaultValue"> {
  /** The tags, controlled. Leave it out to let TagInput keep its own list,
   *  starting from `defaultValue`. */
  value?: string[];
  /** The starting tags of an uncontrolled TagInput (no `value`). */
  defaultValue?: readonly string[];
  /** Receives the whole new list after an add or a remove. */
  onChange?: (value: string[]) => void;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ value: controlledValue, defaultValue, onChange, label, placeholder, ...inputProps }, ref) => {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(() => [
      ...(defaultValue ?? []),
    ]);
    const value = controlledValue ?? uncontrolledValue;

    const commit = (next: string[]) => {
      if (controlledValue === undefined) setUncontrolledValue(next);
      onChange?.(next);
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      setInputValue(e.target.value);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (inputValue.trim()) {
          commit([...value, inputValue.trim()]);
          setInputValue("");
        }
      }
    };

    const handleRemoveTag = (index: number) => {
      commit(value.filter((_, i) => i !== index));
    };

    const handleFocus: FocusEventHandler<HTMLInputElement> = () => {
      setIsFocused(true);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
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

export type { TagInputProps };
export { TagInput };

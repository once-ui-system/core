"use client";

import { ChangeEventHandler, forwardRef, KeyboardEventHandler, useState } from "react";
import { Chip } from "./Chip";
import { Flex } from "./Flex";
import { useFieldSize } from "./FormContext";
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
    const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(() => [
      ...(defaultValue ?? []),
    ]);
    const value = controlledValue ?? uncontrolledValue;
    // The chip row is pulled up 8px into the field; at xxs it keeps 4px clear
    // of the field's edges rather than 8.
    const compact = useFieldSize(inputProps.size) === "xxs";

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
            paddingY={compact ? "12" : "16"}
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

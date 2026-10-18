"use client";

import { ChangeEventHandler, KeyboardEventHandler, type Ref, useState } from "react";
import { useControllableState } from "../internal/useControllableState.js";
import { Flex } from "./Flex.js";
import { useFieldSize } from "./FormContext.js";
import { Input, InputProps } from "./Input.js";
import { Tag } from "./Tag.js";

interface TagInputProps extends Omit<InputProps, "value" | "defaultValue" | "onValueChange"> {
  /** The tags, controlled. Leave it out to let TagInput keep its own list,
   *  starting from `defaultValue`. */
  value?: string[];
  /** The starting tags of an uncontrolled TagInput (no `value`). */
  defaultValue?: readonly string[];
  /** Receives the whole new list after an add or a remove. */
  onValueChange?: (value: string[]) => void;
}

const TagInput = ({
  ref,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  onKeyDown,
  label,
  placeholder,
  ...inputProps
}: TagInputProps & { ref?: Ref<HTMLInputElement> }) => {
  const [inputValue, setInputValue] = useState("");
  const [value, commit] = useControllableState<string[]>({
    value: controlledValue,
    defaultValue: [...(defaultValue ?? [])],
    onChange: onValueChange,
  });
  // The tag row is pulled up 8px into the field; at xxs it keeps 4px clear
  // of the field's edges rather than 8.
  const compact = useFieldSize(inputProps.size) === "xxs";

  /** The text being typed: `onChange` is the native event of that field. */
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    // The caller's handler used to replace this one, so Enter added nothing.
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
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
      // No `aria-haspopup` or `aria-expanded`: they promised a listbox
      // that never existed, and a plain text field may not carry
      // `aria-expanded` at all.
      {...inputProps}
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
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
            <Tag
              key={index}
              label={tag}
              // Tags keep 2.x's look: Chip's `selected` defaulted to true.
              selected
              onRemove={() => handleRemoveTag(index)}
              // The name goes on the button that removes the tag. On the
              // tag it named the tag itself, and every remove button was
              // just "Remove".
              removeButtonProps={{ "aria-label": `Remove tag ${tag}` }}
            />
          ))}
        </Flex>
      )}
    </Input>
  );
};

TagInput.displayName = "TagInput";

export type { TagInputProps };
export { TagInput };

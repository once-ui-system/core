"use client";

import {
  ChangeEventHandler,
  KeyboardEventHandler,
  type Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "../internal/labels.js";
import { useControllableState } from "../internal/useControllableState.js";
import { Flex } from "./Flex.js";
import { useFieldSize } from "./FormContext.js";
import { Input, InputProps } from "./Input.js";
import { Tag } from "./Tag.js";
import { VisuallyHidden } from "./VisuallyHidden.js";

/** What TagInput announces and names. Omitted fields keep the English default. */
interface TagInputLabels {
  /** A tag's remove button. Defaults to `` (tag) => `Remove tag ${tag}` ``. */
  remove?: (tag: string) => string;
  /** Announced, politely, when a tag is removed. Defaults to `` (tag) => `Removed tag ${tag}` ``. */
  removed?: (tag: string) => string;
}

const DEFAULT_LABELS: Required<TagInputLabels> = {
  remove: (tag) => `Remove tag ${tag}`,
  removed: (tag) => `Removed tag ${tag}`,
};

interface TagInputProps extends Omit<InputProps, "value" | "defaultValue" | "onValueChange"> {
  /** The tags, controlled. Leave it out to let TagInput keep its own list,
   *  starting from `defaultValue`. */
  value?: string[];
  /** The starting tags of an uncontrolled TagInput (no `value`). */
  defaultValue?: readonly string[];
  /** Receives the whole new list after an add or a remove. */
  onValueChange?: (value: string[]) => void;
  /** The remove buttons' names and the removal announcement, for a translated interface. */
  labels?: TagInputLabels;
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
  labels,
  ...inputProps
}: TagInputProps & { ref?: Ref<HTMLInputElement> }) => {
  const [inputValue, setInputValue] = useState("");
  const [value, commit] = useControllableState<string[]>({
    value: controlledValue,
    defaultValue: [...(defaultValue ?? [])],
    onChange: onValueChange,
  });
  // What the live region says: the last removal, until the next one.
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  const names = mergeLabels(DEFAULT_LABELS, labels);
  // The tag row is pulled up 8px into the field; at xxs it keeps 4px clear
  // of the field's edges rather than 8.
  const compact = useFieldSize(inputProps.size) === "xxs";

  /** The text being typed: `onChange` is the native event of that field. */
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.target.value);
    onChange?.(e);
  };

  /** Removes a tag and says so: the tag leaving the list is silent otherwise. */
  const removeTag = (index: number) => {
    const tag = value[index];
    if (tag === undefined) return;
    commit(value.filter((_, i) => i !== index));
    setAnnouncement(names.removed(tag));
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
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // In an empty field there is no text to delete, so Backspace takes
      // the last tag, as in a mail client's address field.
      e.preventDefault();
      removeTag(value.length - 1);
    }
  };

  // The remove button leaves the page with its tag, which would drop focus
  // on the body; it goes back to the field instead.
  const handleRemoveTag = (index: number) => {
    removeTag(index);
    inputRef.current?.focus();
  };

  return (
    <>
      <Input
        ref={inputRef}
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
            role="list"
            style={{
              margin: "calc(-1 * var(--static-space-8)) var(--static-space-8)",
            }}
            gap="4"
            vertical="center"
            wrap
            paddingY={compact ? "12" : "16"}
          >
            {value.map((tag, index) => (
              <Flex role="listitem" key={index}>
                <Tag
                  label={tag}
                  // Tags keep 2.x's look: Chip's `selected` defaulted to true.
                  selected
                  // A tag's one action is its removal: the label is text,
                  // not a toggle that does nothing.
                  interactive={false}
                  onRemove={() => handleRemoveTag(index)}
                  // The name goes on the button that removes the tag. On the
                  // tag it named the tag itself, and every remove button was
                  // just "Remove".
                  removeButtonProps={{ "aria-label": names.remove(tag) }}
                />
              </Flex>
            ))}
          </Flex>
        )}
      </Input>
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {announcement}
      </VisuallyHidden>
    </>
  );
};

TagInput.displayName = "TagInput";

export type { TagInputLabels, TagInputProps };
export { TagInput };

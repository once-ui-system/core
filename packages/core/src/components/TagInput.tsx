"use client";

import {
  type ChangeEventHandler,
  forwardRef,
  type KeyboardEventHandler,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { mergeLabels } from "../internal/labels";
import { Chip } from "./Chip";
import { Flex } from "./Flex";
import { useFieldSize } from "./FormContext";
import { Input, type InputProps } from "./Input";
import { VisuallyHidden } from "./VisuallyHidden";

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

interface TagInputProps extends Omit<InputProps, "onChange" | "value" | "defaultValue"> {
  /** The tags, controlled. Leave it out to let TagInput keep its own list,
   *  starting from `defaultValue`. */
  value?: string[];
  /** The starting tags of an uncontrolled TagInput (no `value`). */
  defaultValue?: readonly string[];
  /** Receives the whole new list after an add or a remove. */
  onChange?: (value: string[]) => void;
  /** The remove buttons' names and the removal announcement, for a translated interface. */
  labels?: TagInputLabels;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      onKeyDown,
      label,
      placeholder,
      labels,
      ...inputProps
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(() => [
      ...(defaultValue ?? []),
    ]);
    // What the live region says: the last removal, until the next one.
    const [announcement, setAnnouncement] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
    const value = controlledValue ?? uncontrolledValue;
    const names = mergeLabels(DEFAULT_LABELS, labels);
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

    /** Removes a tag and says so: the chip leaving the list is silent otherwise. */
    const removeTag = (index: number) => {
      const tag = value[index];
      if (tag === undefined) return;
      commit(value.filter((_, i) => i !== index));
      setAnnouncement(names.removed(tag));
    };

    // The caller's handler runs first and can cancel the commit. It used to
    // be spread over this one, and Enter or a comma then added nothing.
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
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
                  <Chip
                    label={tag}
                    // A tag's one action is its removal: the label is text,
                    // not a toggle that does nothing.
                    interactive={false}
                    onRemove={() => handleRemoveTag(index)}
                    // The name goes on the button that removes the tag. On the
                    // Chip it named the chip itself, and every remove button was
                    // just "Remove".
                    iconButtonProps={{ "aria-label": names.remove(tag) }}
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
  },
);

TagInput.displayName = "TagInput";

export type { TagInputLabels, TagInputProps };
export { TagInput };

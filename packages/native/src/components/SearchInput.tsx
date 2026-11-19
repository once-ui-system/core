import { forwardRef, useCallback, useRef, useState } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { Input, type InputProps } from "./Input";
import type { RefComponent, TextInputRef } from "./refs";

export interface SearchInputProps extends Omit<InputProps, "prefix" | "label" | "multiline"> {
  /** Called when the clear button empties the field, after `onChangeText("")`. */
  onClear?: () => void;
}

/**
 * A search field: an `Input` with a search icon, a clear button once there is
 * text, and the keyboard's Search key. `onSubmitEditing` runs the search. With
 * a `testID`, the clear button is `${testID}-clear`.
 */
export const SearchInput: RefComponent<SearchInputProps, TextInputRef> = forwardRef<
  TextInputRef,
  SearchInputProps
>(function SearchInput(
  { placeholder = "Search", onChangeText, onClear, suffix, testID, ...props },
  ref,
) {
  // Tracked when uncontrolled too, so the clear button knows when to show.
  const [typed, setTyped] = useState(props.defaultValue ?? "");
  const value = props.value ?? typed;
  const input = useRef<TextInputRef | null>(null);
  const setInput = useCallback(
    (node: TextInputRef | null) => {
      input.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );
  return (
    <Input
      accessibilityRole="search"
      accessibilityLabel={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      enterKeyHint="search"
      size="s"
      placeholder={placeholder}
      testID={testID}
      {...props}
      ref={setInput}
      onChangeText={(text) => {
        setTyped(text);
        onChangeText?.(text);
      }}
      prefix={<Icon name="search" size="s" onBackground="neutral-weak" />}
      suffix={
        value !== "" ? (
          <IconButton
            variant="ghost"
            size="s"
            icon="close"
            aria-label="Clear search"
            testID={testID ? `${testID}-clear` : undefined}
            disabled={props.disabled}
            onPress={() => {
              // An uncontrolled field holds its own text; a controlled one follows `value`.
              if (props.value === undefined) input.current?.clear();
              setTyped("");
              onChangeText?.("");
              onClear?.();
            }}
          />
        ) : (
          suffix
        )
      }
    />
  );
});

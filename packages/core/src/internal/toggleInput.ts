import type React from "react";

/**
 * Checkbox, RadioButton and Switch draw their own control and keep a hidden
 * native `<input>` for forms. Form libraries (react-hook-form's `register()`)
 * hand over `ref`, `name`, `onChange` and `onBlur` and read the input itself,
 * so these helpers keep that input the one their handlers see.
 */

/** Sets every ref in the list, so a caller's ref and the component's own both
 *  point at the input. */
export function assignRefs<T>(node: T | null, ...refs: Array<React.Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
  }
}

/** The same event, with the hidden input as its target. The visible control
 *  takes focus, but a form library looks the field up by `event.target.name`. */
export function retarget(
  event: React.FocusEvent<Element>,
  input: HTMLInputElement | null,
): React.FocusEvent<HTMLInputElement> {
  if (!input) return event as React.FocusEvent<HTMLInputElement>;
  return Object.create(event, {
    target: { value: input },
    currentTarget: { value: input },
  });
}

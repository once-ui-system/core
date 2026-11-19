"use client";

import { type FocusEvent, type Ref, useCallback, useRef } from "react";

/**
 * Checkbox, RadioButton and Switch draw their own control and keep a hidden
 * native `<input>` beside it for forms. In 3.0 that input is the real one:
 * the caller's native props (`onChange`, `onBlur`, `name`, `required`, …)
 * land on it, and the drawn control activates it with a real click so a
 * native `change` event reaches `onChange` with `event.target.checked` and
 * `event.target.name` set, which is what `register()` from form libraries
 * reads.
 *
 * Focus stays on the drawn control (the input is out of the accessibility
 * tree), so `onFocus` and `onBlur` are called from the drawn control's focus
 * events, with the input as the event's target.
 */
export function useHiddenInput(forwarded: Ref<HTMLInputElement> | undefined) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as { current: HTMLInputElement | null }).current = node;
    },
    [forwarded],
  );

  const activate = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /**
   * Wraps a caller's `onFocus`/`onBlur` for the drawn control: the handler
   * hears the control's focus event with the input as its target, as if the
   * input itself had been focused. Called directly, not re-dispatched, so
   * ancestors do not hear the event twice.
   */
  const relay = useCallback(
    (handler: ((event: FocusEvent<HTMLInputElement>) => void) | undefined) =>
      handler &&
      ((event: FocusEvent<HTMLElement>) => {
        const input = inputRef.current;
        if (!input) return;
        handler(
          Object.assign(Object.create(event), {
            target: input,
            currentTarget: input,
          }) as FocusEvent<HTMLInputElement>,
        );
      }),
    [],
  );

  return { inputRef, setRef, activate, relay };
}

/**
 * Splits `aria-*` attributes (which name and describe the drawn control,
 * the one assistive technology reaches) from the rest (native input props).
 */
export function splitAria<T extends Record<string, unknown>>(props: T) {
  const aria: Record<string, unknown> = {};
  const native: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("aria-")) aria[key] = value;
    else native[key] = value;
  }
  return { aria, native: native as Omit<T, `aria-${string}`> };
}

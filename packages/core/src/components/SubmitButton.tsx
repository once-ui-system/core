"use client";

import type React from "react";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button.js";
import { useFormPending } from "./FormContext.js";

/**
 * SubmitButton — a `Button` that knows when its form is submitting.
 *
 * Inside a `Form` whose `onSubmit` returns a promise, or one given `pending`,
 * it shows a spinner, can swap its label for `pendingLabel`, and ignores
 * clicks until the submit settles, so a double click sends one request.
 *
 * While pending it is `aria-disabled` rather than `disabled`. A natively
 * disabled button drops focus to the page body the moment it is pressed with
 * the keyboard, and the user loses their place in the form; this one keeps
 * focus and just refuses the second press.
 */
interface SubmitButtonProps extends Omit<ButtonProps, "type" | "href"> {
  /** Label while the form is submitting, e.g. "Saving…". Defaults to the usual label. */
  pendingLabel?: ReactNode;
  /** Force the pending look from outside, for a submit the form does not track. */
  pending?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

const SubmitButton = ({
  ref,
  pendingLabel,
  pending,
  loading,
  label,
  children,
  onClick,
  ...rest
}: SubmitButtonProps) => {
  const formPending = useFormPending();
  const isPending = pending ?? formPending;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isPending) {
      // Stops the second submit; the form never hears this click.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const content = isPending && pendingLabel !== undefined ? pendingLabel : (label ?? children);

  return (
    <Button
      ref={ref}
      type="submit"
      loading={loading || isPending}
      aria-disabled={isPending || undefined}
      aria-busy={isPending || undefined}
      onClick={handleClick}
      {...rest}
    >
      {content}
    </Button>
  );
};

SubmitButton.displayName = "SubmitButton";

export { useFormPending } from "./FormContext.js";
export type { SubmitButtonProps };
export { SubmitButton };

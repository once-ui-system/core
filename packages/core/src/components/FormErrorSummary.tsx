"use client";

import React, { type ReactNode, useEffect, useImperativeHandle, useRef } from "react";
import { Column } from "./Column.js";
import { Feedback } from "./Feedback.js";
import { Text } from "./Text.js";

/**
 * FormErrorSummary — every error in a form, in one place, after a failed submit.
 *
 * Per-field messages are only seen by someone who scrolls past each field. A
 * summary at the top says how much is wrong, and each entry links to its
 * field: activating it moves focus into the control, not just the page to it.
 * When the summary appears, or its errors change, it takes focus itself, so a
 * keyboard or screen-reader user is brought to it rather than left on the
 * submit button with no idea why nothing happened.
 *
 * It renders nothing while there are no errors, so it can sit in a form
 * permanently.
 */
interface FormErrorItem {
  /** The id of the control to focus. Without one the entry is plain text. */
  id?: string;
  message: ReactNode;
}

interface FormErrorSummaryProps
  extends Omit<React.ComponentProps<typeof Feedback>, "tone" | "title" | "children"> {
  /**
   * The errors: a list, or a map from control id to message — the shape most
   * validation libraries hand back. Empty messages are skipped.
   */
  errors: FormErrorItem[] | Record<string, ReactNode>;
  /** Heading above the list. Defaults to "Check the highlighted fields". */
  title?: string;
  /** Move focus to the summary when it appears or its errors change. On by default. */
  autoFocus?: boolean;
  /** How many columns to occupy inside a `Form` grid. */
  span?: number;
}

const DEFAULT_TITLE = "Check the highlighted fields";

const renders = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

const toItems = (errors: FormErrorSummaryProps["errors"]): FormErrorItem[] =>
  (Array.isArray(errors)
    ? errors
    : Object.entries(errors).map(([id, message]) => ({ id, message }))
  ).filter((item) => renders(item.message));

const focusControl = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return false;
  target.focus();
  target.scrollIntoView?.({ block: "center" });
  return true;
};

const FormErrorSummary = ({
  ref,
  errors,
  title,
  autoFocus = true,
  // Consumed by `Form`, never rendered.
  span,
  ...rest
}: FormErrorSummaryProps) => {
  const items = toItems(errors);
  const innerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  // A key that changes when the set of errors does, so focus moves again on
  // a second failed submit with different problems — but not on every
  // render of a parent.
  const signature = `${items.map((item) => item.id ?? "").join("|")}#${items.length}`;

  const count = items.length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: `signature` is the trigger, not a value read inside
  useEffect(() => {
    if (!autoFocus || count === 0) return;
    innerRef.current?.focus();
  }, [autoFocus, count, signature]);

  if (items.length === 0) return null;

  return (
    <Feedback ref={innerRef} tone="danger" title={title ?? DEFAULT_TITLE} tabIndex={-1} {...rest}>
      <Column as="ul" gap="4" margin="0" paddingLeft="20">
        {items.map((item, index) => (
          <Text
            as="li"
            // The index too: a field with two errors appears twice.
            // biome-ignore lint/suspicious/noArrayIndexKey: ids may repeat; the list is static per render
            key={`${item.id ?? ""}#${index}`}
            textVariant="body-default-s"
            onBackground="danger-medium"
          >
            {item.id ? (
              <a
                href={`#${item.id}`}
                style={{ color: "inherit" }}
                onClick={(event) => {
                  // Follow the hash only if there is nothing to focus, so
                  // the field is focused rather than merely scrolled to.
                  if (focusControl(item.id as string)) event.preventDefault();
                }}
              >
                {item.message}
              </a>
            ) : (
              item.message
            )}
          </Text>
        ))}
      </Column>
    </Feedback>
  );
};

FormErrorSummary.displayName = "FormErrorSummary";

export type { FormErrorItem, FormErrorSummaryProps };
export { FormErrorSummary };

"use client";

import { type ReactNode, useId } from "react";
import { useFieldSize } from "../components/FormContext";
import type { TShirtSizes } from "../types";

/** The three sizes a checkbox, radio or switch is drawn at. */
export type ControlSize = "s" | "m" | "l";

/**
 * The field chrome Checkbox, RadioButton, Switch and RadioGroup share with
 * Input: `size` (their own, else the enclosing `Form`'s, else `"m"`), and
 * `error` / `errorMessage`.
 */
export interface ControlChromeProps {
  /**
   * The control's size. Left out, it takes the enclosing `Form`'s `size`, as
   * Input does; `"m"` outside one. `xs` draws as `s` and `xl` as `l`.
   */
  size?: TShirtSizes;
  /** Mark the control invalid: a danger border and `aria-invalid`. */
  error?: boolean;
  /**
   * The message under the control, linked to it with `aria-describedby`. It
   * marks the control invalid too.
   */
  errorMessage?: ReactNode;
}

const shows = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

/** The resolved size, the invalid state and the message id of one control. */
export function useControlChrome({ size, error, errorMessage }: ControlChromeProps) {
  const field = useFieldSize(size);
  const errorId = useId();
  const showsError = shows(errorMessage);
  return {
    size: (field === "xs" ? "s" : field === "xl" ? "l" : field) as ControlSize,
    invalid: Boolean(error) || showsError,
    showsError,
    errorId,
  };
}

/** `aria-describedby` from the ids that render, or `undefined` for none. */
export function describedBy(...ids: (string | false | undefined)[]): string | undefined {
  const joined = ids.filter(Boolean).join(" ");
  return joined || undefined;
}

/** The label, description and error text presets for a control size. */
export const CONTROL_TEXT = {
  s: { label: "label-default-s", body: "body-default-xs" },
  m: { label: "label-default-m", body: "body-default-s" },
  l: { label: "label-default-l", body: "body-default-m" },
} as const;

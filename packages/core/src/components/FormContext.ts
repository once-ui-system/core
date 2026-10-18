"use client";

import { createContext, useContext } from "react";
import type { TShirtSizes } from "../types.js";

/**
 * What a `Form` hands down to the fields inside it.
 *
 * Kept out of the package's exports on purpose: this is how `Form` and the
 * field primitives agree on a default, not an API for callers to reach into.
 * A context rather than a cloned prop because `Form` wraps arbitrary children
 * — cloning `size` onto one that is not a field would put a stray attribute
 * in the DOM.
 */
export interface FormFieldDefaults {
  size?: TShirtSizes;
}

export const FormFieldContext = createContext<FormFieldDefaults>({});

/**
 * Resolve a field's size. The field's own prop always wins; a `Form` only
 * supplies a default, and `"m"` remains the default outside one.
 */
export const useFieldSize = (own?: TShirtSizes): TShirtSizes => {
  const inherited = useContext(FormFieldContext).size;
  return own ?? inherited ?? "m";
};

/**
 * What a `Field` tells the control it wraps.
 *
 * `Field` already hands the control its `id` and `aria-*` attributes as props.
 * This carries the one thing a prop cannot: `Input` and `Textarea` compute
 * their own `aria-invalid` and error styling and would overwrite an
 * `aria-invalid` passed in. So they read `invalid` from here instead — but
 * only when their `id` is the field's, so the search box inside a `Select`, or
 * any other field nested in the control, is never marked invalid by accident.
 */
export interface FieldControl {
  id: string;
  invalid: boolean;
  required: boolean;
  /** Space-separated ids of the field's hint and error, when they render. */
  describedBy?: string;
}

export const FieldControlContext = createContext<FieldControl | null>(null);

/**
 * The enclosing `Field`'s state, for a custom control that wants to wire
 * itself up. `null` outside a `Field`.
 */
export const useField = (): FieldControl | null => useContext(FieldControlContext);

/** Whether the control with this `id` is the one an enclosing `Field` marks invalid. */
export const useFieldInvalid = (id: string | undefined): boolean => {
  const field = useContext(FieldControlContext);
  return Boolean(field && id !== undefined && field.id === id && field.invalid);
};

/**
 * What a `Form` tells its submit button. Only provided by a `Form` that can
 * submit (`as="form"`) or that is told it is pending, so a layout-only `Form`
 * nested in a `Fieldset` does not reset the outer form's state.
 */
export interface FormStatus {
  pending: boolean;
}

export const FormStatusContext = createContext<FormStatus>({ pending: false });

/** Whether the enclosing `Form` is submitting. `false` outside one. */
export const useFormPending = (): boolean => useContext(FormStatusContext).pending;

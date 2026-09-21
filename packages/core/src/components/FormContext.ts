"use client";

import { createContext, useContext } from "react";
import type { TShirtSizes } from "../types";

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

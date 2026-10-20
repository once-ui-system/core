import { createContext, useContext } from "react";
import type { TShirtSizes } from "../types";

/**
 * What a `Form` (and a `Fieldset`) hands down to the fields inside it: a
 * default size, and `disabled` from a disabled `Fieldset`. A field's own
 * prop always wins.
 */
export interface FormFieldDefaults {
  size?: TShirtSizes;
  disabled?: boolean;
}

export const FormFieldContext = createContext<FormFieldDefaults>({});

export const useFormFieldDefaults = () => useContext(FormFieldContext);

/** Which corners of a field stay round in a `density="stacked"` Form, in points. */
export interface FormCellCorners {
  tl: boolean;
  tr: boolean;
  bl: boolean;
  br: boolean;
}

/**
 * Set by a stacked `Form` around each cell and read by the first `Input`
 * inside it. Fields that open a sheet reset it to `null` around the sheet, so
 * a search box there keeps its own corners.
 */
export const FormCellContext = createContext<FormCellCorners | null>(null);

/**
 * What a `Form` tells its `SubmitButton`: whether a submit is running, and
 * how to start one. React Native has no `<form>`, so the button submits.
 */
export interface FormStatus {
  pending: boolean;
  submit?: () => void;
}

export const FormStatusContext = createContext<FormStatus>({ pending: false });

/** Whether the enclosing `Form` is submitting. `false` outside one. */
export const useFormPending = (): boolean => useContext(FormStatusContext).pending;

import { createContext, useContext } from "react";

/**
 * Whether a disabled `Fieldset` is around this control. A native control
 * inside `<fieldset disabled>` is disabled by the browser, but the custom
 * ones (Checkbox, Switch, RadioButton, RadioGroup) are `role` elements the
 * browser leaves alone: they stayed focusable and kept toggling.
 */
export const FieldsetDisabledContext = createContext(false);

/** `own`, or true inside a disabled Fieldset. */
export const useFieldsetDisabled = (own?: boolean): boolean => {
  const inherited = useContext(FieldsetDisabledContext);
  return Boolean(own) || inherited;
};

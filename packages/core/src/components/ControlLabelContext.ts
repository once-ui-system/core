"use client";

import { createContext, useContext } from "react";

/**
 * The id(s) of a visible label rendered outside a control, as `Setting` and
 * `SettingAxes` do. A control with no name of its own points
 * `aria-labelledby` at it, so the row's label is also the control's name.
 */
export const ControlLabelContext = createContext<string | undefined>(undefined);

export const useControlLabel = () => useContext(ControlLabelContext);

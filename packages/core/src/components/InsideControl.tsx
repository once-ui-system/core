"use client";

import type { ReactNode } from "react";
import { InsideControlContext } from "../internal/InsideControlContext.js";

export interface InsideControlProps {
  children?: ReactNode;
}

/**
 * Marks its content as part of a control you drew yourself (a `role="button"`
 * or `role="radio"` element with its own onClick): a Button or IconButton
 * inside with no onClick, href or type then renders a plain div that only
 * decorates it, instead of a `<button>` nested in your control. Core's own
 * controls (a clickable Card, SmartLink, a Button) do this already.
 */
const InsideControl = ({ children }: InsideControlProps) => (
  <InsideControlContext.Provider value>{children}</InsideControlContext.Provider>
);

InsideControl.displayName = "InsideControl";

export { InsideControl };

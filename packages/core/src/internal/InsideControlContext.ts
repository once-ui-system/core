"use client";

import { createContext } from "react";

/**
 * True inside an element that is already the control: a real button or link
 * that ElementType rendered, or a core component that draws its own control
 * around a Button (Kbar's trigger, CompareImage's slider handle).
 *
 * A Button or IconButton with no onClick, href or type renders a real
 * `<button type="button">` everywhere else, so agents and assistive tech can
 * find and press it. Inside a control it stays a plain div: it only decorates
 * the outer control, and a button inside a button is invalid HTML.
 *
 * Internal: not exported from the package.
 */
export const InsideControlContext = createContext(false);

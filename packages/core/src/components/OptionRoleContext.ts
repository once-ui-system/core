"use client";

import { createContext } from "react";

/**
 * The role an Option takes in the list it is rendered in. Internal: not
 * exported from the package.
 *
 * An Option is a `listbox` option everywhere but in a ContextMenu, which is a
 * `menu`: there its items are `menuitem`s, and `aria-selected` (which a menu
 * item cannot carry) is left off.
 */
export const OptionRoleContext = createContext<"option" | "menuitem">("option");

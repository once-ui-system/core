import { createContext } from "react";

/**
 * What a Sidebar tells the Nav inside it. `null` outside a Sidebar, where a
 * Nav sets its own width and collapse. Kept out of Sidebar.tsx so Nav does
 * not import the Sidebar, and out of the public index.
 */
export interface SidebarRailState {
  /** The sidebar is an icon rail right now: collapsed and not peeking. */
  iconsOnly: boolean;
}

export const SidebarRailContext = createContext<SidebarRailState | null>(null);

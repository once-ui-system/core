"use client";

import { forwardRef } from "react";
import { sections, type StylePanelRootProps, type StylePanelVisibility } from "./StylePanelSections";

export type {
  StylePanelValue,
  StylePanelVisibility,
  StylePanelRootProps,
  StyleRowProps,
  StyleGroupProps,
} from "./StylePanelSections";
export { useStylePanel } from "./StylePanelSections";

export interface StylePanelProps extends StylePanelRootProps {
  /** Hide whole sections or individual rows. Omitted keys stay visible. */
  visibility?: StylePanelVisibility;
}

const visible = (section: { section?: boolean } | undefined) => section?.section !== false;

/**
 * The default arrangement of every style section.
 *
 * It is a plain composition of its own parts, so a host that needs a different
 * arrangement — or only two of the sections — can drop this and compose
 * `StylePanel.Page`, `StylePanel.Brand` and the rest directly inside
 * `StylePanel.Root`. Pass `value` and `onChange` to take over the state, in
 * which case nothing is written to ThemeProvider or storage.
 */
const StylePanel = forwardRef<HTMLDivElement, StylePanelProps>(({ visibility, ...rest }, ref) => (
  <sections.Root ref={ref} {...rest}>
    {visible(visibility?.page) && <sections.Page rows={visibility?.page} />}
    {visible(visibility?.color) && <sections.Color rows={visibility?.color} />}
    {visible(visibility?.solidStyle) && <sections.SolidStyle rows={visibility?.solidStyle} />}
    {visibility?.bodyText?.section === true && <sections.BodyText rows={visibility?.bodyText} />}
    {visible(visibility?.advanced) && <sections.Advanced rows={visibility?.advanced} />}
  </sections.Root>
));

StylePanel.displayName = "StylePanel";

const StylePanelWithSections = Object.assign(StylePanel, sections);

export { StylePanelWithSections as StylePanel };

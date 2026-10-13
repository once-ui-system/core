"use client";

import { forwardRef } from "react";
import {
  type StylePanelLabels,
  type StylePanelRootProps,
  type StylePanelVisibility,
  sections,
} from "./StylePanelSections";

export type {
  StyleGroupProps,
  StylePanelCustomLabels,
  StylePanelGroupLabels,
  StylePanelHeading,
  StylePanelLabels,
  StylePanelNameLabels,
  StylePanelOptionLabels,
  StylePanelRootProps,
  StylePanelRowLabels,
  StylePanelSchemeRow,
  StylePanelSwatchLabels,
  StylePanelValue,
  StylePanelVisibility,
  StyleRowProps,
  StyleSchemeRowProps,
} from "./StylePanelSections";
export { useStylePanel } from "./StylePanelSections";

export interface StylePanelProps extends StylePanelRootProps {
  /** Hide whole sections or individual rows. Omitted keys stay visible. */
  visibility?: StylePanelVisibility;
  /**
   * Restated from `StylePanelRootProps` — indexed so the types stay tied to
   * one declaration — because this is the component's public surface, and an
   * inherited prop is invisible to anything reading the generated spec.
   */
  value?: StylePanelRootProps["value"];
  onChange?: StylePanelRootProps["onChange"];
  /**
   * Every string the panel shows or announces, over the English defaults.
   * Restated for the same reason; it names its type rather than indexing it,
   * so the spec points at the shape a translation fills in.
   */
  labels?: StylePanelLabels;
  /**
   * End the Brand and Accent swatches with one for a colour of the host's
   * own, edited in a colour field and reported as `brandSeed`/`accentSeed`.
   * Controlled mode only: bound to ThemeProvider, which takes no seed from
   * the panel, the swatch does not render. The panel never generates the
   * scheme; the host renders it from the seed.
   */
  customColors?: boolean;
  /** Put each row's label above its control, for a narrow sidebar. */
  stacked?: boolean;
}

const visible = (section: { section?: boolean } | undefined) => section?.section !== false;

/**
 * The default arrangement of every style section.
 *
 * It is a plain composition of its own parts, so a host that needs a different
 * arrangement — or only two of the sections — can drop this and compose
 * `StylePanel.Page`, `StylePanel.Brand` and the rest directly inside
 * `StylePanel.Root`. Pass `value` and `onChange` to take over the state, in
 * which case nothing is written to ThemeProvider or storage, and `labels` to
 * translate it.
 */
const StylePanel = forwardRef<HTMLDivElement, StylePanelProps>(
  ({ visibility, customColors, ...rest }, ref) => (
    <sections.Root ref={ref} {...rest}>
      {visible(visibility?.page) && <sections.Page rows={visibility?.page} />}
      {visible(visibility?.color) && (
        <sections.Color rows={visibility?.color} customColors={customColors} />
      )}
      {visible(visibility?.solidStyle) && <sections.SolidStyle rows={visibility?.solidStyle} />}
      {visibility?.bodyText?.section === true && <sections.BodyText rows={visibility?.bodyText} />}
      {visible(visibility?.advanced) && <sections.Advanced rows={visibility?.advanced} />}
    </sections.Root>
  ),
);

StylePanel.displayName = "StylePanel";

const StylePanelWithSections = Object.assign(StylePanel, sections);

export { StylePanelWithSections as StylePanel };

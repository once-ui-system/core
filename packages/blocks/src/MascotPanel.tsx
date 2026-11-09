"use client";

import { Column } from "@once-ui-system/core";
import type { ReactNode } from "react";
import styles from "./MascotPanel.module.scss";
import {
  MascotPanelAccessories,
  MascotPanelBody,
  MascotPanelEyes,
  MascotPanelFace,
  type MascotPanelLabels,
  MascotPanelMotion,
  MascotPanelPreview,
  MascotPanelRoot,
  type MascotPanelRootProps,
  type MascotPanelVisibility,
  MascotPanelWorking,
} from "./MascotPanelSections.js";

export type {
  MascotPanelActionsProps,
  MascotPanelContextValue,
  MascotPanelHeading,
  MascotPanelLabels,
  MascotPanelRootProps,
  MascotPanelVisibility,
} from "./MascotPanelSections.js";
export {
  MascotPanelAccessories,
  MascotPanelActions,
  MascotPanelBody,
  MascotPanelColor,
  MascotPanelEyes,
  MascotPanelFace,
  MascotPanelMotion,
  MascotPanelPreview,
  MascotPanelRoot,
  MascotPanelWorking,
  randomMascotDesign,
  useMascotPanel,
  useMascotPanelLabels,
} from "./MascotPanelSections.js";

export interface MascotPanelProps extends MascotPanelRootProps {
  /**
   * Restated from `MascotPanelRootProps` so the generated spec shows them: the
   * design, controlled, and what hears each change.
   */
  value?: MascotPanelRootProps["value"];
  onValueChange?: MascotPanelRootProps["onValueChange"];
  /** Every string the panel shows or announces, over the English defaults. */
  labels?: MascotPanelLabels;
  /** Hide whole sections or single rows. Omitted keys stay visible. */
  visibility?: MascotPanelVisibility;
  /**
   * Where the live preview goes: `side` (default) beside the controls, stuck
   * while they scroll and above them when narrow; `top` above them; `none`
   * leaves it to the host.
   */
  preview?: "side" | "top" | "none";
  /**
   * Export buttons after the free ones (JSON, JSX, SVG, PNG): a product's own,
   * or Pro ones such as animated emotes. They read the design with `useMascotPanel()`.
   */
  exports?: ReactNode;
  /** Labels above controls. Defaults to on with `preview="side"`, where each column is narrow. */
  stacked?: boolean;
}

const visible = (section: { section?: boolean } | undefined) => section?.section !== false;

/**
 * A character designer for the Mascot: body, eyes, face, accessories, how it
 * works and how it moves, with a live preview to try its states and moods.
 * It edits a `MascotDesign`, plain JSON an app stores and spreads back onto
 * `<Mascot />` with `mascotDesignProps`.
 *
 * Like StylePanel it is a plain composition of its own parts: compose
 * `MascotPanelRoot` with only the sections you need for a smaller one.
 */
const MascotPanel = ({
  ref,
  visibility,
  preview = "side",
  exports,
  stacked,
  ...rest
}: MascotPanelProps) => {
  const previewSection = preview !== "none" && visible(visibility?.preview) && (
    <MascotPanelPreview rows={visibility?.preview} exports={exports} />
  );
  const sections = (
    <Column fillWidth gap="16" minWidth={0}>
      {visible(visibility?.body) && <MascotPanelBody rows={visibility?.body} />}
      {visible(visibility?.eyes) && <MascotPanelEyes rows={visibility?.eyes} />}
      {visible(visibility?.face) && <MascotPanelFace rows={visibility?.face} />}
      {visible(visibility?.accessories) && (
        <MascotPanelAccessories rows={visibility?.accessories} />
      )}
      {visible(visibility?.working) && <MascotPanelWorking rows={visibility?.working} />}
      {visible(visibility?.motion) && <MascotPanelMotion rows={visibility?.motion} />}
    </Column>
  );
  return (
    // Beside the preview the controls have half the width, so their labels go above them.
    <MascotPanelRoot ref={ref} stacked={stacked ?? preview === "side"} {...rest}>
      {preview === "side" && previewSection ? (
        <div className={styles.layout}>
          <div className={styles.aside}>{previewSection}</div>
          {sections}
        </div>
      ) : (
        <>
          {previewSection}
          {sections}
        </>
      )}
    </MascotPanelRoot>
  );
};

MascotPanel.displayName = "MascotPanel";

export { MascotPanel };

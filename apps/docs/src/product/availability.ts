import type { ColorScheme } from "@once-ui-system/core";

/**
 * Whether what a page documents can actually be installed today.
 *
 * This is a different axis from `navTag`, and the two are deliberately not
 * merged. `navTag` ("New" / "Update") says *when something changed* and decays
 * on a timer — `Sidebar.tsx` greys it at 30 days and drops it at 60.
 * Availability does not decay: a page stays marked until the release that
 * ships it. Something can also be both at once, which one field could not
 * express.
 *
 * Nobody writes it. `published.ts` reads it from the package on npm, so it
 * cannot outlive the release the way a hand-kept frontmatter flag did. Absent
 * means available on the dist-tag readers install from.
 */
export type Availability = "unreleased";

interface AvailabilityCopy {
  /** Sidebar label. Kept to one short word — the nav column is narrow. */
  tag: string;
  /** Semantic only: `Tag` takes `ColorScheme`, not the extended palette. */
  scheme: ColorScheme;
  /** Leading phrase on the page notice, in the notice's own colour. */
  headline: string;
  /** What the reader has to do about it, if anything. */
  detail: string;
}

export const AVAILABILITY: Record<Availability, AvailabilityCopy> = {
  unreleased: {
    // "Unreleased" is the accurate word and too long for the nav column; the
    // page notice below carries the precise version of it.
    tag: "Soon",
    scheme: "warning",
    headline: "Not released yet.",
    detail: "The published package does not include this yet, so it will not install today.",
  },
};

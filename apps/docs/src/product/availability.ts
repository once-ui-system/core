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
 * Absent means available on the `latest` dist-tag. That is the common case, so
 * it costs nothing to write. 2.0.0 retired the `"alpha"` status along with the
 * alpha dist-tag: everything it marked is on `latest` now.
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
    detail: "This is on main and is not in any published version yet. It will not install today.",
  },
};

/** Narrow an arbitrary frontmatter value to a status we know how to render. */
export function toAvailability(value: unknown): Availability | undefined {
  return value === "unreleased" ? value : undefined;
}

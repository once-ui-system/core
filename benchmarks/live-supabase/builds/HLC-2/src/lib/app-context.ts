import "server-only";
import { cache } from "react";
import { getViewer } from "@/lib/auth";
import { getOrgAccess } from "@/lib/orgs/queries";

// Per-request memoised lookups, so the layout and the page share one query.
export const currentViewer = cache(getViewer);

export const orgAccessFor = cache(async (slug: string) => {
  const viewer = await currentViewer();
  if (!viewer) return null;
  return getOrgAccess(viewer.id, slug);
});

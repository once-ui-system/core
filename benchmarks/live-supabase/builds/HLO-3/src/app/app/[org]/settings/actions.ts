"use server";

import { revalidatePath } from "next/cache";
import { canManage, getViewer, orgAccess, renameOrg } from "@/lib/orgs";

export type RenameState = { error?: string; message?: string };

/** Renames the organization. Checked on the server: owners and admins only. */
export async function renameOrganization(slug: string, _prev: RenameState, formData: FormData): Promise<RenameState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sign in first." };

  const access = await orgAccess(viewer, slug);
  if (!access) return { error: "Organization not found." };
  if (!canManage(access)) return { error: "Only owners and admins can rename the organization." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name || name.length > 80) return { error: "Use a name of 1 to 80 characters." };

  const saved = await renameOrg(viewer, access.id, name);
  if (!saved) return { error: "The organization could not be renamed." };

  revalidatePath("/app", "layout");
  return { message: "Saved." };
}

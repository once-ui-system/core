"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrgError, createOrganization, renameOrganization } from "@/lib/orgs/actions";
import { currentViewer, orgAccessFor } from "@/lib/app-context";
import { isSupabaseConfigured } from "@/lib/env";

export type ActionState = { error?: string; message?: string } | undefined;

export async function createOrgAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await currentViewer();
  if (!viewer) redirect("/auth?next=/app/new");
  let slug: string;
  try {
    const org = await createOrganization(viewer.id, String(formData.get("name") ?? ""));
    slug = org.slug;
  } catch (error) {
    return { error: error instanceof OrgError ? error.message : "Could not create the organization." };
  }
  redirect(`/app/${slug}`);
}

export async function renameOrgAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const slug = String(formData.get("slug") ?? "");
  const access = await orgAccessFor(slug);
  if (!access) return { error: "Organization not found." };
  try {
    await renameOrganization(access.org, access.role, String(formData.get("name") ?? ""));
  } catch (error) {
    return { error: error instanceof OrgError ? error.message : "Could not save the name." };
  }
  revalidatePath(`/app/${slug}`, "layout");
  return { message: isSupabaseConfigured() ? "Saved." : "Saved in demo mode (nothing is stored)." };
}

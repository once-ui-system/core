import { notFound, redirect } from "next/navigation";
import { isSupabaseConfigured } from "../env";
import { createSupabaseServerClient } from "../supabase/server";
import { DEMO_VIEWER, demoRepo } from "./demo";
import { supabaseRepo } from "./supabase";
import { CAN_MANAGE, type OrgAccess, type Repo, type Viewer } from "./types";

export * from "./types";

function repo(): Repo {
  return isSupabaseConfigured() ? supabaseRepo : demoRepo;
}

/** The signed-in user, or null. Demo mode has one fixed viewer. */
export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return DEMO_VIEWER;
  const sb = await createSupabaseServerClient();
  const { data } = await sb.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}

export const listOrgs = (viewer: Viewer) => repo().listOrgs(viewer);
export const createOrg = (viewer: Viewer, name: string) => repo().createOrg(viewer, name);
export const renameOrg = (viewer: Viewer, orgId: string, name: string) => repo().renameOrg(viewer, orgId, name);
export const listMembers = (orgId: string) => repo().listMembers(orgId);
export const createInvitation = (...args: Parameters<Repo["createInvitation"]>) => repo().createInvitation(...args);
export const acceptInvitation = (viewer: Viewer, token: string) => repo().acceptInvitation(viewer, token);
export const setOrgPlan = (orgId: string, plan: "free" | "team") => repo().setPlan(orgId, plan);

/**
 * The organization in `slug`, if the viewer is a member; null otherwise (so a
 * non-member learns nothing about it). Every org-scoped page and route calls this.
 */
export async function orgAccess(viewer: Viewer, slug: string): Promise<OrgAccess | null> {
  return repo().findOrg(viewer, slug);
}

export const canManage = (access: Pick<OrgAccess, "role">) => CAN_MANAGE.includes(access.role);

/**
 * For org-scoped pages: the viewer and their access to `slug`. Signed out goes to
 * sign-in; a non-member gets the not-found page, so tenants cannot probe each other.
 */
export async function requireOrgAccess(slug: string) {
  const viewer = await getViewer();
  if (!viewer) redirect("/auth");
  const access = await orgAccess(viewer, slug);
  if (!access) notFound();
  return { viewer, access };
}

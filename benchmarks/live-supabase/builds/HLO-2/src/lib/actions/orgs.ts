"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { requestOrigin, safeNextPath } from "@/lib/http";
import {
  acceptInvitation,
  createInvitation,
  createOrganization,
  listMyOrganizations,
  renameOrganization,
} from "@/lib/orgs/service";
import { canManage, INVITE_ROLES, type InviteRole } from "@/lib/orgs/types";
import { createSessionClient } from "@/lib/supabase/server";

export type OrgState = { error?: string; message?: string; url?: string };

const NOT_CONFIGURED = "Supabase is not configured, so this change is off in demo mode.";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function createOrganizationAction(_prev: OrgState, formData: FormData): Promise<OrgState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const name = field(formData, "name");
  if (!name || name.length > 80) return { error: "Enter a name of up to 80 characters." };
  const sb = await createSessionClient();
  let org;
  try {
    org = await createOrganization(sb, name);
  } catch {
    return { error: "The organization could not be created. Sign in again and retry." };
  }
  redirect(`/app/${org.slug}`);
}

export async function renameOrganizationAction(_prev: OrgState, formData: FormData): Promise<OrgState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const slug = field(formData, "org");
  const name = field(formData, "name");
  if (!name || name.length > 80) return { error: "Enter a name of up to 80 characters." };
  const sb = await createSessionClient();
  const orgs = await listMyOrganizations(sb);
  const org = orgs.find((o) => o.slug === slug);
  if (!org) return { error: "Organization not found." };
  if (!canManage(org.role)) return { error: "Only owners and admins can rename the organization." };
  try {
    await renameOrganization(sb, org.id, name);
  } catch {
    return { error: "The name could not be saved." };
  }
  revalidatePath("/app", "layout");
  return { message: "Saved." };
}

export async function createInvitationAction(_prev: OrgState, formData: FormData): Promise<OrgState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const slug = field(formData, "org");
  const email = field(formData, "email").toLowerCase();
  const role = field(formData, "role") as InviteRole;
  if (!INVITE_ROLES.includes(role)) return { error: "Choose member or admin." };
  if (email && !email.includes("@")) return { error: "Enter a valid email address, or leave it empty." };

  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { error: "Sign in first." };
  const org = (await listMyOrganizations(sb)).find((o) => o.slug === slug);
  if (!org) return { error: "Organization not found." };
  if (!canManage(org.role)) return { error: "Only owners and admins can invite people." };

  try {
    const token = await createInvitation(sb, {
      orgId: org.id,
      createdBy: user.id,
      email: email || null,
      role,
    });
    const origin = requestOrigin(await headers());
    return { message: "Invitation link created. It works for 7 days.", url: `${origin}/invite/${token}` };
  } catch {
    return { error: "The invitation could not be created." };
  }
}

export async function acceptInvitationAction(_prev: OrgState, formData: FormData): Promise<OrgState> {
  if (!isSupabaseConfigured()) return { error: NOT_CONFIGURED };
  const token = field(formData, "token");
  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  let org;
  try {
    org = await acceptInvitation(sb, token);
  } catch {
    return { error: "The invitation could not be used. Try again." };
  }
  if (!org) return { error: "This invitation is invalid or has expired." };
  redirect(safeNextPath(`/app/${org.slug}`));
}

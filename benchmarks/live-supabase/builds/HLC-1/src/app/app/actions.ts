"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/env";
import { getMyOrg } from "@/lib/orgs/context";
import { createInvitation, createOrganization, listMembers, renameOrganization } from "@/lib/orgs/data";
import { canManage, isInvitableRole } from "@/lib/orgs/types";
import { createClient } from "@/lib/supabase/server";
import { createTeamCheckoutSession, StripeError } from "@/lib/stripe";

export type ActionState = { error?: string; message?: string; link?: string } | undefined;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const demo = "Changes are not saved in demo mode.";

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "";
}

// Every org action re-checks membership and role on the server, whatever the page showed.
export async function createOrg(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: demo };
  const name = text(formData, "name");
  if (name.length < 1 || name.length > 80) return { error: "Use 1 to 80 characters." };
  const supabase = await createClient();
  let slug: string;
  try {
    slug = (await createOrganization(supabase, name)).slug;
  } catch {
    return { error: "Sign in again, then retry." };
  }
  redirect(`/app/${slug}`);
}

export async function inviteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: demo };
  const slug = text(formData, "slug");
  const org = await getMyOrg(slug);
  if (!org) return { error: "Organization not found." };
  if (!canManage(org.role)) return { error: "Only owners and admins can invite people." };

  const role = text(formData, "role");
  if (!isInvitableRole(role)) return { error: "Choose member or admin." };
  const email = text(formData, "email").toLowerCase();
  if (email && (email.length > 320 || !EMAIL.test(email))) return { error: "Enter a valid email or leave it empty." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sign in again, then retry." };
  const token = randomBytes(32).toString("base64url");
  try {
    await createInvitation(supabase, {
      orgId: org.id,
      createdBy: data.user.id,
      email: email || null,
      role,
      token,
    });
  } catch {
    return { error: "Could not create the invitation." };
  }
  return { message: "Invitation created. Share this link; it expires in 7 days.", link: `${await origin()}/invite/${token}` };
}

export async function renameOrg(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: demo };
  const slug = text(formData, "slug");
  const org = await getMyOrg(slug);
  if (!org) return { error: "Organization not found." };
  if (!canManage(org.role)) return { error: "Only owners and admins can rename the organization." };
  const name = text(formData, "name");
  if (name.length < 1 || name.length > 80) return { error: "Use 1 to 80 characters." };
  const supabase = await createClient();
  let saved = false;
  try {
    saved = await renameOrganization(supabase, org.id, name);
  } catch {
    return { error: "Could not save the name." };
  }
  if (!saved) return { error: "You do not have permission to rename this organization." };
  revalidatePath(`/app/${slug}`, "layout");
  return { message: "Name saved." };
}

export async function upgradeToTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: demo };
  const slug = text(formData, "slug");
  const org = await getMyOrg(slug);
  if (!org) return { error: "Organization not found." };
  if (!canManage(org.role)) return { error: "Only owners and admins can upgrade." };
  if (org.plan === "team") return { message: "This organization is already on the Team plan." };

  const supabase = await createClient();
  let members: number;
  try {
    members = (await listMembers(supabase, org.id)).length;
  } catch {
    return { error: "Could not read the members." };
  }
  const base = await origin();
  let url: string;
  try {
    ({ url } = await createTeamCheckoutSession({
      orgId: org.id,
      quantity: members,
      successUrl: `${base}/app/${slug}/settings?checkout=success`,
      cancelUrl: `${base}/app/${slug}/settings?checkout=cancelled`,
    }));
  } catch (error) {
    if (error instanceof StripeError) return { error: error.message };
    return { error: "Could not start checkout." };
  }
  redirect(url);
}

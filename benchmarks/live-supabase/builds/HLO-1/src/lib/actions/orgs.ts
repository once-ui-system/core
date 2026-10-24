"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, originOf } from "../auth";
import {
  checkOrgAccess,
  createInvitation,
  createOrganization,
  acceptInvitation,
  renameOrganization,
  validOrgName,
} from "../orgs";
import { createTeamCheckoutSession, stripeConfigured } from "../stripe";
import { isSupabaseConfigured } from "../supabase/config";
import type { FormState } from "./auth";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const signInFirst: FormState = { error: "Sign in to continue." };

export async function createOrgAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured, so organizations are unavailable." };
  const user = await getCurrentUser();
  if (!user) return signInFirst;
  const name = validOrgName(text(formData, "name"));
  if (!name) return { error: "Name the organization (up to 80 characters)." };
  const org = await createOrganization(user.id, name);
  revalidatePath("/app", "layout");
  redirect(`/app/${org.slug}`);
}

export async function renameOrgAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };
  const user = await getCurrentUser();
  if (!user) return signInFirst;
  const slug = text(formData, "slug");
  const name = validOrgName(text(formData, "name"));
  if (!name) return { error: "Name the organization (up to 80 characters)." };
  const access = await checkOrgAccess(slug, user.id, true);
  if (!access.ok) return { error: "Only owners and admins can rename the organization." };
  await renameOrganization(access.access.id, name);
  revalidatePath("/app", "layout");
  return { message: "Saved." };
}

export async function createInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };
  const user = await getCurrentUser();
  if (!user) return signInFirst;
  const slug = text(formData, "slug");
  const role = text(formData, "role");
  const email = text(formData, "email");
  if (role !== "member" && role !== "admin") return { error: "Choose member or admin." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "That email address does not look right." };

  const access = await checkOrgAccess(slug, user.id, true);
  if (!access.ok) return { error: "Only owners and admins can invite people." };
  const { token } = await createInvitation(access.access, user.id, role, email || null);
  const origin = originOf(await headers());
  return { message: "Invitation link created. It expires in 7 days.", url: `${origin}/invite/${token}` };
}

export async function acceptInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };
  const user = await getCurrentUser();
  if (!user) return signInFirst;
  const result = await acceptInvitation(text(formData, "token"), user);
  if (!result.ok) return { error: result.error };
  revalidatePath("/app", "layout");
  redirect(`/app/${result.org.slug}`);
}

export async function startCheckoutAction(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: "Supabase is not configured." };
  if (!stripeConfigured()) return { error: "Stripe is not configured, so upgrades are unavailable." };
  const user = await getCurrentUser();
  if (!user) return signInFirst;
  const slug = text(formData, "slug");
  const access = await checkOrgAccess(slug, user.id, true);
  if (!access.ok) return { error: "Only owners and admins can upgrade the plan." };
  if (access.access.plan === "team") return { message: "This organization is already on the Team plan." };

  const origin = originOf(await headers());
  const url = await createTeamCheckoutSession({
    orgId: access.access.id,
    successUrl: `${origin}/app/${slug}/settings?billing=success`,
    cancelUrl: `${origin}/app/${slug}/settings?billing=cancelled`,
    stripeCustomerId: null,
  });
  redirect(url);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { headers } from "next/headers";
import {
  HttpError,
  createInvitation,
  createOrganization,
  renameOrganization,
  requireManager,
  requireUser,
} from "@/lib/orgs/server";
import { createCheckoutSession } from "@/lib/stripe";

export type ActionState = { error?: string; message?: string; url?: string } | undefined;

const DEMO = "Demo mode: connect Supabase to enable this.";

function fail(e: unknown): ActionState {
  return { error: e instanceof Error ? e.message : "Something went wrong" };
}

export async function createOrgAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO };
  let slug: string;
  try {
    const user = await requireUser();
    slug = (await createOrganization(user.id, String(fd.get("name") ?? ""))).slug;
  } catch (e) {
    return fail(e);
  }
  redirect(`/app/${slug}`);
}

export async function inviteAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO };
  try {
    const user = await requireUser();
    const org = await requireManager(user.id, String(fd.get("org") ?? ""));
    const email = String(fd.get("email") ?? "");
    const token = await createInvitation(user.id, org, String(fd.get("role") ?? "member"), email);
    const origin = (await headers()).get("origin") ?? "";
    revalidatePath(`/app/${org.slug}`, "layout");
    return { message: "Invitation link created. It expires in 7 days.", url: `${origin}/invite/${token}` };
  } catch (e) {
    return fail(e);
  }
}

export async function renameOrgAction(_: ActionState, fd: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: DEMO };
  try {
    const user = await requireUser();
    const org = await requireManager(user.id, String(fd.get("org") ?? ""));
    await renameOrganization(org.id, String(fd.get("name") ?? ""));
    revalidatePath(`/app/${org.slug}`, "layout");
    return { message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function upgradeAction(fd: FormData) {
  if (!isSupabaseConfigured()) return;
  const slug = String(fd.get("org") ?? "");
  let url: string;
  try {
    const user = await requireUser();
    const org = await requireManager(user.id, slug);
    const origin = (await headers()).get("origin") ?? "";
    url = await createCheckoutSession({
      orgId: org.id,
      successUrl: `${origin}/app/${org.slug}/settings?upgraded=1`,
      cancelUrl: `${origin}/app/${org.slug}/settings`,
    });
  } catch (e) {
    if (e instanceof HttpError) redirect(`/app/${slug}/settings`);
    throw e;
  }
  redirect(url);
}

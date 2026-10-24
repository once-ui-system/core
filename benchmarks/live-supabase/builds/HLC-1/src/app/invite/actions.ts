"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { acceptInvitation, InvitationError } from "@/lib/orgs/data";
import { createClient } from "@/lib/supabase/server";

// Joins the signed-in user to the invitation's organization, then opens it.
export async function acceptInvite(token: string) {
  if (!isSupabaseConfigured()) redirect("/app");
  const supabase = await createClient();
  let slug: string;
  try {
    slug = (await acceptInvitation(supabase, token)).slug;
  } catch (error) {
    const code = error instanceof InvitationError ? error.message : "unknown";
    redirect(`/invite/${encodeURIComponent(token)}?error=${encodeURIComponent(code)}`);
  }
  redirect(`/app/${slug}`);
}

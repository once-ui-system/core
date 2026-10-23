import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AcceptInvite } from "../../../components/AcceptInvite";
import { isSupabaseConfigured } from "../../../lib/env";
import { currentUser } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join an organization", description: "Accept your invitation to Acme Notes." };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (isSupabaseConfigured() && !(await currentUser())) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  return <AcceptInvite token={token} demo={!isSupabaseConfigured()} />;
}

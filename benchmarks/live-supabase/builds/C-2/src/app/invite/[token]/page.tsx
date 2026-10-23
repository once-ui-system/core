import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AcceptInvite } from "@/components/auth/accept-invite";
import { DemoNotice } from "@/components/site/demo-notice";
import { getSessionUser } from "@/lib/orgs";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: "Join an organization",
  description: "Accept your invitation to join an organization on Acme Notes.",
};

async function Body({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isSupabaseConfigured()) {
    return <p className="text-muted-foreground">Supabase is not configured, so invitations are off in demo mode.</p>;
  }
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  return (
    <>
      <p className="text-muted-foreground">You have been invited to join an organization as {user.email}.</p>
      <AcceptInvite token={token} />
    </>
  );
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <>
      <DemoNotice />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Join an organization</h1>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <Body params={params} />
        </Suspense>
      </div>
    </>
  );
}

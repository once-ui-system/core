import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AcceptInvite } from "./AcceptInvite";

export const metadata: Metadata = {
  title: "Join organization",
  description: "Accept an invitation to an Acme Notes organization.",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  return (
    <AuthShell
      title="You are invited"
      description="Join this organization to see its notes and members."
      error={isSupabaseConfigured() ? undefined : "Supabase is not configured, so invitations cannot be accepted."}
    >
      {isSupabaseConfigured() && <AcceptInvite token={token} />}
    </AuthShell>
  );
}

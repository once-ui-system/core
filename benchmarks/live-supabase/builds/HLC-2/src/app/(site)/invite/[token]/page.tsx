import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentViewer } from "@/lib/app-context";
import { acceptInvitation, OrgError } from "@/lib/orgs/actions";
import { pageMetadata } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = pageMetadata({
  title: "Join organization",
  description: "Accept an invitation to an Acme Notes organization.",
});

export default async function InvitePage({ params }: PageProps<"/invite/[token]">) {
  const { token } = await params;
  const viewer = await currentViewer();
  if (!viewer) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  let message: string;
  let joinedSlug: string | null = null;
  try {
    const org = await acceptInvitation(token);
    joinedSlug = org.slug;
    message = `You joined ${org.name} as ${org.role}.`;
  } catch (error) {
    message = error instanceof OrgError ? error.message : "This invitation could not be used.";
    if (!isSupabaseConfigured()) message = "Invitations need Supabase, which is not configured in demo mode.";
  }

  return (
    <section className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Invitation</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {joinedSlug && (
            <Link href={`/app/${joinedSlug}`} className={cn(buttonVariants(), "w-full")}>
              Open the organization
            </Link>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

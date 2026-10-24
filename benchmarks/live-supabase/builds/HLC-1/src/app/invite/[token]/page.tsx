import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/orgs/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { acceptInvite } from "../actions";

export const metadata = pageMetadata({ title: "Join organization", description: "Accept an invitation to an Acme Notes organization.", path: "/invite" });

const messages: Record<string, string> = {
  invalid_invitation: "This invitation does not exist.",
  invitation_expired: "This invitation has expired. Ask for a new one.",
  invitation_email_mismatch: "This invitation was sent to another email address. Sign in with that address.",
};

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    if (!user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);
  }
  const accept = acceptInvite.bind(null, token);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Join an organization</CardTitle>
            <CardDescription>
              Accepting makes you a member of the organization that sent this link, with the role it was created with.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {messages[error] ?? "This invitation could not be accepted."}
              </p>
            )}
            {isSupabaseConfigured() ? (
              <form action={accept}>
                <Button type="submit" className="w-full">
                  Join organization
                </Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">Invitations are off in demo mode.</p>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site/header";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { getUser } from "@/lib/sb/server";
import { acceptInvitation, HttpError } from "@/lib/orgs/server";

export const metadata: Metadata = {
  title: "Accept invitation",
  description: "Join an organization on Acme Notes.",
  robots: { index: false },
};

async function Accept({ params }: { params: PageProps<"/invite/[token]">["params"] }) {
  const { token } = await params;
  if (!isSupabaseConfigured()) {
    return <p className="text-sm">Demo mode: Supabase is not configured, so invitations are off.</p>;
  }
  const user = await getUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/invite/${token}`)}`);

  async function accept() {
    "use server";
    const u = await getUser();
    if (!u) redirect("/auth");
    try {
      const { slug } = await acceptInvitation(u, token);
      redirect(`/app/${slug}`);
    } catch (e) {
      if (e instanceof HttpError) redirect(`/invite/${token}?error=${encodeURIComponent(e.message)}`);
      throw e;
    }
  }
  return (
    <form action={accept}>
      <Button type="submit">Accept invitation</Button>
    </form>
  );
}

export default function InvitePage({ params }: PageProps<"/invite/[token]">) {
  return (
    <PageShell>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Join an organization</CardTitle>
          <CardDescription>You have been invited to join a team on Acme Notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p>Loading…</p>}>
            <Accept params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </PageShell>
  );
}

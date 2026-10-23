import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PageShell } from "@/components/site/header";
import { getAppUser } from "@/lib/orgs/context";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Acme Notes account.",
  robots: { index: false },
};

async function Details() {
  const user = await getAppUser();
  return <p>{user.email}</p>;
}

export default function Profile() {
  return (
    <PageShell>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Signed in as</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<p>Loading…</p>}>
            <Details />
          </Suspense>
          <Link href="/auth/update-password" className={buttonVariants({ variant: "outline" })}>
            Change password
          </Link>
        </CardContent>
      </Card>
    </PageShell>
  );
}

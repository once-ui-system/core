import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DemoNotice } from "@/components/site/demo-notice";
import { getSessionUser } from "@/lib/orgs";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Acme Notes profile.",
};

async function Body() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/profile");
  return (
    <>
      <p className="text-muted-foreground">Signed in as <strong className="text-foreground">{user.email}</strong></p>
      <Link href="/app" className="text-primary underline">Back to the app</Link>
    </>
  );
}

export default function ProfilePage() {
  return (
    <>
      <DemoNotice />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <Body />
        </Suspense>
      </div>
    </>
  );
}

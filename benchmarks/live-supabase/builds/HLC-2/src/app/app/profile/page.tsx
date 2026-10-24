import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentViewer } from "@/lib/app-context";
import { listMyOrgs } from "@/lib/orgs/queries";
import { roleLabel } from "@/lib/orgs/types";
import { pageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Profile",
  description: "Your Acme Notes account and organizations.",
  path: "/app/profile",
});

export default async function ProfilePage() {
  const viewer = await currentViewer();
  if (!viewer) redirect("/auth?next=/app/profile");
  const orgs = await listMyOrgs(viewer.id);
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{viewer.email}</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>Switch between them from the header.</CardDescription>
        </CardHeader>
        <CardContent>
          {orgs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You are not in an organization yet. <Link href="/app/new" className="text-primary hover:underline">Create one</Link>.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {orgs.map(({ org, role }) => (
                <li key={org.id} className="flex items-center justify-between py-3">
                  <Link href={`/app/${org.slug}`} className="font-medium hover:underline">
                    {org.name}
                  </Link>
                  <Badge variant="secondary">{roleLabel[role]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RenameForm } from "@/components/app/forms";
import { getAppContext } from "@/lib/orgs/context";
import { canManage } from "@/lib/orgs/types";
import { upgradeAction } from "@/app/app/actions";

export const metadata: Metadata = {
  title: "Settings",
  description: "Organization name and plan.",
};

export default async function SettingsPage({ params }: PageProps<"/app/[org]/settings">) {
  const { org: slug } = await params;
  const { org } = await getAppContext(slug);
  const manager = canManage(org.role);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>
            {manager ? "Rename your organization." : "Only admins and owners can rename the organization."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {manager ? <RenameForm org={org.slug} name={org.name} /> : <p>{org.name}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Current plan: <strong className="capitalize">{org.plan}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {org.plan === "free" && manager ? (
            <form action={upgradeAction}>
              <input type="hidden" name="org" value={org.slug} />
              <Button type="submit">Upgrade to Team ($8 per member per month)</Button>
            </form>
          ) : org.plan === "team" ? (
            <p className="text-sm text-muted-foreground">Your organization is on the Team plan.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Ask an admin or owner to upgrade.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

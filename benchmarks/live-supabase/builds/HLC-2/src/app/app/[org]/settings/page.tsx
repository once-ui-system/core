import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RenameOrgForm, UpgradeButton } from "@/components/app/OrgForms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orgAccessFor } from "@/lib/app-context";
import { canManage, planLabel } from "@/lib/orgs/types";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Settings",
  description: "Organization name and plan.",
});

export default async function SettingsPage({ params }: PageProps<"/app/[org]/settings">) {
  const { org: slug } = await params;
  const access = await orgAccessFor(slug);
  if (!access) notFound();
  const { org, role } = access;
  const manager = canManage(role);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>
            {manager ? "Owners and admins can rename the organization." : "Only owners and admins can rename it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {manager ? <RenameOrgForm slug={org.slug} name={org.name} /> : <p className="text-sm">{org.name}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>
            Current plan: <span className="font-medium text-foreground">{planLabel[org.plan]}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {org.plan === "team" ? (
            <p className="text-sm text-muted-foreground">This organization is on the Team plan.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Team is $8 per member per month. Upgrading opens a secure checkout.
              </p>
              {manager ? (
                <UpgradeButton slug={org.slug} />
              ) : (
                <p className="text-sm text-muted-foreground">Ask an owner or admin to upgrade this organization.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

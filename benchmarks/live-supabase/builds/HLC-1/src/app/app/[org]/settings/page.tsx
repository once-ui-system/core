import type { Metadata } from "next";
import { getMyOrg } from "@/lib/orgs/context";
import { canManage } from "@/lib/orgs/types";
import { pageMetadata } from "@/lib/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RenameOrgForm, UpgradeForm } from "@/components/app/forms";

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const { org: slug } = await params;
  return pageMetadata({ title: `Settings · ${slug}`, description: "Organization name and plan.", path: `/app/${slug}/settings` });
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { org: slug } = await params;
  const { checkout } = await searchParams;
  const org = await getMyOrg(slug);
  if (!org) return null;
  const manage = canManage(org.role);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage {org.name}.</p>
      </div>

      {checkout === "success" && (
        <p role="status" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm">
          Checkout finished. The plan changes once the payment is confirmed.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>
            {manage ? "Owners and admins can rename the organization." : "Only owners and admins can rename it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {manage ? (
            <RenameOrgForm slug={org.slug} name={org.name} />
          ) : (
            <p className="text-sm">{org.name}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Current plan: <Badge variant="secondary" className="ml-1 capitalize">{org.plan}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {org.plan === "team" ? (
            <p className="text-sm text-muted-foreground">This organization is on the Team plan.</p>
          ) : manage ? (
            <>
              <p className="text-sm text-muted-foreground">
                Team is $8 per member per month, with no member limit.
              </p>
              <UpgradeForm slug={org.slug} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Only owners and admins can upgrade the plan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

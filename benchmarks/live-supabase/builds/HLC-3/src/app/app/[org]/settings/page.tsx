import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { site } from "@/config/site";
import { getOrgPageContext } from "@/lib/orgs/access";
import { canManage } from "@/lib/orgs/types";
import { RenameOrgForm } from "./RenameOrgForm";
import { UpgradeButton } from "./UpgradeButton";

export const metadata: Metadata = {
  title: "Settings",
  description: "Rename your organization and manage its plan.",
  robots: { index: false, follow: false },
};

const BILLING_MESSAGES: Record<string, string> = {
  success: "Checkout finished. Your plan updates once Stripe confirms the payment.",
  cancelled: "Checkout was cancelled. Your plan has not changed.",
};

export default async function SettingsPage({
  params,
  searchParams,
}: PageProps<"/app/[org]/settings">) {
  const { org: slug } = await params;
  const { billing } = await searchParams;
  const context = await getOrgPageContext(slug);
  if (!context) notFound();
  const { org, role } = context;
  const manage = canManage(role);
  const billingMessage = typeof billing === "string" ? BILLING_MESSAGES[billing] : undefined;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Organization details and plan</p>
      </div>

      {billingMessage && (
        <Alert>
          <AlertDescription>{billingMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization name</CardTitle>
          <CardDescription>
            {manage ? "Owners and admins can rename the organization." : "Only owners and admins can rename the organization."}
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
          <CardTitle className="flex items-center gap-2">
            Plan <Badge variant="outline" className="capitalize">{org.plan}</Badge>
          </CardTitle>
          <CardDescription>
            {org.plan === "team"
              ? "Team: every member, $" + site.pricing.team.pricePerMemberPerMonth + " per member per month."
              : `Free: up to ${site.pricing.free.memberLimit} members. Team: $${site.pricing.team.pricePerMemberPerMonth} per member per month.`}
          </CardDescription>
        </CardHeader>
        {manage && org.plan === "free" && (
          <CardContent>
            <UpgradeButton slug={org.slug} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

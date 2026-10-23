import { requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { notFound, redirect } from "next/navigation";
import BillingClient from "./client";

export const metadata = { title: "Billing", robots: { index: false, follow: false } };

type PageProps = { params: Promise<{ org: string }> };

/**
 * The organization's plan. Gates itself as well as sitting under the `[org]`
 * layout: this page ships with the billing slice, which can be scaffolded
 * into an app whose product shell differs, and a page that bills a tenant
 * should not depend on a layout somewhere else to check membership.
 */
export default async function BillingPage({ params }: PageProps) {
  if (isSupabaseConfigured()) {
    const { org } = await params;
    const guard = await requireOrg(org);
    if (!guard.ok) {
      if (guard.status === 401) redirect("/auth");
      notFound();
    }
  }
  return <BillingClient />;
}

import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";
import { requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Meta } from "@once-ui-system/core";
import { SettingsClient } from "./client";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.settings.title,
    description: product.settings.description,
    baseURL,
    path: orgPath(org, "/settings"),
    image: product.settings.image,
  });
}

export default async function SettingsPage({ params }: PageProps) {
  const { org } = await params;
  let name = "Demo organization";
  let plan: "free" | "team" = "free";
  let canManage = true;
  const configured = isSupabaseConfigured();
  if (configured) {
    const guard = await requireOrg(org);
    if (guard.ok) {
      name = guard.org.name;
      plan = guard.org.plan;
      canManage = guard.role !== "member";
    }
  }
  return (
    <SettingsClient org={org} name={name} plan={plan} canManage={canManage} configured={configured} />
  );
}

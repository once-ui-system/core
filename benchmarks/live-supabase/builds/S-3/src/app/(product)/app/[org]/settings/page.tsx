import { requireOrg } from "@/lib/orgs/server";
import { orgPath, type OrgPlan, type OrgRole } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Heading, Meta, Schema } from "@once-ui-system/core";
import SettingsClient from "./client";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.settings.title,
    description: product.settings.description,
    baseURL: baseURL,
    path: orgPath(org, "/settings"),
    image: product.settings.image,
    robots: product.settings.robots,
    alternates: product.settings.alternates,
  });
}

export default async function Settings({ params }: PageProps) {
  const { org } = await params;

  let name = "Demo organization";
  let plan: OrgPlan = "free";
  let role: OrgRole = "owner";
  const live = isSupabaseConfigured();
  if (live) {
    const guard = await requireOrg(org);
    if (guard.ok) {
      name = guard.org.name;
      plan = guard.org.plan;
      role = guard.role;
    }
  }

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.settings.title}
        description={product.settings.description}
        path={orgPath(org, "/settings")}
      />
      <Heading paddingLeft="16" variant="display-strong-s">
        Settings
      </Heading>
      <SettingsClient org={org} name={name} plan={plan} canManage={role !== "member"} live={live} />
    </>
  );
}

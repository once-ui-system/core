import { baseURL, product } from "@/resources";
import { orgPath } from "@/lib/orgs/types";
import { requireOrg } from "@/lib/orgs/server";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Meta } from "@once-ui-system/core";
import { MembersClient } from "./client";

type PageProps = { params: Promise<{ org: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.members.title,
    description: product.members.description,
    baseURL,
    path: orgPath(org, "/members"),
    image: product.members.image,
  });
}

export default async function MembersPage({ params }: PageProps) {
  const { org } = await params;
  const configured = isSupabaseConfigured();
  let canInvite = !configured;
  if (configured) {
    const guard = await requireOrg(org);
    canInvite = guard.ok && guard.role !== "member";
  }
  return <MembersClient org={org} configured={configured} canInvite={canInvite} />;
}

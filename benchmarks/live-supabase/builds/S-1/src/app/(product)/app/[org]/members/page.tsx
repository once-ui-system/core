import { listInvitations } from "@/lib/orgs/invitations";
import { listOrgMembers, requireOrg } from "@/lib/orgs/server";
import type { OrgInvitation, OrgMember } from "@/lib/orgs/types";
import { orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { baseURL, product } from "@/resources";
import { Meta, Schema } from "@once-ui-system/core";
import { notFound, redirect } from "next/navigation";
import MembersClient from "./client";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ org: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { org } = await params;
  return Meta.generate({
    title: product.members.title,
    description: product.members.description,
    baseURL: baseURL,
    path: orgPath(org, "/members"),
    image: product.members.image,
    robots: "noindex,nofollow",
  });
}

export default async function Members({ params }: PageProps) {
  const { org } = await params;

  let members: Pick<OrgMember, "user_id" | "email" | "role">[] = [
    { user_id: "demo-1", email: "you@example.com", role: "owner" },
    { user_id: "demo-2", email: "sam@example.com", role: "admin" },
    { user_id: "demo-3", email: "alex@example.com", role: "member" },
  ];
  let invitations: OrgInvitation[] = [];
  let canInvite = true;

  if (isSupabaseConfigured()) {
    const guard = await requireOrg(org);
    if (!guard.ok) {
      if (guard.status === 401) redirect("/auth");
      notFound();
    }
    const list = await listOrgMembers(guard);
    members = list.ok ? list.members : [];
    canInvite = guard.role === "owner" || guard.role === "admin";
    if (canInvite) {
      const open = await listInvitations(guard);
      invitations = open.ok ? open.invitations : [];
    }
  }

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={product.members.title}
        description={product.members.description}
        path={orgPath(org, "/members")}
      />
      <MembersClient
        org={org}
        demo={!isSupabaseConfigured()}
        canInvite={canInvite}
        members={members.map(({ user_id, email, role }) => ({ user_id, email, role }))}
        invitations={invitations}
      />
    </>
  );
}

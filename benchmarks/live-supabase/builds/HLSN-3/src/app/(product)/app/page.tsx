import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrganization } from "@/components/app/CreateOrganization";
import { Column, Heading, Text } from "@once-ui-system/core";
import { isSupabaseConfigured } from "@/lib/env";
import { getViewer } from "@/lib/session";
import { listMemberships } from "@/lib/orgs/queries";
import { DEMO_ORG } from "@/lib/orgs/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizations - Acme Notes",
  description: "Create or open an organization.",
  robots: { index: false, follow: false },
};

/** /app: sends the user to their first organization, or asks them to create one. */
export default async function AppIndex() {
  if (!isSupabaseConfigured()) redirect(`/app/${DEMO_ORG.slug}`);

  const viewer = await getViewer();
  if (!viewer) redirect("/auth?next=/app");

  const orgs = await listMemberships(viewer.id);
  if (orgs[0]) redirect(`/app/${orgs[0].slug}`);

  return (
    <Column gap="16" maxWidth="s">
      <Heading as="h1" variant="display-strong-xs">
        Create your first organization
      </Heading>
      <Text variant="body-default-m" onBackground="neutral-medium">
        Organizations hold the notebooks and members of one team. You can create more later and
        switch between them from the header.
      </Text>
      <CreateOrganization />
    </Column>
  );
}

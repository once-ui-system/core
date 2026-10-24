import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrgForm } from "@/components/org/CreateOrgForm";
import { isSupabaseConfigured } from "@/lib/env";
import { demoOrgs } from "@/lib/orgs/demo";
import { listMyOrganizations } from "@/lib/orgs/service";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organizations",
  description: "Open one of your organizations or create a new one.",
};

// /app sends the user to their first organization, or asks them to create one.
export default async function AppIndex() {
  if (!isSupabaseConfigured()) redirect(`/app/${demoOrgs[0].slug}`);

  const sb = await createSessionClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/auth?next=/app");

  const orgs = await listMyOrganizations(sb);
  if (orgs.length > 0) redirect(`/app/${orgs[0].slug}`);

  return (
    <Column maxWidth="s" gap="24" paddingY="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Create your first organization
        </Heading>
        <Text onBackground="neutral-medium">
          Organizations hold notebooks and members. You become its owner, and you can invite people from the members
          page.
        </Text>
      </Column>
      <Column background="surface" border radius="l" padding="24">
        <CreateOrgForm />
      </Column>
    </Column>
  );
}

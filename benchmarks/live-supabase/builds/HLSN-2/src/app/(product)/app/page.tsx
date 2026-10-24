import { NoWorkspace } from "@/app/(product)/components";
import { listUserOrganizations } from "@/lib/orgs/server";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Column, Heading, Text } from "@once-ui-system/core";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * `/app`: sends the signed-in user to their first organization. Someone with
 * none sees the form that creates one. Without Supabase, the demo workspace.
 */
export default async function AppIndex() {
  if (!isSupabaseConfigured()) redirect(orgPath(DEMO_ORG_SLUG));

  const result = await listUserOrganizations();
  if (result.ok && result.organizations.length > 0) {
    redirect(orgPath(result.organizations[0].slug));
  }
  if (!result.ok && result.status === 401) redirect("/auth");

  if (result.ok) {
    return (
      <Column fillWidth gap="8">
        <Heading variant="display-strong-s">Acme Notes</Heading>
        <NoWorkspace />
      </Column>
    );
  }

  return (
    <Column fillWidth gap="8" paddingY="32">
      <Heading variant="heading-strong-l">Your organizations could not be loaded</Heading>
      <Text onBackground="neutral-weak">{result.error}</Text>
    </Column>
  );
}

import { listUserOrganizations } from "@/lib/orgs/server";
import { DEMO_ORG_SLUG, orgPath } from "@/lib/orgs/types";
import { isSupabaseConfigured } from "@/lib/sb/config";
import { Column, Heading, Text } from "@once-ui-system/core";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * `/app` — where a fresh sign-in lands, before anyone knows which tenant
 * they belong to.
 *
 * It resolves the user's organizations (creating their personal one on the
 * way, if this is their first authenticated request) and re-routes to the
 * first. Nothing renders here in the normal case; the org's own home is at
 * `/app/<slug>`.
 */
export default async function AppIndex() {
  // Demo mode: there is no database to ask, and the product shell renders
  // its sample data for any slug.
  if (!isSupabaseConfigured()) redirect(orgPath(DEMO_ORG_SLUG));

  const result = await listUserOrganizations();

  if (result.ok && result.organizations.length > 0) {
    redirect(orgPath(result.organizations[0].slug));
  }
  if (!result.ok && result.status === 401) {
    redirect("/auth");
  }

  // Everything above either redirected or failed for a reason worth showing.
  return (
    <Column fillWidth gap="8" paddingX="16" paddingY="64" horizontal="center">
      <Heading variant="heading-strong-l">No workspace yet</Heading>
      <Text align="center" onBackground="neutral-weak" variant="body-default-m">
        {result.ok ? "You are not a member of any organization." : result.error}
      </Text>
    </Column>
  );
}

import { Heading } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SettingsForms } from "../../../../components/OrgForms";
import { orgsFor, requireSession } from "../../../../lib/appdata";
import { canManage } from "../../../../lib/orgs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings", description: "Organization name and plan." };

export default async function Settings({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const session = await requireSession();
  const org = (await orgsFor(session)).find((o) => o.slug === slug)!;
  return (
    <>
      <Heading as="h1" variant="display-strong-xs">
        Settings
      </Heading>
      <SettingsForms org={org.slug} name={org.name} plan={org.plan} canManage={canManage(org.role)} demo={session.demo} />
    </>
  );
}

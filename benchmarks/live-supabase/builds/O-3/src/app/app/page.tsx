import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NewOrgForm } from "@/components/NewOrgForm";
import { loadContext } from "@/lib/context";

export const metadata: Metadata = {
  title: "Your organizations",
  description: "Open one of your Acme Notes organizations.",
};

export const dynamic = "force-dynamic";

export default async function AppIndex() {
  const ctx = await loadContext();
  if (ctx.orgs.length > 0) redirect(`/app/${ctx.orgs[0].slug}`);
  return (
    <AppShell demo={ctx.demo} user={ctx.user} orgs={[]} current={null}>
      <Column maxWidth="s" gap="16">
        <Heading variant="display-strong-xs" as="h1">
          Create your first organization
        </Heading>
        <Text onBackground="neutral-weak">An organization holds your team's notebooks and members.</Text>
        <NewOrgForm />
      </Column>
    </AppShell>
  );
}

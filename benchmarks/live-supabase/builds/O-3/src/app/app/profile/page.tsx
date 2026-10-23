import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { loadContext } from "@/lib/context";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Acme Notes account.",
};

export const dynamic = "force-dynamic";

export default async function Profile() {
  const ctx = await loadContext();
  const first = ctx.orgs[0] ?? null;
  return (
    <AppShell demo={ctx.demo} user={ctx.user} orgs={ctx.orgs} current={first}>
      <Heading variant="display-strong-xs" as="h1">
        Profile
      </Heading>
      <Column background="page" border radius="l" padding="24" gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          Email
        </Text>
        <Text>{ctx.user.email}</Text>
      </Column>
    </AppShell>
  );
}

import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DemoNotice } from "@/components/DemoNotice";
import { signOutAction } from "@/lib/actions/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { demoUser } from "@/lib/orgs/demo";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your account details.",
};

export default async function Profile() {
  let email: string = demoUser.email;
  if (isSupabaseConfigured()) {
    const sb = await createSessionClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user || !user.email) redirect("/auth?next=/app/profile");
    email = user.email;
  }

  return (
    <Column maxWidth="s" gap="24" paddingY="32">
      <Column gap="4">
        <Heading as="h1" variant="display-strong-xs">
          Profile
        </Heading>
        <Text onBackground="neutral-medium">Signed in as {email}</Text>
      </Column>
      <Row gap="8" wrap>
        <Button variant="secondary" href="/app" label="Your organizations" />
        <form action={signOutAction}>
          <Button type="submit" variant="tertiary" label="Sign out" />
        </form>
      </Row>
      {!isSupabaseConfigured() && <DemoNotice />}
    </Column>
  );
}

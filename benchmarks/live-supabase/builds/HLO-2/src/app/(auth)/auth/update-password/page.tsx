import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { DemoNotice } from "@/components/DemoNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { createSessionClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new Acme Notes password.",
};

export default async function UpdatePassword() {
  if (isSupabaseConfigured()) {
    const sb = await createSessionClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) redirect("/auth?next=/auth/update-password");
  }
  return (
    <Column background="surface" border radius="l" padding="32" gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Set a new password
        </Heading>
        <Text onBackground="neutral-medium">Choose a password of at least 8 characters.</Text>
      </Column>
      {isSupabaseConfigured() ? <UpdatePasswordForm /> : <DemoNotice />}
    </Column>
  );
}

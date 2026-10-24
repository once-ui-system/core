import { Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../../components/ActionForm";
import { DemoNotice } from "../../../../components/DemoNotice";
import { updatePasswordAction } from "../../../../lib/actions/auth";
import { pageMetadata } from "../../../../lib/seo";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

export const metadata: Metadata = pageMetadata({
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
  path: "/auth/update-password",
});

export default function UpdatePassword() {
  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="xs" gap="24">
        {!isSupabaseConfigured() && <DemoNotice />}
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Set a new password
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-medium">
            Open this page from the reset link in your email.
          </Text>
        </Column>
        <ActionForm action={updatePasswordAction} submitLabel="Save password">
          <Input id="password" name="password" type="password" label="New password" required minLength={8} autoComplete="new-password" description="At least 8 characters." />
        </ActionForm>
      </Column>
    </Column>
  );
}

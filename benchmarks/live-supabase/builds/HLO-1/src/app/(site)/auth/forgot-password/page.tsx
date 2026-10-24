import { Button, Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../../components/ActionForm";
import { DemoNotice } from "../../../../components/DemoNotice";
import { forgotPasswordAction } from "../../../../lib/actions/auth";
import { pageMetadata } from "../../../../lib/seo";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

export const metadata: Metadata = pageMetadata({
  title: "Forgot password",
  description: "Get a link to set a new Acme Notes password.",
  path: "/auth/forgot-password",
});

export default function ForgotPassword() {
  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="xs" gap="24">
        {!isSupabaseConfigured() && <DemoNotice />}
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Forgot password
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-medium">
            We will email you a link to set a new password.
          </Text>
        </Column>
        <ActionForm action={forgotPasswordAction} submitLabel="Send reset link">
          <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
        </ActionForm>
        <Button href="/auth" variant="tertiary" size="s" label="Back to sign in" />
      </Column>
    </Column>
  );
}

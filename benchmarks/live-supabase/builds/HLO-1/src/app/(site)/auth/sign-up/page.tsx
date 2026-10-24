import { Button, Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../../components/ActionForm";
import { DemoNotice } from "../../../../components/DemoNotice";
import { signUpAction } from "../../../../lib/actions/auth";
import { pageMetadata } from "../../../../lib/seo";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description: "Create an Acme Notes account with your email and a password.",
  path: "/auth/sign-up",
});

export default function SignUp() {
  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="xs" gap="24">
        {!isSupabaseConfigured() && <DemoNotice />}
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Create an account
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-medium">
            You can create or join an organization after you sign up.
          </Text>
        </Column>
        <ActionForm action={signUpAction} submitLabel="Create account">
          <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
          <Input id="password" name="password" type="password" label="Password" required minLength={8} autoComplete="new-password" description="At least 8 characters." />
        </ActionForm>
        <Button href="/auth" variant="tertiary" size="s" label="Already have an account? Sign in" />
      </Column>
    </Column>
  );
}

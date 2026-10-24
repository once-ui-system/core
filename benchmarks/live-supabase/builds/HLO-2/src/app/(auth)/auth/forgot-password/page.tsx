import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { DemoNotice } from "@/components/DemoNotice";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get an email with a link to set a new Acme Notes password.",
};

export default function ForgotPassword() {
  return (
    <Column background="surface" border radius="l" padding="32" gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Forgot password
        </Heading>
        <Text onBackground="neutral-medium">We will email you a link to choose a new password.</Text>
      </Column>
      {isSupabaseConfigured() ? (
        <ForgotPasswordForm />
      ) : (
        <DemoNotice />
      )}
      <Button variant="link" href="/auth" label="Back to sign in" size="s" />
    </Column>
  );
}

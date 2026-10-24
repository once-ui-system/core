import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Forgot password", "Reset your Acme Notes password.", "/auth/forgot-password");

export default function ForgotPasswordPage() {
  return (
    <Column gap="24" maxWidth="xs" horizontal="center">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Forgot your password?
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Enter your email and we will send you a link to choose a new password.
        </Text>
      </Column>
      <ForgotPasswordForm />
    </Column>
  );
}

import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/AuthForms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Set a new password", "Choose a new Acme Notes password.", "/auth/update-password");

export default function UpdatePasswordPage() {
  return (
    <Column gap="24" maxWidth="xs" horizontal="center">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Set a new password
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Use at least 8 characters.
        </Text>
      </Column>
      <UpdatePasswordForm />
    </Column>
  );
}

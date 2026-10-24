import { Column, Heading, Text } from "@once-ui-system/core";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";
import { SupabaseNotice } from "@/components/SupabaseNotice";
import { auth } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return pageMetadata({
    title: auth.updatePassword.title,
    description: auth.updatePassword.description,
    path: auth.updatePassword.path,
    canonical: auth.updatePassword.canonical,
    image: auth.updatePassword.image,
    robots: auth.updatePassword.robots,
    alternates: auth.updatePassword.alternates,
  });
}

export default function UpdatePasswordPage() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Set a new password
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          Choose a password of at least 8 characters.
        </Text>
      </Column>
      <SupabaseNotice />
      <NewPasswordForm />
    </>
  );
}

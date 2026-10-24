import { Button, Column, Heading, Input, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { ActionForm } from "../../../components/ActionForm";
import { DemoNotice } from "../../../components/DemoNotice";
import { signInAction } from "../../../lib/actions/auth";
import { pageMetadata } from "../../../lib/seo";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { safeNext } from "../../../lib/auth";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to your Acme Notes workspace.",
  path: "/auth",
});

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const configured = isSupabaseConfigured();
  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="xs" gap="24">
        {!configured && <DemoNotice />}
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Sign in
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-medium">
            Use the email and password for your Acme Notes account.
          </Text>
        </Column>
        {error === "link" && (
          <Text as="p" variant="body-default-s" onBackground="danger-strong" role="alert">
            That link is invalid or has expired. Request a new one.
          </Text>
        )}
        <ActionForm action={signInAction} submitLabel="Sign in">
          <input type="hidden" name="next" value={safeNext(next)} />
          <Input id="email" name="email" type="email" label="Email" required autoComplete="email" />
          <Input id="password" name="password" type="password" label="Password" required autoComplete="current-password" />
        </ActionForm>
        <Column gap="8" horizontal="center">
          <Button href="/auth/forgot-password" variant="tertiary" size="s" label="Forgot password?" />
          <Button href="/auth/sign-up" variant="tertiary" size="s" label="Create an account" />
        </Column>
      </Column>
    </Column>
  );
}

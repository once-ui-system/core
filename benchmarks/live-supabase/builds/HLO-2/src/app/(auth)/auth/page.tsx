import { Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { DemoNotice } from "@/components/DemoNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Acme Notes, create an account, or reset your password.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const signup = params.mode === "signup";
  const next = safeNextPath(params.next);
  const live = isSupabaseConfigured();

  return (
    <Column background="surface" border radius="l" padding="32" gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {signup ? "Create your account" : "Sign in"}
        </Heading>
        <Text onBackground="neutral-medium">
          {signup ? "Start with the free plan. You can upgrade later." : "Welcome back to Acme Notes."}
        </Text>
      </Column>

      {params.error === "link" && (
        <Text variant="body-default-s" onBackground="danger-strong" role="alert">
          That link is invalid or has expired. Request a new one.
        </Text>
      )}

      {live ? (
        <>
          <AuthForm mode={signup ? "signup" : "signin"} next={next} />
          <Row gap="8" wrap horizontal="between" vertical="center">
            {signup ? (
              <Button variant="link" href="/auth" label="Already have an account? Sign in" size="s" />
            ) : (
              <>
                <Button variant="link" href="/auth?mode=signup" label="Create an account" size="s" />
                <Button variant="link" href="/auth/forgot-password" label="Forgot password?" size="s" />
              </>
            )}
          </Row>
        </>
      ) : (
        <Column gap="16">
          <DemoNotice />
          <Button href="/app" label="Continue in demo mode" variant="secondary" fillWidth />
        </Column>
      )}
    </Column>
  );
}

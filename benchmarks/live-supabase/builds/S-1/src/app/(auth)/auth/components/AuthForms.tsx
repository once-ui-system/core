"use client";

import { isSupabaseConfigured } from "@/lib/sb/config";
import { Button, Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { AuthCard } from "./AuthCard";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LogInForm";
import { SignUpForm } from "./SignUpForm";

const COPY = {
  login: { title: "Sign in", description: "Sign in to Acme Notes to continue." },
  signup: { title: "Create your account", description: "Start sharing notes with your team in under a minute." },
  "forgot-password": {
    title: "Reset your password",
    description: "Enter your email and we'll send you a link to set a new one.",
  },
};

function AuthInner({ state }: { state: string }) {
  const copy = COPY[state as keyof typeof COPY] ?? COPY.login;

  if (!isSupabaseConfigured()) {
    return (
      <AuthCard
        title="Sign in to Acme Notes"
        description="Supabase is not configured, so sign-in is off. Add your keys to .env.local to turn it on, or look around in demo mode."
      >
        <Button fillWidth label="Explore the demo" arrowIcon href="/app" />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={copy.title}
      description={copy.description}
      footer={
        <Column gap="16" horizontal="center">
          {state === "login" ? (
            <Row gap="4" vertical="center" horizontal="center" textVariant="body-default-s" onBackground="neutral-medium">
              Don't have an account?
              <SmartLink href="?state=signup">Sign up</SmartLink>
            </Row>
          ) : (
            <Row gap="4" vertical="center" horizontal="center" textVariant="body-default-s" onBackground="neutral-medium">
              Already have an account?
              <SmartLink href="?state=login">Sign in</SmartLink>
            </Row>
          )}
          <Row fillWidth horizontal="center" gap="8">
            <SmartLink href="/terms">
              <Text variant="body-default-xs" align="center" onBackground="neutral-weak">
                Terms
              </Text>
            </SmartLink>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              •
            </Text>
            <SmartLink href="/privacy">
              <Text variant="body-default-xs" align="center" onBackground="neutral-weak">
                Privacy
              </Text>
            </SmartLink>
          </Row>
        </Column>
      }
    >
      {state === "login" && <LoginForm />}
      {state === "signup" && <SignUpForm />}
      {state === "forgot-password" && <ForgotPasswordForm />}
    </AuthCard>
  );
}

export function AuthForms({ state = "login" }: { state?: string }) {
  return <AuthInner state={state in COPY ? state : "login"} />;
}

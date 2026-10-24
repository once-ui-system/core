import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { SignInForm } from "@/components/AuthForms";
import { isSupabaseConfigured } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("Sign in", "Sign in to Acme Notes or create an account.", "/auth");

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const destination = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  const configured = isSupabaseConfigured();

  return (
    <Column gap="24" maxWidth="xs" horizontal="center">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Welcome to Acme Notes
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Sign in to your organizations, or create an account to start one.
        </Text>
      </Column>
      <SignInForm
        next={destination}
        notice={configured ? undefined : "Supabase is not configured: this build runs in demo mode and accounts are off."}
      />
    </Column>
  );
}

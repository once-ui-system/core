import { Column, Heading, Text } from "@once-ui-system/core";
import { AuthForm, type AuthMode } from "@/components/auth/AuthForm";
import { SupabaseNotice } from "@/components/SupabaseNotice";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNext } from "@/lib/redirect";
import { auth } from "@/resources";
import { pageMetadata } from "@/lib/meta";

// Reads the environment on each request, so a configured deployment never shows the demo notice from the build.
export const dynamic = "force-dynamic";

export function generateMetadata() {
  return pageMetadata({
    title: auth.signIn.title,
    description: auth.signIn.description,
    path: auth.signIn.path,
    canonical: auth.signIn.canonical,
    image: auth.signIn.image,
    robots: auth.signIn.robots,
    alternates: auth.signIn.alternates,
  });
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const mode: AuthMode = params.mode === "signup" ? "signup" : "signin";
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-medium">
          Use the email address and password for your Acme Notes account.
        </Text>
      </Column>
      <SupabaseNotice />
      <AuthForm
        initialMode={mode}
        next={safeNext(params.next)}
        initialError={params.error ?? null}
        configured={isSupabaseConfigured()}
      />
    </>
  );
}

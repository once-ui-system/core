import { pageMetadata } from "@/lib/seo";
import { safeNext } from "@/lib/auth";
import { SignInForm } from "@/components/auth/AuthForms";
import { AuthCard } from "./AuthCard";
import { signIn } from "./actions";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to your Acme Notes workspace.",
  path: "/auth",
});

export default async function SignInPage({ searchParams }: PageProps<"/auth">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? safeNext(params.next) : undefined;
  const error = typeof params.error === "string" ? params.error : undefined;
  return (
    <AuthCard title="Sign in" description="Use the email and password for your account.">
      <SignInForm action={signIn} next={next} error={error} />
    </AuthCard>
  );
}

import { pageMetadata } from "@/lib/seo";
import { SignUpForm } from "@/components/auth/AuthForms";
import { AuthCard } from "../AuthCard";
import { signUp } from "../actions";

export const metadata = pageMetadata({
  title: "Create an account",
  description: "Create an Acme Notes account.",
  path: "/auth/sign-up",
});

export default function SignUpPage() {
  return (
    <AuthCard title="Create an account" description="Sign up with your email and a password.">
      <SignUpForm action={signUp} />
    </AuthCard>
  );
}

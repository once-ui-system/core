import { pageMetadata } from "@/lib/seo";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthCard } from "../AuthCard";
import { requestPasswordReset } from "../actions";

export const metadata = pageMetadata({
  title: "Forgot password",
  description: "Get a link to reset your Acme Notes password.",
  path: "/auth/forgot-password",
});

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password" description="We will email you a link to choose a new password.">
      <ForgotPasswordForm action={requestPasswordReset} />
    </AuthCard>
  );
}

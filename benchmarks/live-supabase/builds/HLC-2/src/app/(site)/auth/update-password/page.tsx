import { pageMetadata } from "@/lib/seo";
import { UpdatePasswordForm } from "@/components/auth/AuthForms";
import { AuthCard } from "../AuthCard";
import { updatePassword } from "../actions";

export const metadata = pageMetadata({
  title: "Set a new password",
  description: "Choose a new Acme Notes password.",
  path: "/auth/update-password",
});

export default function UpdatePasswordPage() {
  return (
    <AuthCard title="Set a new password" description="Enter the password you want to use from now on.">
      <UpdatePasswordForm action={updatePassword} />
    </AuthCard>
  );
}

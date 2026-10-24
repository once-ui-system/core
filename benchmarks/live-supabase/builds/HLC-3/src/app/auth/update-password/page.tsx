import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { updatePassword } from "../actions";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Acme Notes account.",
  alternates: { canonical: "/auth/update-password" },
  robots: { index: false, follow: false },
};

export default async function UpdatePassword({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <AuthShell title="Set a new password" description="Use at least 8 characters." error={error}>
      <form action={updatePassword} className="space-y-4">
        <PasswordField id="new-password" label="New password" autoComplete="new-password" />
        <Button type="submit" className="w-full">
          Save password
        </Button>
      </form>
    </AuthShell>
  );
}

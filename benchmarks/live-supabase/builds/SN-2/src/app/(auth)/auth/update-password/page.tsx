"use client";

import { createClient } from "@/lib/sb/client";
import { Button, Column, PasswordInput, Spinner } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard } from "../components/AuthCard";

// Password-reset emails link here (see ForgotPasswordForm's redirectTo).
// Supabase signs the user in with a recovery session before redirecting,
// so updateUser() is enough to set the new password.
export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/app");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Set a new password" description="Choose a new password for your account.">
      <form onSubmit={handleUpdatePassword}>
        <Column fillWidth gap="20">
          <PasswordInput
            id="new-password"
            placeholder="New password"
            required
            value={password}
            errorMessage={error}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button fillWidth type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Save new password"}
          </Button>
        </Column>
      </form>
    </AuthCard>
  );
}

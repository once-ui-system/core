"use client";

import { createClient } from "@/lib/sb/client";
import {
  Button,
  Column,
  Input,
  Row,
  Spinner,
  Text,
} from "@once-ui-system/core";
import { useState } from "react";

export function ForgotPasswordForm({
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column fillWidth {...props}>
      {success ? (
        <Row fillWidth horizontal="center">
          <Text variant="body-default-s" align="center" onBackground="neutral-medium">
            If you registered using your email and password, you will receive a
            password reset email.
          </Text>
        </Row>
      ) : (
        <Column fillWidth>
          <form onSubmit={handleForgotPassword}>
            <Column fillWidth gap="4">
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                required
                value={email}
                errorMessage={error}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Row fillWidth paddingTop="20">
                <Button fillWidth type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner /> : "Send reset link"}
                </Button>
              </Row>
            </Column>
          </form>
        </Column>
      )}
    </Column>
  );
}

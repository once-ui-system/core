"use client";

import { createClient } from "@/lib/sb/client";
import { nextFromLocation } from "@/lib/sb/next";
import {
  Button,
  Column,
  Form,
  Input,
  PasswordInput,
  Spinner,
} from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({ ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${nextFromLocation()}`,
        },
      });
      if (error) throw error;
      router.push(nextFromLocation());
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column fillWidth {...props}>
      <form onSubmit={handleSignUp}>
        <Column fillWidth gap="20">
          <Form density="stacked">
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              required
              error={error ? true : undefined}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <PasswordInput
              id="password"
              placeholder="Password"
              required
              value={password}
              errorMessage={error}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form>
          <Button fillWidth type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Create account"}
          </Button>
        </Column>
      </form>
    </Column>
  );
}

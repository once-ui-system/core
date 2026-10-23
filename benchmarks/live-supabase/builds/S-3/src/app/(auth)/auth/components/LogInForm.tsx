"use client";

import { createClient } from "@/lib/sb/client";
import { nextFromLocation } from "@/lib/sb/next";
import {
  Button,
  Column,
  Form,
  Input,
  PasswordInput,
  Row,
  SmartLink,
  Spinner,
  Text,
} from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
      <form onSubmit={handleLogin}>
        <Column fillWidth gap="8">
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
              type="password"
              placeholder="Password"
              required
              errorMessage={error}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form>
          <Row fillWidth horizontal="end" paddingTop="4">
            <SmartLink href="/auth?state=forgot-password">
              <Text variant="label-default-s">Forgot password?</Text>
            </SmartLink>
          </Row>
          <Row fillWidth paddingTop="16">
            <Button fillWidth type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : "Log in"}
            </Button>
          </Row>
        </Column>
      </form>
    </Column>
  );
}

"use client";

import {
  Button,
  Column,
  Dialog,
  Heading,
  Input,
  Line,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import { type FormEvent, useState } from "react";

const DEMO_EMAIL = "maya.lindqvist@northwind.dev";
const DEMO_PASSWORD = "correct-horse-battery";
const DEMO_CODE = "482913";

export default function Page() {
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setFormError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setFormError("Your password must be at least 8 characters.");
      return;
    }
    setFormError(null);
    setOtpError(false);
    setOtpOpen(true);
  };

  const handleComplete = (code: string) => {
    if (code === DEMO_CODE) {
      setOtpError(false);
      setOtpOpen(false);
      setVerified(true);
    } else {
      setOtpError(true);
    }
  };

  const closeOtp = () => {
    setOtpOpen(false);
    setOtpError(false);
  };

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
      <Column
        maxWidth="xs"
        fillWidth
        background="surface"
        border
        radius="xl"
        padding="32"
        gap="24"
        s={{ padding: "20" }}
      >
        <Column fillWidth gap="8">
          <Heading as="h1" variant="display-strong-xs">
            {verified ? "You are signed in" : "Sign in to Northwind"}
          </Heading>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {verified
              ? `Welcome back, Maya. Signed in as ${email}.`
              : "New to Northwind? "}
            {!verified && <SmartLink href="/signup">Create an account</SmartLink>}
          </Text>
        </Column>

        {verified ? (
          <Button
            fillWidth
            variant="secondary"
            onClick={() => {
              setVerified(false);
              setPassword("");
            }}
          >
            Sign out
          </Button>
        ) : (
          <>
            <Column fillWidth gap="12">
              <Button fillWidth variant="secondary">
                Continue with GitHub
              </Button>
              <Button fillWidth variant="secondary">
                Continue with Google
              </Button>
            </Column>

            <Row fillWidth vertical="center" gap="16">
              <Line fill />
              <Text variant="label-default-s" onBackground="neutral-weak">
                or
              </Text>
              <Line fill />
            </Row>

            <form onSubmit={handleSubmit} noValidate aria-label="Sign in">
              <Column fillWidth gap="16">
                <Input
                  id="email"
                  label="Work email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={formError?.includes("email") ?? false}
                />
                <PasswordInput
                  id="password"
                  label="Password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formError?.includes("password") ?? false}
                />
                {formError && (
                  <Text variant="body-default-s" onBackground="danger-medium" role="alert">
                    {formError}
                  </Text>
                )}
                <Row fillWidth horizontal="end">
                  <SmartLink href="/forgot">Forgot password?</SmartLink>
                </Row>
                <Button type="submit" fillWidth arrowIcon>
                  Continue
                </Button>
              </Column>
            </form>
          </>
        )}

        <Row gap="16" wrap horizontal="center">
          <SmartLink href="/privacy">Privacy policy</SmartLink>
          <SmartLink href="/terms">Terms of use</SmartLink>
        </Row>
      </Column>

      <Dialog
        stack
        open={otpOpen}
        onClose={closeOtp}
        title="Verify it is you"
        description={`Enter the 6-digit code from your authenticator app for ${email}.`}
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Demo code: {DEMO_CODE}
            </Text>
            <Button variant="tertiary" onClick={closeOtp}>
              Back to password
            </Button>
          </Row>
        }
      >
        <Column fillWidth gap="16" paddingY="8">
          <OTPInput
            length={6}
            autoFocus
            error={otpError}
            errorMessage={otpError ? "That code is incorrect. Try again." : undefined}
            onComplete={handleComplete}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Codes refresh every 30 seconds. Lost your device?{" "}
            <SmartLink href="/recovery">Use a recovery code</SmartLink>
          </Text>
        </Column>
      </Dialog>
    </Column>
  );
}

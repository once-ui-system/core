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

const DEMO_EMAIL = "mara.lindqvist@northwind.example";
const DEMO_PASSWORD = "correct-horse-battery";
const DEMO_CODE = "482913";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setFormError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setFormError("Your password must be at least 8 characters.");
      return;
    }
    setFormError("");
    setOtpError("");
    setOtpOpen(true);
  };

  const handleOtp = (code: string) => {
    if (code === DEMO_CODE) {
      setOtpError("");
      setOtpOpen(false);
      setSignedIn(true);
    } else {
      setOtpError("That code is incorrect or expired. Try again.");
    }
  };

  const closeOtp = () => {
    setOtpOpen(false);
    setOtpError("");
  };

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
      <Column
        maxWidth={32}
        fillWidth
        background="surface"
        border
        radius="xl"
        padding="32"
        gap="24"
        s={{ padding: "20" }}
      >
        {signedIn ? (
          <Column fillWidth gap="16" horizontal="center" role="status" aria-live="polite">
            <Heading as="h1" variant="display-strong-xs" align="center">
              You are signed in
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Welcome back, Mara. Your session on this device is verified.
            </Text>
            <Button
              fillWidth
              variant="secondary"
              onClick={() => {
                setSignedIn(false);
                setPassword("");
              }}
            >
              Sign out
            </Button>
          </Column>
        ) : (
          <>
            <Column fillWidth gap="8" horizontal="center">
              <Heading as="h1" variant="display-strong-xs" align="center">
                Sign in to Northwind
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                New to Northwind? <SmartLink href="#signup">Create an account</SmartLink>
              </Text>
            </Column>

            <Column fillWidth gap="12">
              <Button fillWidth variant="secondary">
                Continue with Google
              </Button>
              <Button fillWidth variant="secondary">
                Continue with GitHub
              </Button>
            </Column>

            <Row fillWidth vertical="center" gap="16">
              <Line fill />
              <Text variant="label-default-s" onBackground="neutral-weak">
                or
              </Text>
              <Line fill />
            </Row>

            <form onSubmit={handleLogin} noValidate>
              <Column fillWidth gap="16">
                <Input
                  id="email"
                  label="Work email"
                  type="email"
                  autoComplete="username"
                  placeholder={DEMO_EMAIL}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={formError.includes("email")}
                />
                <PasswordInput
                  id="password"
                  label="Password"
                  autoComplete="current-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formError.includes("password")}
                />
                {formError ? (
                  <Text variant="body-default-s" onBackground="danger-medium" role="alert">
                    {formError}
                  </Text>
                ) : null}
                <Row fillWidth horizontal="end">
                  <SmartLink href="#forgot">Forgot password?</SmartLink>
                </Row>
                <Button fillWidth type="submit" arrowIcon>
                  Continue
                </Button>
              </Column>
            </form>

            <Row gap="16" wrap horizontal="center">
              <SmartLink href="#privacy">Privacy policy</SmartLink>
              <SmartLink href="#terms">Terms of use</SmartLink>
            </Row>
          </>
        )}
      </Column>

      <Dialog
        stack
        open={otpOpen}
        onClose={closeOtp}
        title="Verify it is you"
        description={`We sent a 6-digit code to the authenticator app linked to ${email || DEMO_EMAIL}. Enter it below to finish signing in.`}
        footer={
          <Row fillWidth gap="8" horizontal="end" wrap>
            <Button variant="tertiary" onClick={closeOtp}>
              Back
            </Button>
            <Button variant="secondary" onClick={() => setOtpError("")}>
              Resend code
            </Button>
          </Row>
        }
      >
        <Column fillWidth gap="16" paddingY="8">
          <OTPInput
            length={6}
            autoFocus
            onComplete={handleOtp}
            error={Boolean(otpError)}
            errorMessage={otpError}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            Demo code for this preview: {DEMO_CODE}. The code expires in 5 minutes.
          </Text>
        </Column>
      </Dialog>
    </Column>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button, Column, Dialog, Heading, Input, Row, Text } from "@once-ui-system/core";

const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_OTP = "482913";

export default function Page() {
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [otpOpen, setOtpOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(DEMO_EMAIL);
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const resetAll = () => {
    setPassword("");
    setOtp("");
    setPasswordError("");
    setOtpError("");
  };

  const openLogin = () => {
    resetAll();
    setLoginOpen(true);
  };

  const closeAll = () => {
    setOtpOpen(false);
    setLoginOpen(false);
    resetAll();
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setPasswordError("Enter a valid work email address.");
      return;
    }
    if (password !== DEMO_PASSWORD) {
      setPasswordError("That email and password combination does not match. Try the demo password shown below.");
      return;
    }
    setPasswordError("");
    setOtp("");
    setOtpError("");
    setCooldown(30);
    setOtpOpen(true);
  };

  const submitOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (otp !== DEMO_OTP) {
      setOtpError("That code is incorrect or has expired. Try the demo code shown below.");
      return;
    }
    setOtpError("");
    setSignedIn(true);
    closeAll();
  };

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      vertical="center"
      padding="l"
      gap="24"
      minHeight="100vh"
    >
      <Column maxWidth={32} fillWidth gap="16" horizontal="center" align="center">
        <Heading as="h1" variant="display-strong-s" wrap="balance">
          Northwind Console
        </Heading>
        {signedIn ? (
          <Column gap="16" horizontal="center" role="status" aria-live="polite">
            <Text variant="body-default-l" onBackground="neutral-weak">
              Welcome back, Maya. You are signed in to the Northwind production workspace.
            </Text>
            <Button variant="secondary" size="m" onClick={() => setSignedIn(false)}>
              Sign out
            </Button>
          </Column>
        ) : (
          <Column gap="16" horizontal="center">
            <Text variant="body-default-l" onBackground="neutral-weak">
              Manage deployments, billing and team access. Sign in with your password, then confirm
              with a one-time code.
            </Text>
            <Button variant="primary" size="l" onClick={openLogin} aria-haspopup="dialog">
              Sign in
            </Button>
          </Column>
        )}
      </Column>

      <Dialog
        open={loginOpen}
        onClose={closeAll}
        title="Sign in to Northwind"
        description="Step 1 of 2: enter your email and password."
      >
        <form onSubmit={submitPassword} noValidate aria-label="Sign in with password">
          <Column fillWidth gap="16">
            <Input
              id="login-email"
              label="Work email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              error={passwordError !== ""}
              errorMessage={passwordError || undefined}
              required
            />
            {passwordError ? (
              <Text variant="body-default-s" onBackground="danger-weak" role="alert">
                {passwordError}
              </Text>
            ) : null}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo password: {DEMO_PASSWORD}
            </Text>
            <Row fillWidth gap="8" horizontal="end" wrap>
              <Button type="button" variant="tertiary" size="m" onClick={closeAll}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="m">
                Continue
              </Button>
            </Row>
          </Column>
        </form>
      </Dialog>

      <Dialog
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        title="Verify it is you"
        description={`Step 2 of 2: enter the 6-digit code for ${email}.`}
        stack
      >
        <form onSubmit={submitOtp} noValidate aria-label="Two-step verification">
          <Column fillWidth gap="16">
            <Input
              id="login-otp"
              label="One-time code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setOtpError("");
              }}
              error={otpError !== ""}
              errorMessage={otpError || undefined}
              required
            />
            {otpError ? (
              <Text variant="body-default-s" onBackground="danger-weak" role="alert">
                {otpError}
              </Text>
            ) : null}
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo code: {DEMO_OTP}
            </Text>
            <Row fillWidth gap="8" horizontal="between" vertical="center" wrap>
              <Button
                type="button"
                variant="tertiary"
                size="s"
                disabled={cooldown > 0}
                onClick={() => setCooldown(30)}
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </Button>
              <Row gap="8">
                <Button type="button" variant="secondary" size="m" onClick={() => setOtpOpen(false)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" size="m">
                  Verify and sign in
                </Button>
              </Row>
            </Row>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

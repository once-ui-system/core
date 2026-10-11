"use client";

import { useState } from "react";
import { Button, Column, Dialog, Heading, Input, Row, Text } from "@once-ui-system/core";

const DEMO_EMAIL = "amara.okafor@northwind.dev";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_CODE = "482913";

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);

  const resetAll = () => {
    setLoginOpen(false);
    setOtpOpen(false);
    setPassword("");
    setCode("");
    setPasswordError("");
    setCodeError("");
    setBusy(false);
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setPasswordError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== DEMO_PASSWORD) {
      setPasswordError("That email and password combination does not match. Hint: correct-horse-42");
      return;
    }
    setPasswordError("");
    setOtpOpen(true);
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (code !== DEMO_CODE) {
        setCodeError("That code is incorrect or expired. Hint: 482913");
        return;
      }
      resetAll();
      setSignedIn(true);
    }, 600);
  };

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      vertical="center"
      padding="l"
      gap="24"
      style={{ minHeight: "100vh" }}
    >
      <Column maxWidth={32} gap="16" horizontal="center" align="center">
        <Heading as="h1" variant="display-strong-s" wrap="balance">
          {signedIn ? "Welcome back, Amara" : "Northwind Console"}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak" wrap="balance">
          {signedIn
            ? "You are signed in. Your deploy dashboard has 3 pending reviews and 1 failed build."
            : "Monitor deployments, manage environments and review access for your team in one place."}
        </Text>
        <Row gap="8" wrap horizontal="center">
          {signedIn ? (
            <Button variant="secondary" onClick={() => setSignedIn(false)}>
              Sign out
            </Button>
          ) : (
            <Button
              variant="primary"
              size="l"
              onClick={() => setLoginOpen(true)}
              aria-haspopup="dialog"
            >
              Sign in
            </Button>
          )}
        </Row>
        <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {signedIn ? "Signed in successfully" : ""}
        </div>
      </Column>

      <Dialog
        isOpen={loginOpen}
        onClose={resetAll}
        title="Sign in to Northwind"
        description="Use your work email and password. We will ask for a verification code next."
        footer={
          <Row gap="8" fillWidth horizontal="end" wrap>
            <Button variant="tertiary" onClick={resetAll}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="login-form">
              Continue
            </Button>
          </Row>
        }
      >
        <form id="login-form" onSubmit={submitPassword} noValidate>
          <Column gap="16" fillWidth paddingTop="8">
            <Input
              id="login-email"
              label="Work email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(passwordError)}
              errorMessage={passwordError || undefined}
            />
          </Column>
        </form>
      </Dialog>

      <Dialog
        isOpen={otpOpen}
        onClose={() => {
          setOtpOpen(false);
          setCode("");
          setCodeError("");
        }}
        stack
        title="Two-step verification"
        description={`Enter the 6-digit code from your authenticator app for ${email}.`}
        footer={
          <Row gap="8" fillWidth horizontal="end" wrap>
            <Button
              variant="tertiary"
              onClick={() => {
                setOtpOpen(false);
                setCode("");
                setCodeError("");
              }}
            >
              Back
            </Button>
            <Button variant="primary" type="submit" form="otp-form" loading={busy} disabled={busy}>
              Verify and sign in
            </Button>
          </Row>
        }
      >
        <form id="otp-form" onSubmit={submitCode} noValidate>
          <Column gap="12" fillWidth paddingTop="8">
            <Input
              id="otp-code"
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setCodeError("");
              }}
              error={Boolean(codeError)}
              errorMessage={codeError || undefined}
            />
            <Text variant="body-default-s" onBackground="neutral-weak">
              Codes refresh every 30 seconds. Lost your device? Contact your workspace admin.
            </Text>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

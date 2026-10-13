"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Heading,
  Input,
  PasswordInput,
  Row,
  Text,
} from "@once-ui-system/core";

const VALID_EMAIL = "maya.okafor@northwind.example";
const VALID_PASSWORD = "correct-horse-42";
const VALID_CODE = "428193";
const RESEND_SECONDS = 30;

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [email, setEmail] = useState(VALID_EMAIL);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!otpOpen || seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [otpOpen, seconds]);

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLoginError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setLoginError("Password must be at least 8 characters.");
      return;
    }
    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setLoginError("Email or password is incorrect. Try again.");
      return;
    }
    setLoginError("");
    setCode("");
    setCodeError("");
    setSeconds(RESEND_SECONDS);
    setOtpOpen(true);
  };

  const submitCode = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setCodeError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    if (code !== VALID_CODE) {
      setCodeError("That code is not valid or has expired.");
      return;
    }
    setOtpOpen(false);
    setLoginOpen(false);
    setSignedIn(true);
  };

  const closeOtp = () => {
    setOtpOpen(false);
    setCode("");
    setCodeError("");
  };

  const closeLogin = () => {
    setOtpOpen(false);
    setLoginOpen(false);
    setPassword("");
    setLoginError("");
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
        <Heading as="h1" variant="display-strong-s">
          Northwind Console
        </Heading>
        {signedIn ? (
          <>
            <Text variant="body-default-m" onBackground="neutral-weak" role="status">
              Signed in as {VALID_EMAIL}. Two-step verification complete.
            </Text>
            <Button
              variant="secondary"
              onClick={() => {
                setSignedIn(false);
                setPassword("");
              }}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Manage deployments, billing and team access for your workspace. Sign in with your
              password, then confirm with a one-time code.
            </Text>
            <Button
              size="l"
              onClick={() => setLoginOpen(true)}
              aria-haspopup="dialog"
            >
              Sign in
            </Button>
          </>
        )}
      </Column>

      <Dialog
        isOpen={loginOpen}
        onClose={closeLogin}
        title="Sign in"
        description="Use your Northwind work account."
      >
        <form onSubmit={submitLogin} noValidate>
          <Column fillWidth gap="16">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Work email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(loginError) && !/^\S+@\S+\.\S+$/.test(email)}
            />
            <PasswordInput
              id="login-password"
              name="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(loginError) && password.length < 8}
            />
            {loginError ? (
              <Text variant="body-default-s" onBackground="danger-medium" role="alert">
                {loginError}
              </Text>
            ) : (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Demo password: correct-horse-42
              </Text>
            )}
            <Row fillWidth gap="8" horizontal="end" wrap>
              <Button type="button" variant="tertiary" onClick={closeLogin}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Continue
              </Button>
            </Row>
          </Column>
        </form>
      </Dialog>

      <Dialog
        isOpen={otpOpen}
        onClose={closeOtp}
        title="Two-step verification"
        description="Enter the 6-digit code from your authenticator app."
      >
        <form onSubmit={submitCode} noValidate>
          <Column fillWidth gap="16">
            <Input
              id="otp-code"
              name="otp"
              label="Verification code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              error={Boolean(codeError)}
            />
            {codeError ? (
              <Text variant="body-default-s" onBackground="danger-medium" role="alert">
                {codeError}
              </Text>
            ) : (
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Demo code: {VALID_CODE}
              </Text>
            )}
            <Row fillWidth gap="8" horizontal="between" vertical="center" wrap>
              <Button
                type="button"
                variant="tertiary"
                disabled={seconds > 0}
                onClick={() => setSeconds(RESEND_SECONDS)}
              >
                {seconds > 0 ? `Resend code in ${seconds}s` : "Resend code"}
              </Button>
              <Row gap="8">
                <Button type="button" variant="secondary" onClick={closeOtp}>
                  Back
                </Button>
                <Button type="submit" variant="primary">
                  Verify
                </Button>
              </Row>
            </Row>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

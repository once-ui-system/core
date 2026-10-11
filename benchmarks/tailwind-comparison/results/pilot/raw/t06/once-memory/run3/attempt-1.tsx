"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button, Column, Dialog, Heading, Input, Row, Text } from "@once-ui-system/core";

const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_OTP = "482913";
const RESEND_SECONDS = 30;

type Stage = "idle" | "password" | "otp" | "done";

export default function Page() {
  const [stage, setStage] = useState<Stage>("idle");
  const [email, setEmail] = useState<string>(DEMO_EMAIL);
  const [password, setPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const openLogin = () => {
    setPassword("");
    setOtp("");
    setPasswordError("");
    setOtpError("");
    setStage("password");
  };

  const closeAll = () => {
    if (timer.current) clearTimeout(timer.current);
    setLoading(false);
    setStage("idle");
  };

  const submitPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setPasswordError("Enter a valid work email address.");
      return;
    }
    if (password.length === 0) {
      setPasswordError("Enter your password.");
      return;
    }
    setLoading(true);
    setPasswordError("");
    timer.current = setTimeout(() => {
      setLoading(false);
      if (password === DEMO_PASSWORD) {
        setOtp("");
        setOtpError("");
        setCountdown(RESEND_SECONDS);
        setStage("otp");
      } else {
        setPasswordError("That password does not match our records. Try again.");
      }
    }, 600);
  };

  const submitOtp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter the 6-digit code.");
      return;
    }
    setLoading(true);
    setOtpError("");
    timer.current = setTimeout(() => {
      setLoading(false);
      if (otp === DEMO_OTP) {
        setStage("done");
      } else {
        setOtpError("That code is incorrect or has expired.");
      }
    }, 600);
  };

  const passwordOpen = stage === "password" || stage === "otp";

  return (
    <Column as="main" fillWidth horizontal="center" vertical="center" padding="l" gap="l" style={{ minHeight: "100vh" }}>
      <Column maxWidth={32} fillWidth gap="m" horizontal="center" align="center">
        <Heading as="h1" variant="display-strong-xs" wrap="balance">
          Northwind Console
        </Heading>
        {stage === "done" ? (
          <>
            <Text variant="body-default-l" onBackground="neutral-weak" role="status">
              Signed in as {email}. Welcome back, Maya.
            </Text>
            <Button variant="secondary" size="l" onClick={openLogin}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Text variant="body-default-l" onBackground="neutral-weak">
              Monitor deployments, invoices and team access in one place. Sign in with your password, then confirm
              with a one-time code.
            </Text>
            <Button variant="primary" size="l" onClick={openLogin}>
              Sign in
            </Button>
          </>
        )}
      </Column>

      <Dialog
        open={passwordOpen}
        onClose={closeAll}
        title="Sign in"
        description="Use your work email and password to continue."
      >
        <form onSubmit={submitPassword} noValidate aria-label="Sign in with password">
          <Column gap="16" fillWidth>
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Work email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="login-password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError.length > 0}
              errorMessage={passwordError}
            />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo password: {DEMO_PASSWORD}
            </Text>
            <Button type="submit" variant="primary" fillWidth loading={loading && stage === "password"}>
              Continue
            </Button>
          </Column>
        </form>
      </Dialog>

      <Dialog
        open={stage === "otp"}
        onClose={() => setStage("password")}
        title="Verify it is you"
        description={`We sent a 6-digit code to the phone linked to ${email}.`}
      >
        <form onSubmit={submitOtp} noValidate aria-label="Enter one-time code">
          <Column gap="16" fillWidth>
            <Input
              id="login-otp"
              name="otp"
              label="One-time code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              error={otpError.length > 0}
              errorMessage={otpError}
            />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo code: {DEMO_OTP}
            </Text>
            <Button type="submit" variant="primary" fillWidth loading={loading && stage === "otp"}>
              Verify and sign in
            </Button>
            <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
              <Button type="button" variant="tertiary" size="s" onClick={() => setStage("password")}>
                Back
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="s"
                disabled={countdown > 0}
                onClick={() => setCountdown(RESEND_SECONDS)}
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </Button>
            </Row>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

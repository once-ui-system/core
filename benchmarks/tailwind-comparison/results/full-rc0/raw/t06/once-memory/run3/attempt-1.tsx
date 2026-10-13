"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "correct-horse-battery";
const DEMO_CODE = "424242";

type Stage = "credentials" | "otp" | "done";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export default function Page() {
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState<string>(DEMO_EMAIL);
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [resentNotice, setResentNotice] = useState<boolean>(false);

  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timers = useRef<number[]>([]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [countdown]);

  const resetOtp = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setResentNotice(false);
  }, []);

  const handleCredentials = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let valid = true;
    if (!emailPattern.test(email.trim())) {
      setEmailError("Enter a valid work email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (!valid) return;

    setSubmitting(true);
    schedule(() => {
      setSubmitting(false);
      if (password !== DEMO_PASSWORD) {
        setPasswordError("That password doesn't match our records. Try the demo password shown below.");
        return;
      }
      resetOtp();
      setCountdown(RESEND_SECONDS);
      setStage("otp");
    }, 700);
  };

  useEffect(() => {
    if (stage === "otp") {
      const id = window.setTimeout(() => cellRefs.current[0]?.focus(), 150);
      return () => window.clearTimeout(id);
    }
  }, [stage]);

  const verify = useCallback(
    (code: string) => {
      setVerifying(true);
      setOtpError("");
      schedule(() => {
        setVerifying(false);
        if (code === DEMO_CODE) {
          setStage("done");
        } else {
          setOtpError("That code is incorrect or has expired. Check the code and try again.");
          setDigits(Array(OTP_LENGTH).fill(""));
          cellRefs.current[0]?.focus();
        }
      }, 700);
    },
    [schedule],
  );

  const updateDigits = (next: string[]) => {
    setDigits(next);
    setOtpError("");
    const code = next.join("");
    if (code.length === OTP_LENGTH && next.every((d) => d !== "")) {
      verify(code);
    }
  };

  const handleCellChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    let cursor = index;
    for (const ch of cleaned) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    cellRefs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
    updateDigits(next);
  };

  const handleCellKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      cellRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      cellRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      cellRefs.current[index + 1]?.focus();
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resetOtp();
    setResentNotice(true);
    setCountdown(RESEND_SECONDS);
    cellRefs.current[0]?.focus();
  };

  const closeDialog = () => {
    if (verifying) return;
    setStage("credentials");
    resetOtp();
  };

  const signOut = () => {
    setStage("credentials");
    setPassword("");
    resetOtp();
  };

  const otpComplete = digits.every((d) => d !== "");

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      vertical="center"
      padding="l"
      minHeight="100vh"
      gap="24"
    >
      <Column
        fillWidth
        maxWidth={28}
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
        padding="32"
        gap="24"
        shadow="l"
      >
        {stage === "done" ? (
          <Column gap="16" horizontal="center" aria-live="polite">
            <Heading as="h1" variant="heading-strong-l" align="center">
              You&apos;re signed in
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              Welcome back, Maya. Your session on this device is verified and will stay active for 12 hours.
            </Text>
            <Button variant="secondary" size="m" onClick={signOut} fillWidth>
              Sign out
            </Button>
          </Column>
        ) : (
          <form onSubmit={handleCredentials} noValidate aria-label="Sign in">
            <Column gap="24" fillWidth>
              <Column gap="8">
                <Heading as="h1" variant="heading-strong-l">
                  Sign in to Northwind
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  Use your work account. We&apos;ll ask for a one-time code on the next step.
                </Text>
              </Column>

              <Column gap="16">
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  label="Work email"
                  autoComplete="username"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  error={Boolean(emailError)}
                  errorMessage={emailError}
                />
                <PasswordInput
                  id="login-password"
                  name="password"
                  label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  error={Boolean(passwordError)}
                  errorMessage={passwordError}
                />
              </Column>

              <Button type="submit" variant="primary" size="l" fillWidth loading={submitting}>
                Continue
              </Button>

              <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
                Demo credentials: password <code>{DEMO_PASSWORD}</code>, then code{" "}
                <code>{DEMO_CODE}</code>.
              </Text>
            </Column>
          </form>
        )}
      </Column>

      <Dialog
        open={stage === "otp"}
        onClose={closeDialog}
        title="Verify it's you"
        description={`Enter the 6-digit code we sent to ${maskEmail(email)}.`}
        footer={
          <Row fillWidth gap="8" horizontal="between" vertical="center" wrap>
            <Button
              variant="tertiary"
              size="m"
              onClick={handleResend}
              disabled={countdown > 0 || verifying}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
            </Button>
            <Button
              variant="primary"
              size="m"
              onClick={() => verify(digits.join(""))}
              disabled={!otpComplete}
              loading={verifying}
            >
              Verify
            </Button>
          </Row>
        }
      >
        <Column gap="16" fillWidth>
          <div role="group" aria-label="One-time code" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(node) => {
                  cellRefs.current[index] = node;
                }}
                value={digit}
                onChange={(e) => handleCellChange(index, e.target.value)}
                onKeyDown={(e) => handleCellKeyDown(index, e)}
                onFocus={(e) => e.currentTarget.select()}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={OTP_LENGTH}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-invalid={otpError ? true : undefined}
                aria-describedby={otpError ? "otp-error" : undefined}
                disabled={verifying}
                style={{
                  width: "min(3rem, 13vw)",
                  height: "3.5rem",
                  textAlign: "center",
                  fontSize: "1.5rem",
                  fontFamily: "var(--font-code)",
                  color: "var(--neutral-on-background-strong)",
                  background: "var(--neutral-alpha-weak)",
                  border: `1px solid ${
                    otpError ? "var(--danger-solid-strong)" : "var(--neutral-alpha-medium)"
                  }`,
                  borderRadius: "var(--radius-m)",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>

          <div aria-live="polite" style={{ minHeight: "1.5rem" }}>
            {otpError ? (
              <Text id="otp-error" variant="body-default-s" onBackground="danger-weak" align="center" role="alert">
                {otpError}
              </Text>
            ) : resentNotice ? (
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                A new code is on its way.
              </Text>
            ) : null}
          </div>
        </Column>
      </Dialog>
    </Column>
  );
}

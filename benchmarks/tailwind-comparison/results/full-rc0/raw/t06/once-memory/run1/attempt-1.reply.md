```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Feedback,
  Heading,
  Input,
  Row,
  Text,
} from "@once-ui-system/core";

const DEMO_EMAIL = "maya.lindqvist@northwind.io";
const DEMO_PASSWORD = "correct-horse-battery";
const DEMO_OTP = "428613";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 3;

type Stage = "login" | "otp" | "done";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export default function Page() {
  const [stage, setStage] = useState<Stage>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP state
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resentNotice, setResentNotice] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const emailId = useId();
  const passwordId = useId();
  const otpHintId = useId();
  const otpErrorId = useId();

  const otpOpen = stage === "otp";

  // Resend countdown
  useEffect(() => {
    if (!otpOpen || cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpOpen, cooldown]);

  // Focus first OTP cell when dialog opens
  useEffect(() => {
    if (!otpOpen) return;
    const t = window.setTimeout(() => inputRefs.current[0]?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [otpOpen]);

  const resetOtp = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setVerifying(false);
  }, []);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    const trimmed = email.trim();
    const emailInvalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    setEmailError(emailInvalid ? "Enter a valid work email address." : null);
    setPasswordError(password.length < 8 ? "Password must be at least 8 characters." : null);
    if (emailInvalid || password.length < 8) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (trimmed.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        resetOtp();
        setAttempts(0);
        setCooldown(RESEND_SECONDS);
        setResentNotice(false);
        setStage("otp");
      } else {
        setLoginError("That email and password don't match. Check your details and try again.");
      }
    }, 700);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setEmailError(null);
    setPasswordError(null);
    setLoginError(null);
  };

  const verify = useCallback(
    (code: string) => {
      setVerifying(true);
      setOtpError(null);
      window.setTimeout(() => {
        setVerifying(false);
        if (code === DEMO_OTP) {
          setStage("done");
          return;
        }
        const next = attempts + 1;
        setAttempts(next);
        setDigits(Array(OTP_LENGTH).fill(""));
        if (next >= MAX_ATTEMPTS) {
          setOtpError("Too many incorrect codes. Request a new code to continue.");
        } else {
          setOtpError(
            `That code isn't right. ${MAX_ATTEMPTS - next} attempt${
              MAX_ATTEMPTS - next === 1 ? "" : "s"
            } left.`,
          );
        }
        inputRefs.current[0]?.focus();
      }, 700);
    },
    [attempts],
  );

  const locked = attempts >= MAX_ATTEMPTS;

  const setDigitAt = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    // Support multi-character input (autofill / paste into one cell)
    const chars = clean.slice(0, OTP_LENGTH - index).split("");
    const next = [...digits];
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setDigits(next);
    const focusIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    if (next.every((d) => d !== "")) verify(next.join(""));
  };

  const onDigitChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    setOtpError(null);
    setDigitAt(index, e.target.value);
  };

  const onDigitKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, i) => (i === index - 1 ? "" : d)));
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const onDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    setOtpError(null);
    const next = Array(OTP_LENGTH).fill("") as string[];
    text.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    inputRefs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) verify(text);
  };

  const resend = () => {
    if (cooldown > 0) return;
    resetOtp();
    setAttempts(0);
    setCooldown(RESEND_SECONDS);
    setResentNotice(true);
    inputRefs.current[0]?.focus();
  };

  const closeOtp = () => {
    resetOtp();
    setPassword("");
    setStage("login");
  };

  const signOut = () => {
    resetOtp();
    setPassword("");
    setEmail("");
    setStage("login");
  };

  const codeComplete = digits.every((d) => d !== "");

  return (
    <Column fillWidth minHeight="100vh" horizontal="center" vertical="center" padding="m">
      <Column
        as="main"
        fillWidth
        maxWidth={28}
        gap="24"
        padding="xl"
        radius="xl"
        background="surface"
        border="neutral-alpha-weak"
        shadow="l"
      >
        {stage === "done" ? (
          <Column gap="20" horizontal="center" align="center" aria-live="polite">
            <Column
              horizontal="center"
              vertical="center"
              radius="full"
              background="success-alpha-weak"
              border="success-alpha-medium"
              style={{ width: 56, height: 56 }}
              aria-hidden="true"
            >
              <Text variant="heading-strong-l" onBackground="success-strong">
                ✓
              </Text>
            </Column>
            <Column gap="8" horizontal="center">
              <Heading as="h1" variant="heading-strong-l">
                You&apos;re signed in
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Welcome back, Maya. Your session on this device is active for the next 12 hours.
              </Text>
            </Column>
            <Button variant="secondary" size="m" fillWidth onClick={signOut}>
              Sign out
            </Button>
          </Column>
        ) : (
          <>
            <Column gap="8">
              <Text variant="label-default-s" onBackground="brand-weak">
                Northwind Console
              </Text>
              <Heading as="h1" variant="heading-strong-xl">
                Sign in to your workspace
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Use your work email and password. We&apos;ll confirm it&apos;s you with a one-time
                code.
              </Text>
            </Column>

            <form onSubmit={handleLogin} noValidate aria-label="Sign in">
              <Column gap="16">
                {loginError && (
                  <div role="alert">
                    <Feedback variant="danger" title="Couldn't sign you in">
                      {loginError}
                    </Feedback>
                  </div>
                )}

                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  label="Work email"
                  autoComplete="username"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!!emailError}
                  errorMessage={emailError ?? undefined}
                  aria-required="true"
                />

                <Column gap="8">
                  <Input
                    id={passwordId}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    errorMessage={passwordError ?? undefined}
                    aria-required="true"
                  />
                  <Row horizontal="end">
                    <Button
                      type="button"
                      variant="tertiary"
                      size="s"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Hide password" : "Show password"}
                    </Button>
                  </Row>
                </Column>

                <Button type="submit" variant="primary" size="l" fillWidth loading={submitting}>
                  Continue
                </Button>
              </Column>
            </form>

            <Column gap="12" paddingTop="16" borderTop="neutral-alpha-weak">
              <Text variant="body-default-s" onBackground="neutral-weak">
                Trying the demo? Fill in the sample credentials, then use code{" "}
                <Text as="span" variant="code-default-s" onBackground="neutral-strong">
                  {DEMO_OTP}
                </Text>{" "}
                on the next step.
              </Text>
              <Row>
                <Button type="button" variant="secondary" size="s" onClick={fillDemo}>
                  Fill demo credentials
                </Button>
              </Row>
            </Column>
          </>
        )}
      </Column>

      <Dialog
        open={otpOpen}
        onClose={closeOtp}
        title="Enter your verification code"
        description={`We sent a 6-digit code to ${maskEmail(email.trim() || DEMO_EMAIL)}. It expires in 10 minutes.`}
      >
        <Column gap="16" paddingTop="8">
          <Column gap="8">
            <Text id={otpHintId} variant="label-default-s" onBackground="neutral-weak">
              Verification code
            </Text>
            <Row
              gap="8"
              role="group"
              aria-labelledby={otpHintId}
              aria-describedby={otpError ? otpErrorId : undefined}
              fillWidth
            >
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={digit}
                  onChange={onDigitChange(i)}
                  onKeyDown={onDigitKeyDown(i)}
                  onPaste={onDigitPaste}
                  onFocus={(e) => e.currentTarget.select()}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  aria-invalid={otpError ? true : undefined}
                  disabled={verifying || locked}
                  style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    width: "100%",
                    height: 52,
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: 600,
                    fontFamily: "var(--font-code)",
                    color: "var(--neutral-on-background-strong)",
                    background: "var(--neutral-alpha-weak)",
                    border: `1px solid ${
                      otpError ? "var(--danger-solid-strong)" : "var(--neutral-alpha-medium)"
                    }`,
                    borderRadius: 8,
                    outlineOffset: 2,
                  }}
                />
              ))}
            </Row>
          </Column>

          <div aria-live="polite" id={otpErrorId}>
            {otpError && (
              <Text variant="body-default-s" onBackground="danger-weak" role="alert">
                {otpError}
              </Text>
            )}
            {!otpError && verifying && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Verifying code…
              </Text>
            )}
            {!otpError && !verifying && resentNotice && (
              <Text variant="body-default-s" onBackground="success-weak">
                A new code is on its way.
              </Text>
            )}
          </div>

          <Row gap="8" vertical="center" wrap>
            <Button
              type="button"
              variant="tertiary"
              size="s"
              onClick={resend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
            </Button>
          </Row>

          <Row gap="8" fillWidth wrap>
            <Button
              type="button"
              variant="primary"
              size="m"
              loading={verifying}
              disabled={!codeComplete || locked}
              onClick={() => verify(digits.join(""))}
              style={{ flex: "1 1 160px" }}
            >
              Verify and sign in
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="m"
              onClick={closeOtp}
              style={{ flex: "1 1 160px" }}
            >
              Back to sign in
            </Button>
          </Row>
        </Column>
      </Dialog>
    </Column>
  );
}
```
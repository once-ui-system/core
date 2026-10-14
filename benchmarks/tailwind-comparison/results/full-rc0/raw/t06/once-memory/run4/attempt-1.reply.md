Two fixes are needed:

1. `"shield"` isn't a valid `IconName`. I'll use `"lock"`, which I believe is in the Once UI icon set, though I couldn't check it. If it isn't, the same error would come back.
2. The `Dialog` `stack` prop is a boolean, not a node. I'll set `stack` to a boolean and move the "Step 2 of 2" text into the dialog body.

I'm also removing the `base` prop, since `stack` alone is the safer choice.

```tsx
"use client";

import {
  Background,
  Button,
  Column,
  Dialog,
  Feedback,
  Heading,
  Icon,
  Input,
  PasswordInput,
  Row,
  Text,
} from "@once-ui-system/core";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";

const DEMO_EMAIL = "amara.okafor@northwind.example";
const DEMO_PASSWORD = "Northwind#2025";
const DEMO_CODE = "123456";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Stage = "login" | "otp" | "done";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function OtpFields({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  onComplete,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  onComplete: (code: string) => void;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const commit = (next: string[]) => {
    onChange(next);
    if (next.every((d) => d !== "")) {
      onComplete(next.join(""));
    }
  };

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits === "") {
      const next = [...value];
      next[index] = "";
      onChange(next);
      return;
    }
    const next = [...value];
    // Handles typing and browser autofill of several digits at once.
    let cursor = index;
    for (const ch of digits) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    commit(next);
    refs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value[index] === "" && index > 0) {
      e.preventDefault();
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => text[i] ?? "");
    commit(next);
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <Row
      fillWidth
      horizontal="center"
      gap="8"
      role="group"
      aria-label="One-time verification code"
    >
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          style={{
            width: "clamp(36px, 11vw, 48px)",
            height: "clamp(46px, 13vw, 56px)",
            textAlign: "center",
            fontSize: "1.25rem",
            fontWeight: 600,
            fontFamily: "var(--font-code)",
            color: "var(--neutral-on-background-strong)",
            background: "var(--surface-background)",
            border: `1px solid ${
              invalid ? "var(--danger-border-strong)" : "var(--neutral-border-strong)"
            }`,
            borderRadius: "var(--radius-m)",
            outlineOffset: 2,
          }}
        />
      ))}
    </Row>
  );
}

export default function Page() {
  const emailId = useId();
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState<string[]>(() => Array.from({ length: OTP_LENGTH }, () => ""));
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  const otpErrorId = useId();

  useEffect(() => {
    if (stage !== "otp" || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, secondsLeft]);

  const resetOtp = useCallback(() => {
    setOtp(Array.from({ length: OTP_LENGTH }, () => ""));
    setOtpKey((k) => k + 1);
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!emailPattern.test(email.trim())) next.email = "Enter a valid work email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    await wait(700);
    setSubmitting(false);

    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setErrors({ form: "That email and password combination doesn't match our records." });
      return;
    }
    setErrors({});
    resetOtp();
    setOtpError("");
    setResent(false);
    setSecondsLeft(RESEND_SECONDS);
    setStage("otp");
  };

  const verify = useCallback(
    async (code: string) => {
      setVerifying(true);
      setOtpError("");
      await wait(700);
      setVerifying(false);
      if (code === DEMO_CODE) {
        setStage("done");
      } else {
        setOtpError("That code is incorrect or has expired. Check your authenticator and try again.");
        resetOtp();
      }
    },
    [resetOtp],
  );

  const handleVerifySubmit = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    void verify(code);
  };

  const handleResend = () => {
    setSecondsLeft(RESEND_SECONDS);
    setResent(true);
    setOtpError("");
    resetOtp();
  };

  const signOut = () => {
    setStage("login");
    setPassword("");
    setErrors({});
  };

  const otpOpen = stage === "otp";

  return (
    <Column fillWidth fillHeight horizontal="center" vertical="center" style={{ minHeight: "100vh", position: "relative" }}>
      <Background
        position="absolute"
        fill
        gradient={{
          display: true,
          opacity: 60,
          x: 50,
          y: 0,
          width: 100,
          height: 60,
          tilt: 0,
          colorStart: "brand-background-strong",
          colorEnd: "static-transparent",
        }}
      />

      <Column
        as="main"
        fillWidth
        horizontal="center"
        padding="16"
        style={{ position: "relative", zIndex: 1 }}
      >
        {stage === "done" ? (
          <Column
            maxWidth={28}
            fillWidth
            background="surface"
            border="neutral-alpha-medium"
            radius="xl"
            padding="32"
            gap="24"
            horizontal="center"
            shadow="l"
          >
            <Row
              background="success-alpha-weak"
              radius="full"
              padding="16"
              horizontal="center"
              vertical="center"
            >
              <Icon name="check" onBackground="success-strong" size="l" />
            </Row>
            <Column gap="8" horizontal="center">
              <Heading as="h1" variant="heading-strong-l" align="center">
                You&apos;re signed in
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" align="center">
                Welcome back, Amara. Your session on Northwind Console is active on this device for
                the next 12 hours.
              </Text>
            </Column>
            <Button variant="secondary" size="l" fillWidth onClick={signOut}>
              Sign out
            </Button>
          </Column>
        ) : (
          <Column
            maxWidth={28}
            fillWidth
            background="surface"
            border="neutral-alpha-medium"
            radius="xl"
            padding="32"
            gap="24"
            shadow="l"
          >
            <Column gap="8">
              <Row gap="8" vertical="center">
                <Icon name="lock" onBackground="brand-medium" size="m" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Northwind Console
                </Text>
              </Row>
              <Heading as="h1" variant="heading-strong-xl">
                Sign in
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Use your work account to manage deployments, billing and team access.
              </Text>
            </Column>

            <form onSubmit={handleLogin} noValidate aria-label="Sign in">
              <Column gap="16">
                {errors.form && (
                  <div role="alert">
                    <Feedback variant="danger" title="Sign-in failed" description={errors.form} />
                  </div>
                )}
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  label="Work email"
                  autoComplete="username"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  error={Boolean(errors.email)}
                  errorMessage={errors.email}
                  disabled={submitting}
                />
                <PasswordInput
                  id={`${emailId}-password`}
                  name="password"
                  label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  error={Boolean(errors.password)}
                  errorMessage={errors.password}
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="l"
                  fillWidth
                  loading={submitting}
                  disabled={submitting}
                >
                  Continue
                </Button>
              </Column>
            </form>

            <Column gap="4" padding="12" radius="m" background="neutral-alpha-weak">
              <Text variant="label-default-s" onBackground="neutral-strong">
                Demo credentials
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {DEMO_EMAIL} / {DEMO_PASSWORD}
              </Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Verification code: {DEMO_CODE}
              </Text>
            </Column>
          </Column>
        )}
      </Column>

      <Dialog
        isOpen={otpOpen}
        onClose={() => {
          if (!verifying) setStage("login");
        }}
        title="Two-step verification"
        description={`Enter the ${OTP_LENGTH}-digit code from your authenticator app to finish signing in as ${email.trim()}.`}
        stack
        footer={
          <Row fillWidth gap="8" horizontal="end" s={{ direction: "column-reverse" }}>
            <Button
              variant="tertiary"
              onClick={() => setStage("login")}
              disabled={verifying}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifySubmit}
              loading={verifying}
              disabled={verifying}
            >
              Verify and sign in
            </Button>
          </Row>
        }
      >
        <Column fillWidth gap="16" paddingTop="8">
          <Row fillWidth horizontal="center">
            <Text variant="label-default-s" onBackground="neutral-weak">
              Step 2 of 2
            </Text>
          </Row>
          <OtpFields
            key={otpKey}
            value={otp}
            onChange={setOtp}
            disabled={verifying}
            invalid={Boolean(otpError)}
            describedBy={otpError ? otpErrorId : undefined}
            onComplete={(code) => void verify(code)}
          />
          <div aria-live="polite" id={otpErrorId}>
            {otpError && (
              <Text variant="body-default-s" onBackground="danger-weak" align="center" as="p">
                {otpError}
              </Text>
            )}
          </div>
          <Row fillWidth horizontal="center" vertical="center" gap="8" wrap>
            {secondsLeft > 0 ? (
              <Text variant="body-default-s" onBackground="neutral-weak" aria-live="off">
                {resent ? "New code sent. " : ""}Resend available in {secondsLeft}s
              </Text>
            ) : (
              <>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Didn&apos;t get a code?
                </Text>
                <Button variant="tertiary" size="s" onClick={handleResend} disabled={verifying}>
                  Resend code
                </Button>
              </>
            )}
          </Row>
        </Column>
      </Dialog>
    </Column>
  );
}
```
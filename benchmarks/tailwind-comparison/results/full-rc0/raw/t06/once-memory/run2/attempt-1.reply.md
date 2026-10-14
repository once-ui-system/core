The package still isn't installed, so I can't check the types directly. Since `Checkbox` is `checked`-based, it likely extends native input props, so I'll use `onChange`.

```tsx
"use client";

import {
  Background,
  Button,
  Checkbox,
  Column,
  Dialog,
  Feedback,
  Heading,
  Input,
  Line,
  PasswordInput,
  Row,
  Text,
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";

const OTP_LENGTH = 6;
const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "northwind-2025";
const DEMO_OTP = "424242";
const RESEND_SECONDS = 30;

type Stage = "credentials" | "otp" | "signedIn";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

function OtpCells({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  describedBy,
  groupLabelId,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete: (code: string) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy?: string;
  groupLabelId: string;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusCell = (index: number) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    el?.focus();
    el?.select();
  };

  useEffect(() => {
    const t = window.setTimeout(() => focusCell(0), 80);
    return () => window.clearTimeout(t);
  }, []);

  const commit = (next: string[]) => {
    onChange(next);
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleInput = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      const next = [...value];
      next[index] = "";
      onChange(next);
      return;
    }
    const next = [...value];
    let cursor = index;
    for (const d of digits) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = d;
      cursor += 1;
    }
    commit(next);
    focusCell(cursor);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      focusCell(index - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    const next = Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? "");
    commit(next);
    focusCell(Math.min(digits.length, OTP_LENGTH - 1));
  };

  return (
    <Row
      gap="8"
      fillWidth
      horizontal="center"
      role="group"
      aria-labelledby={groupLabelId}
      aria-describedby={describedBy}
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={digit}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            width: "min(3rem, 13vw)",
            height: "3.5rem",
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: 600,
            fontFamily: "var(--font-code)",
            color: "var(--neutral-on-background-strong)",
            background: "var(--surface-background)",
            border: `1px solid ${
              invalid ? "var(--danger-solid-medium)" : "var(--neutral-alpha-medium)"
            }`,
            borderRadius: "var(--radius-m)",
            outlineOffset: 2,
            minWidth: 0,
          }}
        />
      ))}
    </Row>
  );
}

export default function Page() {
  const { addToast } = useToast();

  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [credError, setCredError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  const otpLabelId = useId();
  const otpErrorId = useId();
  const errorId = useId();

  const otpOpen = stage === "otp";

  // Resend countdown
  useEffect(() => {
    if (!otpOpen || countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [otpOpen, countdown]);

  const resetOtp = useCallback(() => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setVerifying(false);
  }, []);

  const handleCredentials = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setCredError("Enter a valid work email address.");
      return;
    }
    if (password.length === 0) {
      setCredError("Enter your password to continue.");
      return;
    }
    setCredError(null);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      if (password !== DEMO_PASSWORD) {
        setCredError("That email and password combination doesn't match our records.");
        return;
      }
      resetOtp();
      setCountdown(RESEND_SECONDS);
      setStage("otp");
    }, 700);
  };

  const verifyCode = (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    window.setTimeout(() => {
      if (code === DEMO_OTP) {
        setVerifying(false);
        setStage("signedIn");
        addToast({ variant: "success", message: "Verified. Welcome back, Maya." });
      } else {
        setVerifying(false);
        setOtpError("That code is incorrect or has expired. Try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
      }
    }, 600);
  };

  const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    verifyCode(code);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    resetOtp();
    setCountdown(RESEND_SECONDS);
    addToast({ variant: "success", message: "A new code is on its way." });
  };

  const closeOtp = () => {
    resetOtp();
    setStage("credentials");
    setPassword("");
  };

  const signOut = () => {
    setPassword("");
    resetOtp();
    setCredError(null);
    setStage("credentials");
  };

  return (
    <Column
      as="main"
      fillWidth
      flex={1}
      horizontal="center"
      vertical="center"
      padding="l"
      style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}
    >
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
          colorEnd: "page-background",
        }}
        mask={{ x: 50, y: 0, radius: 100 }}
      />

      <Column
        fillWidth
        maxWidth={26}
        gap="24"
        position="relative"
        style={{ zIndex: 1 }}
      >
        <Column gap="8" horizontal="center" align="center">
          <Row
            radius="l"
            background="brand-strong"
            horizontal="center"
            vertical="center"
            aria-hidden="true"
            style={{ width: 48, height: 48 }}
          >
            <Text variant="heading-strong-l" onBackground="brand-strong" style={{ color: "#fff" }}>
              N
            </Text>
          </Row>
          <Text variant="label-default-s" onBackground="neutral-weak">
            Northwind Workspace
          </Text>
        </Column>

        {stage === "signedIn" ? (
          <Column
            background="surface"
            border="neutral-alpha-weak"
            radius="xl"
            padding="32"
            gap="20"
            horizontal="center"
            align="center"
            role="status"
            aria-live="polite"
          >
            <Heading as="h1" variant="heading-strong-l">
              You&apos;re signed in
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Signed in as {DEMO_EMAIL}. Your session stays active on this device
              {remember ? " for 30 days" : " until you close the browser"}.
            </Text>
            <Line />
            <Row fillWidth gap="12" wrap>
              <Button fillWidth variant="primary" href="#dashboard">
                Open dashboard
              </Button>
              <Button fillWidth variant="secondary" onClick={signOut}>
                Sign out
              </Button>
            </Row>
          </Column>
        ) : (
          <form
            onSubmit={handleCredentials}
            noValidate
            aria-labelledby="login-title"
            style={{ display: "flex", width: "100%" }}
          >
            <Column
              fillWidth
              background="surface"
              border="neutral-alpha-weak"
              radius="xl"
              padding="32"
              gap="20"
            >
              <Column gap="8">
                <Heading as="h1" variant="heading-strong-l" id="login-title">
                  Sign in to your workspace
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Use your work email. We&apos;ll ask for a verification code next.
                </Text>
              </Column>

              {credError && (
                <Feedback variant="danger" id={errorId} role="alert" title="Couldn't sign you in">
                  {credError}
                </Feedback>
              )}

              <Column gap="16">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Work email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </Column>

              <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
                <Checkbox
                  label="Keep me signed in"
                  checked={remember}
                  onChange={() => setRemember((r) => !r)}
                />
                <Button variant="tertiary" size="s" href="#forgot">
                  Forgot password?
                </Button>
              </Row>

              <Button type="submit" fillWidth size="l" loading={submitting} disabled={submitting}>
                Continue
              </Button>

              <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
                Demo credentials: password <code>{DEMO_PASSWORD}</code>, then code{" "}
                <code>{DEMO_OTP}</code>.
              </Text>
            </Column>
          </form>
        )}
      </Column>

      <Dialog
        open={otpOpen}
        onClose={closeOtp}
        title="Verify it's you"
        description={`Enter the 6-digit code we sent to the authenticator linked to ${maskEmail(
          email.trim() || DEMO_EMAIL,
        )}.`}
        base
        stack
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Button
              variant="tertiary"
              size="s"
              onClick={handleResend}
              disabled={countdown > 0 || verifying}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
            </Button>
            <Button variant="secondary" size="s" onClick={closeOtp} disabled={verifying}>
              Back
            </Button>
          </Row>
        }
      >
        <form
          onSubmit={handleOtpSubmit}
          noValidate
          aria-busy={verifying}
          style={{ display: "flex", width: "100%" }}
        >
          <Column gap="16" fillWidth>
            <Text
              id={otpLabelId}
              variant="label-default-s"
              onBackground="neutral-weak"
              align="center"
            >
              Verification code
            </Text>

            <OtpCells
              value={otp}
              onChange={setOtp}
              onComplete={verifyCode}
              disabled={verifying}
              invalid={otpError !== null}
              describedBy={otpError ? otpErrorId : undefined}
              groupLabelId={otpLabelId}
            />

            <div aria-live="assertive" style={{ minHeight: "1.25rem" }}>
              {otpError && (
                <Text
                  id={otpErrorId}
                  variant="body-default-s"
                  onBackground="danger-medium"
                  align="center"
                  as="p"
                >
                  {otpError}
                </Text>
              )}
            </div>

            <Button type="submit" fillWidth loading={verifying} disabled={verifying}>
              Verify and sign in
            </Button>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}
```
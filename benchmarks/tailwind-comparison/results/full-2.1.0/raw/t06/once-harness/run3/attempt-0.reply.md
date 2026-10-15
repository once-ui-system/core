Checkbox has `label` via `InteractiveDetails`. I'll write the file.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Background,
  Button,
  Checkbox,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Input,
  Line,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

/* ---------- Inline placeholder content ---------- */

const DEMO_EMAIL = "maya.okafor@northwind.io";
const DEMO_PASSWORD = "northwind-2025";
const DEMO_CODE = "482913";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const highlights = [
  {
    icon: "security",
    title: "Two-step verification",
    text: "Every new device is confirmed with a one-time code before it can reach your workspace.",
  },
  {
    icon: "bolt",
    title: "Pick up where you left off",
    text: "Your boards, filters and drafts sync the moment you sign in, on any device.",
  },
  {
    icon: "organization",
    title: "Built for teams",
    text: "Roles, audit trail and SSO are included on every Northwind plan.",
  },
] as const;

type Step = "form" | "device" | "otp" | "done";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

/* ---------- Page ---------- */

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<Step>("form");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [resentNotice, setResentNotice] = useState(false);

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

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    if (!trimmed || !password) {
      setFormError("Enter your email and password to continue.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setFormError("That email address doesn't look right. Check it and try again.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    schedule(() => {
      setSubmitting(false);
      if (trimmed.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setStep("device");
      } else {
        setFormError("Email or password is incorrect. Use the demo credentials shown below.");
      }
    }, 700);
  };

  const startOtp = () => {
    setOtpError(null);
    setOtpKey((k) => k + 1);
    setResendIn(RESEND_SECONDS);
    setResentNotice(false);
    setStep("otp");
  };

  const handleComplete = (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    schedule(() => {
      setVerifying(false);
      if (code === DEMO_CODE) {
        setStep("done");
      } else {
        setOtpError("That code isn't valid or has expired. Try again or request a new one.");
        setOtpKey((k) => k + 1);
      }
    }, 600);
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setOtpError(null);
    setOtpKey((k) => k + 1);
    setResendIn(RESEND_SECONDS);
    setResentNotice(true);
  };

  const closeAll = () => {
    setStep("form");
    setOtpError(null);
    setVerifying(false);
  };

  const backToDevice = () => {
    setOtpError(null);
    setStep("device");
  };

  const signedIn = step === "done";

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh" s={{ padding: "12" }}>
      <Background
        position="absolute"
        top="0"
        left="0"
        fill
        pointerEvents="none"
        gradient={{
          display: true,
          colorStart: "brand-alpha-medium",
          colorEnd: "static-transparent",
          x: 50,
          y: 0,
          width: 150,
          height: 80,
          opacity: 50,
        }}
        dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
      />

      <Grid
        zIndex={1}
        maxWidth="l"
        columns="2"
        radius="xl"
        border
        overflow="hidden"
        background="surface"
        s={{ columns: 1 }}
      >
        {/* Brand panel */}
        <Column
          padding="48"
          gap="40"
          vertical="between"
          background="brand-alpha-weak"
          s={{ hide: true }}
        >
          <Row gap="12" vertical="center">
            <Row center radius="m" background="brand-alpha-medium" width={2.5} height={2.5}>
              <Icon name="symbol" size="m" onBackground="brand-strong" />
            </Row>
            <Text variant="heading-strong-m">Northwind</Text>
          </Row>

          <Column gap="16">
            <Heading as="h2" variant="display-strong-s">
              Your team&apos;s work, one sign-in away.
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Plan sprints, review releases and keep every decision in one place.
            </Text>
          </Column>

          <Column as="ul" gap="20" margin="0" padding="0" style={{ listStyle: "none" }}>
            {highlights.map((item) => (
              <Row as="li" key={item.title} gap="16" vertical="start">
                <Row
                  center
                  radius="m"
                  background="surface"
                  border
                  width={2.5}
                  height={2.5}
                  flex={0}
                  aria-hidden="true"
                >
                  <Icon name={item.icon} size="s" onBackground="brand-strong" />
                </Row>
                <Column gap="4" fillWidth>
                  <Text variant="label-strong-m">{item.title}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {item.text}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        {/* Form panel */}
        <Column padding="48" gap="32" center s={{ padding: "24" }}>
          <Column fillWidth gap="8" horizontal="center">
            <Heading as="h1" variant="display-strong-xs" align="center">
              {signedIn ? "You're signed in" : "Welcome back"}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak" align="center">
              {signedIn ? (
                <>Signed in as {DEMO_EMAIL}.</>
              ) : (
                <>
                  New to Northwind? <SmartLink href="/signup">Create an account</SmartLink>
                </>
              )}
            </Text>
          </Column>

          {signedIn ? (
            <Column fillWidth gap="16" horizontal="center">
              <Row
                center
                radius="full"
                background="success-alpha-medium"
                width={4}
                height={4}
                aria-hidden="true"
              >
                <Icon name="check" size="l" onBackground="success-strong" />
              </Row>
              <Text
                variant="body-default-m"
                onBackground="neutral-weak"
                align="center"
                role="status"
              >
                This device is now trusted. Redirecting you to the Atlas workspace…
              </Text>
              <Button
                variant="secondary"
                fillWidth
                onClick={() => {
                  setStep("form");
                  setPassword("");
                  setOtpError(null);
                }}
              >
                Sign out
              </Button>
            </Column>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-label="Sign in" style={{ width: "100%" }}>
              <Column fillWidth gap="16">
                <Input
                  id="login-email"
                  label="Email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  autoComplete="email"
                  type="email"
                  inputMode="email"
                  required
                  error={Boolean(formError)}
                />
                <PasswordInput
                  id="login-password"
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  error={Boolean(formError)}
                />

                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Checkbox
                    label="Keep me signed in"
                    checked={remember}
                    onToggle={(checked: boolean) => setRemember(checked)}
                  />
                  <SmartLink href="/forgot-password">Forgot password?</SmartLink>
                </Row>

                <div role="alert" aria-live="assertive">
                  {formError ? (
                    <Row
                      gap="8"
                      padding="12"
                      radius="m"
                      background="danger-alpha-weak"
                      border="danger-alpha-medium"
                      vertical="start"
                    >
                      <Icon name="warning" size="s" onBackground="danger-strong" />
                      <Text variant="body-default-s" onBackground="danger-strong">
                        {formError}
                      </Text>
                    </Row>
                  ) : null}
                </div>

                <Button type="submit" fillWidth arrowIcon loading={submitting}>
                  {submitting ? "Checking…" : "Sign in"}
                </Button>
              </Column>
            </form>
          )}

          {!signedIn && (
            <>
              <Row fillWidth vertical="center" gap="16" aria-hidden="true">
                <Line fill />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  demo account
                </Text>
                <Line fill />
              </Row>

              <Column
                fillWidth
                gap="8"
                padding="16"
                radius="l"
                background="page"
                border
                textVariant="body-default-s"
              >
                <Row gap="8" wrap>
                  <Text onBackground="neutral-weak">Email</Text>
                  <Text variant="code-default-s">{DEMO_EMAIL}</Text>
                </Row>
                <Row gap="8" wrap>
                  <Text onBackground="neutral-weak">Password</Text>
                  <Text variant="code-default-s">{DEMO_PASSWORD}</Text>
                </Row>
                <Row gap="8" wrap>
                  <Text onBackground="neutral-weak">One-time code</Text>
                  <Text variant="code-default-s">{DEMO_CODE}</Text>
                </Row>
              </Column>

              <Row gap="16" wrap horizontal="center">
                <SmartLink href="/privacy">Privacy policy</SmartLink>
                <SmartLink href="/terms">Terms of use</SmartLink>
              </Row>
            </>
          )}
        </Column>
      </Grid>

      {/* Dialog 1 — base: confirm the verification channel */}
      <Dialog
        base
        open={step === "device" || step === "otp"}
        onClose={closeAll}
        title="Verify it's you"
        description="We don't recognise this browser, so we need one more step before you can continue."
        footer={
          <Row fillWidth horizontal="end" gap="8" wrap>
            <Button variant="secondary" onClick={closeAll}>
              Cancel
            </Button>
            <Button onClick={startOtp} arrowIcon>
              Send code
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <Row
            gap="16"
            padding="16"
            radius="l"
            background="surface"
            border
            vertical="center"
          >
            <Row
              center
              radius="m"
              background="brand-alpha-medium"
              width={2.5}
              height={2.5}
              flex={0}
              aria-hidden="true"
            >
              <Icon name="mail" size="s" onBackground="brand-strong" />
            </Row>
            <Column gap="4" fillWidth>
              <Text variant="label-strong-m">Email a 6-digit code</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Sent to {maskEmail(DEMO_EMAIL)}
              </Text>
            </Column>
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Codes expire after 10 minutes. {remember ? "We'll remember this device for 30 days." : "We won't remember this device."}
          </Text>
        </Column>
      </Dialog>

      {/* Dialog 2 — stacked on top: enter the OTP */}
      <Dialog
        stack
        open={step === "otp"}
        onClose={backToDevice}
        title="Enter your code"
        description={`We sent a ${OTP_LENGTH}-digit code to ${maskEmail(DEMO_EMAIL)}.`}
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
            <Button variant="tertiary" prefixIcon="arrowLeft" onClick={backToDevice}>
              Back
            </Button>
            <Button
              variant="secondary"
              onClick={handleResend}
              disabled={resendIn > 0}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8" horizontal="center">
          <OTPInput
            key={otpKey}
            length={OTP_LENGTH}
            autoFocus
            disabled={verifying}
            error={Boolean(otpError)}
            errorMessage={otpError ?? undefined}
            onComplete={handleComplete}
          />
          <div role="status" aria-live="polite" style={{ minHeight: "1.5rem" }}>
            {verifying ? (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Verifying code…
              </Text>
            ) : resentNotice && !otpError ? (
              <Text variant="body-default-s" onBackground="success-strong">
                A new code is on its way.
              </Text>
            ) : null}
          </div>
        </Column>
      </Dialog>
    </Column>
  );
}
```
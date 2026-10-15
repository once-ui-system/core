`PasswordInput` extends `Input`, so `value`/`onChange` follow native input props. I'll write the page now.

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

/* ------------------------------------------------------------------ */
/* Placeholder data (inline, no network)                               */
/* ------------------------------------------------------------------ */

const DEMO_EMAIL = "maya.lindqvist@northwind.io";
const DEMO_PASSWORD = "Northwind#2025";
const DEMO_OTP = "482916";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const highlights: { icon: "security" | "bolt" | "organization"; title: string; text: string }[] = [
  {
    icon: "security",
    title: "Two-step verification",
    text: "Every sign-in from a new device is confirmed with a one-time code.",
  },
  {
    icon: "bolt",
    title: "Deploys in seconds",
    text: "Pick up your pipelines, previews and release notes right where you left them.",
  },
  {
    icon: "organization",
    title: "Built for teams",
    text: "Shared workspaces, roles and audit logs for 2,400+ engineering teams.",
  },
];

type EmailErrors = { email?: string; password?: string };

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<EmailErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    if (!otpOpen || secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [otpOpen, secondsLeft]);

  /* Step 1: password ------------------------------------------------- */

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const next: EmailErrors = {};
    if (!email.trim()) next.email = "Enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "That email doesn't look right.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    schedule(() => {
      setSubmitting(false);
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setConfirmOpen(true);
      } else {
        setFormError("Email or password is incorrect. Use the demo credentials shown below.");
      }
    }, 700);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setFormError(null);
  };

  /* Step 2: confirm device (base dialog) -> OTP (stacked dialog) ----- */

  const startOtp = () => {
    setOtpError(false);
    setOtpKey((k) => k + 1);
    setSecondsLeft(RESEND_SECONDS);
    setOtpOpen(true);
  };

  const closeAll = () => {
    setOtpOpen(false);
    setConfirmOpen(false);
  };

  const handleOtpComplete = (code: string) => {
    setOtpVerifying(true);
    setOtpError(false);
    schedule(() => {
      setOtpVerifying(false);
      if (code === DEMO_OTP) {
        closeAll();
        setSignedIn(true);
      } else {
        setOtpError(true);
      }
    }, 600);
  };

  const resend = () => {
    setOtpError(false);
    setOtpKey((k) => k + 1);
    setSecondsLeft(RESEND_SECONDS);
  };

  const signOut = () => {
    setSignedIn(false);
    setPassword("");
    setOtpError(false);
  };

  /* Render ------------------------------------------------------------ */

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
      <Grid
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
          padding="40"
          gap="32"
          vertical="between"
          overflow="hidden"
          minHeight={40}
          s={{ hide: true }}
        >
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
              x: 20,
              y: 0,
              width: 200,
              height: 120,
              opacity: 70,
            }}
            dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
          />
          <Row zIndex={1} gap="12" vertical="center">
            <Row
              center
              width={2.5}
              height={2.5}
              radius="m"
              background="brand-alpha-medium"
              onBackground="brand-strong"
              aria-hidden="true"
            >
              <Icon name="sparkle" size="s" />
            </Row>
            <Text variant="heading-strong-m">Northwind</Text>
          </Row>

          <Column zIndex={1} gap="24">
            <Heading as="h2" variant="display-strong-xs">
              Ship with confidence. Sign in to pick up where you left off.
            </Heading>
            <Column as="ul" gap="20" margin="0" padding="0" style={{ listStyle: "none" }}>
              {highlights.map((item) => (
                <Row as="li" key={item.title} gap="16" vertical="start">
                  <Row
                    center
                    flex={0}
                    width={2.5}
                    height={2.5}
                    radius="m"
                    background="neutral-alpha-weak"
                    border
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
        </Column>

        {/* Form panel */}
        <Column padding="48" gap="32" center s={{ padding: "24" }}>
          {signedIn ? (
            <Column fillWidth gap="24" horizontal="center" aria-live="polite" role="status">
              <Row
                center
                width={4}
                height={4}
                radius="full"
                background="success-alpha-medium"
                onBackground="success-strong"
              >
                <Icon name="check" size="l" />
              </Row>
              <Column gap="8" horizontal="center">
                <Heading as="h1" variant="display-strong-xs" align="center">
                  Welcome back, Maya
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  You&apos;re signed in as {DEMO_EMAIL}. Redirecting you to the Northwind
                  dashboard…
                </Text>
              </Column>
              <Button variant="secondary" fillWidth onClick={signOut}>
                Sign out and start over
              </Button>
            </Column>
          ) : (
            <>
              <Column fillWidth gap="8" horizontal="center">
                <Heading as="h1" variant="display-strong-xs" align="center">
                  Sign in to Northwind
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                  New here? <SmartLink href="/signup">Create an account</SmartLink>
                </Text>
              </Column>

              <Column fillWidth gap="12">
                <Button fillWidth variant="secondary" prefixIcon="globe" type="button">
                  Continue with Google
                </Button>
                <Button fillWidth variant="secondary" prefixIcon="code" type="button">
                  Continue with GitHub
                </Button>
              </Column>

              <Row fillWidth vertical="center" gap="16" aria-hidden="true">
                <Line fill />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  or
                </Text>
                <Line fill />
              </Row>

              <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
                <Column fillWidth gap="16">
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    label="Work email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                  />
                  <PasswordInput
                    id="login-password"
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    error={Boolean(errors.password)}
                    errorMessage={errors.password}
                  />

                  <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                    <Checkbox
                      label="Keep me signed in"
                      checked={remember}
                      onToggle={(checked: boolean) => setRemember(checked)}
                    />
                    <SmartLink href="/forgot-password">Forgot password?</SmartLink>
                  </Row>

                  {formError && (
                    <Row
                      role="alert"
                      gap="8"
                      padding="12"
                      radius="m"
                      background="danger-alpha-weak"
                      onBackground="danger-strong"
                      vertical="start"
                    >
                      <Icon name="warning" size="s" />
                      <Text variant="body-default-s">{formError}</Text>
                    </Row>
                  )}

                  <Button fillWidth type="submit" loading={submitting} arrowIcon>
                    Sign in
                  </Button>
                </Column>
              </form>

              <Column
                fillWidth
                gap="8"
                padding="16"
                radius="l"
                background="neutral-alpha-weak"
                border
              >
                <Row gap="8" vertical="center">
                  <Icon name="info" size="xs" onBackground="neutral-weak" />
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    Demo credentials
                  </Text>
                </Row>
                <Text variant="code-default-s" wrap="balance">
                  {DEMO_EMAIL}
                </Text>
                <Text variant="code-default-s">{DEMO_PASSWORD}</Text>
                <Row>
                  <Button variant="tertiary" size="s" type="button" onClick={fillDemo}>
                    Fill in for me
                  </Button>
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

      {/* Base dialog: confirm the sign-in attempt */}
      <Dialog
        base
        open={confirmOpen}
        onClose={closeAll}
        title="Confirm it's you"
        description={`We noticed a sign-in from a new device for ${maskEmail(DEMO_EMAIL)}.`}
        footer={
          <Row fillWidth gap="12" horizontal="end" wrap>
            <Button variant="tertiary" onClick={closeAll}>
              Cancel
            </Button>
            <Button prefixIcon="mail" onClick={startOtp}>
              Send verification code
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <Row gap="12" vertical="start" padding="16" radius="l" background="neutral-alpha-weak" border>
            <Icon name="computer" size="m" onBackground="neutral-weak" />
            <Column gap="4">
              <Text variant="label-strong-s">MacBook Pro · Safari</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Stockholm, Sweden · just now
              </Text>
            </Column>
          </Row>
          <Text variant="body-default-s" onBackground="neutral-weak">
            For your protection, we&apos;ll email a 6-digit code to verify this sign-in.
          </Text>
        </Column>
      </Dialog>

      {/* Stacked dialog: one-time code */}
      <Dialog
        stack
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        title="Enter your verification code"
        description={`We sent a ${OTP_LENGTH}-digit code to ${maskEmail(DEMO_EMAIL)}. It expires in 10 minutes.`}
        footer={
          <Row fillWidth gap="12" horizontal="between" vertical="center" wrap>
            <Button variant="tertiary" prefixIcon="arrowLeft" onClick={() => setOtpOpen(false)}>
              Back
            </Button>
            <Button
              variant="secondary"
              prefixIcon="refresh"
              onClick={resend}
              disabled={secondsLeft > 0 || otpVerifying}
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8" horizontal="center">
          <OTPInput
            key={otpKey}
            length={OTP_LENGTH}
            autoFocus
            error={otpError}
            errorMessage={otpError ? "That code isn't right. Check your email and try again." : undefined}
            disabled={otpVerifying}
            onComplete={handleOtpComplete}
          />
          <Text variant="body-default-s" onBackground="neutral-weak" align="center" aria-live="polite">
            {otpVerifying ? "Verifying code…" : `Demo code: ${DEMO_OTP}`}
          </Text>
        </Column>
      </Dialog>
    </Column>
  );
}
```
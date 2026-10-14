The `Input` component docs don't show `value`/`onChange`, so I'll use them as standard HTML input props, which the `Input` extends. Writing the page now.

```tsx
"use client";

import {
  Background,
  Button,
  Column,
  DialogProvider,
  Dialog,
  Feedback,
  Heading,
  Icon,
  Input,
  Line,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

const DEMO_EMAIL = "maya.lindqvist@northwind.io";
const DEMO_PASSWORD = "northwind-2025";
const DEMO_OTP = "482916";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const HIGHLIGHTS = [
  { icon: "security", title: "Two-step verification", text: "A one-time code protects every sign-in from a new device." },
  { icon: "time", title: "Session history", text: "Review and revoke active sessions from account settings." },
  { icon: "lock", title: "Encrypted at rest", text: "Credentials are salted and hashed, never stored in plain text." },
] as const;

type Step = "closed" | "password" | "otp" | "done";

export default function Page() {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const timers = useRef<number[]>([]);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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

  const resetAll = useCallback(() => {
    setStep("closed");
    setPassword("");
    setPasswordError(null);
    setEmailError(null);
    setOtpError(null);
    setSubmitting(false);
    setVerifying(false);
    setResendIn(0);
  }, []);

  const openLogin = () => {
    setStep("password");
    setAnnouncement("Sign in dialog opened.");
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid work email, like name@company.com.");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (password.length === 0) {
      setPasswordError("Enter your password.");
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) {
      setAnnouncement("Sign in failed. Check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    setAnnouncement("Checking your credentials.");
    schedule(() => {
      setSubmitting(false);
      if (trimmed.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setOtpError(null);
        setOtpKey((k) => k + 1);
        setResendIn(RESEND_SECONDS);
        setStep("otp");
        setAnnouncement(`Password accepted. Enter the ${OTP_LENGTH}-digit code sent to your authenticator.`);
      } else {
        setPasswordError("That email and password combination doesn't match our records.");
        setAnnouncement("Sign in failed. Email or password is incorrect.");
      }
    }, 900);
  };

  const handleOtpComplete = (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    setAnnouncement("Verifying code.");
    schedule(() => {
      setVerifying(false);
      if (code === DEMO_OTP) {
        setStep("done");
        setAnnouncement("Verified. You are signed in.");
      } else {
        setOtpError("That code is incorrect or has expired. Try again.");
        setOtpKey((k) => k + 1);
        setAnnouncement("Verification failed. The code is incorrect.");
      }
    }, 800);
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setOtpError(null);
    setOtpKey((k) => k + 1);
    setResendIn(RESEND_SECONDS);
    setAnnouncement("A new code has been sent.");
  };

  const backToPassword = () => {
    setOtpError(null);
    setStep("password");
    setAnnouncement("Back to password step.");
  };

  const signedIn = step === "done";
  const baseOpen = step === "password" || step === "otp";

  return (
    <Column as="main" fillWidth horizontal="center" minHeight="100vh">
      <VisuallyHidden>
        <div role="status" aria-live="polite">
          {announcement}
        </div>
      </VisuallyHidden>

      <Column fillWidth horizontal="center" paddingX="24" paddingY="80" s={{ paddingY: "48" }}>
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
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />

        <Column zIndex={1} maxWidth="m" gap="40">
          <Row vertical="center" gap="12">
            <Row
              center
              width={2.5}
              height={2.5}
              radius="m"
              solid="brand-strong"
              onSolid="brand-strong"
              aria-hidden="true"
            >
              <Icon name="bolt" size="s" onSolid="brand-strong" />
            </Row>
            <Text variant="heading-strong-m">Northwind</Text>
            <Tag size="s" scheme="brand">
              Console
            </Tag>
          </Row>

          <Column gap="16">
            <Text variant="label-default-s" onBackground="brand-medium">
              Account access
            </Text>
            <Heading as="h1" variant="display-strong-l">
              {signedIn ? "You're signed in, Maya." : "Welcome back to Northwind."}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak">
              {signedIn
                ? "Your session is verified and your workspace is ready. Pick up where you left off."
                : "Sign in with your password, then confirm with a one-time code. It takes about fifteen seconds."}
            </Text>
          </Column>

          {signedIn ? (
            <Column background="surface" border radius="l" padding="24" gap="16">
              <Row vertical="center" gap="12">
                <Icon name="check" onBackground="success-medium" />
                <Heading as="h2" variant="heading-strong-m">
                  Verified sign-in
                </Heading>
              </Row>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Signed in as {DEMO_EMAIL} from Stockholm, Sweden on a trusted browser. Last sign-in was yesterday at
                17:42.
              </Text>
              <Row gap="12" wrap>
                <Button
                  variant="secondary"
                  prefixIcon="logout"
                  onClick={() => {
                    resetAll();
                    setAnnouncement("Signed out.");
                  }}
                >
                  Sign out
                </Button>
              </Row>
            </Column>
          ) : (
            <Column background="surface" border radius="l" padding="24" gap="24">
              <Column gap="8">
                <Heading as="h2" variant="heading-strong-m">
                  Sign in to your workspace
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Use your work email. New to Northwind? <SmartLink href="/signup">Create an account</SmartLink>
                </Text>
              </Column>
              <Row gap="12" wrap vertical="center">
                <Button
                  ref={triggerRef}
                  size="l"
                  arrowIcon
                  onClick={openLogin}
                  aria-haspopup="dialog"
                >
                  Sign in
                </Button>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  Demo: {DEMO_EMAIL} · {DEMO_PASSWORD} · code {DEMO_OTP}
                </Text>
              </Row>
            </Column>
          )}

          <Line />

          <Column gap="16" as="section" aria-labelledby="security-heading">
            <Heading as="h2" variant="display-strong-xs" id="security-heading">
              Built to keep your account safe
            </Heading>
            <Column as="ul" gap="16" margin="0" padding="0">
              {HIGHLIGHTS.map((item) => (
                <Row as="li" key={item.title} gap="16" vertical="start">
                  <Row
                    center
                    width={2.5}
                    height={2.5}
                    radius="m"
                    background="neutral-alpha-weak"
                    border
                    aria-hidden="true"
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="4" flex={1}>
                    <Text variant="label-strong-m">{item.title}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.text}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Column>
          </Column>

          <Row gap="16" wrap horizontal="center">
            <SmartLink href="/privacy">Privacy policy</SmartLink>
            <SmartLink href="/terms">Terms of use</SmartLink>
            <SmartLink href="/help">Help center</SmartLink>
          </Row>
        </Column>
      </Column>

      <DialogProvider>
        <Dialog
          base
          open={baseOpen}
          onClose={resetAll}
          title="Sign in"
          description="Enter your work email and password to continue."
          closeOnClickaway={false}
        >
          <form onSubmit={handlePasswordSubmit} noValidate aria-label="Sign in with password">
            <Column gap="16" fillWidth>
              <Input
                id="login-email"
                label="Work email"
                type="email"
                name="email"
                autoComplete="username"
                inputMode="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                error={emailError !== null}
                errorMessage={emailError}
                disabled={submitting}
              />
              <PasswordInput
                id="login-password"
                label="Password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError !== null}
                errorMessage={passwordError}
                disabled={submitting}
              />
              <Row fillWidth horizontal="end">
                <SmartLink href="/forgot">Forgot password?</SmartLink>
              </Row>
              <Button type="submit" fillWidth size="l" loading={submitting} disabled={submitting} arrowIcon>
                Continue
              </Button>
            </Column>
          </form>
        </Dialog>

        <Dialog
          stack
          open={step === "otp"}
          onClose={backToPassword}
          title="Verify it's you"
          description={`Enter the ${OTP_LENGTH}-digit code from your authenticator app for ${email.trim() || DEMO_EMAIL}.`}
          closeOnClickaway={false}
          footer={
            <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
              <Button variant="tertiary" prefixIcon="arrowLeft" onClick={backToPassword} disabled={verifying}>
                Back
              </Button>
              <Button variant="secondary" prefixIcon="refresh" onClick={handleResend} disabled={resendIn > 0 || verifying}>
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </Button>
            </Row>
          }
        >
          <Column gap="16" fillWidth horizontal="center">
            <OTPInput
              key={otpKey}
              length={OTP_LENGTH}
              autoFocus
              disabled={verifying}
              error={otpError !== null}
              errorMessage={otpError}
              onComplete={handleOtpComplete}
            />
            {verifying ? (
              <Text variant="label-default-s" onBackground="neutral-weak">
                Verifying…
              </Text>
            ) : (
              <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                Lost access to your device? <SmartLink href="/recovery">Use a recovery code</SmartLink>
              </Text>
            )}
            {otpError ? <Feedback variant="danger" description={otpError} /> : null}
          </Column>
        </Dialog>
      </DialogProvider>
    </Column>
  );
}
```
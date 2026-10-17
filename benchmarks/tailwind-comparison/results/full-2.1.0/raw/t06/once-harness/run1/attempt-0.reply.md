I have enough context. Writing the page now.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Background,
  Button,
  Column,
  Dialog,
  Heading,
  Input,
  Line,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Text,
} from "@once-ui-system/core";

const ACCOUNT = {
  email: "maya.okafor@northwind.studio",
  password: "northwind-2025",
  otp: "482916",
  maskedPhone: "•••• ••• 4821",
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Step = "idle" | "otp" | "success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<Step>("idle");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [resendIn, setResendIn] = useState(0);

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

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    let valid = true;
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Enter a valid email address.");
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
      setFormError(null);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    schedule(() => {
      setSubmitting(false);
      if (
        email.trim().toLowerCase() === ACCOUNT.email &&
        password === ACCOUNT.password
      ) {
        setOtpError(null);
        setOtpKey((k) => k + 1);
        setResendIn(RESEND_SECONDS);
        setStep("otp");
      } else {
        setFormError(
          "That email and password don't match. Check them and try again.",
        );
      }
    }, 700);
  };

  const handleOtpComplete = (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    schedule(() => {
      setVerifying(false);
      if (code === ACCOUNT.otp) {
        setStep("success");
      } else {
        setOtpError("That code is incorrect or has expired. Try again.");
        setOtpKey((k) => k + 1);
      }
    }, 600);
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setOtpError(null);
    setOtpKey((k) => k + 1);
    setResendIn(RESEND_SECONDS);
  };

  const closeOtp = () => {
    setStep("idle");
    setOtpError(null);
    setVerifying(false);
  };

  const resetAll = () => {
    setStep("idle");
    setPassword("");
    setOtpError(null);
    setFormError(null);
  };

  const otpOpen = step === "otp";
  const successOpen = step === "success";

  return (
    <Column as="main" fillWidth center padding="24" minHeight="100vh">
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

      <Column zIndex={1} maxWidth={28} gap="24">
        <Column
          background="surface"
          border
          radius="xl"
          padding="32"
          gap="24"
          s={{ padding: "24" }}
        >
          <Column gap="8">
            <Text variant="label-default-s" onBackground="brand-medium">
              Northwind Studio
            </Text>
            <Heading as="h1" variant="display-strong-xs">
              Sign in to your workspace
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Use your work email. We&apos;ll text a 6-digit code to the phone
              on file to confirm it&apos;s you.
            </Text>
          </Column>

          <form onSubmit={handleLogin} noValidate aria-label="Sign in">
            <Column gap="16">
              {formError && (
                <Column
                  role="alert"
                  padding="12"
                  radius="m"
                  background="danger-alpha-weak"
                  border="danger-alpha-medium"
                  onBackground="danger-strong"
                  textVariant="body-default-s"
                >
                  {formError}
                </Column>
              )}

              <Input
                id="login-email"
                name="email"
                type="email"
                label="Work email"
                placeholder="you@company.com"
                autoComplete="username"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                error={emailError !== null}
                errorMessage={emailError}
              />

              <PasswordInput
                id="login-password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                error={passwordError !== null}
                errorMessage={passwordError}
              />

              <Row fillWidth horizontal="end">
                <SmartLink href="/forgot-password">Forgot password?</SmartLink>
              </Row>

              <Button
                type="submit"
                fillWidth
                loading={submitting}
                arrowIcon
                disabled={submitting}
              >
                Continue
              </Button>
            </Column>
          </form>

          <Row fillWidth vertical="center" gap="16">
            <Line fill />
            <Text variant="label-default-s" onBackground="neutral-weak">
              demo account
            </Text>
            <Line fill />
          </Row>

          <Column
            gap="8"
            padding="16"
            radius="m"
            background="page"
            border
            textVariant="body-default-s"
            onBackground="neutral-weak"
          >
            <Text variant="label-default-s" onBackground="neutral-strong">
              Try the flow
            </Text>
            <Text as="p" variant="body-default-s">
              Email <Text variant="code-default-s">{ACCOUNT.email}</Text>
            </Text>
            <Text as="p" variant="body-default-s">
              Password <Text variant="code-default-s">{ACCOUNT.password}</Text>
            </Text>
            <Text as="p" variant="body-default-s">
              Code <Text variant="code-default-s">{ACCOUNT.otp}</Text>
            </Text>
            <Button
              type="button"
              variant="secondary"
              size="s"
              prefixIcon="sparkle"
              onClick={() => {
                setEmail(ACCOUNT.email);
                setPassword(ACCOUNT.password);
                setEmailError(null);
                setPasswordError(null);
                setFormError(null);
              }}
            >
              Fill demo credentials
            </Button>
          </Column>
        </Column>

        <Row gap="16" wrap horizontal="center">
          <SmartLink href="/privacy">Privacy policy</SmartLink>
          <SmartLink href="/terms">Terms of use</SmartLink>
          <SmartLink href="/help">Help</SmartLink>
        </Row>
      </Column>

      {/* Step 2: OTP, stacked over the page */}
      <Dialog
        open={otpOpen}
        onClose={closeOtp}
        title="Check your phone"
        description={`Enter the ${OTP_LENGTH}-digit code we sent to ${ACCOUNT.maskedPhone}.`}
        stack
        closeOnClickaway={false}
        footer={
          <Row fillWidth gap="8" horizontal="between" vertical="center" wrap>
            <Button
              type="button"
              variant="tertiary"
              prefixIcon="arrowLeft"
              onClick={closeOtp}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="secondary"
              prefixIcon="refresh"
              onClick={handleResend}
              disabled={resendIn > 0 || verifying}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </Row>
        }
      >
        <Column gap="16" paddingY="8">
          <OTPInput
            key={otpKey}
            length={OTP_LENGTH}
            autoFocus
            disabled={verifying}
            error={otpError !== null}
            errorMessage={otpError}
            onComplete={handleOtpComplete}
          />
          <Row
            gap="8"
            vertical="center"
            textVariant="body-default-s"
            onBackground="neutral-weak"
            aria-live="polite"
          >
            {verifying ? "Verifying code…" : `Signing in as ${ACCOUNT.email}`}
          </Row>
        </Column>
      </Dialog>

      {/* Step 3: success, stacked on top once the code is verified */}
      <Dialog
        open={successOpen}
        onClose={resetAll}
        title="You're signed in"
        description="Welcome back, Maya. Your session is secured with two-step verification."
        stack
      >
        <Column gap="16" paddingY="8">
          <Column
            gap="8"
            padding="16"
            radius="m"
            background="success-alpha-weak"
            border="success-alpha-medium"
          >
            <Text variant="label-default-s" onBackground="success-strong">
              Verified
            </Text>
            <Text variant="body-default-s" onBackground="neutral-strong">
              Northwind Studio · Design Systems team
            </Text>
          </Column>
          <Button fillWidth arrowIcon onClick={resetAll}>
            Go to dashboard
          </Button>
        </Column>
      </Dialog>
    </Column>
  );
}
```
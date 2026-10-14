The Input API doesn't list `value`/`onChange`, though `Input` extends native input props. I'll keep the fields controlled with standard `value`/`onChange`, which `Input` forwards to the underlying element.

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Background,
  Button,
  Checkbox,
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

/* ------------------------------------------------------------------ */
/* Placeholder data (demo only — a real app would call its auth API)   */
/* ------------------------------------------------------------------ */

const DEMO_ACCOUNT = {
  email: "maya.laurent@northwind.studio",
  password: "Harbor-Lamp-42!",
  otp: "481926",
  maskedPhone: "+1 (415) •••-0187",
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 3;

type Step = "idle" | "credentials" | "otp" | "success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <DialogProvider>
      <LoginPage />
    </DialogProvider>
  );
}

function LoginPage() {
  const [step, setStep] = useState<Step>("idle");

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [otpKey, setOtpKey] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resentNotice, setResentNotice] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  // Resend countdown while the OTP dialog is open
  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, secondsLeft]);

  const resetOtp = useCallback(() => {
    setOtpError(null);
    setAttempts(0);
    setVerifying(false);
    setResentNotice(false);
    setSecondsLeft(RESEND_SECONDS);
    setOtpKey((k) => k + 1);
  }, []);

  /* ----------------------------- Step 1 ---------------------------- */

  const openLogin = () => {
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setStep("credentials");
  };

  const closeAll = () => {
    setStep("idle");
    setSubmitting(false);
    setPassword("");
    resetOtp();
  };

  const handleCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    const nextEmailError = !trimmedEmail
      ? "Enter your work email."
      : !EMAIL_PATTERN.test(trimmedEmail)
        ? "That doesn't look like a valid email address."
        : null;
    const nextPasswordError = !password
      ? "Enter your password."
      : password.length < 8
        ? "Passwords are at least 8 characters."
        : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    later(() => {
      setSubmitting(false);
      if (
        trimmedEmail.toLowerCase() !== DEMO_ACCOUNT.email ||
        password !== DEMO_ACCOUNT.password
      ) {
        setFormError("Email or password is incorrect. Check them and try again.");
        return;
      }
      resetOtp();
      setStep("otp");
    }, 700);
  };

  /* ----------------------------- Step 2 ---------------------------- */

  const handleOtpComplete = (code: string) => {
    if (verifying || attempts >= MAX_OTP_ATTEMPTS) return;
    setVerifying(true);
    setOtpError(null);
    later(() => {
      setVerifying(false);
      if (code === DEMO_ACCOUNT.otp) {
        setStep("success");
        return;
      }
      const used = attempts + 1;
      setAttempts(used);
      setOtpKey((k) => k + 1);
      setOtpError(
        used >= MAX_OTP_ATTEMPTS
          ? "Too many incorrect codes. Request a new code to continue."
          : `That code isn't right. ${MAX_OTP_ATTEMPTS - used} ${
              MAX_OTP_ATTEMPTS - used === 1 ? "attempt" : "attempts"
            } left.`,
      );
    }, 600);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setOtpError(null);
    setAttempts(0);
    setOtpKey((k) => k + 1);
    setSecondsLeft(RESEND_SECONDS);
    setResentNotice(true);
  };

  const backToCredentials = () => {
    resetOtp();
    setStep("credentials");
  };

  const signOut = () => {
    setPassword("");
    resetOtp();
    setStep("idle");
  };

  const otpLocked = attempts >= MAX_OTP_ATTEMPTS;
  const credentialsOpen = step === "credentials" || step === "otp";

  /* ------------------------------ UI ------------------------------- */

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <VisuallyHidden focusable>
        <a href="#main">Skip to content</a>
      </VisuallyHidden>

      <Column fillWidth horizontal="center" paddingY="64" gap="40">
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

        <Column zIndex={1} fillWidth maxWidth="xs" gap="32">
          <Column fillWidth gap="12" horizontal="center">
            <Row
              center
              radius="l"
              background="brand-alpha-weak"
              border="brand-alpha-medium"
              width="48"
              height="48"
              onBackground="brand-strong"
            >
              <Icon name="lock" size="l" />
            </Row>
            <Text variant="label-default-s" onBackground="brand-medium">
              Northwind Studio
            </Text>
            <Heading as="h1" variant="display-strong-xs" align="center">
              {step === "success" ? "You're signed in" : "Sign in to your workspace"}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" align="center">
              {step === "success"
                ? `Welcome back, Maya. You're signed in as ${DEMO_ACCOUNT.email}.`
                : "Projects, invoices and client feedback in one place. Sign in with your password, then confirm with a one-time code."}
            </Text>
          </Column>

          {step === "success" ? (
            <Column background="surface" border radius="l" padding="24" gap="16">
              <Row gap="12" vertical="center">
                <Row
                  center
                  radius="full"
                  background="success-alpha-weak"
                  width="40"
                  height="40"
                  onBackground="success-strong"
                >
                  <Icon name="check" />
                </Row>
                <Column gap="2">
                  <Text variant="heading-strong-s">Two-step verification complete</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    This device {remember ? "will be remembered for 30 days" : "won't be remembered"}.
                  </Text>
                </Column>
              </Row>
              <Line />
              <Row gap="12" wrap>
                <Button href="#main" arrowIcon>
                  Open dashboard
                </Button>
                <Button variant="secondary" onClick={signOut} prefixIcon="logout">
                  Sign out
                </Button>
              </Row>
            </Column>
          ) : (
            <Column background="surface" border radius="l" padding="24" gap="20">
              <Column gap="4">
                <Text variant="heading-strong-s">Welcome back</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Two-step verification is required for all accounts in this workspace.
                </Text>
              </Column>
              <Button fillWidth arrowIcon onClick={openLogin} aria-haspopup="dialog">
                Sign in with email
              </Button>
              <Row fillWidth vertical="center" gap="16">
                <Line fill />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  or
                </Text>
                <Line fill />
              </Row>
              <Row fillWidth gap="8" horizontal="center" wrap>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  New to Northwind?
                </Text>
                <SmartLink href="/signup">Request an invite</SmartLink>
              </Row>
            </Column>
          )}

          <Row gap="16" wrap horizontal="center">
            <SmartLink href="/privacy">Privacy policy</SmartLink>
            <SmartLink href="/terms">Terms of use</SmartLink>
            <SmartLink href="/status">System status</SmartLink>
          </Row>
        </Column>
      </Column>

      {/* Base dialog: email + password */}
      <Dialog
        base
        open={credentialsOpen}
        onClose={closeAll}
        title="Sign in"
        description="Use the email and password for your Northwind account."
        footer={
          <Row fillWidth gap="8" horizontal="end" wrap>
            <Button variant="tertiary" onClick={closeAll}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="login-form"
              loading={submitting}
              disabled={submitting}
              arrowIcon
            >
              Continue
            </Button>
          </Row>
        }
      >
        <Column
          as="form"
          id="login-form"
          fillWidth
          gap="16"
          onSubmit={handleCredentials}
          noValidate
        >
          <Column aria-live="polite" fillWidth>
            {formError && (
              <Feedback variant="danger" title="Couldn't sign you in" description={formError} />
            )}
          </Column>

          <Input
            id="login-email"
            name="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            error={Boolean(emailError)}
            errorMessage={emailError}
            required
          />
          <PasswordInput
            id="login-password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            error={Boolean(passwordError)}
            errorMessage={passwordError}
            required
          />
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Checkbox
              label="Remember this device"
              checked={remember}
              onToggle={setRemember}
            />
            <SmartLink href="/forgot-password">Forgot password?</SmartLink>
          </Row>

          <Row
            fillWidth
            gap="8"
            padding="12"
            radius="m"
            background="neutral-alpha-weak"
            vertical="start"
          >
            <Icon name="info" size="s" onBackground="neutral-weak" />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo account — email <strong>{DEMO_ACCOUNT.email}</strong>, password{" "}
              <strong>{DEMO_ACCOUNT.password}</strong>.
            </Text>
          </Row>
        </Column>
      </Dialog>

      {/* Stacked dialog: one-time code */}
      <Dialog
        stack
        open={step === "otp"}
        onClose={backToCredentials}
        title="Enter your verification code"
        description={`We sent a ${OTP_LENGTH}-digit code to ${DEMO_ACCOUNT.maskedPhone}. It expires in 10 minutes.`}
        footer={
          <Row fillWidth gap="8" horizontal="between" vertical="center" wrap>
            <Button variant="tertiary" prefixIcon="arrowLeft" onClick={backToCredentials}>
              Back
            </Button>
            <Button
              variant="secondary"
              prefixIcon="refresh"
              onClick={handleResend}
              disabled={secondsLeft > 0}
            >
              {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
            </Button>
          </Row>
        }
      >
        <Column fillWidth gap="20" horizontal="center">
          <Tag scheme="brand" size="m" prefixIcon="security">
            Step 2 of 2 · Verify it&apos;s you
          </Tag>

          <Column fillWidth horizontal="center" gap="8">
            <OTPInput
              key={otpKey}
              length={OTP_LENGTH}
              autoFocus
              onComplete={handleOtpComplete}
              error={Boolean(otpError)}
              disabled={verifying || otpLocked}
            />
            <VisuallyHidden>Enter the {OTP_LENGTH}-digit code</VisuallyHidden>
          </Column>

          <Column fillWidth aria-live="polite" horizontal="center" gap="8">
            {verifying && (
              <Text variant="body-default-s" onBackground="neutral-weak">
                Verifying code…
              </Text>
            )}
            {otpError && (
              <Row gap="8" vertical="center" onBackground="danger-medium" role="alert">
                <Icon name="danger" size="s" />
                <Text variant="body-default-s" onBackground="danger-medium">
                  {otpError}
                </Text>
              </Row>
            )}
            {resentNotice && !otpError && !verifying && (
              <Text variant="body-default-s" onBackground="success-medium">
                A new code is on its way.
              </Text>
            )}
          </Column>

          <Row
            fillWidth
            gap="8"
            padding="12"
            radius="m"
            background="neutral-alpha-weak"
            vertical="start"
          >
            <Icon name="info" size="s" onBackground="neutral-weak" />
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo code: <strong>{DEMO_ACCOUNT.otp}</strong>
            </Text>
          </Row>
        </Column>
      </Dialog>
    </Column>
  );
}
```
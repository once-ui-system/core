"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Background,
  Button,
  Checkbox,
  Column,
  Dialog,
  DialogProvider,
  Feedback,
  Heading,
  Icon,
  Input,
  OTPInput,
  PasswordInput,
  Row,
  SmartLink,
  Tag,
  Text,
  useToast,
} from "@once-ui-system/core";

/* ---------------------------------------------------------------------------
 * Placeholder data (mock backend, no network)
 * ------------------------------------------------------------------------- */

const DEMO_ACCOUNT = {
  email: "maya.lindqvist@northwind.dev",
  password: "Harbor-Lantern-42",
  otp: "482916",
  workspace: "Northwind Studio",
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const HIGHLIGHTS = [
  { icon: "security", title: "Two-step sign-in", text: "A password plus a six-digit code from your authenticator app." },
  { icon: "lock", title: "Encrypted sessions", text: "Sessions expire after 12 hours of inactivity on shared devices." },
  { icon: "bell", title: "Sign-in alerts", text: "We email you whenever a new device signs in to your workspace." },
] as const;

/** Simulated latency so loading states are visible. */
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "closed" | "password" | "otp" | "done";

export default function Page() {
  return (
    <DialogProvider>
      <AuthPage />
    </DialogProvider>
  );
}

function AuthPage() {
  const { addToast } = useToast();

  const [step, setStep] = useState<Step>("closed");

  // Password step
  const [email, setEmail] = useState(DEMO_ACCOUNT.email);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP step
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpAttempt, setOtpAttempt] = useState(0); // remounts OTPInput to clear boxes
  const [pendingCode, setPendingCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const returnFocusRef = useRef<HTMLButtonElement | null>(null);

  /* Resend countdown */
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const resetAll = useCallback(() => {
    setPassword("");
    setEmailError(null);
    setPasswordError(null);
    setOtpError(null);
    setPendingCode("");
    setSubmitting(false);
    setVerifying(false);
    setOtpAttempt((value) => value + 1);
  }, []);

  const openSignIn = () => {
    resetAll();
    setStep("password");
  };

  const closeAll = () => {
    setStep("closed");
    resetAll();
    returnFocusRef.current?.focus();
  };

  /* Step 1: email + password */
  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const nextEmailError = !email.trim()
      ? "Enter your email address."
      : !EMAIL_PATTERN.test(email.trim())
        ? "That doesn't look like a valid email address."
        : null;
    const nextPasswordError = !password ? "Enter your password." : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    setSubmitting(true);
    await wait(900);

    if (
      email.trim().toLowerCase() !== DEMO_ACCOUNT.email ||
      password !== DEMO_ACCOUNT.password
    ) {
      setSubmitting(false);
      setPasswordError("Email or password is incorrect. Check them and try again.");
      return;
    }

    setSubmitting(false);
    setOtpError(null);
    setPendingCode("");
    setOtpAttempt((value) => value + 1);
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  /* Step 2: one-time code */
  const verifyCode = useCallback(
    async (code: string) => {
      if (verifying) return;
      if (code.length < OTP_LENGTH) {
        setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
        return;
      }
      setOtpError(null);
      setVerifying(true);
      await wait(800);

      if (code !== DEMO_ACCOUNT.otp) {
        setVerifying(false);
        setOtpError("That code is incorrect or has expired. Try again.");
        setPendingCode("");
        setOtpAttempt((value) => value + 1);
        return;
      }

      setVerifying(false);
      setStep("done");
      addToast({
        variant: "success",
        message: `Signed in to ${DEMO_ACCOUNT.workspace}.`,
      });
    },
    [verifying, addToast],
  );

  const handleResend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setOtpError(null);
    setPendingCode("");
    setOtpAttempt((value) => value + 1);
    addToast({
      variant: "info",
      message: `A new code was sent to ${maskEmail(email)}.`,
    });
  };

  const signedIn = step === "done";

  return (
    <Column as="main" fillWidth horizontal="center">
      {/* Ambient layer on a full-bleed wrapper */}
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

        <Column zIndex={1} maxWidth="m" gap="40" minHeight={32} vertical="center">
          <Column gap="16" horizontal="center" align="center">
            <Text variant="label-default-s" onBackground="brand-medium">
              {DEMO_ACCOUNT.workspace}
            </Text>
            <Heading as="h1" variant="display-strong-l">
              {signedIn ? "You're in." : "Sign in to your workspace"}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              {signedIn
                ? `Welcome back, Maya. Your session on this device is active${remember ? " and will be remembered for 30 days" : ""}.`
                : "Use your password, then confirm with a six-digit code. Protecting design files and billing starts with a verified sign-in."}
            </Text>
            <Row gap="12" wrap horizontal="center" paddingTop="8">
              {signedIn ? (
                <Button
                  ref={returnFocusRef}
                  variant="secondary"
                  prefixIcon="logout"
                  onClick={() => {
                    setStep("closed");
                    resetAll();
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button
                  ref={returnFocusRef}
                  suffixIcon="arrowRight"
                  onClick={openSignIn}
                  aria-haspopup="dialog"
                >
                  Sign in
                </Button>
              )}
              <Button variant="tertiary" href="#help">
                Need help?
              </Button>
            </Row>
          </Column>

          <Column
            as="ul"
            padding="0"
            margin="0"
            gap="12"
            fillWidth
            id="help"
            aria-label="Account security features"
          >
            {HIGHLIGHTS.map((item) => (
              <Row
                as="li"
                key={item.title}
                fillWidth
                gap="16"
                padding="20"
                radius="l"
                background="surface"
                border
                vertical="center"
              >
                <Row
                  center
                  minWidth={2.5}
                  height={2.5}
                  radius="m"
                  background="brand-alpha-weak"
                  onBackground="brand-strong"
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
      </Column>

      {/* Base dialog: email + password */}
      <Dialog
        base
        open={step === "password" || step === "otp"}
        onClose={closeAll}
        title="Welcome back"
        description="Sign in to continue to your workspace."
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              New here? <SmartLink href="#create">Create an account</SmartLink>
            </Text>
          </Row>
        }
      >
        <form onSubmit={handlePasswordSubmit} noValidate aria-label="Sign in with password">
          <Column fillWidth gap="16" paddingTop="8">
            <Feedback
              variant="info"
              title="Demo account"
              description={`Password: ${DEMO_ACCOUNT.password} · one-time code: ${DEMO_ACCOUNT.otp}`}
            />

            <Input
              id="login-email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (emailError) setEmailError(null);
              }}
              error={Boolean(emailError)}
              errorMessage={emailError}
              disabled={submitting}
            />

            <PasswordInput
              id="login-password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (passwordError) setPasswordError(null);
              }}
              error={Boolean(passwordError)}
              errorMessage={passwordError}
              disabled={submitting}
            />

            <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
              <Checkbox
                label="Keep me signed in"
                checked={remember}
                onToggle={setRemember}
              />
              <SmartLink href="#forgot">Forgot password?</SmartLink>
            </Row>

            <Button
              type="submit"
              fillWidth
              size="l"
              loading={submitting}
              disabled={submitting}
              suffixIcon="arrowRight"
            >
              Continue
            </Button>
          </Column>
        </form>
      </Dialog>

      {/* Stacked dialog: one-time code */}
      <Dialog
        stack
        open={step === "otp"}
        onClose={() => {
          if (verifying) return;
          setStep("password");
          setOtpError(null);
        }}
        title="Check your authenticator"
        description={`Enter the ${OTP_LENGTH}-digit code for ${maskEmail(email)}.`}
        closeOnClickaway={false}
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
            <Button
              variant="tertiary"
              prefixIcon="arrowLeft"
              disabled={verifying}
              onClick={() => {
                setStep("password");
                setOtpError(null);
              }}
            >
              Back
            </Button>
            <Button
              variant="secondary"
              disabled={resendIn > 0 || verifying}
              onClick={handleResend}
              prefixIcon="refresh"
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </Button>
          </Row>
        }
      >
        <Column fillWidth gap="24" paddingTop="8" horizontal="center">
          <Tag scheme="brand" prefixIcon="security" size="m">
            Step 2 of 2 · Verification
          </Tag>

          <Column fillWidth horizontal="center" gap="12" aria-busy={verifying}>
            <OTPInput
              key={otpAttempt}
              length={OTP_LENGTH}
              autoFocus
              error={Boolean(otpError)}
              disabled={verifying}
              onComplete={(code) => {
                setPendingCode(code);
                void verifyCode(code);
              }}
            />
            <div aria-live="polite" role="status" style={{ minHeight: "1.25rem" }}>
              {verifying ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Verifying your code…
                </Text>
              ) : null}
            </div>
            {otpError ? (
              <Text
                role="alert"
                variant="body-default-s"
                onBackground="danger-medium"
                align="center"
              >
                {otpError}
              </Text>
            ) : null}
          </Column>

          <Button
            fillWidth
            size="l"
            loading={verifying}
            disabled={verifying || pendingCode.length < OTP_LENGTH}
            onClick={() => void verifyCode(pendingCode)}
          >
            Verify and sign in
          </Button>

          <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
            Lost access to your authenticator? <SmartLink href="#recovery">Use a recovery code</SmartLink>
          </Text>
        </Column>
      </Dialog>
    </Column>
  );
}

function maskEmail(value: string): string {
  const [user, domain] = value.trim().split("@");
  if (!user || !domain) return "your email";
  const visible = user.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

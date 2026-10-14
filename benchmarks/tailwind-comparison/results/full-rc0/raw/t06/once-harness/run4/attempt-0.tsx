"use client";

import {
  Background,
  Button,
  Column,
  Dialog,
  DialogProvider,
  Feedback,
  Form,
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
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";

const DEMO_EMAIL = "maya.lindqvist@northwind.app";
const DEMO_PASSWORD = "northwind-2025";
const DEMO_CODE = "424242";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Step = "credentials" | "otp" | "signedIn";

interface FieldErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) {
    errors.email = "Enter your work email.";
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = "That doesn't look like a valid email address.";
  }
  if (!password) {
    errors.password = "Enter your password.";
  } else if (password.length < 8) {
    errors.password = "Passwords are at least 8 characters.";
  }
  return errors;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export default function Page() {
  const { addToast } = useToast();

  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [otpError, setOtpError] = useState(false);
  const [otpAttempt, setOtpAttempt] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

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

  // Resend countdown while the OTP dialog is open.
  useEffect(() => {
    if (step !== "otp" || secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [step, secondsLeft]);

  const handleCredentials = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const errors = validate(email, password);
    setFieldErrors(errors);
    setFormError(null);
    if (errors.email || errors.password) return;

    setSubmitting(true);
    schedule(() => {
      setSubmitting(false);
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        setFormError("The email or password is incorrect. Check them and try again.");
        return;
      }
      setOtpError(false);
      setOtpAttempt((n) => n + 1);
      setSecondsLeft(RESEND_SECONDS);
      setStep("otp");
    }, 700);
  };

  const handleOtpComplete = (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(false);
    schedule(() => {
      setVerifying(false);
      if (code === DEMO_CODE) {
        setStep("signedIn");
        setPassword("");
        addToast({ variant: "success", message: "Signed in. Welcome back, Maya." });
      } else {
        setOtpError(true);
        // Remount the input so the boxes clear for the next attempt.
        setOtpAttempt((n) => n + 1);
      }
    }, 600);
  };

  const closeOtp = () => {
    if (verifying) return;
    setStep("credentials");
    setOtpError(false);
  };

  const resendCode = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setOtpError(false);
    setOtpAttempt((n) => n + 1);
    addToast({ variant: "info", message: `A new code was sent to ${maskEmail(email)}.` });
  };

  const signOut = () => {
    setStep("credentials");
    setFieldErrors({});
    setFormError(null);
    addToast({ variant: "info", message: "You've been signed out." });
  };

  const signedIn = step === "signedIn";
  const credentialsOpen = !signedIn;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="48" minHeight="100vh">
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

      <Column zIndex={1} maxWidth="xs" gap="32" center flex={1}>
        <Row gap="12" vertical="center">
          <Row
            width="40"
            height="40"
            center
            radius="m"
            solid="brand-strong"
            onSolid="brand-strong"
            aria-hidden="true"
          >
            <Icon name="security" size="m" onSolid="brand-strong" />
          </Row>
          <Text variant="heading-strong-l">Northwind</Text>
        </Row>

        {signedIn ? (
          <Column
            fillWidth
            background="surface"
            border
            radius="l"
            padding="32"
            gap="24"
            horizontal="center"
            s={{ padding: "24" }}
          >
            <Row
              width="56"
              height="56"
              center
              radius="full"
              background="success-alpha-weak"
              aria-hidden="true"
            >
              <Icon name="check" size="l" onBackground="success-strong" />
            </Row>
            <Column gap="8" horizontal="center">
              <Heading as="h1" variant="display-strong-xs" align="center">
                You&apos;re signed in
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" align="center">
                Verified as {maskEmail(email)}. This session stays active on this device for 30
                days.
              </Text>
            </Column>
            <Row gap="8" wrap horizontal="center">
              <Tag scheme="success" size="m" prefixIcon="check">
                Two-step verified
              </Tag>
              <Tag scheme="neutral" size="m" prefixIcon="computer">
                Chrome on macOS
              </Tag>
            </Row>
            <Button fillWidth variant="secondary" prefixIcon="logout" onClick={signOut}>
              Sign out
            </Button>
          </Column>
        ) : (
          <Column
            fillWidth
            background="surface"
            border
            radius="l"
            padding="32"
            gap="24"
            s={{ padding: "24" }}
          >
            <Column gap="8">
              <Heading as="h1" variant="display-strong-xs">
                Sign in to your workspace
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                New to Northwind? <SmartLink href="/signup">Create an account</SmartLink>
              </Text>
            </Column>

            <Form as="form" onSubmit={handleCredentials} density="stacked">
              <Column fillWidth gap="16">
                {formError && (
                  <Feedback variant="danger" icon="warning" title="Couldn't sign you in">
                    {formError}
                  </Feedback>
                )}

                <Input
                  id="login-email"
                  label="Work email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setEmail(event.target.value);
                    if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
                  }}
                  error={Boolean(fieldErrors.email)}
                  errorMessage={fieldErrors.email}
                  autoComplete="username"
                  inputMode="email"
                  disabled={submitting}
                />

                <PasswordInput
                  id="login-password"
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((e) => ({ ...e, password: undefined }));
                  }}
                  error={Boolean(fieldErrors.password)}
                  errorMessage={fieldErrors.password}
                  autoComplete="current-password"
                  disabled={submitting}
                />

                <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Demo password: {DEMO_PASSWORD}
                  </Text>
                  <SmartLink href="/forgot-password">Forgot password?</SmartLink>
                </Row>

                <Button
                  fillWidth
                  arrowIcon
                  loading={submitting}
                  disabled={submitting}
                  onClick={() => {
                    // Mirrors the form submit so the button works even if the
                    // Button renders without a native submit type.
                    const errors = validate(email, password);
                    setFieldErrors(errors);
                    setFormError(null);
                    if (errors.email || errors.password || submitting) return;
                    setSubmitting(true);
                    schedule(() => {
                      setSubmitting(false);
                      if (
                        email.trim().toLowerCase() !== DEMO_EMAIL ||
                        password !== DEMO_PASSWORD
                      ) {
                        setFormError(
                          "The email or password is incorrect. Check them and try again.",
                        );
                        return;
                      }
                      setOtpError(false);
                      setOtpAttempt((n) => n + 1);
                      setSecondsLeft(RESEND_SECONDS);
                      setStep("otp");
                    }, 700);
                  }}
                >
                  Continue
                </Button>
              </Column>
            </Form>

            <Row fillWidth vertical="center" gap="16">
              <Line fill />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Protected by two-step verification
              </Text>
              <Line fill />
            </Row>

            <Row gap="16" wrap horizontal="center">
              <SmartLink href="/privacy">Privacy policy</SmartLink>
              <SmartLink href="/terms">Terms of use</SmartLink>
            </Row>
          </Column>
        )}
      </Column>

      {/* Base dialog: confirms the credentials step is in progress. The OTP dialog stacks on top. */}
      <DialogProvider>
        <Dialog
          base
          open={credentialsOpen && step === "otp"}
          onClose={closeOtp}
          title="Signing in"
          description={`Password accepted for ${maskEmail(email)}.`}
          hideClose
          closeOnClickaway={false}
        >
          <Row gap="12" vertical="center" paddingY="8">
            <Icon name="lock" size="m" onBackground="neutral-weak" />
            <Text variant="body-default-s" onBackground="neutral-weak">
              One more step to protect your account.
            </Text>
          </Row>
        </Dialog>

        <Dialog
          stack
          open={step === "otp"}
          onClose={closeOtp}
          title="Enter your verification code"
          description={`We sent a ${OTP_LENGTH}-digit code to ${maskEmail(email)}. It expires in 10 minutes.`}
          closeOnClickaway={false}
          footer={
            <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
              <Button variant="tertiary" prefixIcon="arrowLeft" onClick={closeOtp}>
                Back
              </Button>
              <Button
                variant="secondary"
                prefixIcon="refresh"
                onClick={resendCode}
                disabled={secondsLeft > 0 || verifying}
              >
                {secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : "Resend code"}
              </Button>
            </Row>
          }
        >
          <Column gap="16" paddingY="8">
            <OTPInput
              key={otpAttempt}
              length={OTP_LENGTH}
              autoFocus
              onComplete={handleOtpComplete}
              error={otpError}
              errorMessage={otpError ? "That code isn't right. Try again." : undefined}
              disabled={verifying}
            />
            <Row gap="8" vertical="center" aria-live="polite" minHeight="24">
              {verifying ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Verifying your code…
                </Text>
              ) : (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Demo code: {DEMO_CODE}
                </Text>
              )}
            </Row>
          </Column>
        </Dialog>
      </DialogProvider>
    </Column>
  );
}

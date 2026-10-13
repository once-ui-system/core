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
  useToast,
} from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

/* ------------------------------------------------------------------ */
/* Placeholder data                                                    */
/* ------------------------------------------------------------------ */

const DEMO_EMAIL = "maya.lindqvist@northwind.io";
const DEMO_PASSWORD = "Harbor-Lantern-42";
const DEMO_CODE = "482913";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const highlights = [
  {
    icon: "security",
    title: "Two-step verification",
    text: "Every sign-in is confirmed with a one-time code sent to your device.",
  },
  {
    icon: "time",
    title: "Session history",
    text: "Review where you signed in and revoke any session in one click.",
  },
  {
    icon: "organization",
    title: "Workspace-ready",
    text: "Single sign-on for teams, with roles managed from your admin console.",
  },
] as const;

type Step = "credentials" | "otp" | "success";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<Step>("credentials");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /* Resend countdown ------------------------------------------------ */
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  /* Handlers -------------------------------------------------------- */
  const onEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(null);
    setFormError(null);
  }, []);

  const onPasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(null);
    setFormError(null);
  }, []);

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    // Read from the DOM too, so browser autofill is respected.
    const form = new FormData(e.currentTarget);
    const emailValue = String(form.get("email") ?? email).trim();
    const passwordValue = String(form.get("password") ?? password);

    let valid = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setEmailError("Enter a valid email address, like you@company.com.");
      valid = false;
    }
    if (passwordValue.length < 8) {
      setPasswordError("Your password must be at least 8 characters.");
      valid = false;
    }
    if (!valid) return;

    setSubmitting(true);
    setFormError(null);
    await wait(900);
    if (!mounted.current) return;

    if (emailValue.toLowerCase() !== DEMO_EMAIL || passwordValue !== DEMO_PASSWORD) {
      setSubmitting(false);
      setFormError("That email and password combination doesn’t match our records.");
      return;
    }

    setEmail(emailValue);
    setSubmitting(false);
    setOtpError(null);
    setOtpKey((k) => k + 1);
    setResendIn(RESEND_SECONDS);
    setStep("otp");
    setOtpOpen(true);
  };

  const handleComplete = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    await wait(900);
    if (!mounted.current) return;
    setVerifying(false);

    if (code !== DEMO_CODE) {
      setOtpError("That code isn’t right. Check the latest message and try again.");
      setOtpKey((k) => k + 1);
      return;
    }

    setOtpOpen(false);
    setStep("success");
    setWelcomeOpen(true);
    addToast({ variant: "success", message: "Signed in successfully." });
  };

  const closeOtp = () => {
    if (verifying) return;
    setOtpOpen(false);
    setOtpError(null);
    setStep("credentials");
  };

  const resend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setOtpError(null);
    setOtpKey((k) => k + 1);
    addToast({ variant: "info", message: "A new code is on its way." });
  };

  const signOut = () => {
    setWelcomeOpen(false);
    setStep("credentials");
    setPassword("");
    setFormError(null);
  };

  const baseOpen = !welcomeOpen;

  return (
    <Column as="main" fillWidth horizontal="center" minHeight="100vh">
      {/* Ambient layer: one brand glow on the full-bleed wrapper */}
      <Column fillWidth horizontal="center" paddingX="16" paddingY="64" s={{ paddingY: "32" }}>
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

        <Column zIndex={1} maxWidth="l" gap="32">
          <Row
            fillWidth
            gap="48"
            vertical="center"
            m={{ direction: "column", gap: "32" }}
            s={{ direction: "column", gap: "32" }}
          >
            {/* Intro column */}
            <Column flex={1} gap="32" fillWidth>
              <Column gap="16">
                <Row vertical="center" gap="8">
                  <Icon name="lock" onBackground="brand-medium" size="s" />
                  <Text variant="label-default-s" onBackground="brand-medium">
                    Northwind account
                  </Text>
                </Row>
                <Heading as="h1" variant="display-strong-s" wrap="balance">
                  Sign in to your workspace
                </Heading>
                <Text variant="body-default-l" onBackground="neutral-weak">
                  Pick up where you left off. We’ll ask for a verification code after your password
                  to keep your projects safe.
                </Text>
              </Column>

              <Column gap="20" s={{ hide: true }}>
                {highlights.map((item) => (
                  <Row key={item.title} gap="16" vertical="start">
                    <Row
                      center
                      width="40"
                      height="40"
                      radius="m"
                      background="brand-alpha-weak"
                      onBackground="brand-medium"
                      aria-hidden="true"
                    >
                      <Icon name={item.icon} size="s" />
                    </Row>
                    <Column gap="4" flex={1}>
                      <Text variant="heading-strong-s">{item.title}</Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {item.text}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Column>
            </Column>

            {/* Sign-in panel */}
            <Column
              as="section"
              aria-labelledby="signin-title"
              flex={1}
              fillWidth
              maxWidth={32}
              background="surface"
              border
              radius="xl"
              padding="32"
              s={{ padding: "24" }}
              gap="24"
            >
              <Column gap="8">
                <Heading as="h2" id="signin-title" variant="heading-strong-l">
                  Welcome back
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  New here? <SmartLink href="/signup">Create an account</SmartLink>
                </Text>
              </Column>

              <form onSubmit={handleSubmit} noValidate aria-describedby="demo-hint">
                <Column gap="16">
                  {formError && (
                    <div role="alert">
                      <Feedback variant="danger" title="Couldn’t sign you in" description={formError} />
                    </div>
                  )}

                  <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Work email"
                    placeholder="you@company.com"
                    autoComplete="username"
                    inputMode="email"
                    required
                    value={email}
                    onChange={onEmailChange}
                    error={Boolean(emailError)}
                    errorMessage={emailError}
                    disabled={submitting}
                  />

                  <PasswordInput
                    id="password"
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={onPasswordChange}
                    error={Boolean(passwordError)}
                    errorMessage={passwordError}
                    disabled={submitting}
                  />

                  <Row fillWidth horizontal="end">
                    <SmartLink href="/forgot-password">Forgot password?</SmartLink>
                  </Row>

                  <Button
                    type="submit"
                    fillWidth
                    size="l"
                    loading={submitting}
                    disabled={submitting}
                    arrowIcon
                  >
                    Continue
                  </Button>
                </Column>
              </form>

              <Row fillWidth vertical="center" gap="16">
                <Line fill />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  demo
                </Text>
                <Line fill />
              </Row>

              <Column
                id="demo-hint"
                gap="12"
                padding="16"
                radius="l"
                background="page"
                border
              >
                <Row gap="8" vertical="center">
                  <Icon name="info" size="xs" onBackground="neutral-weak" />
                  <Text variant="label-strong-s">Try the flow</Text>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Use the sample account, then enter the code{" "}
                  <Tag size="s" scheme="brand" label={DEMO_CODE} /> when asked.
                </Text>
                <Button variant="secondary" size="s" onClick={fillDemo} prefixIcon="person">
                  Fill sample credentials
                </Button>
              </Column>

              <Row gap="16" wrap horizontal="center">
                <SmartLink href="/privacy">Privacy policy</SmartLink>
                <SmartLink href="/terms">Terms of use</SmartLink>
              </Row>
            </Column>
          </Row>
        </Column>
      </Column>

      {/* Stacked dialogs: base sign-in context + OTP on top */}
      <DialogProvider>
        {/* Base dialog: confirms the pending sign-in; dims while OTP is stacked */}
        <Dialog
          base
          open={step !== "credentials" && baseOpen}
          onClose={closeOtp}
          title="Confirm it’s you"
          description={`Signing in as ${email || DEMO_EMAIL}`}
          hideClose
          closeOnClickaway={false}
        >
          <Column gap="16" paddingY="8">
            <Row gap="12" vertical="center">
              <Row
                center
                width="40"
                height="40"
                radius="full"
                background="brand-alpha-weak"
                onBackground="brand-medium"
                aria-hidden="true"
              >
                <Icon name="lock" size="s" />
              </Row>
              <Column gap="4" flex={1}>
                <Text variant="label-strong-m">Password accepted</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  One more step to finish signing in.
                </Text>
              </Column>
            </Row>
            <Button variant="tertiary" onClick={closeOtp} prefixIcon="arrowLeft">
              Use a different account
            </Button>
          </Column>
        </Dialog>

        {/* Stacked dialog: OTP */}
        <Dialog
          stack
          open={otpOpen}
          onClose={closeOtp}
          title="Enter verification code"
          description={`We sent a ${OTP_LENGTH}-digit code to your authenticator app for ${
            email || DEMO_EMAIL
          }.`}
          closeOnClickaway={false}
          footer={
            <Row fillWidth horizontal="between" vertical="center" gap="12" wrap>
              <Button variant="tertiary" onClick={closeOtp} disabled={verifying}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                prefixIcon="refresh"
                onClick={resend}
                disabled={resendIn > 0 || verifying}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </Button>
            </Row>
          }
        >
          <Column gap="16" paddingY="8" horizontal="center">
            <Column gap="12" fillWidth horizontal="center">
              <OTPInput
                key={otpKey}
                length={OTP_LENGTH}
                autoFocus
                disabled={verifying}
                error={Boolean(otpError)}
                errorMessage={otpError}
                onComplete={handleComplete}
              />
            </Column>

            <div role="status" aria-live="polite" style={{ minHeight: "1.5rem" }}>
              {verifying ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Verifying code…
                </Text>
              ) : null}
            </div>

            <Text variant="body-default-xs" onBackground="neutral-weak" align="center">
              Demo code: {DEMO_CODE}
            </Text>
          </Column>
        </Dialog>
      </DialogProvider>

      {/* Success dialog */}
      <Dialog
        open={welcomeOpen}
        onClose={signOut}
        title="You’re signed in"
        description={`Welcome back, Maya. Your session on this device is verified.`}
        footer={
          <Row fillWidth horizontal="end" gap="12" wrap>
            <Button variant="tertiary" onClick={signOut} prefixIcon="logout">
              Sign out
            </Button>
            <Button href="/dashboard" arrowIcon>
              Go to dashboard
            </Button>
          </Row>
        }
      >
        <Column gap="12" paddingY="8">
          <Row gap="12" vertical="center">
            <Row
              center
              width="40"
              height="40"
              radius="full"
              background="success-alpha-weak"
              onBackground="success-medium"
              aria-hidden="true"
            >
              <Icon name="check" size="s" />
            </Row>
            <Column gap="4" flex={1}>
              <Text variant="label-strong-m">Verified with one-time code</Text>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Berlin, Germany · Chrome on macOS
              </Text>
            </Column>
          </Row>
        </Column>
      </Dialog>
    </Column>
  );
}

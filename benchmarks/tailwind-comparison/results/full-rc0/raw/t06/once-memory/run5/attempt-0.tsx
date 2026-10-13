"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Heading,
  Input,
  PasswordInput,
  Row,
  Text,
} from "@once-ui-system/core";

const DEMO_EMAIL = "amara.okafor@northwind.example";
const DEMO_PASSWORD = "Northwind#2025";
const DEMO_OTP = "482916";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Step = "closed" | "password" | "otp";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Page() {
  const [step, setStep] = useState<Step>("closed");
  const [signedIn, setSignedIn] = useState(false);

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  // Focus first OTP box when the OTP step opens
  useEffect(() => {
    if (step !== "otp") return;
    const id = setTimeout(() => otpRefs.current[0]?.focus(), 150);
    return () => clearTimeout(id);
  }, [step]);

  const resetAll = useCallback(() => {
    setStep("closed");
    setPassword("");
    setPasswordError(null);
    setEmailError(null);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setResendIn(0);
    setSubmittingPassword(false);
    setVerifying(false);
  }, []);

  const handlePasswordSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (submittingPassword) return;
    setEmailError(null);
    setPasswordError(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Enter a valid work email address.");
      return;
    }
    if (password.length === 0) {
      setPasswordError("Enter your password.");
      return;
    }

    setSubmittingPassword(true);
    await wait(700);
    setSubmittingPassword(false);

    if (password !== DEMO_PASSWORD) {
      setPasswordError("That email and password combination doesn't match our records.");
      return;
    }

    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  const verifyCode = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    setOtpError(null);
    await wait(700);
    setVerifying(false);

    if (code !== DEMO_OTP) {
      setOtpError("That code is incorrect or has expired. Check the code and try again.");
      setDigits(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
      return;
    }

    resetAll();
    setSignedIn(true);
  };

  const handleOtpSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    void verifyCode(code);
  };

  const handleDigitChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    const next = [...digits];
    // Support multi-character input (autofill) by spreading across boxes
    const chars = value.slice(0, OTP_LENGTH - index).split("");
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setDigits(next);
    setOtpError(null);
    const focusIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
    if (next.every((d) => d !== "")) {
      void verifyCode(next.join(""));
    }
  };

  const handleDigitKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((prev) => prev.map((d, i) => (i === index - 1 ? "" : d)));
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      event.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    const next = Array<string>(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    setOtpError(null);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    if (pasted.length === OTP_LENGTH) void verifyCode(pasted);
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError(null);
    otpRefs.current[0]?.focus();
  };

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      vertical="center"
      padding="l"
      gap="24"
      style={{ minHeight: "100vh" }}
    >
      <Column
        maxWidth={32}
        fillWidth
        padding="32"
        gap="20"
        radius="xl"
        border="neutral-alpha-weak"
        background="surface"
        horizontal="center"
        align="center"
      >
        {signedIn ? (
          <>
            <Heading as="h1" variant="heading-strong-xl">
              Welcome back, Amara
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak" role="status">
              You&apos;re signed in to the Northwind workspace as {maskEmail(DEMO_EMAIL)}.
            </Text>
            <Button variant="secondary" size="m" onClick={() => setSignedIn(false)}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Heading as="h1" variant="heading-strong-xl">
              Northwind Console
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              Manage billing, team access and deployments in one place. Sign in with your
              password, then confirm with a one-time code.
            </Text>
            <Button
              variant="primary"
              size="l"
              fillWidth
              onClick={() => setStep("password")}
              aria-haspopup="dialog"
            >
              Sign in
            </Button>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Demo credentials: password <code>{DEMO_PASSWORD}</code>, code{" "}
              <code>{DEMO_OTP}</code>
            </Text>
          </>
        )}
      </Column>

      {/* Step 1: email + password */}
      <Dialog
        isOpen={step === "password" || step === "otp"}
        onClose={resetAll}
        title="Sign in to Northwind"
        description="Use your work email and password to continue."
        base={step === "otp"}
        footer={
          <Row fillWidth horizontal="end" gap="8" wrap>
            <Button variant="tertiary" onClick={resetAll} disabled={submittingPassword}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handlePasswordSubmit()}
              loading={submittingPassword}
              disabled={submittingPassword}
            >
              Continue
            </Button>
          </Row>
        }
      >
        <form onSubmit={handlePasswordSubmit} noValidate aria-label="Sign in with password">
          <Column fillWidth gap="16">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Work email"
              autoComplete="username"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              error={Boolean(emailError)}
              errorMessage={emailError ?? undefined}
            />
            <PasswordInput
              id="login-password"
              name="password"
              label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              error={Boolean(passwordError)}
              errorMessage={passwordError ?? undefined}
            />
            {/* Enables Enter-to-submit without a visible duplicate button */}
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
          </Column>
        </form>
      </Dialog>

      {/* Step 2: OTP, stacked over the password dialog */}
      <Dialog
        isOpen={step === "otp"}
        onClose={() => setStep("password")}
        stack
        title="Enter your verification code"
        description={`We sent a 6-digit code to ${maskEmail(email)}. It expires in 10 minutes.`}
        footer={
          <Row fillWidth horizontal="between" vertical="center" gap="8" wrap>
            <Button variant="tertiary" onClick={() => setStep("password")} disabled={verifying}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => handleOtpSubmit()}
              loading={verifying}
              disabled={verifying}
            >
              Verify and sign in
            </Button>
          </Row>
        }
      >
        <form onSubmit={handleOtpSubmit} noValidate aria-label="Verify one-time code">
          <Column fillWidth gap="16" horizontal="center">
            <Row
              gap="8"
              horizontal="center"
              role="group"
              aria-label="One-time code"
              style={{ flexWrap: "nowrap" }}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  value={digit}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? "otp-error" : undefined}
                  disabled={verifying}
                  onChange={(e) => handleDigitChange(index, e)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  onPaste={handleDigitPaste}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{
                    width: "clamp(36px, 11vw, 48px)",
                    height: "clamp(44px, 13vw, 56px)",
                    textAlign: "center",
                    fontSize: "1.25rem",
                    fontFamily: "var(--font-code)",
                    borderRadius: "var(--radius-m, 8px)",
                    border: `1px solid ${
                      otpError ? "var(--danger-solid-strong, #d33)" : "var(--neutral-alpha-medium, #8888)"
                    }`,
                    background: "var(--surface-background, transparent)",
                    color: "var(--neutral-on-background-strong, inherit)",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </Row>

            <div aria-live="polite" style={{ minHeight: "1.25rem", width: "100%" }}>
              {otpError && (
                <Text
                  id="otp-error"
                  variant="body-default-s"
                  onBackground="danger-weak"
                  role="alert"
                  align="center"
                >
                  {otpError}
                </Text>
              )}
            </div>

            <Row gap="8" vertical="center" horizontal="center" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Didn&apos;t get a code?
              </Text>
              <Button
                variant="tertiary"
                size="s"
                onClick={handleResend}
                disabled={resendIn > 0 || verifying}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </Button>
            </Row>
            <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

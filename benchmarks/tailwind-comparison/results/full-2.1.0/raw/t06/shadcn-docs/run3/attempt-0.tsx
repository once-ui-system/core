"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

const DEMO_EMAIL = "maya.okafor@northwind.dev";
const DEMO_PASSWORD = "correct-horse-9";
const DEMO_CODE = "123456";
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_SECONDS = 30;
const MASKED_PHONE = "+1 (•••) •••-0142";

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type Session = { email: string; name: string };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const [session, setSession] = useState<Session | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resetOtp = useCallback(() => {
    setCode("");
    setOtpError(null);
    setAttempts(0);
    setVerifying(false);
  }, []);

  const handleLoginOpenChange = (open: boolean) => {
    // Don't let the base dialog close while the OTP step is on top of it.
    if (!open && (otpOpen || submitting)) return;
    setLoginOpen(open);
    if (!open) {
      setPassword("");
      setShowPassword(false);
      setEmailError(null);
      setPasswordError(null);
      setFormError(null);
    }
  };

  const handleOtpOpenChange = (open: boolean) => {
    if (!open && verifying) return;
    setOtpOpen(open);
    if (!open) resetOtp();
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmed = email.trim();
    const nextEmailError = !trimmed
      ? "Enter your work email."
      : !isValidEmail(trimmed)
        ? "Enter a valid email address, like name@company.com."
        : null;
    const nextPasswordError = !password ? "Enter your password." : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(null);
    if (nextEmailError || nextPasswordError) {
      if (nextEmailError) emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    await wait(900);
    setSubmitting(false);

    if (trimmed.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setFormError(
        "The email or password you entered is incorrect. Check your details and try again.",
      );
      return;
    }

    resetOtp();
    setCooldown(RESEND_SECONDS);
    setOtpOpen(true);
  };

  const verifyCode = useCallback(
    async (value: string) => {
      if (verifying) return;
      setVerifying(true);
      setOtpError(null);
      await wait(800);

      if (value === DEMO_CODE) {
        setVerifying(false);
        setOtpOpen(false);
        setLoginOpen(false);
        setSession({ email: DEMO_EMAIL, name: "Maya Okafor" });
        setPassword("");
        setCode("");
        setAttempts(0);
        toast.success("Signed in", {
          description: "Welcome back, Maya. Your device is now trusted for 30 days.",
        });
        return;
      }

      const used = attempts + 1;
      setAttempts(used);
      setVerifying(false);
      setCode("");
      if (used >= MAX_OTP_ATTEMPTS) {
        setOtpError(
          "Too many incorrect codes. Go back and sign in again to get a new code.",
        );
      } else {
        const left = MAX_OTP_ATTEMPTS - used;
        setOtpError(
          `That code isn't right. ${left} ${left === 1 ? "attempt" : "attempts"} left.`,
        );
      }
    },
    [attempts, verifying],
  );

  const lockedOut = attempts >= MAX_OTP_ATTEMPTS;

  const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lockedOut || verifying) return;
    if (code.length < OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    void verifyCode(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || verifying) return;
    setResending(true);
    await wait(700);
    setResending(false);
    setCooldown(RESEND_SECONDS);
    setCode("");
    setOtpError(null);
    setAttempts(0);
    toast("New code sent", { description: `We texted a fresh code to ${MASKED_PHONE}.` });
  };

  const handleSignOut = () => {
    setSession(null);
    setEmail("");
    toast("Signed out", { description: "You've been signed out of Northwind." });
  };

  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheckIcon className="size-4" aria-hidden="true" />
          </span>
          Northwind
        </div>
        {session ? (
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOutIcon aria-hidden="true" />
            Sign out
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLoginOpen(true)}
          >
            Sign in
          </Button>
        )}
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 pb-16 sm:px-6">
        {session ? (
          <div className="mx-auto w-full max-w-md rounded-xl border bg-background p-6 text-center shadow-xs sm:p-8">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2Icon className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-balance">
              You&apos;re signed in, {session.name.split(" ")[0]}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">{session.email}</span>{" "}
              with two-step verification.
            </p>
            <Button className="mt-6 w-full sm:w-auto" onClick={handleSignOut}>
              <LogOutIcon aria-hidden="true" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyholeIcon className="size-6" aria-hidden="true" />
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Secure access to your workspace
            </h1>
            <p className="mt-3 text-base text-pretty text-muted-foreground">
              Sign in with your password, then confirm with a one-time code sent
              to your phone. It takes less than a minute.
            </p>
            <Button
              size="lg"
              className="mt-6 w-full sm:w-auto"
              onClick={() => setLoginOpen(true)}
            >
              Sign in to Northwind
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Protected by two-step verification
            </p>
          </div>
        )}
      </section>

      {/* Step 1: password dialog (stays mounted beneath the OTP dialog) */}
      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent
          className="transition-[transform,opacity,scale] data-[stacked=true]:scale-[0.97] data-[stacked=true]:opacity-60 sm:max-w-md"
          data-stacked={otpOpen}
          aria-hidden={otpOpen ? true : undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            emailRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Sign in to Northwind</DialogTitle>
            <DialogDescription>
              Enter your work email and password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} noValidate className="grid gap-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircleIcon aria-hidden="true" />
                <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <FieldGroup className="gap-4">
              <Field data-invalid={emailError ? true : undefined}>
                <FieldLabel htmlFor="login-email">Work email</FieldLabel>
                <div className="relative">
                  <MailIcon
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    ref={emailRef}
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="name@company.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? "login-email-error" : undefined}
                    disabled={submitting}
                  />
                </div>
                {emailError && (
                  <FieldError id="login-email-error">{emailError}</FieldError>
                )}
              </Field>

              <Field data-invalid={passwordError ? true : undefined}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <button
                    type="button"
                    className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() =>
                      toast("Reset link sent", {
                        description: "If an account exists, you'll get an email shortly.",
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={passwordError ? true : undefined}
                    aria-describedby={
                      passwordError ? "login-password-error" : undefined
                    }
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-0.5 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOffIcon aria-hidden="true" />
                    ) : (
                      <EyeIcon aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {passwordError && (
                  <FieldError id="login-password-error">
                    {passwordError}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner aria-hidden="true" />
                  Checking credentials…
                </>
              ) : (
                "Continue"
              )}
            </Button>

            <div className="rounded-md border border-dashed bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Demo credentials</p>
              <p className="mt-1 break-all">
                {DEMO_EMAIL} / {DEMO_PASSWORD}
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Step 2: OTP dialog stacked on top */}
      <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
        <DialogContent
          className="sm:max-w-sm"
          showCloseButton={!verifying}
          onInteractOutside={(event) => {
            if (verifying) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (verifying) event.preventDefault();
          }}
        >
          <DialogHeader className="items-center text-center sm:text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SmartphoneIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle>Verify it&apos;s you</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to {MASKED_PHONE}. Enter it below to finish
              signing in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOtpSubmit} className="grid gap-4" noValidate>
            <Field data-invalid={otpError ? true : undefined} className="items-center">
              <FieldLabel htmlFor="otp-code" className="sr-only">
                One-time verification code
              </FieldLabel>
              <InputOTP
                id="otp-code"
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(value) => {
                  setCode(value);
                  if (otpError && !lockedOut) setOtpError(null);
                }}
                onComplete={(value) => void verifyCode(value)}
                disabled={verifying || lockedOut}
                aria-invalid={otpError ? true : undefined}
                aria-describedby={otpError ? "otp-error" : "otp-hint"}
                autoFocus
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                  <InputOTPSlot index={1} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                  <InputOTPSlot index={2} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                  <InputOTPSlot index={4} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                  <InputOTPSlot index={5} aria-invalid={otpError ? true : undefined} className="size-10 sm:size-11" />
                </InputOTPGroup>
              </InputOTP>

              {otpError ? (
                <FieldError id="otp-error" className="text-center">
                  {otpError}
                </FieldError>
              ) : (
                <FieldDescription id="otp-hint" className="text-center text-xs">
                  Demo code: <span className="font-mono font-medium">{DEMO_CODE}</span>
                </FieldDescription>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={verifying || lockedOut || code.length < OTP_LENGTH}
            >
              {verifying ? (
                <>
                  <Spinner aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify and sign in"
              )}
            </Button>
          </form>

          <DialogFooter className="items-center gap-1 sm:flex-col sm:items-center sm:justify-center">
            <p
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              {cooldown > 0
                ? `Didn't get it? You can resend in ${cooldown}s`
                : "Didn't get the code?"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1">
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={cooldown > 0 || resending || verifying}
              >
                {resending && <Spinner aria-hidden="true" />}
                Resend code
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleOtpOpenChange(false)}
                disabled={verifying}
              >
                <ArrowLeftIcon aria-hidden="true" />
                Back to password
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

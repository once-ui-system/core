"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

// ---------------------------------------------------------------------------
// Placeholder data (demo credentials are shown in the UI so the flow is testable)
// ---------------------------------------------------------------------------
const DEMO_EMAIL = "maya.chen@northwind.io";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_OTP = "428193";
const DEMO_PHONE_HINT = "•••• •• 4821";
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_SECONDS = 30;

const RECENT_ACTIVITY = [
  { id: "a1", label: "Invoice #NW-2043 approved", time: "12 minutes ago" },
  { id: "a2", label: "Fleet report exported (CSV)", time: "Today, 09:14" },
  { id: "a3", label: "Billing contact updated", time: "Yesterday, 16:40" },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  const uid = useId();
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const credErrorId = `${uid}-cred-error`;
  const otpErrorId = `${uid}-otp-error`;

  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Step 1 state
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [credError, setCredError] = useState<string | null>(null);
  const [checkingCreds, setCheckingCreds] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const locked = attempts >= MAX_OTP_ATTEMPTS;
  const passwordRef = useRef<HTMLInputElement>(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resetFlow = useCallback(() => {
    setOtpOpen(false);
    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setCooldown(0);
    setPassword("");
    setCredError(null);
    setShowPassword(false);
  }, []);

  const handleLoginOpenChange = (open: boolean) => {
    setLoginOpen(open);
    if (!open) resetFlow();
  };

  const handleCredentials = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checkingCreds) return;
    setCredError(null);

    if (!email.trim() || !password) {
      setCredError("Enter both your work email and password.");
      return;
    }

    setCheckingCreds(true);
    await wait(900);
    setCheckingCreds(false);

    if (
      email.trim().toLowerCase() !== DEMO_EMAIL ||
      password !== DEMO_PASSWORD
    ) {
      setCredError("That email and password don't match. Try again.");
      passwordRef.current?.focus();
      return;
    }

    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setCooldown(RESEND_SECONDS);
    setOtpOpen(true);
    toast.info("Verification code sent", {
      description: `We texted a 6-digit code to ${DEMO_PHONE_HINT}.`,
    });
  };

  const verifyOtp = async (code: string) => {
    if (verifying || locked || code.length !== OTP_LENGTH) return;
    setVerifying(true);
    setOtpError(null);
    await wait(800);
    setVerifying(false);

    if (code === DEMO_OTP) {
      setOtpOpen(false);
      setLoginOpen(false);
      resetFlow();
      setSignedIn(true);
      toast.success("Signed in", {
        description: "Welcome back, Maya. You're all set.",
      });
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    setOtp("");
    if (next >= MAX_OTP_ATTEMPTS) {
      setOtpError(
        "Too many incorrect codes. Go back and sign in again to get a new code."
      );
    } else {
      const left = MAX_OTP_ATTEMPTS - next;
      setOtpError(
        `That code isn't right. ${left} ${left === 1 ? "attempt" : "attempts"} left.`
      );
    }
  };

  const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    void verifyOtp(otp);
  };

  const handleResend = () => {
    if (cooldown > 0 || locked) return;
    setCooldown(RESEND_SECONDS);
    setOtp("");
    setOtpError(null);
    toast.success("New code sent", {
      description: `Check your phone ending in ${DEMO_PHONE_HINT.slice(-4)}.`,
    });
  };

  const handleSignOut = () => {
    setSignedIn(false);
    toast("Signed out", { description: "Your session has ended." });
  };

  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <ShieldCheck className="size-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Northwind Fleet
            </span>
          </div>
          {signedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          ) : (
            <Button size="sm" onClick={() => setLoginOpen(true)}>
              Log in
            </Button>
          )}
        </header>

        <section className="flex flex-1 items-center py-10 sm:py-16">
          {signedIn ? (
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <Badge variant="secondary">
                  <CheckCircle2 aria-hidden="true" />
                  Two-step verification passed
                </Badge>
                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back, Maya
                </h1>
                <p className="max-w-prose text-pretty text-muted-foreground">
                  You&apos;re signed in as {DEMO_EMAIL}. Here&apos;s what
                  happened in your workspace since your last visit.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>
                    Updates across your Northwind Fleet account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y">
                    {RECENT_ACTIVITY.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
              <Badge variant="outline">Secure workspace access</Badge>
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                Manage your fleet from one secure place
              </h1>
              <p className="max-w-prose text-pretty text-muted-foreground sm:text-lg">
                Sign in with your work email and password, then confirm with a
                one-time code sent to your phone.
              </p>
              <Button size="lg" onClick={() => setLoginOpen(true)}>
                <KeyRound aria-hidden="true" />
                Log in to your account
              </Button>
              <p className="text-sm text-muted-foreground">
                Demo password:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {DEMO_PASSWORD}
                </code>{" "}
                · Demo code:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                  {DEMO_OTP}
                </code>
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Step 1: credentials dialog */}
      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log in to Northwind Fleet</DialogTitle>
            <DialogDescription>
              Use your work email and password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCredentials} noValidate className="grid gap-4">
            <FieldGroup className="gap-4">
              <Field data-invalid={credError ? true : undefined}>
                <Label htmlFor={emailId}>Work email</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Mail aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={emailId}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={credError ? true : undefined}
                    aria-describedby={credError ? credErrorId : undefined}
                    disabled={checkingCreds}
                  />
                </InputGroup>
              </Field>

              <Field data-invalid={credError ? true : undefined}>
                <Label htmlFor={passwordId}>Password</Label>
                <InputGroup>
                  <InputGroupAddon>
                    <KeyRound aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    ref={passwordRef}
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={credError ? true : undefined}
                    aria-describedby={credError ? credErrorId : undefined}
                    disabled={checkingCreds}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {credError && (
                  <FieldError id={credErrorId}>{credError}</FieldError>
                )}
              </Field>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${uid}-remember`}
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <Label htmlFor={`${uid}-remember`} className="font-normal">
                    Keep me signed in
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() =>
                    toast.info("Password reset", {
                      description: `We'd email reset instructions to ${email || "your address"}.`,
                    })
                  }
                >
                  Forgot password?
                </Button>
              </div>
            </FieldGroup>

            <Button type="submit" disabled={checkingCreds} className="w-full">
              {checkingCreds ? (
                <>
                  <Spinner aria-hidden="true" role="presentation" />
                  Checking credentials…
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          {/* Step 2: OTP dialog stacked on top */}
          <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
            <DialogContent
              className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-sm"
              onInteractOutside={(e) => {
                if (verifying) e.preventDefault();
              }}
            >
              <DialogHeader className="items-center text-center sm:text-center">
                <div
                  className="mb-1 flex size-10 items-center justify-center rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <Smartphone className="size-5" />
                </div>
                <DialogTitle>Enter verification code</DialogTitle>
                <DialogDescription>
                  We sent a 6-digit code to the phone ending in{" "}
                  <span className="font-medium text-foreground">
                    {DEMO_PHONE_HINT.slice(-4)}
                  </span>
                  . It expires in 10 minutes.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleOtpSubmit}
                noValidate
                className="grid gap-4"
              >
                <div className="flex flex-col items-center gap-3">
                  <Label htmlFor={`${uid}-otp`} className="sr-only">
                    6-digit verification code
                  </Label>
                  <InputOTP
                    id={`${uid}-otp`}
                    maxLength={OTP_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      if (otpError && !locked) setOtpError(null);
                    }}
                    onComplete={(v) => void verifyOtp(v)}
                    disabled={verifying || locked}
                    aria-invalid={otpError ? true : undefined}
                    aria-describedby={otpError ? otpErrorId : undefined}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} aria-invalid={!!otpError} />
                      <InputOTPSlot index={1} aria-invalid={!!otpError} />
                      <InputOTPSlot index={2} aria-invalid={!!otpError} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} aria-invalid={!!otpError} />
                      <InputOTPSlot index={4} aria-invalid={!!otpError} />
                      <InputOTPSlot index={5} aria-invalid={!!otpError} />
                    </InputOTPGroup>
                  </InputOTP>
                  <div aria-live="polite" className="min-h-5 text-center">
                    {otpError && (
                      <FieldError id={otpErrorId}>{otpError}</FieldError>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={verifying || locked || otp.length !== OTP_LENGTH}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Spinner aria-hidden="true" role="presentation" />
                      Verifying…
                    </>
                  ) : (
                    "Verify and sign in"
                  )}
                </Button>
              </form>

              <DialogFooter className="items-center sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtpOpen(false)}
                  disabled={verifying}
                >
                  <ArrowLeft aria-hidden="true" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResend}
                  disabled={cooldown > 0 || locked || verifying}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </main>
  );
}

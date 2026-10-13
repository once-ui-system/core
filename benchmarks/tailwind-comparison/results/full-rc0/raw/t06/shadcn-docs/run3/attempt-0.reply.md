I have what I need. The design is a login page with a card. Submitting the correct email and password opens an OTP dialog, which is the "stacked dialog". A "trouble with your code?" link opens a second dialog on top of the first (recovery options), so the stacking is real.

Demo credentials are shown inline, and the valid OTP is `428193`.

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LifeBuoy,
  LogOut,
  Mail,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
const DEMO_PASSWORD = "Harbor-Lantern-42";
const DEMO_OTP = "428193";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Session = { name: string; email: string };

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local.slice(0, 2)}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

export default function Page() {
  const formId = useId();

  // Credentials step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP step
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Stacked help dialog
  const [helpOpen, setHelpOpen] = useState(false);

  // Result
  const [session, setSession] = useState<Session | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const trimmed = email.trim();
    const nextEmailError = !trimmed
      ? "Enter your work email."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
        ? "Enter a valid email address."
        : null;
    const nextPasswordError = !password ? "Enter your password." : null;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError) {
      emailRef.current?.focus();
      return;
    }
    if (nextPasswordError) {
      passwordRef.current?.focus();
      return;
    }

    setSubmitting(true);
    await wait(900);
    setSubmitting(false);

    if (
      trimmed.toLowerCase() !== DEMO_EMAIL ||
      password !== DEMO_PASSWORD
    ) {
      setFormError(
        "That email and password combination doesn't match our records."
      );
      return;
    }

    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setCooldown(RESEND_SECONDS);
    setOtpOpen(true);
  }

  async function verifyOtp(code: string) {
    if (verifying || code.length !== OTP_LENGTH) return;
    setOtpError(null);
    setVerifying(true);
    await wait(800);
    setVerifying(false);

    if (code !== DEMO_OTP) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setOtp("");
      setOtpError(
        nextAttempts >= 3
          ? "Incorrect code again. Request a new code or try another method."
          : "That code is incorrect or has expired. Try again."
      );
      return;
    }

    setOtpOpen(false);
    setHelpOpen(false);
    setSession({ name: "Maya Okafor", email: DEMO_EMAIL });
    toast.success("Signed in", {
      description: "Welcome back, Maya. Your device has been verified.",
    });
  }

  function handleOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    void verifyOtp(otp);
  }

  function resendCode() {
    if (cooldown > 0) return;
    setOtp("");
    setOtpError(null);
    setCooldown(RESEND_SECONDS);
    toast("New code sent", {
      description: `We emailed a fresh 6-digit code to ${maskEmail(DEMO_EMAIL)}.`,
    });
  }

  function signOut() {
    setSession(null);
    setPassword("");
    setOtp("");
    setFormError(null);
    toast("Signed out", { description: "You've been signed out safely." });
  }

  if (session) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">You&apos;re signed in</CardTitle>
            <CardDescription>
              Signed in as <span className="font-medium text-foreground">{session.name}</span>{" "}
              ({session.email}). Two-step verification was completed on this
              device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Workspace</dt>
                <dd className="font-medium">Northwind Logistics</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Session length</dt>
                <dd className="font-medium">{remember ? "30 days" : "This browser session"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-muted-foreground">Verification</dt>
                <dd className="font-medium">Email code</dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Northwind</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your workspace to manage shipments and invoices.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              id={formId}
              onSubmit={handleCredentials}
              noValidate
              aria-describedby={formError ? `${formId}-error` : undefined}
            >
              <FieldGroup className="gap-5">
                {formError && (
                  <div
                    id={`${formId}-error`}
                    role="alert"
                    className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    {formError}
                  </div>
                )}

                <Field data-invalid={emailError ? true : undefined}>
                  <FieldLabel htmlFor={`${formId}-email`}>Work email</FieldLabel>
                  <Input
                    ref={emailRef}
                    id={`${formId}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    aria-invalid={emailError ? true : undefined}
                    aria-describedby={emailError ? `${formId}-email-error` : undefined}
                    disabled={submitting}
                  />
                  {emailError && (
                    <FieldError id={`${formId}-email-error`}>{emailError}</FieldError>
                  )}
                </Field>

                <Field data-invalid={passwordError ? true : undefined}>
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
                    <button
                      type="button"
                      className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onClick={() =>
                        toast("Reset link sent", {
                          description:
                            "If an account exists for that email, a reset link is on its way.",
                        })
                      }
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      ref={passwordRef}
                      id={`${formId}-password`}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pr-10"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError(null);
                      }}
                      aria-invalid={passwordError ? true : undefined}
                      aria-describedby={
                        passwordError ? `${formId}-password-error` : undefined
                      }
                      disabled={submitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-0.5 right-0.5"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" />
                      ) : (
                        <Eye aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                  {passwordError && (
                    <FieldError id={`${formId}-password-error`}>
                      {passwordError}
                    </FieldError>
                  )}
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id={`${formId}-remember`}
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <FieldLabel htmlFor={`${formId}-remember`} className="font-normal">
                    Keep me signed in for 30 days
                  </FieldLabel>
                </Field>

                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner aria-hidden="true" />
                      Checking credentials…
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3">
            <div className="rounded-md border border-dashed bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">Demo credentials</p>
              <p>
                Email: <code className="font-mono text-foreground">{DEMO_EMAIL}</code>
              </p>
              <p>
                Password:{" "}
                <code className="font-mono text-foreground">{DEMO_PASSWORD}</code>
              </p>
              <p>
                Then enter code{" "}
                <code className="font-mono text-foreground">{DEMO_OTP}</code>.
              </p>
            </div>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by two-step verification. By continuing you agree to the
          Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Step 2: OTP dialog */}
      <Dialog
        open={otpOpen}
        onOpenChange={(open) => {
          setOtpOpen(open);
          if (!open) {
            setHelpOpen(false);
            setOtp("");
            setOtpError(null);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            if (verifying) e.preventDefault();
          }}
        >
          <form onSubmit={handleOtpSubmit} noValidate className="grid gap-5">
            <DialogHeader>
              <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary max-sm:mx-auto">
                <Mail className="size-5" aria-hidden="true" />
              </div>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We sent a 6-digit verification code to{" "}
                <span className="font-medium text-foreground">
                  {maskEmail(DEMO_EMAIL)}
                </span>
                . It expires in 10 minutes.
              </DialogDescription>
            </DialogHeader>

            <Field data-invalid={otpError ? true : undefined}>
              <FieldLabel htmlFor={`${formId}-otp`} className="sr-only">
                Verification code
              </FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  id={`${formId}-otp`}
                  maxLength={OTP_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (otpError) setOtpError(null);
                  }}
                  onComplete={(value) => void verifyOtp(value)}
                  disabled={verifying}
                  autoFocus
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? `${formId}-otp-error` : undefined}
                >
                  <InputOTPGroup>
                    {[0, 1, 2].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-10 text-base sm:size-12 sm:text-lg"
                        aria-invalid={otpError ? true : undefined}
                      />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {[3, 4, 5].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="size-10 text-base sm:size-12 sm:text-lg"
                        aria-invalid={otpError ? true : undefined}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div aria-live="polite" className="min-h-5 text-center">
                {otpError && (
                  <FieldError id={`${formId}-otp-error`}>{otpError}</FieldError>
                )}
              </div>
            </Field>

            <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
              <p>
                Didn&apos;t get it?{" "}
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={cooldown > 0 || verifying}
                  className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </p>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <LifeBuoy className="size-3.5" aria-hidden="true" />
                Trouble with your code?
              </button>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOtpOpen(false)}
                disabled={verifying}
              >
                Back
              </Button>
              <Button type="submit" disabled={verifying || otp.length !== OTP_LENGTH}>
                {verifying ? (
                  <>
                    <Spinner aria-hidden="true" />
                    Verifying…
                  </>
                ) : (
                  "Verify and sign in"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stacked dialog on top of the OTP dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Other ways to verify</DialogTitle>
            <DialogDescription>
              Pick another method if the email code isn&apos;t arriving. Your
              password has already been accepted.
            </DialogDescription>
          </DialogHeader>

          <ul className="grid gap-2">
            <li>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-3 py-3 text-left whitespace-normal"
                onClick={() => {
                  setHelpOpen(false);
                  toast("Authenticator app", {
                    description:
                      "Open your authenticator app and enter the current 6-digit code.",
                  });
                }}
              >
                <Smartphone className="size-5 text-muted-foreground" aria-hidden="true" />
                <span className="grid gap-0.5">
                  <span className="font-medium">Authenticator app</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Use the rotating code from your phone.
                  </span>
                </span>
              </Button>
            </li>
            <li>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 px-3 py-3 text-left whitespace-normal"
                onClick={() => {
                  setHelpOpen(false);
                  toast("Recovery code", {
                    description: "Enter one of the 10-character codes you saved at setup.",
                  });
                }}
              >
                <KeyRound className="size-5 text-muted-foreground" aria-hidden="true" />
                <span className="grid gap-0.5">
                  <span className="font-medium">Recovery code</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Use a single-use backup code.
                  </span>
                </span>
              </Button>
            </li>
          </ul>

          <FieldDescription>
            Still stuck? Contact your workspace admin at
            {" "}
            <span className="font-medium text-foreground">it-help@northwind.dev</span>.
          </FieldDescription>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setHelpOpen(false)}>
              Back to code entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
```
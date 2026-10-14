"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  ZapIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DEMO_EMAIL = "maya.okafor@northwind.dev";
const DEMO_PASSWORD = "correct-horse-battery";
const DEMO_OTP = "424242";
const RESEND_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 3;

const HIGHLIGHTS = [
  {
    icon: ShieldCheckIcon,
    title: "Two-step verification",
    text: "Every sign-in is confirmed with a one-time code sent to your phone.",
  },
  {
    icon: ZapIcon,
    title: "Deploys in seconds",
    text: "Push to main and your preview is live before the coffee cools.",
  },
  {
    icon: SmartphoneIcon,
    title: "Trusted devices",
    text: "Skip the code on devices you trust for the next 30 days.",
  },
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

type CredentialErrors = { email?: string; password?: string; form?: string };

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Credentials step
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [credErrors, setCredErrors] = useState<CredentialErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // OTP step
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const resetOtp = useCallback(() => {
    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setVerifying(false);
  }, []);

  const handleLoginOpenChange = (open: boolean) => {
    // Don't let the first dialog close while the second is stacked above it.
    if (!open && (otpOpen || submitting)) return;
    setLoginOpen(open);
    if (!open) {
      setCredErrors({});
      setPassword("");
      setShowPassword(false);
    }
  };

  const handleOtpOpenChange = (open: boolean) => {
    if (!open && verifying) return;
    setOtpOpen(open);
    if (!open) resetOtp();
  };

  const handleCredentials = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: CredentialErrors = {};
    const trimmed = email.trim();

    if (!trimmed) errors.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      errors.email = "That doesn't look like a valid email address.";

    if (!password) errors.password = "Enter your password.";
    else if (password.length < 8)
      errors.password = "Passwords are at least 8 characters.";

    if (errors.email || errors.password) {
      setCredErrors(errors);
      return;
    }

    setCredErrors({});
    setSubmitting(true);
    await wait(900);
    setSubmitting(false);

    if (trimmed.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setCredErrors({
        form: "The email or password is incorrect. Try the demo password shown below.",
      });
      return;
    }

    resetOtp();
    setCooldown(RESEND_SECONDS);
    setOtpOpen(true);
    toast.success("Code sent", {
      description: "We texted a 6-digit code to the phone ending in 42.",
    });
  };

  const verifyCode = useCallback(
    async (code: string) => {
      if (verifying) return;
      setVerifying(true);
      setOtpError(null);
      await wait(800);

      if (code === DEMO_OTP) {
        setVerifying(false);
        setOtpOpen(false);
        setLoginOpen(false);
        setSignedIn(true);
        setPassword("");
        resetOtp();
        toast.success("Welcome back, Maya", {
          description: "You're signed in on this device.",
        });
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setVerifying(false);
      setOtp("");
      setOtpError(
        nextAttempts >= MAX_OTP_ATTEMPTS
          ? "Too many incorrect codes. Request a new code to keep going."
          : `That code is incorrect. ${MAX_OTP_ATTEMPTS - nextAttempts} attempt${
              MAX_OTP_ATTEMPTS - nextAttempts === 1 ? "" : "s"
            } left.`,
      );
    },
    [attempts, verifying, resetOtp],
  );

  const handleOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length < 6) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    void verifyCode(otp);
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setCooldown(RESEND_SECONDS);
    toast.info("New code sent", {
      description: "Your previous code is no longer valid.",
    });
  };

  const handleSignOut = () => {
    setSignedIn(false);
    toast("Signed out", { description: "See you next time." });
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  const locked = attempts >= MAX_OTP_ATTEMPTS;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <ZapIcon className="size-4" />
            </span>
            Northwind Deploy
          </div>
          {signedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Button
              ref={triggerRef}
              size="sm"
              onClick={() => setLoginOpen(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-medium text-muted-foreground">
            Hosting for product teams
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Ship every branch with confidence.
          </h1>
          <p className="max-w-prose text-base text-muted-foreground sm:text-lg">
            Northwind Deploy gives your team instant previews, gradual
            rollouts and one-click rollbacks. Sign in to pick up where you left
            off.
          </p>
          <ul className="flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"
                >
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-live="polite" className="flex justify-center lg:justify-end">
          {signedIn ? (
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2Icon
                    aria-hidden="true"
                    className="size-5 text-emerald-600"
                  />
                  You&apos;re signed in
                </CardTitle>
                <CardDescription>
                  Signed in as {DEMO_EMAIL}
                  {remember ? " · this device is remembered" : ""}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="font-medium">marketing-site</span>
                  <span className="text-muted-foreground">
                    Deployed 12 min ago
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="font-medium">billing-api</span>
                  <span className="text-muted-foreground">
                    Deployed 3 hours ago
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="font-medium">docs-portal</span>
                  <span className="text-muted-foreground">
                    Deployed yesterday
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in with your password, then confirm with a one-time
                  code.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Button size="lg" onClick={() => setLoginOpen(true)}>
                  <LockIcon aria-hidden="true" />
                  Sign in to your workspace
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}. The code is{" "}
                  {DEMO_OTP}.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>© 2025 Northwind Labs, Inc.</span>
          <span>Status: all systems operational</span>
        </div>
      </footer>

      {/* Step 1: credentials */}
      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to Northwind Deploy</DialogTitle>
            <DialogDescription>
              Enter your work email and password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCredentials} noValidate>
            <FieldGroup className="gap-5">
              {credErrors.form && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {credErrors.form}
                </div>
              )}

              <Field data-invalid={!!credErrors.email}>
                <FieldLabel htmlFor="login-email">Work email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MailIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!credErrors.email}
                    aria-describedby={
                      credErrors.email ? "login-email-error" : undefined
                    }
                    disabled={submitting}
                  />
                </InputGroup>
                <FieldError id="login-email-error">{credErrors.email}</FieldError>
              </Field>

              <Field data-invalid={!!credErrors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <button
                    type="button"
                    className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() =>
                      toast("Reset link sent", {
                        description: `Check ${email.trim() || "your inbox"} for instructions.`,
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <InputGroup>
                  <InputGroupAddon>
                    <LockIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!credErrors.password}
                    aria-describedby={
                      credErrors.password ? "login-password-error" : undefined
                    }
                    disabled={submitting}
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
                        <EyeOffIcon aria-hidden="true" />
                      ) : (
                        <EyeIcon aria-hidden="true" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError id="login-password-error">
                  {credErrors.password}
                </FieldError>
              </Field>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="login-remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label htmlFor="login-remember" className="font-normal">
                  Remember this device for 30 days
                </Label>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Spinner aria-hidden="true" />
                    Checking credentials…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>

              <FieldDescription className="text-center text-xs">
                Demo password: {DEMO_PASSWORD}
              </FieldDescription>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      {/* Step 2: OTP, stacked above the login dialog */}
      <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
        <DialogContent
          className="sm:max-w-sm"
          showCloseButton={!verifying}
          onInteractOutside={(e) => {
            if (verifying) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (verifying) e.preventDefault();
          }}
        >
          <DialogHeader>
            <div
              aria-hidden="true"
              className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-muted sm:mx-0"
            >
              <SmartphoneIcon className="size-5" />
            </div>
            <DialogTitle>Enter your verification code</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to the phone ending in 42. It expires in 10
              minutes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOtpSubmit} noValidate>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!otpError}>
                <FieldLabel htmlFor="login-otp" className="sr-only">
                  6-digit verification code
                </FieldLabel>
                <div className="flex justify-center sm:justify-start">
                  <InputOTP
                    id="login-otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      if (otpError) setOtpError(null);
                    }}
                    onComplete={(v) => void verifyCode(v)}
                    disabled={verifying || locked}
                    aria-invalid={!!otpError}
                    aria-describedby={otpError ? "login-otp-error" : undefined}
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
                </div>
                <FieldError id="login-otp-error">{otpError}</FieldError>
              </Field>

              <Button
                type="submit"
                disabled={verifying || locked || otp.length < 6}
                className="w-full"
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

              <div className="flex flex-col items-center justify-between gap-2 text-sm sm:flex-row">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={verifying}
                  onClick={() => handleOtpOpenChange(false)}
                >
                  <ArrowLeftIcon aria-hidden="true" />
                  Back
                </Button>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  disabled={cooldown > 0 || verifying}
                  onClick={handleResend}
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </Button>
              </div>
            </FieldGroup>
          </form>

          <DialogFooter className="sm:justify-start">
            <p className="text-xs text-muted-foreground">
              Demo code: {DEMO_OTP}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

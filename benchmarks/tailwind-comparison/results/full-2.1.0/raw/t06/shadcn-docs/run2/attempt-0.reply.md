Now I'll write the page.

```tsx
"use client";

import * as React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
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
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Demo credentials (placeholder, no network involved).
const DEMO_PASSWORD = "correct-horse";
const DEMO_OTP = "482913";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const DEFAULT_EMAIL = "amara.okafor@northwind.example";

type Session = { email: string; name: string };

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return "Member";
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>(null);

  // Login step state
  const [email, setEmail] = React.useState(DEFAULT_EMAIL);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loginPending, setLoginPending] = React.useState(false);

  // OTP step state
  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpPending, setOtpPending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const passwordRef = React.useRef<HTMLInputElement>(null);

  // Resend cooldown ticker
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function resetAll() {
    setPassword("");
    setShowPassword(false);
    setLoginError(null);
    setLoginPending(false);
    setOtp("");
    setOtpError(null);
    setOtpPending(false);
    setCooldown(0);
  }

  function handleLoginOpenChange(next: boolean) {
    setLoginOpen(next);
    if (!next) {
      setOtpOpen(false);
      resetAll();
    }
  }

  function handleOtpOpenChange(next: boolean) {
    setOtpOpen(next);
    if (!next) {
      setOtp("");
      setOtpError(null);
      setOtpPending(false);
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginPending) return;
    setLoginError(null);
    setLoginPending(true);
    await sleep(800);
    setLoginPending(false);

    if (password !== DEMO_PASSWORD) {
      setLoginError("That email and password don’t match. Please try again.");
      passwordRef.current?.focus();
      return;
    }

    setOtp("");
    setOtpError(null);
    setCooldown(RESEND_SECONDS);
    setOtpOpen(true);
    toast.info("Verification code sent", {
      description: `We texted a 6-digit code to the phone ending in 42.`,
    });
  }

  async function verifyOtp(code: string) {
    if (otpPending) return;
    setOtpError(null);
    setOtpPending(true);
    await sleep(700);
    setOtpPending(false);

    if (code !== DEMO_OTP) {
      setOtpError("That code is incorrect or has expired. Try again.");
      setOtp("");
      return;
    }

    const name = nameFromEmail(email);
    setSession({ email, name });
    setOtpOpen(false);
    setLoginOpen(false);
    resetAll();
    toast.success(`Welcome back, ${name.split(" ")[0]}`, {
      description: "You’re signed in on this device.",
    });
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    void verifyOtp(otp);
  }

  function handleResend() {
    if (cooldown > 0) return;
    setOtp("");
    setOtpError(null);
    setCooldown(RESEND_SECONDS);
    toast.success("New code sent", {
      description: "It may take a few seconds to arrive.",
    });
  }

  function handleSignOut() {
    setSession(null);
    toast("Signed out", { description: "See you next time." });
  }

  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheckIcon className="size-4" aria-hidden="true" />
            </span>
            Northwind Ledger
          </div>
          {session ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm leading-tight sm:block">
                <p className="font-medium">{session.name}</p>
                <p className="text-muted-foreground">{session.email}</p>
              </div>
              <Avatar>
                <AvatarFallback>{initials(session.name)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOutIcon aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setLoginOpen(true)}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-20">
        {session ? (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-xl">
                Good to see you, {session.name.split(" ")[0]}
              </CardTitle>
              <CardDescription>
                Two-step verification is on. Your last sign-in was from Chrome
                on macOS, Lisbon, Portugal.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Open invoices</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">14</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Outstanding balance
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  $12,480.50
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LockKeyholeIcon className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Your books, protected by two-step sign-in
              </h1>
              <p className="text-pretty text-muted-foreground">
                Sign in with your password, then confirm with a one-time code
                sent to your phone. It takes about ten seconds and keeps your
                invoices and payouts safe.
              </p>
            </div>
            <Button size="lg" onClick={() => setLoginOpen(true)}>
              Sign in to your account
            </Button>
            <p className="text-sm text-muted-foreground">
              Demo: password{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {DEMO_PASSWORD}
              </code>
              , code{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {DEMO_OTP}
              </code>
            </p>
          </div>
        )}
      </section>

      {/* Step 1: password */}
      <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in</DialogTitle>
            <DialogDescription>
              Enter your work email and password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLoginSubmit} noValidate>
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <MailIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loginPending}
                  />
                </InputGroup>
              </Field>

              <Field data-invalid={loginError ? true : undefined}>
                <div className="flex items-center justify-between gap-2">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <button
                    type="button"
                    className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    onClick={() =>
                      toast("Password reset", {
                        description: `We’ve emailed reset steps to ${maskEmail(email)}.`,
                      })
                    }
                  >
                    Forgot password?
                  </button>
                </div>
                <InputGroup>
                  <InputGroupAddon>
                    <LockKeyholeIcon aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-password"
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    disabled={loginPending}
                    aria-invalid={loginError ? true : undefined}
                    aria-describedby={
                      loginError ? "login-error" : undefined
                    }
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
                {loginError ? (
                  <FieldError id="login-error">{loginError}</FieldError>
                ) : null}
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={loginPending || !email || !password}
              >
                {loginPending ? (
                  <>
                    <Spinner aria-hidden="true" />
                    Checking…
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>

      {/* Step 2: OTP, stacked on top of the login dialog */}
      <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
        <DialogContent
          className="sm:max-w-sm"
          showCloseButton={!otpPending}
          onInteractOutside={(e) => {
            if (otpPending) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (otpPending) e.preventDefault();
          }}
        >
          <DialogHeader className="items-center text-center sm:text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SmartphoneIcon className="size-5" aria-hidden="true" />
            </span>
            <DialogTitle>Enter verification code</DialogTitle>
            <DialogDescription>
              We sent a 6-digit code to the phone ending in 42 for{" "}
              <span className="font-medium text-foreground">
                {maskEmail(email)}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleOtpSubmit}
            className="flex flex-col items-center gap-4"
            noValidate
          >
            <Field
              className="items-center"
              data-invalid={otpError ? true : undefined}
            >
              <FieldLabel htmlFor="otp-code" className="sr-only">
                6-digit verification code
              </FieldLabel>
              <InputOTP
                id="otp-code"
                maxLength={OTP_LENGTH}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={otp}
                disabled={otpPending}
                onChange={(value) => {
                  setOtp(value);
                  if (otpError) setOtpError(null);
                }}
                onComplete={(value) => void verifyOtp(value)}
                aria-invalid={otpError ? true : undefined}
                aria-describedby={otpError ? "otp-error" : "otp-hint"}
                containerClassName="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                  <InputOTPSlot
                    index={1}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                  <InputOTPSlot
                    index={2}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                  <InputOTPSlot
                    index={4}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                  <InputOTPSlot
                    index={5}
                    aria-invalid={otpError ? true : undefined}
                    className="size-10 sm:size-11"
                  />
                </InputOTPGroup>
              </InputOTP>
              {otpError ? (
                <FieldError id="otp-error" className="text-center">
                  {otpError}
                </FieldError>
              ) : (
                <FieldDescription id="otp-hint" className="text-center">
                  The code expires in 10 minutes.
                </FieldDescription>
              )}
            </Field>

            <Button
              type="submit"
              className="w-full"
              disabled={otpPending || otp.length < OTP_LENGTH}
            >
              {otpPending ? (
                <>
                  <Spinner aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify and sign in"
              )}
            </Button>
          </form>

          <DialogFooter className="items-center sm:flex-col sm:items-center sm:justify-center">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Didn’t get a code?{" "}
              {cooldown > 0 ? (
                <span className="tabular-nums">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={otpPending}
                  className="rounded-sm font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
                >
                  Resend code
                </button>
              )}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={otpPending}
              onClick={() => handleOtpOpenChange(false)}
            >
              <ArrowLeftIcon aria-hidden="true" />
              Back to password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
```
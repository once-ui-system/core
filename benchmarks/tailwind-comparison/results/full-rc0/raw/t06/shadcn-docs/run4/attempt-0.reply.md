```tsx
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

/* ------------------------------------------------------------------ */
/* Placeholder data (simulated backend)                               */
/* ------------------------------------------------------------------ */

const DEMO_ACCOUNT = {
  name: "Maya Chen",
  email: "maya.chen@northwind.example",
  password: "correct-horse-9",
  otp: "482916",
  phoneTail: "•• 4821",
};

const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3;
const RESEND_SECONDS = 30;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginErrors = { email?: string; password?: string; form?: string };

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  // Login step
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginErrors, setLoginErrors] = React.useState<LoginErrors>({});
  const [loginPending, setLoginPending] = React.useState(false);

  // OTP step
  const [code, setCode] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpPending, setOtpPending] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [resendIn, setResendIn] = React.useState(0);

  const locked = attempts >= MAX_OTP_ATTEMPTS;

  // Resend countdown
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  function resetOtp() {
    setCode("");
    setOtpError(null);
    setAttempts(0);
    setOtpPending(false);
    setResendIn(0);
  }

  function resetLogin() {
    setPassword("");
    setShowPassword(false);
    setLoginErrors({});
    setLoginPending(false);
  }

  function handleLoginOpenChange(next: boolean) {
    setLoginOpen(next);
    if (!next) {
      // Closing the login dialog also tears down the stacked OTP dialog.
      setOtpOpen(false);
      resetLogin();
      resetOtp();
    }
  }

  function handleOtpOpenChange(next: boolean) {
    setOtpOpen(next);
    if (!next) resetOtp();
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginPending) return;

    const errors: LoginErrors = {};
    if (!email.trim()) errors.email = "Enter your work email.";
    else if (!EMAIL_PATTERN.test(email.trim()))
      errors.email = "That doesn't look like a valid email address.";
    if (!password) errors.password = "Enter your password.";
    else if (password.length < 8)
      errors.password = "Passwords are at least 8 characters.";

    if (errors.email || errors.password) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginPending(true);
    await wait(900);

    const ok =
      email.trim().toLowerCase() === DEMO_ACCOUNT.email &&
      password === DEMO_ACCOUNT.password;

    setLoginPending(false);

    if (!ok) {
      setLoginErrors({
        form: "The email or password is incorrect. Check your details and try again.",
      });
      return;
    }

    // Password accepted: stack the OTP dialog on top of the login dialog.
    resetOtp();
    setResendIn(RESEND_SECONDS);
    setOtpOpen(true);
  }

  async function verifyCode(value: string) {
    if (otpPending || locked) return;
    setOtpPending(true);
    setOtpError(null);
    await wait(800);

    if (value === DEMO_ACCOUNT.otp) {
      setOtpPending(false);
      setOtpOpen(false);
      setLoginOpen(false);
      resetOtp();
      resetLogin();
      setSignedIn(true);
      toast.success(`Welcome back, ${DEMO_ACCOUNT.name.split(" ")[0]}`, {
        description: "You're signed in on this device.",
      });
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setOtpPending(false);
    setCode("");
    setOtpError(
      nextAttempts >= MAX_OTP_ATTEMPTS
        ? "Too many incorrect codes. Go back and sign in again to get a new code."
        : `That code isn't right. ${MAX_OTP_ATTEMPTS - nextAttempts} ${
            MAX_OTP_ATTEMPTS - nextAttempts === 1 ? "attempt" : "attempts"
          } left.`,
    );
  }

  function handleOtpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    void verifyCode(code);
  }

  function handleResend() {
    if (resendIn > 0 || locked) return;
    setCode("");
    setOtpError(null);
    setResendIn(RESEND_SECONDS);
    toast("New code sent", {
      description: `We texted a new 6-digit code to ${DEMO_ACCOUNT.phoneTail}.`,
    });
  }

  function handleSignOut() {
    setSignedIn(false);
    setEmail("");
    toast("Signed out", { description: "See you next time." });
  }

  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      {/* Top bar */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <ShieldCheckIcon className="size-4" />
            </span>
            Northwind Console
          </div>
          {signedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOutIcon />
              Sign out
            </Button>
          ) : null}
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-12 sm:px-6">
        {signedIn ? (
          <SignedInPanel />
        ) : (
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center">
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            >
              <LockIcon className="size-6" />
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Sign in to your workspace
              </h1>
              <p className="text-pretty text-muted-foreground">
                Billing, deployments and team access for Northwind, all in one
                place. Accounts are protected with a password and a one-time
                code sent to your phone.
              </p>
            </div>

            <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <KeyRoundIcon />
                  Sign in
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Welcome back</DialogTitle>
                  <DialogDescription>
                    Sign in with your work email and password. We&apos;ll ask
                    for a verification code next.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleLogin} noValidate className="grid gap-5">
                  {loginErrors.form ? (
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
                      <AlertDescription>{loginErrors.form}</AlertDescription>
                    </Alert>
                  ) : null}

                  <FieldGroup className="gap-5">
                    <Field data-invalid={!!loginErrors.email}>
                      <FieldLabel htmlFor="login-email">Work email</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <MailIcon aria-hidden="true" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="login-email"
                          name="email"
                          type="email"
                          inputMode="email"
                          autoComplete="username"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          aria-invalid={!!loginErrors.email}
                          aria-describedby={
                            loginErrors.email ? "login-email-error" : undefined
                          }
                          disabled={loginPending}
                        />
                      </InputGroup>
                      <FieldError id="login-email-error">
                        {loginErrors.email}
                      </FieldError>
                    </Field>

                    <Field data-invalid={!!loginErrors.password}>
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <LockIcon aria-hidden="true" />
                        </InputGroupAddon>
                        <InputGroupInput
                          id="login-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          aria-invalid={!!loginErrors.password}
                          aria-describedby={
                            loginErrors.password
                              ? "login-password-error"
                              : undefined
                          }
                          disabled={loginPending}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            size="icon-xs"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword((v) => !v)}
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError id="login-password-error">
                        {loginErrors.password}
                      </FieldError>
                    </Field>

                    <Field orientation="horizontal">
                      <Checkbox
                        id="login-remember"
                        checked={remember}
                        onCheckedChange={(v) => setRemember(v === true)}
                      />
                      <FieldLabel
                        htmlFor="login-remember"
                        className="font-normal"
                      >
                        Keep me signed in on this device
                      </FieldLabel>
                    </Field>
                  </FieldGroup>

                  <Button type="submit" disabled={loginPending}>
                    {loginPending ? <Spinner /> : null}
                    {loginPending ? "Checking details…" : "Continue"}
                  </Button>

                  <p className="rounded-md border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Demo account:
                    </span>{" "}
                    <span className="break-all">{DEMO_ACCOUNT.email}</span>{" "}
                    with password{" "}
                    <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                      {DEMO_ACCOUNT.password}
                    </code>
                  </p>
                </form>

                {/* Stacked OTP dialog (nested inside the login dialog) */}
                <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
                  <DialogContent
                    className="sm:max-w-sm"
                    onInteractOutside={(e) => {
                      if (otpPending) e.preventDefault();
                    }}
                    onEscapeKeyDown={(e) => {
                      if (otpPending) e.preventDefault();
                    }}
                  >
                    <DialogHeader>
                      <span
                        aria-hidden="true"
                        className="mb-1 flex size-10 items-center justify-center self-center rounded-full bg-primary/10 text-primary sm:self-start"
                      >
                        <SmartphoneIcon className="size-5" />
                      </span>
                      <DialogTitle>Verify it&apos;s you</DialogTitle>
                      <DialogDescription>
                        Enter the {OTP_LENGTH}-digit code we texted to{" "}
                        <span className="font-medium text-foreground">
                          {DEMO_ACCOUNT.phoneTail}
                        </span>
                        . It expires in 10 minutes.
                      </DialogDescription>
                    </DialogHeader>

                    <form
                      onSubmit={handleOtpSubmit}
                      noValidate
                      className="grid gap-5"
                    >
                      <Field data-invalid={!!otpError}>
                        <FieldLabel htmlFor="otp-input" className="sr-only">
                          Verification code
                        </FieldLabel>
                        <div className="flex justify-center">
                          <InputOTP
                            id="otp-input"
                            maxLength={OTP_LENGTH}
                            value={code}
                            onChange={(v) => {
                              setCode(v);
                              if (otpError && !locked) setOtpError(null);
                            }}
                            onComplete={(v) => void verifyCode(v)}
                            disabled={otpPending || locked}
                            autoFocus
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            pattern="^[0-9]*$"
                            aria-invalid={!!otpError}
                            aria-describedby={
                              otpError ? "otp-error" : "otp-hint"
                            }
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
                        {otpError ? (
                          <FieldError id="otp-error" className="text-center">
                            {otpError}
                          </FieldError>
                        ) : (
                          <FieldDescription
                            id="otp-hint"
                            className="text-center"
                          >
                            Demo code:{" "}
                            <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                              {DEMO_ACCOUNT.otp}
                            </code>
                          </FieldDescription>
                        )}
                      </Field>

                      <Button
                        type="submit"
                        disabled={otpPending || locked || code.length === 0}
                      >
                        {otpPending ? <Spinner /> : <CheckCircle2Icon />}
                        {otpPending ? "Verifying…" : "Verify and sign in"}
                      </Button>
                    </form>

                    <DialogFooter className="items-center gap-1 sm:justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOtpOpenChange(false)}
                        disabled={otpPending}
                      >
                        Back to password
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleResend}
                        disabled={resendIn > 0 || otpPending || locked}
                      >
                        {resendIn > 0
                          ? `Resend code in ${resendIn}s`
                          : "Resend code"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Signed-in view                                                     */
/* ------------------------------------------------------------------ */

const RECENT_ACTIVITY = [
  { id: "a1", label: "Production deploy succeeded", time: "12 minutes ago" },
  { id: "a2", label: "Invoice INV-2048 paid", time: "Today, 9:41 AM" },
  { id: "a3", label: "Dana Okafor joined the Platform team", time: "Yesterday" },
];

function SignedInPanel() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          <CheckCircle2Icon className="size-3.5 text-primary" />
          Verified with one-time code
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          Good to see you, {DEMO_ACCOUNT.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Signed in as{" "}
          <span className="break-all font-medium text-foreground">
            {DEMO_ACCOUNT.email}
          </span>
        </p>
      </div>

      <div className="rounded-xl border bg-background">
        <h2 className="border-b px-4 py-3 text-sm font-medium sm:px-6">
          Recent activity
        </h2>
        <ul className="divide-y">
          {RECENT_ACTIVITY.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```
"use client";

import * as React from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  EyeIcon,
  EyeOffIcon,
  LockKeyholeIcon,
  MailIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { cn } from "@/lib/utils";

/* ----------------------------- Demo constants ----------------------------- */

const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "hunter2024";
const DEMO_CODE = "424242";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 5;

const HIGHLIGHTS = [
  {
    title: "Encrypted at rest",
    body: "Every project file and export is encrypted with per-workspace keys.",
  },
  {
    title: "Two-step verification",
    body: "A one-time code from your authenticator protects every sign-in.",
  },
  {
    title: "Audit-ready history",
    body: "Review sign-ins, device approvals and permission changes at any time.",
  },
] as const;

const RECENT_ACTIVITY = [
  { id: "a1", label: "Q3 roadmap review", meta: "Edited 12 minutes ago" },
  { id: "a2", label: "Vendor onboarding checklist", meta: "Shared yesterday" },
  { id: "a3", label: "Design tokens audit", meta: "Commented 2 days ago" },
] as const;

/* ------------------------------- Helpers ---------------------------------- */

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 2)}${"•".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

type LoginErrors = { email?: string; password?: string; form?: string };

/* --------------------------------- Page ----------------------------------- */

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [signedIn, setSignedIn] = React.useState(false);

  // Login step state
  const [email, setEmail] = React.useState(DEMO_EMAIL);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loginErrors, setLoginErrors] = React.useState<LoginErrors>({});
  const [loginPending, setLoginPending] = React.useState(false);

  // OTP step state
  const [code, setCode] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpPending, setOtpPending] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);

  const emailId = React.useId();
  const passwordId = React.useId();
  const otpId = React.useId();
  const otpErrorId = React.useId();

  /* Resend countdown, only ticking while the OTP dialog is open. */
  React.useEffect(() => {
    if (!otpOpen || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpOpen, resendIn]);

  const resetOtp = React.useCallback(() => {
    setCode("");
    setOtpError(null);
    setOtpPending(false);
    setAttempts(0);
    setResendIn(RESEND_SECONDS);
  }, []);

  const handleLoginOpenChange = (open: boolean) => {
    // Ignore close requests while a request is in flight.
    if (!open && loginPending) return;
    setLoginOpen(open);
    if (!open) {
      setOtpOpen(false);
      setPassword("");
      setShowPassword(false);
      setLoginErrors({});
      resetOtp();
    }
  };

  const handleOtpOpenChange = (open: boolean) => {
    if (!open && otpPending) return;
    setOtpOpen(open);
    if (!open) resetOtp();
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginPending) return;

    const errors: LoginErrors = {};
    const trimmed = email.trim();
    if (!trimmed) errors.email = "Enter your work email.";
    else if (!/^\S+@\S+\.\S+$/.test(trimmed))
      errors.email = "Enter a valid email address, like name@company.com.";
    if (!password) errors.password = "Enter your password.";

    if (errors.email || errors.password) {
      setLoginErrors(errors);
      return;
    }

    setLoginErrors({});
    setLoginPending(true);
    await wait(900);
    setLoginPending(false);

    if (password !== DEMO_PASSWORD) {
      setLoginErrors({
        form: "That email and password combination doesn’t match our records.",
      });
      return;
    }

    resetOtp();
    setOtpOpen(true);
  };

  const verifyCode = React.useCallback(
    async (value: string) => {
      setOtpPending(true);
      setOtpError(null);
      await wait(800);

      if (value === DEMO_CODE) {
        setOtpPending(false);
        setOtpOpen(false);
        setLoginOpen(false);
        setPassword("");
        setSignedIn(true);
        resetOtp();
        toast.success("Signed in", {
          description: `Welcome back, Maya. Signed in as ${email.trim()}.`,
        });
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setOtpPending(false);
      setCode("");
      setOtpError(
        nextAttempts >= MAX_OTP_ATTEMPTS
          ? "Too many incorrect codes. Request a new code to keep going."
          : `That code isn’t right. ${MAX_OTP_ATTEMPTS - nextAttempts} ${
              MAX_OTP_ATTEMPTS - nextAttempts === 1 ? "attempt" : "attempts"
            } left.`,
      );
    },
    [attempts, email, resetOtp],
  );

  const handleOtpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otpPending || code.length !== OTP_LENGTH) return;
    void verifyCode(code);
  };

  const handleResend = () => {
    if (resendIn > 0 || otpPending) return;
    setCode("");
    setOtpError(null);
    setAttempts(0);
    setResendIn(RESEND_SECONDS);
    toast.info("New code sent", {
      description: `We sent a fresh 6-digit code to ${maskEmail(email.trim())}.`,
    });
  };

  const handleSignOut = () => {
    setSignedIn(false);
    toast("Signed out", { description: "You have been signed out safely." });
  };

  const lockedOut = attempts >= MAX_OTP_ATTEMPTS;

  return (
    <main className="min-h-dvh bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <ShieldCheckIcon className="size-4" />
            </span>
            Northwind Workspace
          </div>

          {signedIn ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          ) : (
            <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
              <DialogTrigger asChild>
                <Button size="sm">Sign in</Button>
              </DialogTrigger>
              <LoginDialogBody
                otpOpen={otpOpen}
                onOtpOpenChange={handleOtpOpenChange}
                emailId={emailId}
                passwordId={passwordId}
                otpId={otpId}
                otpErrorId={otpErrorId}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                remember={remember}
                setRemember={setRemember}
                loginErrors={loginErrors}
                loginPending={loginPending}
                onLogin={handleLogin}
                code={code}
                setCode={setCode}
                otpError={otpError}
                otpPending={otpPending}
                lockedOut={lockedOut}
                resendIn={resendIn}
                onOtpSubmit={handleOtpSubmit}
                onVerify={verifyCode}
                onResend={handleResend}
              />
            </Dialog>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {signedIn ? (
          <section aria-labelledby="dash-title" className="grid gap-6">
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2Icon className="size-4" aria-hidden="true" />
                Verified sign-in
              </p>
              <h1
                id="dash-title"
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Welcome back, Maya
              </h1>
              <p className="text-muted-foreground">
                Pick up where you left off in the Product Design workspace.
              </p>
            </div>

            <ul className="grid gap-3">
              {RECENT_ACTIVITY.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-0.5 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.meta}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <section aria-labelledby="hero-title" className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Secure access for your team
                </p>
                <h1
                  id="hero-title"
                  className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
                >
                  Sign in to your workspace
                </h1>
                <p className="max-w-prose text-pretty text-muted-foreground">
                  Use your password, then confirm with a one-time code. It takes
                  a few seconds and keeps your team’s work protected.
                </p>
              </div>

              <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-fit">
                    <LockKeyholeIcon aria-hidden="true" />
                    Continue to sign in
                  </Button>
                </DialogTrigger>
                <LoginDialogBody
                  otpOpen={otpOpen}
                  onOtpOpenChange={handleOtpOpenChange}
                  emailId={`${emailId}-hero`}
                  passwordId={`${passwordId}-hero`}
                  otpId={`${otpId}-hero`}
                  otpErrorId={`${otpErrorId}-hero`}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  remember={remember}
                  setRemember={setRemember}
                  loginErrors={loginErrors}
                  loginPending={loginPending}
                  onLogin={handleLogin}
                  code={code}
                  setCode={setCode}
                  otpError={otpError}
                  otpPending={otpPending}
                  lockedOut={lockedOut}
                  resendIn={resendIn}
                  onOtpSubmit={handleOtpSubmit}
                  onVerify={verifyCode}
                  onResend={handleResend}
                />
              </Dialog>
            </section>

            <section aria-label="Security highlights">
              <ul className="grid gap-3">
                {HIGHLIGHTS.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border bg-background p-4"
                  >
                    <h2 className="font-medium">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

/* ------------------------- Stacked dialog contents ------------------------ */

type LoginDialogBodyProps = {
  otpOpen: boolean;
  onOtpOpenChange: (open: boolean) => void;
  emailId: string;
  passwordId: string;
  otpId: string;
  otpErrorId: string;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  remember: boolean;
  setRemember: (v: boolean) => void;
  loginErrors: LoginErrors;
  loginPending: boolean;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => void;
  code: string;
  setCode: (v: string) => void;
  otpError: string | null;
  otpPending: boolean;
  lockedOut: boolean;
  resendIn: number;
  onOtpSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onVerify: (value: string) => Promise<void>;
  onResend: () => void;
};

function LoginDialogBody(props: LoginDialogBodyProps) {
  const {
    otpOpen,
    onOtpOpenChange,
    emailId,
    passwordId,
    otpId,
    otpErrorId,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    remember,
    setRemember,
    loginErrors,
    loginPending,
    onLogin,
    code,
    setCode,
    otpError,
    otpPending,
    lockedOut,
    resendIn,
    onOtpSubmit,
    onVerify,
    onResend,
  } = props;

  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;

  return (
    <DialogContent
      className={cn(
        "transition-[transform,opacity,filter] duration-300 sm:max-w-md",
        // Parent dialog recedes while the OTP dialog is stacked on top.
        otpOpen &&
          "pointer-events-none scale-[0.96] opacity-60 brightness-95 data-[state=open]:zoom-in-100",
      )}
      onInteractOutside={(e) => {
        if (loginPending) e.preventDefault();
      }}
      onEscapeKeyDown={(e) => {
        if (loginPending) e.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>Sign in</DialogTitle>
        <DialogDescription>
          Enter your work email and password to continue.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={onLogin} noValidate className="grid gap-5">
        {loginErrors.form ? (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Couldn’t sign you in</AlertTitle>
            <AlertDescription>{loginErrors.form}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-5">
          <Field data-invalid={loginErrors.email ? true : undefined}>
            <FieldLabel htmlFor={emailId}>Work email</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <MailIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={emailId}
                type="email"
                name="email"
                autoComplete="username"
                inputMode="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={loginErrors.email ? true : undefined}
                aria-describedby={loginErrors.email ? emailErrorId : undefined}
                disabled={loginPending}
              />
            </InputGroup>
            {loginErrors.email ? (
              <FieldError id={emailErrorId}>{loginErrors.email}</FieldError>
            ) : null}
          </Field>

          <Field data-invalid={loginErrors.password ? true : undefined}>
            <FieldLabel htmlFor={passwordId}>Password</FieldLabel>
            <InputGroup>
              <InputGroupAddon>
                <LockKeyholeIcon aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id={passwordId}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={loginErrors.password ? true : undefined}
                aria-describedby={
                  loginErrors.password ? passwordErrorId : undefined
                }
                disabled={loginPending}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOffIcon aria-hidden="true" />
                  ) : (
                    <EyeIcon aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {loginErrors.password ? (
              <FieldError id={passwordErrorId}>{loginErrors.password}</FieldError>
            ) : (
              <FieldDescription>
                Demo password: <code className="font-mono">{DEMO_PASSWORD}</code>
              </FieldDescription>
            )}
          </Field>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${emailId}-remember`}
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
                disabled={loginPending}
              />
              <label
                htmlFor={`${emailId}-remember`}
                className="text-sm leading-none select-none"
              >
                Remember this device
              </label>
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0"
              onClick={() =>
                toast.info("Reset link sent", {
                  description: "Check your inbox for password reset steps.",
                })
              }
            >
              Forgot password?
            </Button>
          </div>
        </FieldGroup>

        <Button type="submit" disabled={loginPending} className="w-full">
          {loginPending ? (
            <>
              <Spinner aria-hidden="true" />
              Checking credentials…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>

      {/* Stacked OTP dialog, nested so focus trapping and Escape nest correctly. */}
      <Dialog open={otpOpen} onOpenChange={onOtpOpenChange}>
        <DialogContent
          showCloseButton={!otpPending}
          className="z-[60] sm:max-w-sm"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (otpPending) e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            // Focus the OTP input itself.
            e.preventDefault();
            const el = (e.currentTarget as HTMLElement).querySelector<HTMLInputElement>(
              "input[data-input-otp]",
            );
            el?.focus();
          }}
        >
          <DialogHeader>
            <span
              aria-hidden="true"
              className="mx-auto mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0"
            >
              <ShieldCheckIcon className="size-5" />
            </span>
            <DialogTitle>Two-step verification</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code we sent to{" "}
              <span className="font-medium text-foreground">
                {maskEmail(email.trim())}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onOtpSubmit} className="grid gap-5">
            <Field data-invalid={otpError ? true : undefined}>
              <FieldLabel htmlFor={otpId} className="sr-only">
                Verification code
              </FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  id={otpId}
                  maxLength={OTP_LENGTH}
                  pattern={REGEXP_ONLY_DIGITS}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (otpError) {
                      // Clear stale error as soon as the user edits.
                    }
                  }}
                  onComplete={(v) => {
                    if (!otpPending && !lockedOut) void onVerify(v);
                  }}
                  disabled={otpPending || lockedOut}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? otpErrorId : `${otpId}-hint`}
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

              <div aria-live="polite" className="min-h-5 text-center">
                {otpError ? (
                  <FieldError id={otpErrorId} className="text-center">
                    {otpError}
                  </FieldError>
                ) : otpPending ? (
                  <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Spinner aria-hidden="true" />
                    Verifying code…
                  </p>
                ) : (
                  <FieldDescription
                    id={`${otpId}-hint`}
                    className="text-center"
                  >
                    Demo code: <code className="font-mono">{DEMO_CODE}</code>
                  </FieldDescription>
                )}
              </div>
            </Field>

            <Button
              type="submit"
              disabled={otpPending || lockedOut || code.length !== OTP_LENGTH}
              className="w-full"
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

            <div className="flex flex-col-reverse items-center justify-between gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={otpPending}
                onClick={() => onOtpOpenChange(false)}
              >
                <ArrowLeftIcon aria-hidden="true" />
                Back to password
              </Button>
              <Button
                type="button"
                variant="link"
                size="sm"
                disabled={resendIn > 0 || otpPending}
                onClick={onResend}
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
}

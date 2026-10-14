Now I'll write the page.

```tsx
"use client";

import * as React from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* ------------------------------------------------------------------ */
/* Demo data (all simulated, nothing leaves the browser)               */
/* ------------------------------------------------------------------ */

const DEMO_EMAIL = "maya.okafor@northwind.dev";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_OTP = "482913";
const RESEND_SECONDS = 30;
const OTP_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}

type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};

type Session = {
  email: string;
  name: string;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [otpOpen, setOtpOpen] = React.useState(false);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<LoginErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [otp, setOtp] = React.useState("");
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const [attempts, setAttempts] = React.useState(0);

  const [session, setSession] = React.useState<Session | null>(null);

  const emailId = React.useId();
  const passwordId = React.useId();
  const emailErrorId = `${emailId}-error`;
  const passwordErrorId = `${passwordId}-error`;
  const rememberId = React.useId();
  const otpErrorId = React.useId();

  /* Resend countdown, only ticks while the OTP dialog is open. */
  React.useEffect(() => {
    if (!otpOpen || resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpOpen, resendIn]);

  const resetAll = React.useCallback(() => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
    setSubmitting(false);
    setOtp("");
    setOtpError(null);
    setVerifying(false);
    setResendIn(RESEND_SECONDS);
    setAttempts(0);
  }, []);

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
      setVerifying(false);
    }
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: LoginErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = "Enter your work email address.";
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = "That doesn't look like a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (password.length < 8) {
      nextErrors.password = "Passwords are at least 8 characters long.";
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await wait(900);

    if (
      trimmedEmail.toLowerCase() !== DEMO_EMAIL ||
      password !== DEMO_PASSWORD
    ) {
      setSubmitting(false);
      setErrors({
        form: "The email or password you entered is incorrect. Check them and try again.",
      });
      return;
    }

    setSubmitting(false);
    setOtp("");
    setOtpError(null);
    setAttempts(0);
    setResendIn(RESEND_SECONDS);
    setOtpOpen(true);
  }

  async function verifyOtp(code: string) {
    if (verifying) return;
    if (code.length !== OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your verification code.");
      return;
    }

    setOtpError(null);
    setVerifying(true);
    await wait(800);

    if (code !== DEMO_OTP) {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setVerifying(false);
      setOtp("");
      setOtpError(
        nextAttempts >= 3
          ? "Too many incorrect codes. Request a new code to continue."
          : `That code is incorrect. You have ${3 - nextAttempts} ${
              3 - nextAttempts === 1 ? "attempt" : "attempts"
            } left.`,
      );
      return;
    }

    setVerifying(false);
    setSession({ email: DEMO_EMAIL, name: "Maya Okafor" });
    setOtpOpen(false);
    setLoginOpen(false);
    resetAll();
    toast.success("You're signed in", {
      description: "Two-step verification completed successfully.",
    });
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setAttempts(0);
    setOtp("");
    setOtpError(null);
    toast("New code sent", {
      description: `We emailed a fresh code to ${maskEmail(DEMO_EMAIL)}.`,
    });
  }

  function handleSignOut() {
    setSession(null);
    toast("Signed out", { description: "See you next time, Maya." });
  }

  const lockedOut = attempts >= 3;

  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <ShieldCheck className="size-4" />
            </span>
            Northwind Console
          </div>

          {session ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut />
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
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-20">
        {session ? (
          <SignedInView session={session} />
        ) : (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <Badge variant="secondary">Two-step verification enabled</Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Manage your deployments, billing and team in one place
            </h1>
            <p className="text-base text-pretty text-muted-foreground">
              Sign in with your password, then confirm it&apos;s you with a
              one-time code sent to your email. Your session stays protected
              even if your password leaks.
            </p>

            <Dialog open={loginOpen} onOpenChange={handleLoginOpenChange}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto">
                  Sign in to your account
                </Button>
              </DialogTrigger>

              <DialogContent
                data-stacked={otpOpen ? "true" : "false"}
                className="max-h-[calc(100svh-2rem)] gap-6 overflow-y-auto text-left transition-[transform,opacity,filter] duration-300 data-[stacked=true]:pointer-events-none data-[stacked=true]:scale-[0.96] data-[stacked=true]:opacity-60 data-[stacked=true]:blur-[1px] sm:max-w-md"
              >
                <DialogHeader>
                  <DialogTitle>Welcome back</DialogTitle>
                  <DialogDescription>
                    Sign in to your Northwind account to continue.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleLoginSubmit}
                  noValidate
                  className="grid gap-4"
                  aria-describedby={errors.form ? "login-form-error" : undefined}
                >
                  {errors.form ? (
                    <Alert variant="destructive" id="login-form-error">
                      <AlertCircle />
                      <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
                      <AlertDescription>{errors.form}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="grid gap-2">
                    <Label htmlFor={emailId}>Email</Label>
                    <Input
                      id={emailId}
                      type="email"
                      name="email"
                      autoComplete="username"
                      inputMode="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? emailErrorId : undefined}
                      disabled={submitting}
                    />
                    {errors.email ? (
                      <p
                        id={emailErrorId}
                        className="text-sm text-destructive"
                      >
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={passwordId}>Password</Label>
                      <button
                        type="button"
                        className="rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        onClick={() =>
                          toast("Reset link sent", {
                            description:
                              "If an account exists, you'll get an email shortly.",
                          })
                        }
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id={passwordId}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={errors.password ? true : undefined}
                        aria-describedby={
                          errors.password ? passwordErrorId : undefined
                        }
                        disabled={submitting}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-0.5 right-0.5"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                    {errors.password ? (
                      <p
                        id={passwordErrorId}
                        className="text-sm text-destructive"
                      >
                        {errors.password}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={rememberId}
                      checked={remember}
                      onCheckedChange={(v) => setRemember(v === true)}
                    />
                    <Label htmlFor={rememberId} className="font-normal">
                      Keep me signed in on this device
                    </Label>
                  </div>

                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Checking credentials…
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>

                  <p className="rounded-md border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Demo account:
                    </span>{" "}
                    <code className="font-mono">{DEMO_EMAIL}</code> /{" "}
                    <code className="font-mono">{DEMO_PASSWORD}</code>
                  </p>
                </form>

                {/* Stacked OTP dialog, nested so focus and Escape unwind in order. */}
                <Dialog open={otpOpen} onOpenChange={handleOtpOpenChange}>
                  <DialogContent
                    className="gap-6 sm:max-w-md"
                    onOpenAutoFocus={(e) => {
                      // Let the OTP input take focus instead of the close button.
                      e.preventDefault();
                      const input =
                        e.currentTarget instanceof HTMLElement
                          ? e.currentTarget.querySelector<HTMLInputElement>(
                              "input",
                            )
                          : null;
                      input?.focus();
                    }}
                  >
                    <DialogHeader>
                      <div
                        aria-hidden="true"
                        className="mb-1 flex size-10 items-center justify-center rounded-full bg-muted sm:mx-0"
                      >
                        <Mail className="size-5" />
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

                    <form
                      className="grid gap-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void verifyOtp(otp);
                      }}
                    >
                      <div className="grid justify-items-center gap-3 sm:justify-items-start">
                        <Label htmlFor="otp-input">Verification code</Label>
                        <InputOTP
                          id="otp-input"
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
                          disabled={verifying || lockedOut}
                          aria-invalid={otpError ? true : undefined}
                          aria-describedby={otpError ? otpErrorId : undefined}
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

                        <div aria-live="polite" className="min-h-5 text-sm">
                          {otpError ? (
                            <p id={otpErrorId} className="text-destructive">
                              {otpError}
                            </p>
                          ) : verifying ? (
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              Verifying code…
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={verifying || lockedOut || otp.length === 0}
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="animate-spin" />
                            Verifying…
                          </>
                        ) : (
                          "Verify and sign in"
                        )}
                      </Button>

                      <p className="rounded-md border border-dashed bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Demo code:
                        </span>{" "}
                        <code className="font-mono">{DEMO_OTP}</code>
                      </p>
                    </form>

                    <DialogFooter className="items-center sm:justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOtpOpenChange(false)}
                        disabled={verifying}
                      >
                        <ArrowLeft />
                        Back to password
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleResend}
                        disabled={resendIn > 0 || verifying}
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

      <footer className="border-t bg-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
          © 2025 Northwind Labs, Inc. · Protected by two-step verification
        </div>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Signed-in state                                                     */
/* ------------------------------------------------------------------ */

const RECENT_ACTIVITY: { id: string; label: string; time: string }[] = [
  { id: "a1", label: "Deployed api-gateway to production", time: "12 min ago" },
  { id: "a2", label: "Invited priya@northwind.dev to the team", time: "2 hours ago" },
  { id: "a3", label: "Rotated the staging database credentials", time: "Yesterday" },
];

function SignedInView({ session }: { session: Session }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          <CheckCircle2 />
          Verified session
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          Welcome back, {session.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">{session.email}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            What happened in your workspace since your last visit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {RECENT_ACTIVITY.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```
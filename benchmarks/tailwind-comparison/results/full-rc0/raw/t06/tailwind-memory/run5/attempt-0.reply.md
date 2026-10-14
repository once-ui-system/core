```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  X,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* ------------------------------ Placeholder data ------------------------------ */

const DEMO_EMAIL_HINT = "maya.chen@northwind.io";
const DEMO_OTP = "424242";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const FEATURES = [
  {
    icon: BarChart3,
    title: "Live revenue dashboards",
    body: "Track MRR, churn and expansion across every plan without exporting a single spreadsheet.",
  },
  {
    icon: Zap,
    title: "Automated dunning",
    body: "Recover failed payments with smart retries and polite reminders that adapt to each customer.",
  },
  {
    icon: ShieldCheck,
    title: "SOC 2 Type II compliant",
    body: "Role-based access, audit logs and enforced two-step verification for your whole team.",
  },
];

const STATS = [
  { value: "$2.4B", label: "Payments processed" },
  { value: "9,800+", label: "Teams onboarded" },
  { value: "99.99%", label: "Uptime last 12 months" },
];

/* ---------------------------------- Helpers ----------------------------------- */

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 1)}${"•".repeat(Math.max(name.length - 1, 2))}@${domain}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------ Modal (native dialog) ------------------------------ */

type ModalProps = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  /** Visually pushed back because another dialog is stacked on top. */
  receded?: boolean;
  children: ReactNode;
};

function Modal({ open, onClose, labelledBy, describedBy, receded = false, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onCancel={(e) => {
        // Let React state drive closing so both stay in sync.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={[
        "m-auto w-[calc(100%-1.5rem)] max-w-md overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl",
        "backdrop:bg-slate-950/50 backdrop:backdrop-blur-[2px]",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        receded ? "scale-[0.94] opacity-60 -translate-y-4" : "scale-100 opacity-100",
      ].join(" ")}
    >
      {open ? children : null}
    </dialog>
  );
}

/* ----------------------------------- OTP input ----------------------------------- */

type OtpInputProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  autoFocusFirst?: boolean;
};

function OtpInput({ value, onChange, disabled, invalid, describedBy }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };

  const setDigitAt = (i: number, digit: string) => {
    const chars = digits.slice();
    chars[i] = digit;
    onChange(chars.join("").slice(0, OTP_LENGTH));
  };

  const handleChange = (i: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigitAt(i, "");
      return;
    }
    if (cleaned.length === 1) {
      setDigitAt(i, cleaned);
      if (i < OTP_LENGTH - 1) focusAt(i + 1);
      return;
    }
    // Multiple chars (autofill / IME): spread from this index.
    const chars = digits.slice();
    for (let k = 0; k < cleaned.length && i + k < OTP_LENGTH; k++) {
      chars[i + k] = cleaned[k] ?? "";
    }
    onChange(chars.join(""));
    focusAt(Math.min(i + cleaned.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigitAt(i - 1, "");
      focusAt(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div role="group" aria-label="One-time passcode" className="flex justify-between gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          maxLength={OTP_LENGTH}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold tabular-nums text-slate-900 outline-none transition sm:h-14",
            "focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 disabled:bg-slate-100 disabled:text-slate-400",
            invalid ? "border-red-500" : "border-slate-300",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* ----------------------------------- Auth flow ----------------------------------- */

type Step = "closed" | "password" | "otp";

function AuthFlow({
  step,
  setStep,
  onSuccess,
}: {
  step: Step;
  setStep: (s: Step) => void;
  onSuccess: (email: string) => void;
}) {
  const uid = useId();
  const ids = {
    loginTitle: `${uid}-login-title`,
    loginDesc: `${uid}-login-desc`,
    email: `${uid}-email`,
    emailErr: `${uid}-email-err`,
    password: `${uid}-password`,
    passwordErr: `${uid}-password-err`,
    otpTitle: `${uid}-otp-title`,
    otpDesc: `${uid}-otp-desc`,
    otpErr: `${uid}-otp-err`,
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resentNote, setResentNote] = useState(false);

  const timers = useRef<number[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  // Resend countdown while OTP step is visible.
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [step, resendIn]);

  // Focus management when dialogs open.
  useEffect(() => {
    if (step === "password") {
      const t = window.setTimeout(() => emailRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
    if (step === "otp") {
      const t = window.setTimeout(() => {
        document.getElementById(`${uid}-otp-focus`)?.querySelector("input")?.focus();
      }, 30);
      return () => window.clearTimeout(t);
    }
  }, [step, uid]);

  const closeAll = () => {
    setStep("closed");
    // Reset after the close transition.
    schedule(() => {
      setPassword("");
      setOtp("");
      setOtpError("");
      setFieldErrors({});
      setSubmitting(false);
      setVerifying(false);
      setShowPassword(false);
      setResendIn(RESEND_SECONDS);
      setResentNote(false);
    }, 200);
  };

  const submitPassword = (e: FormEvent) => {
    e.preventDefault();
    const errs: { email?: string; password?: string } = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid work email, like name@company.com.";
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    setFieldErrors(errs);
    if (errs.email) {
      emailRef.current?.focus();
      return;
    }
    if (errs.password) {
      document.getElementById(ids.password)?.focus();
      return;
    }
    setSubmitting(true);
    schedule(() => {
      setSubmitting(false);
      setOtp("");
      setOtpError("");
      setResendIn(RESEND_SECONDS);
      setResentNote(false);
      setStep("otp");
    }, 700);
  };

  const verifyOtp = (e?: FormEvent) => {
    e?.preventDefault();
    if (otp.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    setOtpError("");
    setVerifying(true);
    schedule(() => {
      setVerifying(false);
      if (otp === DEMO_OTP) {
        onSuccess(email.trim());
        closeAll();
      } else {
        setOtpError("That code didn’t match. Check your authenticator app and try again.");
        setOtp("");
        document.getElementById(`${uid}-otp-focus`)?.querySelector("input")?.focus();
      }
    }, 800);
  };

  const resend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setResentNote(true);
    setOtp("");
    setOtpError("");
  };

  // Auto-submit once all digits are entered.
  useEffect(() => {
    if (step === "otp" && otp.length === OTP_LENGTH && !verifying && !otpError) {
      verifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const inputBase =
    "block w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20";

  return (
    <>
      {/* Dialog 1: password */}
      <Modal
        open={step === "password" || step === "otp"}
        onClose={closeAll}
        labelledBy={ids.loginTitle}
        describedBy={ids.loginDesc}
        receded={step === "otp"}
      >
        <div className="relative p-6 sm:p-8" inert={step === "otp"}>
          <button
            type="button"
            onClick={closeAll}
            aria-label="Close sign in dialog"
            className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <div className="mb-6">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Lock className="size-5" aria-hidden="true" />
            </div>
            <h2 id={ids.loginTitle} className="text-2xl font-semibold tracking-tight">
              Sign in to Ledgerly
            </h2>
            <p id={ids.loginDesc} className="mt-1 text-sm text-slate-600">
              Use your work email and password. We’ll ask for a verification code next.
            </p>
          </div>

          <form onSubmit={submitPassword} noValidate className="space-y-4">
            <div>
              <label htmlFor={ids.email} className="mb-1.5 block text-sm font-medium text-slate-800">
                Work email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={emailRef}
                  id={ids.email}
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder={DEMO_EMAIL_HINT}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? ids.emailErr : undefined}
                  className={`${inputBase} ${fieldErrors.email ? "border-red-500" : "border-slate-300"}`}
                />
              </div>
              {fieldErrors.email && (
                <p id={ids.emailErr} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={ids.password} className="block text-sm font-medium text-slate-800">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="rounded text-sm font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={ids.password}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? ids.passwordErr : undefined}
                  className={`${inputBase} pr-11 ${fieldErrors.password ? "border-red-500" : "border-slate-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p
                  id={ids.passwordErr}
                  role="alert"
                  className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-slate-300 accent-indigo-600"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Checking credentials…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Demo: any valid email, a password of 8+ characters, then code{" "}
            <span className="font-mono font-semibold text-slate-700">{DEMO_OTP}</span>.
          </p>
        </div>
      </Modal>

      {/* Dialog 2: OTP (stacked on top) */}
      <Modal
        open={step === "otp"}
        onClose={() => setStep("password")}
        labelledBy={ids.otpTitle}
        describedBy={ids.otpDesc}
      >
        <div className="relative p-6 sm:p-8">
          <button
            type="button"
            onClick={() => setStep("password")}
            aria-label="Close verification dialog and go back"
            className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setStep("password")}
            className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to password
          </button>

          <div className="mb-6">
            <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Smartphone className="size-5" aria-hidden="true" />
            </div>
            <h2 id={ids.otpTitle} className="text-2xl font-semibold tracking-tight">
              Two-step verification
            </h2>
            <p id={ids.otpDesc} className="mt-1 text-sm text-slate-600">
              Enter the {OTP_LENGTH}-digit code from your authenticator app for{" "}
              <span className="font-medium text-slate-800">{maskEmail(email.trim() || DEMO_EMAIL_HINT)}</span>.
            </p>
          </div>

          <form onSubmit={verifyOtp} noValidate className="space-y-4">
            <div id={`${uid}-otp-focus`}>
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  if (otpError) setOtpError("");
                }}
                disabled={verifying}
                invalid={Boolean(otpError)}
                describedBy={otpError ? ids.otpErr : undefined}
              />
            </div>

            <div aria-live="polite" className="min-h-5">
              {otpError && (
                <p id={ids.otpErr} role="alert" className="flex items-start gap-1.5 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {otpError}
                </p>
              )}
              {!otpError && resentNote && (
                <p className="flex items-start gap-1.5 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  A new code has been requested.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {verifying ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify and sign in"
              )}
            </button>

            <p className="text-center text-sm text-slate-600">
              Didn’t get a code?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={resendIn > 0}
                className="rounded font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </p>
          </form>
        </div>
      </Modal>
    </>
  );
}

/* ------------------------------------- Page ------------------------------------- */

export default function Page() {
  const [step, setStep] = useState<Step>("closed");
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const prevStep = useRef<Step>("closed");

  // Return focus to the trigger when the flow closes.
  useEffect(() => {
    if (prevStep.current !== "closed" && step === "closed") {
      triggerRef.current?.focus();
    }
    prevStep.current = step;
  }, [step]);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-2 rounded text-lg font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BarChart3 className="size-4" aria-hidden="true" />
            </span>
            Ledgerly
          </a>

          {signedInAs ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">{signedInAs}</span>
              <button
                type="button"
                onClick={() => setSignedInAs(null)}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setStep("password")}
              aria-haspopup="dialog"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:pb-16 lg:pt-24">
          {signedInAs && (
            <div
              role="status"
              className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">You’re signed in</p>
                <p className="text-sm">
                  Welcome back, {signedInAs}. Your session is protected with two-step verification.
                </p>
              </div>
            </div>
          )}

          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Now with enforced two-step verification
            </p>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Subscription billing that finally keeps up with your team.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg text-slate-600">
              Ledgerly gives finance and growth teams one source of truth for recurring revenue, from first invoice
              to renewal, with security your auditors will love.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!signedInAs && (
                <button
                  type="button"
                  onClick={() => setStep("password")}
                  aria-haspopup="dialog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  Sign in to your workspace
                </button>
              )}
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                See how it works
              </a>
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <dd className="text-3xl font-bold tracking-tight text-slate-900">{s.value}</dd>
                <dt className="mt-1 text-sm text-slate-600">{s.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Built for revenue teams</h2>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <span className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 sm:px-6">
          © 2025 Ledgerly, Inc. All rights reserved.
        </div>
      </footer>

      <AuthFlow
        step={step}
        setStep={setStep}
        onSuccess={(email) => setSignedInAs(email)}
      />
    </div>
  );
}
```
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
} from "react";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
  Users,
  X,
  Zap,
  AlertCircle,
  LogOut,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Placeholder data                             */
/* -------------------------------------------------------------------------- */

const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "harbor-lane-42";
const DEMO_OTP = "483920";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MASKED_PHONE = "•••• •• 4417";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Live revenue dashboards",
    body: "Track MRR, churn and expansion across every plan with numbers that refresh as invoices settle.",
  },
  {
    icon: Users,
    title: "Shared team workspaces",
    body: "Finance, support and product see the same customer record, with permissions that follow the role.",
  },
  {
    icon: Zap,
    title: "Automated dunning",
    body: "Recover failed payments with smart retries and reminders that stop the moment a card is updated.",
  },
];

const STATS = [
  { value: "4,200+", label: "teams on Ledgerly" },
  { value: "$1.8B", label: "billed last year" },
  { value: "99.99%", label: "uptime, trailing 12 mo" },
];

type Stage = "closed" | "password" | "otp" | "done";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/*                               Modal primitive                              */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  /** True when another dialog sits on top of this one. */
  buried?: boolean;
  children: React.ReactNode;
}

function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  buried = false,
  children,
}: ModalProps) {
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
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={[
        "m-auto w-[calc(100%-1.5rem)] max-w-md overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        "backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm",
        buried
          ? "scale-[0.94] -translate-y-3 opacity-60"
          : "scale-100 translate-y-0 opacity-100",
      ].join(" ")}
    >
      {open ? children : null}
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 OTP input                                  */
/* -------------------------------------------------------------------------- */

interface OtpInputProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  autoFocus?: boolean;
}

function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
  autoFocus,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? "");

  const setAt = (index: number, char: string) => {
    const chars = digits.slice();
    chars[index] = char;
    onChange(chars.join("").slice(0, OTP_LENGTH));
  };

  const handleInput = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setAt(index, "");
      return;
    }
    if (cleaned.length > 1) {
      // Autofill or multi-char input: spread across boxes.
      const merged = (value.slice(0, index) + cleaned).slice(0, OTP_LENGTH);
      onChange(merged);
      refs.current[Math.min(merged.length, OTP_LENGTH - 1)]?.focus();
      return;
    }
    setAt(index, cleaned);
    if (index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setAt(index - 1, "");
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div
      role="group"
      aria-label="6-digit verification code"
      className="flex justify-between gap-2 sm:gap-3"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={i === 0 ? OTP_LENGTH : 1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={[
            "h-12 w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold tabular-nums text-slate-900 outline-none transition-colors sm:h-14",
            "focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 disabled:cursor-not-allowed disabled:bg-slate-100",
            invalid ? "border-red-500" : "border-slate-300",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function Page() {
  const uid = useId();
  const ids = {
    pwTitle: `${uid}-pw-title`,
    pwDesc: `${uid}-pw-desc`,
    pwErr: `${uid}-pw-err`,
    otpTitle: `${uid}-otp-title`,
    otpDesc: `${uid}-otp-desc`,
    otpErr: `${uid}-otp-err`,
    doneTitle: `${uid}-done-title`,
    doneDesc: `${uid}-done-desc`,
  };

  const [stage, setStage] = useState<Stage>("closed");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [resendNote, setResendNote] = useState("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const resetAll = useCallback(() => {
    setPassword("");
    setShowPassword(false);
    setPwError("");
    setPwLoading(false);
    setOtp("");
    setOtpError("");
    setOtpLoading(false);
    setResendIn(0);
    setResendNote("");
  }, []);

  const closeAll = useCallback(() => {
    setStage("closed");
    resetAll();
    // Return focus to the trigger once the dialog is closed.
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [resetAll]);

  const openLogin = () => {
    resetAll();
    setStage("password");
  };

  // Focus password field when the first dialog opens.
  useEffect(() => {
    if (stage === "password") {
      const t = setTimeout(() => passwordRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (pwLoading) return;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setPwError("Enter a valid work email address.");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setPwError("Enter your password to continue.");
      passwordRef.current?.focus();
      return;
    }
    setPwError("");
    setPwLoading(true);
    await sleep(800);
    setPwLoading(false);
    if (password !== DEMO_PASSWORD) {
      setPwError("That email and password don't match. Check them and try again.");
      passwordRef.current?.focus();
      passwordRef.current?.select();
      return;
    }
    setOtp("");
    setOtpError("");
    setResendIn(RESEND_SECONDS);
    setResendNote("");
    setStage("otp");
  };

  const verifyOtp = async (code: string) => {
    if (otpLoading) return;
    if (code.length < OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      return;
    }
    setOtpError("");
    setOtpLoading(true);
    await sleep(900);
    setOtpLoading(false);
    if (code !== DEMO_OTP) {
      setOtpError("That code is incorrect or has expired. Try again.");
      setOtp("");
      return;
    }
    setStage("done");
  };

  const onOtpChange = (next: string) => {
    setOtp(next);
    if (otpError) setOtpError("");
    if (next.length === OTP_LENGTH) void verifyOtp(next);
  };

  const submitOtp = (e: FormEvent) => {
    e.preventDefault();
    void verifyOtp(otp);
  };

  const resend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setOtp("");
    setOtpError("");
    setResendNote("A new code is on its way.");
  };

  const backToPassword = () => {
    setOtp("");
    setOtpError("");
    setStage("password");
    setTimeout(() => passwordRef.current?.focus(), 30);
  };

  const signedIn = stage === "done";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a
            href="#main"
            className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-4 focus-visible:ring-indigo-600/30"
          >
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white"
            >
              <BarChart3 className="size-4" />
            </span>
            Ledgerly
          </a>
          <nav aria-label="Primary" className="flex items-center gap-2 sm:gap-4">
            <a
              href="#features"
              className="hidden rounded-md px-2 py-1 text-sm text-slate-600 outline-none hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-indigo-600/30 sm:inline"
            >
              Features
            </a>
            {signedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-sm text-slate-600 sm:inline">
                  {email}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStage("closed");
                    resetAll();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 outline-none transition hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            ) : (
              <button
                ref={triggerRef}
                type="button"
                onClick={openLogin}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white outline-none transition hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-600/40"
              >
                <Lock className="size-4" aria-hidden="true" />
                Sign in
              </button>
            )}
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:pb-20">
          <div className="max-w-2xl">
            {signedIn ? (
              <p
                role="status"
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Signed in as {email}
              </p>
            ) : (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 ring-1 ring-indigo-200">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Two-step verification enabled
              </p>
            )}
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              {signedIn
                ? "Welcome back, Maya."
                : "Subscription billing your finance team can trust."}
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
              {signedIn
                ? "Your workspace is ready. 3 invoices need review and 2 failed payments are being retried today."
                : "Ledgerly brings invoicing, revenue recognition and payment recovery into one calm workspace, so month-end close takes hours instead of days."}
            </p>
            {!signedIn && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openLogin}
                  aria-haspopup="dialog"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-base font-medium text-white outline-none transition hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-600/40"
                >
                  <Lock className="size-4" aria-hidden="true" />
                  Sign in to your workspace
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-800 outline-none transition hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
                >
                  See what&apos;s inside
                </a>
              </div>
            )}
          </div>

          <dl className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <dt className="text-sm text-slate-500">{s.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Features */}
        <section
          id="features"
          aria-labelledby="features-heading"
          className="border-t border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <h2
              id="features-heading"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Everything between invoice and payout
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-6"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-700"
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {body}
                  </p>
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

      {/* ------------------------- Dialog 1: password ------------------------ */}
      <Modal
        open={stage === "password" || stage === "otp"}
        onClose={closeAll}
        labelledBy={ids.pwTitle}
        describedBy={ids.pwDesc}
        buried={stage === "otp"}
      >
        <form onSubmit={submitPassword} noValidate className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                aria-hidden="true"
                className="mb-4 grid size-11 place-items-center rounded-xl bg-indigo-600 text-white"
              >
                <Lock className="size-5" />
              </span>
              <h2 id={ids.pwTitle} className="text-xl font-semibold tracking-tight">
                Sign in to Ledgerly
              </h2>
              <p id={ids.pwDesc} className="mt-1 text-sm text-slate-600">
                Use your work email and password. We&apos;ll verify it&apos;s you
                in the next step.
              </p>
            </div>
            <button
              type="button"
              onClick={closeAll}
              aria-label="Close sign-in dialog"
              className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor={`${uid}-email`}
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                Work email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={emailRef}
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="username"
                  value={email}
                  disabled={pwLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={pwError ? ids.pwErr : undefined}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={`${uid}-password`}
                className="mb-1.5 block text-sm font-medium text-slate-800"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={passwordRef}
                  id={`${uid}-password`}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  disabled={pwLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (pwError) setPwError("");
                  }}
                  aria-invalid={pwError ? true : undefined}
                  aria-describedby={pwError ? ids.pwErr : undefined}
                  className={[
                    "block w-full rounded-lg border bg-white py-2.5 pl-10 pr-11 text-base text-slate-900 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20 disabled:bg-slate-100",
                    pwError ? "border-red-500" : "border-slate-300",
                  ].join(" ")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 outline-none hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div id={ids.pwErr} role="alert" aria-live="assertive">
              {pwError && (
                <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {pwError}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white outline-none transition hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pwLoading ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </button>

          <p className="mt-5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600 ring-1 ring-slate-200">
            <span className="font-medium text-slate-800">Demo credentials:</span>{" "}
            password <code className="font-mono text-slate-900">{DEMO_PASSWORD}</code>
            , then code <code className="font-mono text-slate-900">{DEMO_OTP}</code>.
          </p>
        </form>
      </Modal>

      {/* --------------------------- Dialog 2: OTP --------------------------- */}
      <Modal
        open={stage === "otp"}
        onClose={backToPassword}
        labelledBy={ids.otpTitle}
        describedBy={ids.otpDesc}
      >
        <form onSubmit={submitOtp} noValidate className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                aria-hidden="true"
                className="mb-4 grid size-11 place-items-center rounded-xl bg-emerald-600 text-white"
              >
                <Smartphone className="size-5" />
              </span>
              <h2 id={ids.otpTitle} className="text-xl font-semibold tracking-tight">
                Enter your verification code
              </h2>
              <p id={ids.otpDesc} className="mt-1 text-sm text-slate-600">
                We sent a 6-digit code by text to{" "}
                <span className="font-medium text-slate-800">{MASKED_PHONE}</span>.
                It expires in 10 minutes.
              </p>
            </div>
            <button
              type="button"
              onClick={backToPassword}
              aria-label="Close verification and go back"
              className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 outline-none transition hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6">
            <OtpInput
              value={otp}
              onChange={onOtpChange}
              disabled={otpLoading}
              invalid={Boolean(otpError)}
              describedBy={otpError ? ids.otpErr : undefined}
              autoFocus
            />
            <div
              id={ids.otpErr}
              role="alert"
              aria-live="assertive"
              className="mt-3 min-h-5"
            >
              {otpError && (
                <p className="flex items-start gap-2 text-sm text-red-700">
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {otpError}
                </p>
              )}
            </div>
            <p role="status" aria-live="polite" className="min-h-5 text-sm text-emerald-700">
              {resendNote}
            </p>
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white outline-none transition hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {otpLoading ? (
              <>
                <Loader2
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                Verifying…
              </>
            ) : (
              "Verify and sign in"
            )}
          </button>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={backToPassword}
              className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-slate-600 outline-none hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-indigo-600/30"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to password
            </button>
            <button
              type="button"
              onClick={resend}
              disabled={resendIn > 0}
              className="rounded-md px-1 py-0.5 font-medium text-indigo-700 outline-none hover:text-indigo-900 focus-visible:ring-4 focus-visible:ring-indigo-600/30 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </div>
        </form>
      </Modal>

      {/* --------------------------- Dialog 3: success ----------------------- */}
      <Modal
        open={false}
        onClose={closeAll}
        labelledBy={ids.doneTitle}
        describedBy={ids.doneDesc}
      >
        <div />
      </Modal>
    </div>
  );
}
```
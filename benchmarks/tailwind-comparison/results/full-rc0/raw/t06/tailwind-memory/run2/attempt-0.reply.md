```tsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

/* ----------------------------- placeholder data ---------------------------- */

const DEMO_EMAIL = "amara.okafor@northwind.example";
const DEMO_PASSWORD = "Harbor-Lantern-42";
const DEMO_OTP = "482916";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const STATS = [
  { label: "Monthly revenue", value: "$48,920", delta: "+12.4%", icon: Wallet },
  { label: "Active customers", value: "2,318", delta: "+4.1%", icon: Users },
  { label: "Conversion rate", value: "3.62%", delta: "+0.3%", icon: BarChart3 },
];

const ACTIVITY = [
  { who: "Priya Raman", what: "upgraded to the Team plan", when: "4 min ago" },
  { who: "Lukas Weber", what: "paid invoice #INV-2048", when: "22 min ago" },
  { who: "Sofia Alvarez", what: "opened a support ticket", when: "1 hr ago" },
  { who: "Daniel Kim", what: "invited 3 teammates", when: "3 hr ago" },
];

type Step = "closed" | "password" | "otp" | "done";

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/* ---------------------------------- page ----------------------------------- */

export default function Page() {
  const [step, setStep] = useState<Step>("closed");

  // password step
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // otp step
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, () => ""),
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resentNotice, setResentNotice] = useState(false);

  const passwordDialogRef = useRef<HTMLDialogElement>(null);
  const otpDialogRef = useRef<HTMLDialogElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  const ids = {
    passwordTitle: useId(),
    passwordDesc: useId(),
    otpTitle: useId(),
    otpDesc: useId(),
    emailField: useId(),
    passwordField: useId(),
    passwordErr: useId(),
    otpErr: useId(),
  };

  /* Sync the native dialogs with the step state. Opening the OTP dialog after
     the password dialog puts it above in the top layer => a real stacked dialog. */
  useEffect(() => {
    const pw = passwordDialogRef.current;
    const otp = otpDialogRef.current;
    if (!pw || !otp) return;

    const wantPassword = step === "password" || step === "otp";
    const wantOtp = step === "otp";

    if (wantPassword && !pw.open) pw.showModal();
    if (!wantPassword && pw.open) pw.close();

    if (wantOtp && !otp.open) {
      otp.showModal();
      otpRefs.current[0]?.focus();
    }
    if (!wantOtp && otp.open) otp.close();
  }, [step]);

  // Return focus to the trigger when the whole flow closes.
  const previousStep = useRef<Step>("closed");
  useEffect(() => {
    if (previousStep.current !== "closed" && step === "closed") {
      triggerRef.current?.focus();
    }
    previousStep.current = step;
  }, [step]);

  // Resend countdown
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [step, resendIn]);

  const openFlow = () => {
    setPassword("");
    setPasswordError(null);
    setShowPassword(false);
    setStep("password");
  };

  const closeAll = useCallback(() => {
    setStep("closed");
    setPasswordLoading(false);
    setOtpLoading(false);
  }, []);

  const resetOtp = () => {
    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setOtpError(null);
    setResentNotice(false);
  };

  /* ------------------------------ password step ----------------------------- */

  const onPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordLoading) return;

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setPasswordError("Enter a valid work email address.");
      emailRef.current?.focus();
      return;
    }
    if (password.length === 0) {
      setPasswordError("Enter your password to continue.");
      return;
    }

    setPasswordError(null);
    setPasswordLoading(true);
    await wait(900);
    setPasswordLoading(false);

    if (password !== DEMO_PASSWORD) {
      setPasswordError("That email and password combination doesn't match.");
      return;
    }

    resetOtp();
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  /* -------------------------------- otp step -------------------------------- */

  const focusDigit = (i: number) => {
    const el = otpRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };

  const verify = async (code: string) => {
    setOtpLoading(true);
    setOtpError(null);
    await wait(900);
    setOtpLoading(false);
    if (code === DEMO_OTP) {
      setStep("done");
    } else {
      setOtpError("That code is incorrect or has expired. Try again.");
      setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
      requestAnimationFrame(() => focusDigit(0));
    }
  };

  const onDigitChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setDigits((d) => d.map((v, idx) => (idx === i ? "" : v)));
      return;
    }
    // Handles typing and autofill (multiple chars) alike.
    const next = [...digits];
    raw
      .slice(0, OTP_LENGTH - i)
      .split("")
      .forEach((ch, k) => {
        next[i + k] = ch;
      });
    setDigits(next);
    setOtpError(null);
    const lastFilled = Math.min(i + raw.length, OTP_LENGTH - 1);
    focusDigit(lastFilled);
    if (next.every(Boolean)) void verify(next.join(""));
  };

  const onDigitKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((d) => d.map((v, idx) => (idx === i - 1 ? "" : v)));
      focusDigit(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusDigit(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusDigit(i + 1);
    }
  };

  const onDigitPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, k) => pasted[k] ?? "");
    setDigits(next);
    setOtpError(null);
    focusDigit(Math.min(pasted.length, OTP_LENGTH - 1));
    if (next.every(Boolean)) void verify(next.join(""));
  };

  const onOtpSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otpLoading) return;
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      focusDigit(digits.findIndex((d) => !d));
      return;
    }
    void verify(code);
  };

  const onResend = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setResentNotice(true);
    setDigits(Array.from({ length: OTP_LENGTH }, () => ""));
    setOtpError(null);
    focusDigit(0);
  };

  const backToPassword = () => {
    resetOtp();
    setStep("password");
  };

  /* Native dialog "cancel" (Esc): keep React state authoritative. The top-most
     dialog handles it; Esc on OTP returns to password, Esc on password closes. */
  const onOtpCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    backToPassword();
  };
  const onPasswordCancel = (e: SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    if (step === "otp") return;
    closeAll();
  };

  const stacked = step === "otp";

  /* --------------------------------- render --------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Backdrop styling for native dialogs (kept local to this page). */}
      <style>{`
        dialog.auth-dialog::backdrop { background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(2px); }
        dialog.auth-dialog-top::backdrop { background: rgba(15, 23, 42, 0.35); backdrop-filter: none; }
        @keyframes auth-pop { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        dialog.auth-dialog[open] > .auth-panel { animation: auth-pop 180ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          dialog.auth-dialog[open] > .auth-panel { animation: none; }
          .auth-recede { transition: none !important; }
        }
      `}</style>

      {/* ------------------------------ app shell ------------------------------ */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white"
            >
              <BarChart3 className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Northwind Ledger
            </span>
          </div>

          {step === "done" ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Bell className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={closeAll}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <button
              ref={triggerRef}
              type="button"
              onClick={openFlow}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {step === "done" ? (
          <section aria-labelledby="dash-title">
            <div
              role="status"
              className="mb-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
            >
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <p className="text-sm">
                Signed in as <strong>{email}</strong>. Two-step verification
                completed.
              </p>
            </div>

            <h1
              id="dash-title"
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Welcome back, Amara
            </h1>
            <p className="mt-1 text-slate-600">
              Here&apos;s how Northwind is doing this month.
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {STATS.map(({ label, value, delta, icon: Icon }) => (
                <li
                  key={label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-sm">{label}</span>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight">
                    {value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-emerald-600">
                    {delta} vs last month
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
              <h2 className="border-b border-slate-200 px-5 py-4 text-base font-semibold">
                Recent activity
              </h2>
              <ul className="divide-y divide-slate-100">
                {ACTIVITY.map((a) => (
                  <li
                    key={a.who}
                    className="flex flex-col gap-0.5 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="text-sm">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-slate-600">{a.what}</span>
                    </p>
                    <p className="text-xs text-slate-500">{a.when}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section
            aria-labelledby="hero-title"
            className="mx-auto max-w-2xl py-8 text-center sm:py-16"
          >
            <span
              aria-hidden="true"
              className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600"
            >
              <ShieldCheck className="size-7" />
            </span>
            <h1
              id="hero-title"
              className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Your books, secured with two-step verification
            </h1>
            <p className="mt-4 text-base text-slate-600 text-pretty sm:text-lg">
              Sign in with your password, then confirm with a one-time code to
              reach your invoices, payouts and reports.
            </p>
            <button
              type="button"
              onClick={openFlow}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <KeyRound className="size-5" aria-hidden="true" />
              Sign in to your workspace
            </button>

            <div className="mx-auto mt-10 max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-4 text-left text-sm text-slate-600">
              <p className="font-medium text-slate-800">Demo credentials</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-slate-500">Password</dt>
                <dd className="font-mono break-all">{DEMO_PASSWORD}</dd>
                <dt className="text-slate-500">Code</dt>
                <dd className="font-mono">{DEMO_OTP}</dd>
              </dl>
            </div>
          </section>
        )}
      </main>

      {/* --------------------------- dialog 1: password --------------------------- */}
      <dialog
        ref={passwordDialogRef}
        aria-labelledby={ids.passwordTitle}
        aria-describedby={ids.passwordDesc}
        onCancel={onPasswordCancel}
        onClose={() => {
          if (step === "password") closeAll();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && step === "password") closeAll();
        }}
        className="auth-dialog m-auto w-[calc(100%-2rem)] max-w-md bg-transparent p-0 text-slate-900 backdrop:bg-transparent"
      >
        <div
          className={`auth-panel auth-recede rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 transition-all duration-200 sm:p-8 ${
            stacked ? "scale-[0.94] opacity-60" : ""
          }`}
          {...(stacked ? { inert: true } : {})}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600"
              >
                <KeyRound className="size-5" />
              </span>
              <div>
                <h2
                  id={ids.passwordTitle}
                  className="text-xl font-semibold tracking-tight"
                >
                  Sign in
                </h2>
                <p
                  id={ids.passwordDesc}
                  className="text-sm text-slate-600"
                >
                  Step 1 of 2 · Enter your credentials
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAll}
              aria-label="Close sign in dialog"
              className="-m-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={onPasswordSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label
                htmlFor={ids.emailField}
                className="block text-sm font-medium text-slate-700"
              >
                Work email
              </label>
              <div className="relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  ref={emailRef}
                  id={ids.emailField}
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={passwordError ? true : undefined}
                  aria-describedby={passwordError ? ids.passwordErr : undefined}
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-invalid:border-red-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={ids.passwordField}
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id={ids.passwordField}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={passwordError ? true : undefined}
                  aria-describedby={passwordError ? ids.passwordErr : undefined}
                  placeholder="Enter your password"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-11 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-invalid:border-red-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div aria-live="polite">
              {passwordError && (
                <p
                  id={ids.passwordErr}
                  className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Checking…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Forgot your password? Contact your workspace admin.
          </p>
        </div>
      </dialog>

      {/* ------------------------------ dialog 2: OTP ----------------------------- */}
      <dialog
        ref={otpDialogRef}
        aria-labelledby={ids.otpTitle}
        aria-describedby={ids.otpDesc}
        onCancel={onOtpCancel}
        className="auth-dialog auth-dialog-top m-auto w-[calc(100%-2rem)] max-w-sm bg-transparent p-0 text-slate-900 backdrop:bg-transparent"
      >
        <div className="auth-panel rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={backToPassword}
              className="-ml-1 inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <button
              type="button"
              onClick={closeAll}
              aria-label="Close verification dialog"
              className="-m-1 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 text-center">
            <span
              aria-hidden="true"
              className="mx-auto flex size-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
            >
              <ShieldCheck className="size-6" />
            </span>
            <h2
              id={ids.otpTitle}
              className="mt-4 text-xl font-semibold tracking-tight"
            >
              Verify it&apos;s you
            </h2>
            <p id={ids.otpDesc} className="mt-1 text-sm text-slate-600">
              Step 2 of 2 · We sent a {OTP_LENGTH}-digit code to{" "}
              <span className="font-medium text-slate-800">
                {maskEmail(email)}
              </span>
              .
            </p>
          </div>

          <form onSubmit={onOtpSubmit} noValidate className="mt-6">
            <fieldset disabled={otpLoading} className="min-w-0">
              <legend className="sr-only">
                {OTP_LENGTH}-digit verification code
              </legend>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={OTP_LENGTH}
                    value={d}
                    aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                    aria-invalid={otpError ? true : undefined}
                    aria-describedby={otpError ? ids.otpErr : undefined}
                    onChange={(e) => onDigitChange(i, e)}
                    onKeyDown={(e) => onDigitKeyDown(i, e)}
                    onPaste={onDigitPaste}
                    onFocus={(e) => e.currentTarget.select()}
                    className="size-11 rounded-lg border border-slate-300 bg-white text-center text-xl font-semibold text-slate-900 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-invalid:border-red-500 disabled:opacity-60 sm:size-12"
                  />
                ))}
              </div>
            </fieldset>

            <div aria-live="polite" className="mt-4 min-h-6 text-center">
              {otpError && (
                <p
                  id={ids.otpErr}
                  className="inline-flex items-start gap-2 text-sm text-red-700"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {otpError}
                </p>
              )}
              {!otpError && resentNotice && (
                <p className="text-sm text-emerald-700">
                  A new code is on its way.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {otpLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Verifying…
                </>
              ) : (
                "Verify and sign in"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Didn&apos;t get it?{" "}
            {resendIn > 0 ? (
              <span className="tabular-nums text-slate-500">
                Resend in {resendIn}s
              </span>
            ) : (
              <button
                type="button"
                onClick={onResend}
                className="rounded font-semibold text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </dialog>
    </div>
  );
}
```
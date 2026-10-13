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
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  X,
  LogOut,
  Activity,
  BarChart3,
  Users,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Placeholder data                                                    */
/* ------------------------------------------------------------------ */

const DEMO_EMAIL = "maya.okafor@northwind.io";
const DEMO_PASSWORD = "Harbor-Lantern-42";
const DEMO_OTP = "424242";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const STATS = [
  { label: "Active sessions", value: "1,284", icon: Activity },
  { label: "Weekly signups", value: "312", icon: Users },
  { label: "Conversion", value: "4.8%", icon: BarChart3 },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

/* ------------------------------------------------------------------ */
/* Modal shell (stack aware)                                           */
/* ------------------------------------------------------------------ */

interface ModalProps {
  open: boolean;
  /** true when another dialog is stacked above this one */
  covered: boolean;
  /** stack depth: 0 for base dialog, 1 for the one on top */
  depth: number;
  titleId: string;
  descId: string;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ open, covered, depth, titleId, descId, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus management: move focus in when it becomes the active (top) dialog,
  // and restore focus to the previously focused element when it closes.
  useEffect(() => {
    if (!open || covered) return;
    const panel = panelRef.current;
    if (!panel) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const target =
      panel.querySelector<HTMLElement>("[data-autofocus]") ??
      panel.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus();
    return () => {
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [open, covered]);

  // Escape + focus trap, only for the active (top) dialog.
  useEffect(() => {
    if (!open || covered) return;
    function onKeyDown(e: globalThis.KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, covered]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6"
      style={{ zIndex: 50 + depth * 10 }}
    >
      <div
        aria-hidden="true"
        onClick={covered ? undefined : onClose}
        className={`absolute inset-0 transition-colors duration-200 ${
          depth === 0 ? "bg-slate-950/60 backdrop-blur-sm" : "bg-slate-950/40"
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        inert={covered}
        className={`dialog-pop relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 transition-all duration-300 sm:max-w-md sm:rounded-3xl sm:p-8 ${
          covered ? "scale-[0.94] opacity-60 sm:-translate-y-4" : "scale-100 opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OTP input                                                           */
/* ------------------------------------------------------------------ */

interface OtpInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled: boolean;
  invalid: boolean;
  describedBy: string;
  onComplete: (code: string) => void;
}

function OtpInput({ value, onChange, disabled, invalid, describedBy, onComplete }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))];
    el?.focus();
    el?.select();
  };

  const commit = (next: string[]) => {
    onChange(next);
    if (next.every((d) => d !== "")) onComplete(next.join(""));
  };

  const handleInput = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      const next = [...value];
      next[i] = "";
      onChange(next);
      return;
    }
    const next = [...value];
    let cursor = i;
    for (const d of digits) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = d;
      cursor += 1;
    }
    commit(next);
    focusAt(Math.min(cursor, OTP_LENGTH - 1));
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && value[i] === "" && i > 0) {
      e.preventDefault();
      const next = [...value];
      next[i - 1] = "";
      onChange(next);
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
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    const next = Array.from({ length: OTP_LENGTH }, (_, idx) => digits[idx] ?? "");
    commit(next);
    focusAt(Math.min(digits.length, OTP_LENGTH - 1));
  };

  return (
    <div role="group" aria-label="One-time code" className="flex justify-between gap-2 sm:gap-3">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          data-autofocus={i === 0 ? "" : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-full min-w-0 rounded-xl border bg-white text-center text-xl font-semibold tabular-nums text-slate-900 shadow-sm outline-none transition focus:ring-4 disabled:opacity-60 sm:h-14 sm:text-2xl ${
            invalid
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type Step = "closed" | "login" | "otp";

export default function Page() {
  const uid = useId();
  const ids = {
    loginTitle: `${uid}-login-title`,
    loginDesc: `${uid}-login-desc`,
    otpTitle: `${uid}-otp-title`,
    otpDesc: `${uid}-otp-desc`,
    emailErr: `${uid}-email-err`,
    passErr: `${uid}-pass-err`,
    otpErr: `${uid}-otp-err`,
  };

  const [step, setStep] = useState<Step>("closed");
  const [signedIn, setSignedIn] = useState(false);

  // Login form
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loggingIn, setLoggingIn] = useState(false);

  // OTP
  const [otp, setOtp] = useState<string[]>(() => Array<string>(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [resentNotice, setResentNotice] = useState(false);

  // Lock body scroll while any dialog is open.
  useEffect(() => {
    if (step === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [step]);

  // Resend countdown while the OTP dialog is open.
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  const resetOtp = useCallback(() => {
    setOtp(Array<string>(OTP_LENGTH).fill(""));
    setOtpError("");
    setVerifying(false);
    setResendIn(RESEND_SECONDS);
    setResentNotice(false);
  }, []);

  const closeAll = useCallback(() => {
    setStep("closed");
    setPassword("");
    setShowPassword(false);
    setLoginErrors({});
    setLoggingIn(false);
    resetOtp();
  }, [resetOtp]);

  const closeOtp = useCallback(() => {
    resetOtp();
    setStep("login");
  }, [resetOtp]);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loggingIn) return;
    const errors: { email?: string; password?: string; form?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid work email address.";
    if (password.length === 0) errors.password = "Enter your password.";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    setLoginErrors(errors);
    if (errors.email || errors.password) return;

    setLoggingIn(true);
    await wait(900);
    setLoggingIn(false);
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setLoginErrors({ form: "That email and password don't match. Check your details and try again." });
      return;
    }
    setLoginErrors({});
    resetOtp();
    setStep("otp");
  }

  async function verifyOtp(code: string) {
    if (verifying) return;
    setVerifying(true);
    setOtpError("");
    await wait(800);
    if (code === DEMO_OTP) {
      setVerifying(false);
      setSignedIn(true);
      closeAll();
      return;
    }
    setVerifying(false);
    setOtpError("That code isn't right or has expired. Try again.");
    setOtp(Array<string>(OTP_LENGTH).fill(""));
    // refocus first digit after state flush
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>(`[aria-label="Digit 1 of ${OTP_LENGTH}"]`)?.focus();
    });
  }

  function handleOtpSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of your code.`);
      return;
    }
    void verifyOtp(code);
  }

  function handleResend() {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setResentNotice(true);
    setOtpError("");
    setOtp(Array<string>(OTP_LENGTH).fill(""));
  }

  const inputBase =
    "block w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 sm:text-sm";
  const inputOk = "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100";
  const inputBad = "border-rose-400 focus:border-rose-500 focus:ring-rose-100";

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-indigo-50/60 text-slate-900">
      <style>{`
        @keyframes dialog-pop { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        .dialog-pop { animation: dialog-pop 220ms ease-out; }
        @media (prefers-reduced-motion: reduce) { .dialog-pop { animation: none; } }
      `}</style>

      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          Northwind Console
        </div>
        {signedIn ? (
          <button
            type="button"
            onClick={() => setSignedIn(false)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep("login")}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-16">
        {signedIn ? (
          <section aria-labelledby="welcome-title">
            <p role="status" className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-600/20">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Signed in with two-step verification
            </p>
            <h1 id="welcome-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              Welcome back, Maya
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Here&apos;s a snapshot of your workspace since your last visit on Tuesday.
            </p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                  <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
                  <dt className="mt-3 text-sm text-slate-500">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : (
          <section aria-labelledby="hero-title" className="max-w-2xl">
            <h1 id="hero-title" className="text-4xl font-bold tracking-tight sm:text-6xl">
              Your team&apos;s analytics, <span className="text-indigo-600">locked down.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-600">
              Sign in with your password and a one-time code to reach dashboards, exports and billing for the
              Northwind workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Sign in to your workspace
              </button>
              <p className="text-sm text-slate-500">Demo password: {DEMO_PASSWORD} · code: {DEMO_OTP}</p>
            </div>
          </section>
        )}
      </main>

      {/* Dialog 1: password */}
      <Modal
        open={step === "login" || step === "otp"}
        covered={step === "otp"}
        depth={0}
        titleId={ids.loginTitle}
        descId={ids.loginDesc}
        onClose={closeAll}
      >
        <button
          type="button"
          onClick={closeAll}
          aria-label="Close sign in dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id={ids.loginTitle} className="mt-4 text-2xl font-bold tracking-tight">
          Sign in
        </h2>
        <p id={ids.loginDesc} className="mt-1 text-sm text-slate-600">
          Use your work email and password. We&apos;ll ask for a verification code next.
        </p>

        <form onSubmit={handleLogin} noValidate className="mt-6 space-y-4">
          {loginErrors.form && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {loginErrors.form}
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-email`} className="block text-sm font-medium text-slate-700">
              Work email
            </label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id={`${uid}-email`}
                data-autofocus
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(loginErrors.email)}
                aria-describedby={loginErrors.email ? ids.emailErr : undefined}
                placeholder="you@company.com"
                className={`${inputBase} ${loginErrors.email ? inputBad : inputOk}`}
              />
            </div>
            {loginErrors.email && (
              <p id={ids.emailErr} className="mt-1.5 text-sm text-rose-600">
                {loginErrors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${uid}-password`} className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id={`${uid}-password`}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(loginErrors.password)}
                aria-describedby={loginErrors.password ? ids.passErr : undefined}
                placeholder="Enter your password"
                className={`${inputBase} pr-11 ${loginErrors.password ? inputBad : inputOk}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {loginErrors.password && (
              <p id={ids.passErr} className="mt-1.5 text-sm text-rose-600">
                {loginErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </button>
          <p className="text-center text-xs text-slate-500">
            Demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}
          </p>
        </form>
      </Modal>

      {/* Dialog 2: OTP, stacked on top */}
      <Modal
        open={step === "otp"}
        covered={false}
        depth={1}
        titleId={ids.otpTitle}
        descId={ids.otpDesc}
        onClose={closeOtp}
      >
        <button
          type="button"
          onClick={closeOtp}
          aria-label="Back to password"
          className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={closeAll}
          aria-label="Close verification dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 id={ids.otpTitle} className="mt-4 text-2xl font-bold tracking-tight">
          Verify it&apos;s you
        </h2>
        <p id={ids.otpDesc} className="mt-1 text-sm text-slate-600">
          Enter the {OTP_LENGTH}-digit code from your authenticator app for{" "}
          <span className="font-medium text-slate-800">{maskEmail(email.trim() || DEMO_EMAIL)}</span>.
        </p>

        <form onSubmit={handleOtpSubmit} noValidate className="mt-6 space-y-4">
          <OtpInput
            value={otp}
            onChange={(next) => {
              setOtp(next);
              if (otpError) setOtpError("");
            }}
            disabled={verifying}
            invalid={Boolean(otpError)}
            describedBy={otpError ? ids.otpErr : ids.otpDesc}
            onComplete={(code) => void verifyOtp(code)}
          />

          <div className="min-h-5" aria-live="polite">
            {otpError && (
              <p id={ids.otpErr} role="alert" className="flex items-center gap-1.5 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {otpError}
              </p>
            )}
            {!otpError && resentNotice && (
              <p className="text-sm text-emerald-700">A new code has been generated.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              "Verify and sign in"
            )}
          </button>

          <p className="text-center text-sm text-slate-600">
            Didn&apos;t get a code?{" "}
            {resendIn > 0 ? (
              <span className="tabular-nums text-slate-500">Resend in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-semibold text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                Resend code
              </button>
            )}
          </p>
          <p className="text-center text-xs text-slate-500">Demo code: {DEMO_OTP}</p>
        </form>
      </Modal>
    </div>
  );
}
```
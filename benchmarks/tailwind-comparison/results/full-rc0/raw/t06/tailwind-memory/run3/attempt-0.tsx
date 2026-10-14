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
  Waves,
  BarChart3,
  Users,
  Bell,
} from "lucide-react";

const DEMO_EMAIL = "maya.okafor@harborlane.io";
const DEMO_PASSWORD = "Harbor-2025!";
const DEMO_OTP = "428913";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type Stage = "closed" | "login" | "otp" | "success";

const features = [
  {
    icon: BarChart3,
    title: "Live shipment analytics",
    body: "Track dwell time, port congestion and carrier performance across 140 trade lanes in one view.",
  },
  {
    icon: Users,
    title: "Shared workspaces",
    body: "Brokers, warehouses and finance teams work from the same source of truth with role-based access.",
  },
  {
    icon: Bell,
    title: "Exception alerts",
    body: "Get notified within minutes when a container is held, rerouted or misses a milestone.",
  },
];

const stats = [
  { value: "2,400+", label: "Logistics teams" },
  { value: "38M", label: "Containers tracked" },
  { value: "99.98%", label: "Uptime, last 12 months" },
];

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export default function Page() {
  const [stage, setStage] = useState<Stage>("closed");

  const loginRef = useRef<HTMLDialogElement>(null);
  const otpRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // OTP state
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  const emailId = useId();
  const passwordId = useId();
  const loginErrorId = useId();
  const otpErrorId = useId();
  const otpHintId = useId();

  const timers = useRef<number[]>([]);
  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // Sync <dialog> elements with stage
  useEffect(() => {
    const login = loginRef.current;
    const otp = otpRef.current;
    if (!login || !otp) return;

    const loginShouldBeOpen = stage === "login" || stage === "otp";
    const otpShouldBeOpen = stage === "otp" || stage === "success";

    if (loginShouldBeOpen && !login.open) login.showModal();
    if (!loginShouldBeOpen && login.open) login.close();
    if (otpShouldBeOpen && !otp.open) otp.showModal();
    if (!otpShouldBeOpen && otp.open) otp.close();
  }, [stage]);

  // Resend countdown
  useEffect(() => {
    if (stage !== "otp" || resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [stage, resendIn]);

  const resetAll = useCallback(() => {
    setStage("closed");
    setPassword("");
    setShowPassword(false);
    setLoginError("");
    setLoginLoading(false);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setOtpLoading(false);
    setResendIn(RESEND_SECONDS);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const openLogin = () => {
    setLoginError("");
    setStage("login");
  };

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loginLoading) return;
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setLoginError("Enter a valid work email address.");
      return;
    }
    if (!password) {
      setLoginError("Enter your password.");
      return;
    }
    setLoginError("");
    setLoginLoading(true);
    schedule(() => {
      setLoginLoading(false);
      if (trimmed.toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        setDigits(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        setResendIn(RESEND_SECONDS);
        setStage("otp");
      } else {
        setLoginError("That email and password combination doesn't match our records.");
      }
    }, 900);
  };

  const submitOtp = (code: string) => {
    if (otpLoading) return;
    setOtpLoading(true);
    setOtpError("");
    schedule(() => {
      setOtpLoading(false);
      if (code === DEMO_OTP) {
        setStage("success");
      } else {
        setOtpError("That code is incorrect or has expired. Check the digits and try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        otpInputs.current[0]?.focus();
      }
    }, 800);
  };

  const setDigitAt = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => prev.map((d, i) => (i === index ? "" : d)));
      return;
    }
    // Handle multi-char input (autofill / paste into one box)
    const chars = clean.slice(0, OTP_LENGTH - index).split("");
    const next = [...digits];
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setDigits(next);
    setOtpError("");
    const focusIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    otpInputs.current[focusIndex]?.focus();
    if (next.every((d) => d !== "")) submitOtp(next.join(""));
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, i) => (i === index - 1 ? "" : d)));
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH)
      .fill("")
      .map((_, i) => text[i] ?? "");
    setDigits(next);
    setOtpError("");
    otpInputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) submitOtp(text);
  };

  const handleOtpFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your verification code.");
      const firstEmpty = digits.findIndex((d) => d === "");
      otpInputs.current[firstEmpty === -1 ? 0 : firstEmpty]?.focus();
      return;
    }
    submitOtp(code);
  };

  const resendCode = () => {
    if (resendIn > 0) return;
    setResendIn(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    otpInputs.current[0]?.focus();
  };

  const backToLogin = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setStage("login");
  };

  // Focus management when dialogs open
  useEffect(() => {
    if (stage === "otp") {
      const id = window.setTimeout(() => otpInputs.current[0]?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [stage]);

  const dialogBase =
    "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm open:animate-[dialog-in_180ms_ease-out] motion-reduce:open:animate-none";

  const inputBase =
    "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:bg-slate-50";

  const primaryBtn =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        @keyframes dialog-in {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        dialog[data-stacked="under"] { transform: translateY(-14px) scale(0.96); filter: brightness(0.92); transition: transform 200ms ease, filter 200ms ease; }
        @media (prefers-reduced-motion: reduce) {
          dialog[data-stacked="under"] { transition: none; }
        }
      `}</style>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <a
            href="#top"
            className="flex items-center gap-2 rounded-md font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-700 text-white">
              <Waves className="h-5 w-5" aria-hidden="true" />
            </span>
            Harborlane
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700" href="#features">
              Features
            </a>
            <a className="rounded hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700" href="#trust">
              Customers
            </a>
          </nav>
          <button
            ref={triggerRef}
            type="button"
            onClick={openLogin}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Sign in
          </button>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 ring-1 ring-teal-200">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              SOC 2 Type II certified
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Know where every container is before your customer asks.
            </h1>
            <p className="mt-5 text-base text-slate-600 sm:text-lg">
              Harborlane gives freight forwarders and importers a single control tower for ocean,
              rail and drayage shipments, with alerts that arrive while there is still time to act.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Sign in to your workspace
              </button>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                See how it works
              </a>
            </div>
          </div>

          <dl id="trust" className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
                <dt className="text-sm text-slate-500">{s.label}</dt>
                <dd className="mt-1 text-2xl font-bold tracking-tight">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="features" className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight">Built for the people who keep freight moving</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-xl border border-slate-200 p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © 2025 Harborlane Logistics, Inc. All rights reserved.
      </footer>

      {/* Login dialog (bottom of stack) */}
      <dialog
        ref={loginRef}
        aria-labelledby="login-title"
        aria-describedby="login-desc"
        data-stacked={stage === "otp" || stage === "success" ? "under" : undefined}
        className={dialogBase}
        onCancel={(e) => {
          e.preventDefault();
          if (stage === "login") resetAll();
        }}
        onClose={() => {
          if (stage === "login") resetAll();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && stage === "login") resetAll();
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="login-title" className="text-xl font-bold tracking-tight">
                Welcome back
              </h2>
              <p id="login-desc" className="mt-1 text-sm text-slate-600">
                Sign in to your Harborlane workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              aria-label="Close sign in dialog"
              className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium">
                Work email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  autoComplete="username"
                  inputMode="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginLoading}
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? loginErrorId : undefined}
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-sm font-medium">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => e.preventDefault()}
                  className="rounded text-xs font-medium text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginLoading}
                  aria-invalid={loginError ? true : undefined}
                  aria-describedby={loginError ? loginErrorId : undefined}
                  className={`${inputBase} px-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div id={loginErrorId} role="alert" aria-live="assertive">
              {loginError && (
                <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {loginError}
                </p>
              )}
            </div>

            <button type="submit" disabled={loginLoading} className={primaryBtn}>
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Checking credentials…
                </>
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
            <p className="font-semibold text-slate-700">Demo credentials</p>
            <p className="mt-1">
              Email: <code className="font-mono text-slate-900">{DEMO_EMAIL}</code>
            </p>
            <p>
              Password: <code className="font-mono text-slate-900">{DEMO_PASSWORD}</code>
            </p>
          </div>
        </div>
      </dialog>

      {/* OTP dialog (top of stack) */}
      <dialog
        ref={otpRef}
        aria-labelledby="otp-title"
        aria-describedby={otpHintId}
        className={dialogBase}
        onCancel={(e) => {
          e.preventDefault();
          if (stage === "otp") backToLogin();
          else if (stage === "success") resetAll();
        }}
      >
        {stage === "success" ? (
          <div className="p-6 text-center sm:p-8">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h2 id="otp-title" className="mt-4 text-xl font-bold tracking-tight">
              You&apos;re signed in
            </h2>
            <p id={otpHintId} role="status" className="mt-2 text-sm text-slate-600">
              Welcome back, Maya. Your session on this device is secured and will stay active for 12 hours.
            </p>
            <button
              type="button"
              onClick={resetAll}
              autoFocus
              className={`${primaryBtn} mt-6`}
            >
              Go to dashboard
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="otp-title" className="text-xl font-bold tracking-tight">
                    Two-step verification
                  </h2>
                  <p id={otpHintId} className="mt-1 text-sm text-slate-600">
                    We sent a 6-digit code to <span className="font-medium text-slate-900">{maskEmail(email.trim() || DEMO_EMAIL)}</span>.
                    It expires in 10 minutes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={backToLogin}
                aria-label="Close verification and go back"
                className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleOtpFormSubmit} noValidate className="mt-6">
              <fieldset disabled={otpLoading} className="min-w-0">
                <legend className="mb-2 text-sm font-medium">Verification code</legend>
                <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpInputs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      maxLength={OTP_LENGTH}
                      value={d}
                      aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                      aria-invalid={otpError ? true : undefined}
                      aria-describedby={otpError ? otpErrorId : undefined}
                      onChange={(e) => setDigitAt(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      onFocus={(e) => e.currentTarget.select()}
                      className={`h-12 w-full min-w-0 rounded-lg border bg-white text-center text-lg font-semibold text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:bg-slate-50 sm:h-14 sm:text-xl ${
                        otpError
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                          : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/30"
                      }`}
                    />
                  ))}
                </div>
              </fieldset>

              <div id={otpErrorId} role="alert" aria-live="assertive" className="mt-3">
                {otpError && (
                  <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {otpError}
                  </p>
                )}
              </div>

              <button type="submit" disabled={otpLoading} className={`${primaryBtn} mt-4`}>
                {otpLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Verifying…
                  </>
                ) : (
                  "Verify and sign in"
                )}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <button
                type="button"
                onClick={backToLogin}
                className="inline-flex items-center gap-1.5 rounded font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to password
              </button>
              <button
                type="button"
                onClick={resendCode}
                disabled={resendIn > 0}
                className="rounded font-medium text-teal-700 hover:underline focus-visible:outline-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
              >
                {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
              </button>
            </div>

            <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 ring-1 ring-slate-200">
              Demo code: <code className="font-mono font-semibold text-slate-900">{DEMO_OTP}</code>
            </p>
          </div>
        )}
      </dialog>
    </div>
  );
}

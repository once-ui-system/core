"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
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
} from "lucide-react";

type Step = "closed" | "password" | "otp" | "done";

const OTP_LENGTH = 6;
const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_CODE = "482916";
const RESEND_SECONDS = 30;

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 aria-[invalid=true]:border-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";
const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60";
const dialogClass =
  "m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100";

export default function Page() {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const loginRef = useRef<HTMLDialogElement>(null);
  const otpRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timers = useRef<number[]>([]);

  const uid = useId();
  const loginTitleId = `${uid}-login-title`;
  const loginDescId = `${uid}-login-desc`;
  const otpTitleId = `${uid}-otp-title`;
  const otpDescId = `${uid}-otp-desc`;
  const passwordErrId = `${uid}-pw-err`;
  const otpErrId = `${uid}-otp-err`;

  // Sync native dialogs with the step. Opening login first, then OTP, stacks them
  // in the browser top layer, so Escape and focus trapping apply to the top one.
  useEffect(() => {
    const login = loginRef.current;
    const otp = otpRef.current;
    if (!login || !otp) return;
    const wantLogin = step === "password" || step === "otp";
    if (wantLogin && !login.open) login.showModal();
    if (!wantLogin && login.open) login.close();
    if (step === "otp" && !otp.open) otp.showModal();
    if (step !== "otp" && otp.open) otp.close();
  }, [step]);

  // Focus management
  useEffect(() => {
    if (step === "otp") cellRefs.current[0]?.focus();
    if (step === "password") passwordInputRef.current?.focus();
  }, [step]);

  // Return focus to the trigger when everything closes
  useEffect(() => {
    if (step === "closed" || step === "done") triggerRef.current?.focus();
  }, [step]);

  // Resend countdown
  useEffect(() => {
    if (step !== "otp") return;
    setSecondsLeft(RESEND_SECONDS);
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [step]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      for (const t of list) window.clearTimeout(t);
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const resetAll = () => {
    setPassword("");
    setPasswordError("");
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setSubmitting(false);
    setVerifying(false);
  };

  const openLogin = () => {
    resetAll();
    setStep("password");
  };

  const submitPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setPasswordError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      passwordInputRef.current?.focus();
      return;
    }
    setPasswordError("");
    setSubmitting(true);
    later(() => {
      setSubmitting(false);
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setStep("otp");
    }, 700);
  };

  const verify = (code: string) => {
    setVerifying(true);
    setOtpError("");
    later(() => {
      setVerifying(false);
      if (code === DEMO_CODE) {
        setStep("done");
      } else {
        setOtpError("That code is incorrect or has expired. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        cellRefs.current[0]?.focus();
      }
    }, 700);
  };

  const setCell = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((v, i) => (i === index ? "" : v)));
      return;
    }
    const next = [...digits];
    let i = index;
    for (const ch of clean) {
      if (i >= OTP_LENGTH) break;
      next[i] = ch;
      i += 1;
    }
    setDigits(next);
    setOtpError("");
    if (i < OTP_LENGTH) cellRefs.current[i]?.focus();
    else cellRefs.current[OTP_LENGTH - 1]?.focus();
    if (next.every(Boolean) && !verifying) verify(next.join(""));
  };

  const onCellKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigits((d) => d.map((v, i) => (i === index - 1 ? "" : v)));
      cellRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      cellRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      cellRefs.current[index + 1]?.focus();
    }
  };

  const onCellPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    setCell(0, text.slice(0, OTP_LENGTH));
  };

  const submitOtp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Enter all 6 digits of your code.");
      cellRefs.current[digits.findIndex((d) => !d)]?.focus();
      return;
    }
    if (!verifying) verify(code);
  };

  const resend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    cellRefs.current[0]?.focus();
  };

  const maskedEmail = email.replace(/^(.).*(@.*)$/, "$1•••$2");

  return (
    <main className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white"
          >
            <ShieldCheck className="size-4" />
          </span>
          Northwind Console
        </div>
        <button
          type="button"
          onClick={openLogin}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/70 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Sign in
        </button>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center gap-6 px-4 pb-16 sm:px-6">
        {step === "done" ? (
          <div
            role="status"
            className="flex w-full max-w-xl items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Signed in as {email}</p>
              <p className="mt-1 text-sm">
                Two-step verification passed. Your session is active on this device
                for the next 12 hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  resetAll();
                  setStep("closed");
                }}
                className="mt-3 text-sm font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-emerald-700"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-400">
              Workspace access for 1,284 team members
            </p>
            <h1 className="max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Every deploy, invoice and audit log in one secure console.
            </h1>
            <p className="max-w-xl text-pretty text-base text-slate-600 sm:text-lg dark:text-slate-400">
              Sign in with your password, then confirm with the 6-digit code from
              your authenticator app.
            </p>
            <button
              ref={triggerRef}
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <Lock className="size-4" aria-hidden="true" />
              Sign in to your workspace
            </button>
          </>
        )}
      </section>

      {/* Dialog 1: password */}
      <dialog
        ref={loginRef}
        aria-labelledby={loginTitleId}
        aria-describedby={loginDescId}
        onClose={() => setStep((s) => (s === "password" || s === "otp" ? "closed" : s))}
        className={`${dialogClass} transition-transform duration-200 ${
          step === "otp" ? "scale-[0.97]" : ""
        }`}
      >
        <form onSubmit={submitPassword} noValidate className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 id={loginTitleId} className="text-xl font-semibold">
              Welcome back
            </h2>
            <p id={loginDescId} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Enter your credentials to continue to Northwind Console.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor={`${uid}-email`} className="text-sm font-medium">
              Work email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id={`${uid}-email`}
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={`${uid}-password`} className="text-sm font-medium">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                ref={passwordInputRef}
                id={`${uid}-password`}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? passwordErrId : undefined}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-slate-800"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordError && (
              <p
                id={passwordErrId}
                role="alert"
                className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={submitting} className={primaryButton}>
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Checking…" : "Continue"}
            </button>
            <button
              type="button"
              onClick={() => loginRef.current?.close()}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      {/* Dialog 2: OTP, stacked above the login dialog */}
      <dialog
        ref={otpRef}
        aria-labelledby={otpTitleId}
        aria-describedby={otpDescId}
        onClose={() => setStep((s) => (s === "otp" ? "password" : s))}
        className={`${dialogClass} backdrop:bg-slate-950/30`}
      >
        <form onSubmit={submitOtp} noValidate className="space-y-5 p-6 sm:p-8">
          <button
            type="button"
            onClick={() => otpRef.current?.close()}
            className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>

          <div>
            <h2 id={otpTitleId} className="text-xl font-semibold">
              Two-step verification
            </h2>
            <p id={otpDescId} className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Enter the 6-digit code from your authenticator app for {maskedEmail}.
            </p>
          </div>

          <fieldset>
            <legend className="sr-only">One-time code</legend>
            <div className="flex justify-between gap-2" onPaste={undefined}>
              {digits.map((d, i) => (
                <input
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length cells
                  key={i}
                  ref={(el) => {
                    cellRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={d}
                  disabled={verifying}
                  aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? otpErrId : undefined}
                  onChange={(e) => setCell(i, e.target.value)}
                  onKeyDown={(e) => onCellKey(i, e)}
                  onPaste={onCellPaste}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white text-center text-lg font-semibold text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 disabled:opacity-60 aria-[invalid=true]:border-red-600 sm:h-14 sm:text-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              ))}
            </div>
          </fieldset>

          <div aria-live="polite" className="min-h-5">
            {otpError && (
              <p
                id={otpErrId}
                role="alert"
                className="flex items-center gap-1.5 text-sm text-red-700 dark:text-red-400"
              >
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                {otpError}
              </p>
            )}
            {verifying && (
              <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Verifying code…
              </p>
            )}
          </div>

          <button type="submit" disabled={verifying} className={primaryButton}>
            Verify and sign in
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            Didn’t get a code?{" "}
            {secondsLeft > 0 ? (
              <span>Resend in {secondsLeft}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600 dark:text-indigo-400"
              >
                Resend code
              </button>
            )}
          </p>
          <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Demo: use any password of 8+ characters, then code {DEMO_CODE}.
          </p>
        </form>
      </dialog>
    </main>
  );
}

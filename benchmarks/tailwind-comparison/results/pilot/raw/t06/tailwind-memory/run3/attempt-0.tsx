"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, X, CheckCircle2, Loader2 } from "lucide-react";

type Step = "closed" | "password" | "otp" | "done";

const DEMO_EMAIL = "maya.okafor@northwind.example";
const DEMO_PASSWORD = "correct-horse-42";
const DEMO_CODE = "482913";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 aria-[invalid=true]:border-red-600";

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60";

export default function Page() {
  const [step, setStep] = useState<Step>("closed");
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [seconds, setSeconds] = useState(0);

  const loginRef = useRef<HTMLDialogElement>(null);
  const otpRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const otpInputs = useRef<Array<HTMLInputElement | null>>([]);

  const loginTitleId = useId();
  const loginDescId = useId();
  const otpTitleId = useId();
  const otpDescId = useId();
  const emailErrId = useId();
  const passErrId = useId();
  const otpErrId = useId();

  const loginOpen = step === "password" || step === "otp";
  const otpOpen = step === "otp";

  // Sync native dialogs with state. Opening the OTP dialog second stacks it above the first.
  useEffect(() => {
    const dlg = loginRef.current;
    if (!dlg) return;
    if (loginOpen && !dlg.open) dlg.showModal();
    if (!loginOpen && dlg.open) dlg.close();
  }, [loginOpen]);

  useEffect(() => {
    const dlg = otpRef.current;
    if (!dlg) return;
    if (otpOpen && !dlg.open) {
      dlg.showModal();
      otpInputs.current[0]?.focus();
    }
    if (!otpOpen && dlg.open) dlg.close();
  }, [otpOpen]);

  // Resend countdown.
  useEffect(() => {
    if (seconds <= 0) return;
    const id = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [seconds]);

  // Return focus to the trigger when everything closes.
  useEffect(() => {
    if (step === "closed" || step === "done") triggerRef.current?.focus();
  }, [step]);

  function reset() {
    setPassword("");
    setShowPassword(false);
    setPasswordError("");
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setLoading(false);
    setSeconds(0);
  }

  function openLogin() {
    reset();
    setStep("password");
  }

  function closeAll() {
    reset();
    setStep("closed");
  }

  function submitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!email.includes("@")) {
      setPasswordError("Enter a valid work email address.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      passwordInputRef.current?.focus();
      return;
    }
    setPasswordError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (password !== DEMO_PASSWORD) {
        setPasswordError("That email and password combination does not match. Try again.");
        passwordInputRef.current?.focus();
        return;
      }
      setDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setSeconds(RESEND_SECONDS);
      setStep("otp");
    }, 700);
  }

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function onDigitChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      setDigitAt(index, "");
      return;
    }
    if (value.length > 1) {
      fillFrom(index, value);
      return;
    }
    setDigitAt(index, value);
    setOtpError("");
    if (index < OTP_LENGTH - 1) otpInputs.current[index + 1]?.focus();
  }

  function fillFrom(start: number, raw: string) {
    const chars = raw.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    if (chars.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[start + i] = c;
      });
      return next;
    });
    setOtpError("");
    otpInputs.current[Math.min(start + chars.length, OTP_LENGTH - 1)]?.focus();
  }

  function onDigitKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      setDigitAt(index - 1, "");
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpInputs.current[index + 1]?.focus();
    }
  }

  function onDigitPaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    fillFrom(index, e.clipboardData.getData("text"));
  }

  function submitOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError(`Enter all ${OTP_LENGTH} digits of the code.`);
      otpInputs.current[Math.max(0, digits.findIndex((d) => !d))]?.focus();
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      if (code !== DEMO_CODE) {
        setOtpError("That code is incorrect or has expired. Check your authenticator app.");
        setDigits(Array(OTP_LENGTH).fill(""));
        otpInputs.current[0]?.focus();
        return;
      }
      setStep("done");
    }, 700);
  }

  function resend() {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    otpInputs.current[0]?.focus();
  }

  const signedIn = step === "done";

  return (
    <main className="min-h-dvh bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
          <ShieldCheck className="size-7" aria-hidden="true" />
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Northwind Console
        </h1>
        <p className="mt-3 text-pretty text-slate-600">
          Manage billing, team access and deployment keys for your workspace. Sign in with your
          password and a one-time code from your authenticator app.
        </p>

        {signedIn ? (
          <div
            role="status"
            className="mt-8 flex w-full items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left"
          >
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-emerald-900">Signed in as {email}</p>
              <p className="mt-1 text-sm text-emerald-800">
                Two-step verification completed. Your session expires in 12 hours.
              </p>
              <button
                type="button"
                onClick={openLogin}
                className="mt-3 text-sm font-medium text-emerald-900 underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Sign in with a different account
              </button>
            </div>
          </div>
        ) : null}

        <button
          ref={triggerRef}
          type="button"
          onClick={openLogin}
          aria-haspopup="dialog"
          className={`${primaryButton} mt-8 max-w-xs ${signedIn ? "hidden" : ""}`}
        >
          <Lock className="size-4" aria-hidden="true" />
          Sign in
        </button>

        <p className="mt-6 text-xs text-slate-500">
          Demo credentials: password <code className="rounded bg-slate-200 px-1 py-0.5">{DEMO_PASSWORD}</code>
          , code <code className="rounded bg-slate-200 px-1 py-0.5">{DEMO_CODE}</code>
        </p>
      </div>

      {/* Dialog 1: password */}
      <dialog
        ref={loginRef}
        aria-labelledby={loginTitleId}
        aria-describedby={loginDescId}
        onClose={() => {
          if (step === "password") closeAll();
        }}
        onCancel={(e) => {
          // Escape on the lower dialog while the OTP dialog is open should not tear it down.
          if (step === "otp") e.preventDefault();
        }}
        className={`m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm transition duration-200 ${
          otpOpen ? "scale-95 opacity-60" : ""
        }`}
      >
        <form onSubmit={submitPassword} noValidate className="p-6 sm:p-8" inert={otpOpen}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={loginTitleId} className="text-xl font-semibold">
                Sign in to your workspace
              </h2>
              <p id={loginDescId} className="mt-1 text-sm text-slate-600">
                Step 1 of 2. Enter your email and password.
              </p>
            </div>
            <button
              type="button"
              onClick={closeAll}
              aria-label="Close sign in dialog"
              className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-800">
                Work email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
                  Password
                </label>
                <a
                  href="#forgot"
                  className="text-sm font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
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
                  ref={passwordInputRef}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  required
                  aria-invalid={passwordError ? true : undefined}
                  aria-describedby={passwordError ? passErrId : undefined}
                  className={`${inputClass} px-9`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {passwordError ? (
                <p id={passErrId} role="alert" className="mt-2 text-sm text-red-700">
                  {passwordError}
                </p>
              ) : null}
              <span id={emailErrId} className="sr-only" />
            </div>
          </div>

          <button type="submit" disabled={loading} className={`${primaryButton} mt-6`}>
            {loading && step === "password" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {loading && step === "password" ? "Checking..." : "Continue"}
          </button>
        </form>
      </dialog>

      {/* Dialog 2: OTP, stacked above the first */}
      <dialog
        ref={otpRef}
        aria-labelledby={otpTitleId}
        aria-describedby={otpDescId}
        onClose={() => {
          if (step === "otp") {
            setDigits(Array(OTP_LENGTH).fill(""));
            setOtpError("");
            setStep("password");
            window.setTimeout(() => passwordInputRef.current?.focus(), 0);
          }
        }}
        className="m-auto w-[calc(100%-3rem)] max-w-sm translate-y-4 rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/30"
      >
        <form onSubmit={submitOtp} noValidate className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={otpTitleId} className="text-xl font-semibold">
                Two-step verification
              </h2>
              <p id={otpDescId} className="mt-1 text-sm text-slate-600">
                Step 2 of 2. Enter the {OTP_LENGTH}-digit code from your authenticator app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => otpRef.current?.close()}
              aria-label="Back to password step"
              className="-mr-2 -mt-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <fieldset className="mt-6">
            <legend className="sr-only">One-time code</legend>
            <div className="flex justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional inputs
                  key={i}
                  ref={(el) => {
                    otpInputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={d}
                  onChange={(e) => onDigitChange(i, e)}
                  onKeyDown={(e) => onDigitKeyDown(i, e)}
                  onPaste={(e) => onDigitPaste(i, e)}
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  aria-invalid={otpError ? true : undefined}
                  aria-describedby={otpError ? otpErrId : undefined}
                  className="h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white text-center text-lg font-semibold tabular-nums text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 aria-[invalid=true]:border-red-600 sm:h-14 sm:text-xl"
                />
              ))}
            </div>
            {otpError ? (
              <p id={otpErrId} role="alert" className="mt-3 text-sm text-red-700">
                {otpError}
              </p>
            ) : null}
          </fieldset>

          <button type="submit" disabled={loading} className={`${primaryButton} mt-6`}>
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {loading ? "Verifying..." : "Verify and sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600" aria-live="polite">
            {seconds > 0 ? (
              <>Resend code in {seconds}s</>
            ) : (
              <>
                Did not get a code?{" "}
                <button
                  type="button"
                  onClick={resend}
                  className="font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  Resend
                </button>
              </>
            )}
          </p>
        </form>
      </dialog>
    </main>
  );
}

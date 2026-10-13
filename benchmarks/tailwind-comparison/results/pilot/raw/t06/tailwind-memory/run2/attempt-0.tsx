"use client";

import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
// Demo-only: the code our pretend server accepts.
const DEMO_CODE = "482913";
const DEMO_PASSWORD = "correct-horse-battery";

type Session = { email: string; signedInAt: string };

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"•".repeat(Math.max(name.length - 2, 1))}@${domain}`;
}

/* -------------------------------------------------------------------------- */
/* Modal built on the native <dialog> element: focus trap, Esc, top layer      */
/* stacking and focus restoration come from the platform.                      */
/* -------------------------------------------------------------------------- */

function Modal({
  open,
  onClose,
  titleId,
  descriptionId,
  dimmed = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  dimmed?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={[
        "m-auto w-[calc(100%-2rem)] max-w-md overflow-visible rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl transition-all duration-200",
        "backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm",
        dimmed ? "scale-[0.96] opacity-60" : "scale-100 opacity-100",
      ].join(" ")}
    >
      {open ? children : null}
    </dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Login dialog                                                                */
/* -------------------------------------------------------------------------- */

function LoginDialog({
  open,
  dimmed,
  onClose,
  onSuccess,
}: {
  open: boolean;
  dimmed: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const [email, setEmail] = useState("amara.okafor@northwind.example");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShow(false);
      setErrors({});
      setBusy(false);
    }
  }, [open]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    if (next.email || next.password) return;

    setBusy(true);
    await wait(700);
    if (password !== DEMO_PASSWORD) {
      setBusy(false);
      setErrors({ form: "That email and password combination does not match our records." });
      return;
    }
    setBusy(false);
    onSuccess(email);
  }

  return (
    <Modal open={open} onClose={onClose} titleId={titleId} descriptionId={descId} dimmed={dimmed}>
      <div className="p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="mb-6">
          <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </span>
          <h2 id={titleId} className="text-xl font-semibold tracking-tight">
            Sign in to Harbor
          </h2>
          <p id={descId} className="mt-1 text-sm text-slate-600">
            Use your work email and password. We will ask for a one-time code next.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {errors.form ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {errors.form}
            </p>
          ) : null}

          <div>
            <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium">
              Work email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? `${uid}-email-err` : undefined}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-[invalid=true]:border-red-600 sm:text-sm"
            />
            {errors.email ? (
              <p id={`${uid}-email-err`} className="mt-1.5 text-sm text-red-700">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor={`${uid}-password`} className="block text-sm font-medium">
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
              <input
                id={`${uid}-password`}
                type={show ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={`${uid}-password-hint${errors.password ? ` ${uid}-password-err` : ""}`}
                className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-11 text-base placeholder:text-slate-400 focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-[invalid=true]:border-red-600 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Hide password" : "Show password"}
                aria-pressed={show}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600"
              >
                {show ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
            <p id={`${uid}-password-hint`} className="mt-1.5 text-xs text-slate-500">
              Demo password: {DEMO_PASSWORD}
            </p>
            {errors.password ? (
              <p id={`${uid}-password-err`} className="mt-1 text-sm text-red-700">
                {errors.password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Checking credentials…" : "Continue"}
          </button>
        </form>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* OTP dialog (stacked on top of the login dialog)                             */
/* -------------------------------------------------------------------------- */

function OtpDialog({
  open,
  email,
  onBack,
  onClose,
  onVerified,
}: {
  open: boolean;
  email: string;
  onBack: () => void;
  onClose: () => void;
  onVerified: () => void;
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [notice, setNotice] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const reset = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setError("");
    setBusy(false);
    setNotice("");
    setSeconds(RESEND_SECONDS);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (!open || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [open, seconds]);

  const verify = useCallback(
    async (code: string) => {
      setBusy(true);
      setError("");
      await wait(700);
      if (code !== DEMO_CODE) {
        setBusy(false);
        setError("That code is incorrect or has expired. Try again.");
        setDigits(Array(OTP_LENGTH).fill(""));
        inputs.current[0]?.focus();
        return;
      }
      setBusy(false);
      onVerified();
    },
    [onVerified],
  );

  function update(next: string[]) {
    setDigits(next);
    setError("");
    setNotice("");
    const code = next.join("");
    if (code.length === OTP_LENGTH && next.every(Boolean)) void verify(code);
  }

  function handleChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      update(next);
      return;
    }
    const next = [...digits];
    // Handles typing and autofill that drops several digits into one box.
    let cursor = index;
    for (const ch of clean) {
      if (cursor >= OTP_LENGTH) break;
      next[cursor] = ch;
      cursor += 1;
    }
    update(next);
    inputs.current[Math.min(cursor, OTP_LENGTH - 1)]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      e.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("") as string[];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    update(next);
    inputs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  function resend() {
    setSeconds(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setError("");
    setNotice("A new code is on its way.");
    inputs.current[0]?.focus();
  }

  return (
    <Modal open={open} onClose={onClose} titleId={titleId} descriptionId={descId}>
      <div className="p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close verification dialog"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onBack}
          className="mb-4 -ml-1 inline-flex items-center gap-1 rounded px-1 text-sm font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to password
        </button>

        <h2 id={titleId} className="text-xl font-semibold tracking-tight">
          Enter your verification code
        </h2>
        <p id={descId} className="mt-1 text-sm text-slate-600">
          We sent a 6-digit code to <span className="font-medium text-slate-900">{maskEmail(email)}</span>.
          It expires in 10 minutes.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const code = digits.join("");
            if (code.length < OTP_LENGTH) {
              setError("Enter all 6 digits.");
              inputs.current[digits.findIndex((d) => !d)]?.focus();
              return;
            }
            void verify(code);
          }}
          className="mt-6"
        >
          <fieldset disabled={busy} className="min-w-0 border-0 p-0">
            <legend className="sr-only">One-time code, {OTP_LENGTH} digits</legend>
            <div className="flex justify-between gap-2 sm:gap-3">
              {digits.map((d, i) => (
                <input
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional inputs
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={OTP_LENGTH}
                  value={d}
                  aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${uid}-err` : undefined}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className="h-13 w-full min-w-0 rounded-lg border border-slate-300 bg-white text-center text-xl font-semibold tabular-nums focus:border-indigo-600 focus:outline-2 focus:outline-indigo-600/30 aria-[invalid=true]:border-red-600 disabled:bg-slate-50 sm:h-14"
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-3 min-h-10" aria-live="polite">
            {error ? (
              <p id={`${uid}-err`} role="alert" className="text-sm text-red-700">
                {error}
              </p>
            ) : notice ? (
              <p className="text-sm text-emerald-700">{notice}</p>
            ) : (
              <p className="text-xs text-slate-500">Demo code: {DEMO_CODE}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {busy ? "Verifying…" : "Verify and sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Did not get a code?{" "}
            {seconds > 0 ? (
              <span>Resend in {seconds}s</span>
            ) : (
              <button
                type="button"
                onClick={resend}
                className="rounded font-medium text-indigo-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Resend code
              </button>
            )}
          </p>
        </form>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

const ACTIVITY = [
  { id: 1, title: "Deployment succeeded", detail: "api-gateway v2.14.3 to production", time: "12 min ago" },
  { id: 2, title: "New teammate joined", detail: "Priya Raman accepted your invite", time: "1 hr ago" },
  { id: 3, title: "Usage alert resolved", detail: "Build minutes back under 80% of quota", time: "Yesterday" },
];

export default function Page() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeAll = useCallback(() => {
    setOtpOpen(false);
    setLoginOpen(false);
  }, []);

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">Harbor</span>
          </div>
          {session ? (
            <button
              type="button"
              onClick={() => setSession(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {session ? (
          <section aria-labelledby="welcome-title">
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p className="text-sm">
                Signed in as <strong>{session.email}</strong> at {session.signedInAt} with two-factor verification.
              </p>
            </div>
            <h1 id="welcome-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back, Amara
            </h1>
            <p className="mt-2 text-slate-600">Here is what happened in the Northwind workspace.</p>
            <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {ACTIVITY.map((a) => (
                <li key={a.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-slate-600">{a.detail}</p>
                  </div>
                  <p className="text-sm text-slate-500">{a.time}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section aria-labelledby="hero-title" className="mx-auto max-w-2xl text-center">
            <h1 id="hero-title" className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Ship securely with Harbor
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Deployments, secrets and audit logs for your team, protected by password and one-time code sign in.
            </p>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="mt-8 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in to your workspace
            </button>
          </section>
        )}
      </div>

      <LoginDialog
        open={loginOpen}
        dimmed={otpOpen}
        onClose={closeAll}
        onSuccess={(email) => {
          setPendingEmail(email);
          setOtpOpen(true);
        }}
      />
      <OtpDialog
        open={otpOpen}
        email={pendingEmail}
        onBack={() => setOtpOpen(false)}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          setSession({
            email: pendingEmail,
            signedInAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          });
          closeAll();
        }}
      />
    </main>
  );
}

I'll build the wizard as a client component, with the data in `lib/data.ts` and the welcome page as a server component.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const steps = [
  { id: 1, label: "Account", hint: "Who you are" },
  { id: 2, label: "Workspace", hint: "Your team's home" },
  { id: 3, label: "Invite", hint: "Bring teammates" },
  { id: 4, label: "Preferences", hint: "Make it yours" },
] as const;

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51+ people" },
] as const;

export const themes = [
  { value: "light", label: "Light", description: "Bright and crisp" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
] as const;

export type ThemeValue = (typeof themes)[number]["value"];

export const MAX_INVITES = 3;

export const nextSteps = [
  {
    title: "Connect your first data source",
    description:
      "Install the Lumen snippet or SDK so page views and events start flowing into your dashboards.",
  },
  {
    title: "Create your first project",
    description:
      "Projects group your issues, releases and analytics for a single product or service.",
  },
  {
    title: "Import or file your first issues",
    description:
      "Bring in a CSV from your old tracker, or log the bug you've been meaning to write down.",
  },
  {
    title: "Set up a weekly review",
    description:
      "Pick a day for the team to look at funnel drop-offs and the issue backlog together.",
  },
];
```

```tsx components/onboarding-wizard.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import {
  MAX_INVITES,
  steps,
  teamSizes,
  themes,
  user,
  type ThemeValue,
} from "@/lib/data";
import { StepIndicator } from "@/components/step-indicator";
import { SummaryCard } from "@/components/summary-card";
import { Field, inputClass } from "@/components/field";

export type WizardData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: ThemeValue;
  digest: boolean;
};

type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(step: number, data: WizardData): Errors {
  const errors: Errors = {};
  if (step === 1) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!EMAIL_RE.test(data.email.trim()))
      errors.email = "Enter a valid email address, like name@company.com.";
  }
  if (step === 2) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (step === 3) {
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (!v) return;
      if (!EMAIL_RE.test(v)) errors[`invite-${i}`] = "Enter a valid email address.";
      else if (v === data.email.trim().toLowerCase())
        errors[`invite-${i}`] = "That's your own email — invite someone else.";
      else if (seen.has(v)) errors[`invite-${i}`] = "You've already added this email.";
      seen.add(v);
    });
  }
  return errors;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>({
    name: "",
    email: "",
    workspace: "",
    teamSize: "",
    invites: [""],
    theme: "system",
    digest: true,
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!(key in e)) return e;
      const { [key as string]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  };

  const setInvite = (i: number, value: string) => {
    setData((d) => ({ ...d, invites: d.invites.map((v, idx) => (idx === i ? value : v)) }));
    setErrors((e) => {
      const key = `invite-${i}`;
      if (!(key in e)) return e;
      const { [key]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  };

  const goTo = (n: number) => {
    setStep(n);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const onNext = () => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>('[data-wizard] [aria-invalid="true"]');
        first?.focus();
      });
      return;
    }
    if (step < steps.length) goTo(step + 1);
  };

  const onFinish = () => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setSubmitting(true);
    router.push("/welcome");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < steps.length) onNext();
    else onFinish();
  };

  const current = steps[step - 1];
  const hasInvites = data.invites.some((v) => v.trim());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white"
        >
          L
        </span>
        <div>
          <p className="text-base font-semibold leading-tight text-slate-900">Lumen</p>
          <p className="text-sm text-slate-600">Let&apos;s get your team set up</p>
        </div>
      </header>

      <StepIndicator current={step} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <form
          noValidate
          data-wizard
          onSubmit={onSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
        >
          <p className="text-sm font-medium text-indigo-700">
            Step {step} of {steps.length}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 outline-none"
          >
            {step === 1 && "Create your account"}
            {step === 2 && "Set up your workspace"}
            {step === 3 && "Invite your teammates"}
            {step === 4 && "Choose your preferences"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {step === 1 && "We'll use this to sign you in and send important account notices."}
            {step === 2 && "A workspace holds your projects, issues and analytics."}
            {step === 3 &&
              `Add up to ${MAX_INVITES} teammates now. You can skip this and invite people later.`}
            {step === 4 && "Pick how Lumen looks and what lands in your inbox."}
          </p>

          <div className="mt-6 space-y-5">
            {step === 1 && (
              <>
                <Field id="name" label="Full name" error={errors.name}>
                  {(p) => (
                    <input
                      {...p}
                      type="text"
                      autoComplete="name"
                      placeholder={user.name}
                      value={data.name}
                      onChange={(e) => update("name", e.target.value)}
                      className={inputClass(!!errors.name)}
                    />
                  )}
                </Field>
                <Field id="email" label="Work email" error={errors.email}>
                  {(p) => (
                    <input
                      {...p}
                      type="email"
                      autoComplete="email"
                      placeholder={user.email}
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass(!!errors.email)}
                    />
                  )}
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field id="workspace" label="Workspace name" error={errors.workspace}>
                  {(p) => (
                    <input
                      {...p}
                      type="text"
                      autoComplete="organization"
                      placeholder="Acme Labs"
                      value={data.workspace}
                      onChange={(e) => update("workspace", e.target.value)}
                      className={inputClass(!!errors.workspace)}
                    />
                  )}
                </Field>
                <Field id="teamSize" label="Team size" error={errors.teamSize}>
                  {(p) => (
                    <select
                      {...p}
                      value={data.teamSize}
                      onChange={(e) => update("teamSize", e.target.value)}
                      className={inputClass(!!errors.teamSize)}
                    >
                      <option value="">Select team size…</option>
                      {teamSizes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                {data.invites.map((value, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <Field
                        id={`invite-${i}`}
                        label={`Teammate ${i + 1} email`}
                        error={errors[`invite-${i}`]}
                      >
                        {(p) => (
                          <input
                            {...p}
                            type="email"
                            autoComplete="off"
                            placeholder="teammate@company.com"
                            value={value}
                            onChange={(e) => setInvite(i, e.target.value)}
                            className={inputClass(!!errors[`invite-${i}`])}
                          />
                        )}
                      </Field>
                    </div>
                    {data.invites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setData((d) => ({
                            ...d,
                            invites: d.invites.filter((_, idx) => idx !== i),
                          }));
                          setErrors({});
                        }}
                        aria-label={`Remove teammate ${i + 1}`}
                        className="mt-7 grid size-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
                {data.invites.length < MAX_INVITES && (
                  <button
                    type="button"
                    onClick={() => setData((d) => ({ ...d, invites: [...d.invites, ""] }))}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add another teammate
                  </button>
                )}
              </>
            )}

            {step === 4 && (
              <>
                <fieldset>
                  <legend className="text-sm font-medium text-slate-900">Theme</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {themes.map((t) => {
                      const checked = data.theme === t.value;
                      return (
                        <label
                          key={t.value}
                          className={`relative flex min-h-11 cursor-pointer flex-col rounded-xl border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600 ${
                            checked
                              ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                              : "border-slate-300 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={t.value}
                            checked={checked}
                            onChange={() => update("theme", t.value)}
                            className="sr-only"
                          />
                          <span className="flex items-center justify-between text-sm font-medium text-slate-900">
                            {t.label}
                            {checked && (
                              <Check className="size-4 text-indigo-700" aria-hidden="true" />
                            )}
                          </span>
                          <span className="mt-1 text-sm text-slate-600">{t.description}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600">
                  <input
                    type="checkbox"
                    checked={data.digest}
                    onChange={(e) => update("digest", e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-indigo-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      Send me the weekly digest
                    </span>
                    <span className="block text-sm text-slate-600">
                      A Monday summary of key metrics, new issues and what shipped.
                    </span>
                  </span>
                </label>
              </>
            )}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={step === 1}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {step === 3 && !hasInvites && (
                <button
                  type="button"
                  onClick={() => goTo(4)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Skip for now
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70"
              >
                {step === steps.length ? (
                  <>
                    {submitting ? "Finishing…" : "Finish setup"}
                    <Check className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Next: {steps[step].label}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {`Step ${step} of ${steps.length}: ${current.label}`}
          </p>
        </form>

        <SummaryCard data={data} />
      </div>
    </div>
  );
}
```

```tsx components/field.tsx
import { useId } from "react";

type InputProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export function inputClass(invalid: boolean) {
  return `block min-h-11 w-full rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 sm:text-sm ${
    invalid ? "border-red-600" : "border-slate-300"
  }`;
}

export function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: (props: InputProps) => React.ReactNode;
}) {
  const uid = useId();
  const errorId = `${uid}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-900">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
```

```tsx components/step-indicator.tsx
import { Check } from "lucide-react";
import { steps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-start">
        {steps.map((s, i) => {
          const done = s.id < current;
          const active = s.id === current;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold ${
                    done
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : active
                        ? "border-indigo-600 bg-white text-indigo-700"
                        : "border-slate-300 bg-white text-slate-600"
                  }`}
                >
                  {done ? <Check className="size-4" aria-hidden="true" /> : s.id}
                </span>
                <span className="text-center sm:text-left">
                  <span
                    className={`block text-xs font-medium sm:text-sm ${
                      active ? "text-slate-900" : "text-slate-600"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="hidden text-xs text-slate-600 lg:block">{s.hint}</span>
                  <span className="sr-only">
                    {done ? " (completed)" : active ? " (current step)" : " (upcoming)"}
                  </span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-2 mt-[18px] h-0.5 flex-1 self-start sm:mx-4 sm:mt-[17px] ${
                    done ? "bg-indigo-600" : "bg-slate-200"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

```tsx components/summary-card.tsx
import type { WizardData } from "@/components/onboarding-wizard";
import { teamSizes, themes } from "@/lib/data";

function Row({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <div className="py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className={`mt-0.5 break-words text-sm ${empty ? "text-slate-500" : "text-slate-900"}`}>
        {empty ? "Not provided yet" : value}
      </dd>
    </div>
  );
}

export function SummaryCard({ data }: { data: WizardData }) {
  const teamSize = teamSizes.find((t) => t.value === data.teamSize)?.label ?? "";
  const theme = themes.find((t) => t.value === data.theme)?.label ?? "";
  const invites = data.invites.map((v) => v.trim()).filter(Boolean);

  return (
    <aside
      aria-labelledby="summary-heading"
      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 lg:sticky lg:top-8"
    >
      <h2 id="summary-heading" className="text-base font-semibold text-slate-900">
        Your setup so far
      </h2>
      <dl className="mt-2 divide-y divide-slate-200">
        <Row label="Name" value={data.name.trim()} />
        <Row label="Work email" value={data.email.trim()} />
        <Row label="Workspace" value={data.workspace.trim()} />
        <Row label="Team size" value={teamSize} />
        <div className="py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Invitations
          </dt>
          <dd className="mt-0.5 text-sm">
            {invites.length === 0 ? (
              <span className="text-slate-500">No one invited yet</span>
            ) : (
              <ul className="space-y-0.5 text-slate-900">
                {invites.map((e, i) => (
                  <li key={i} className="break-all">
                    {e}
                  </li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        <Row label="Theme" value={theme} />
        <Row label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </dl>
    </aside>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <OnboardingWizard />
    </main>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { nextSteps, user } from "@/lib/data";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready.",
};

export default function WelcomePage() {
  const firstName = user.name.split(" ")[0];
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Your Lumen workspace is ready. Here&apos;s a short checklist to get real value from it
            in your first week.
          </p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Next steps
          </h2>
          <ol className="mt-3 space-y-3">
            {nextSteps.map((s) => (
              <li
                key={s.title}
                className="flex gap-3 rounded-xl border border-slate-200 p-4"
              >
                <Circle className="mt-0.5 size-5 shrink-0 text-indigo-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to onboarding
            </Link>
            <p className="text-sm text-slate-600">
              Signed in as {user.email} · {user.role}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```
"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import { MAX_INVITES, steps, teamSizes, themes, user } from "@/lib/data";
import type { WizardData } from "@/lib/data";
import { StepIndicator } from "@/components/step-indicator";
import { SummaryCard } from "@/components/summary-card";
import { FieldShell, inputClass } from "@/components/field";

type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function withoutKey(errors: Errors, key: string): Errors {
  if (!(key in errors)) return errors;
  const next: Errors = {};
  for (const k of Object.keys(errors)) {
    if (k !== key) next[k] = errors[k];
  }
  return next;
}

function validate(step: number, data: WizardData): Errors {
  const errors: Errors = {};
  if (step === 1) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (data.email.trim() === "") errors.email = "Enter your work email.";
    else if (!EMAIL_RE.test(data.email.trim()))
      errors.email = "Enter a valid email address, like name@company.com.";
  }
  if (step === 2) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (data.teamSize === "") errors.teamSize = "Choose your team size.";
  }
  if (step === 3) {
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (v === "") return;
      if (!EMAIL_RE.test(v)) errors["invite-" + i] = "Enter a valid email address.";
      else if (v === data.email.trim().toLowerCase())
        errors["invite-" + i] = "That's your own email, invite someone else.";
      else if (seen.has(v)) errors["invite-" + i] = "You've already added this email.";
      seen.add(v);
    });
  }
  return errors;
}

const headings = [
  "Create your account",
  "Set up your workspace",
  "Invite your teammates",
  "Choose your preferences",
];

const descriptions = [
  "We'll use this to sign you in and send important account notices.",
  "A workspace holds your projects, issues and analytics.",
  "Add up to " + MAX_INVITES + " teammates now. You can skip this and invite people later.",
  "Pick how Lumen looks and what lands in your inbox.",
];

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";

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
  const formRef = useRef<HTMLFormElement>(null);
  const focusTarget = useRef<"heading" | "error" | null>(null);

  useEffect(() => {
    if (focusTarget.current === "heading") {
      headingRef.current?.focus();
    } else if (focusTarget.current === "error") {
      const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
    }
    focusTarget.current = null;
  }, [step, errors]);

  const setField = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => withoutKey(e, key));
  };

  const setInvite = (i: number, value: string) => {
    setData((d) => ({ ...d, invites: d.invites.map((v, idx) => (idx === i ? value : v)) }));
    setErrors((e) => withoutKey(e, "invite-" + i));
  };

  const goTo = (n: number) => {
    focusTarget.current = "heading";
    setErrors({});
    setStep(n);
  };

  const tryAdvance = (): boolean => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      focusTarget.current = "error";
      setErrors(found);
      return false;
    }
    return true;
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tryAdvance()) return;
    if (step < steps.length) {
      goTo(step + 1);
    } else {
      setSubmitting(true);
      router.push("/welcome");
    }
  };

  const hasInvites = data.invites.some((v) => v.trim() !== "");
  const nextLabel = step < steps.length ? steps[step].label : "";

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
          ref={formRef}
          noValidate
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
            {headings[step - 1]}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{descriptions[step - 1]}</p>

          <div className="mt-6 space-y-5">
            {step === 1 ? (
              <>
                <FieldShell id="name" label="Full name" error={errors.name}>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder={user.name}
                    value={data.name}
                    onChange={(e) => setField("name", e.target.value)}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={inputClass(!!errors.name)}
                  />
                </FieldShell>
                <FieldShell id="email" label="Work email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={user.email}
                    value={data.email}
                    onChange={(e) => setField("email", e.target.value)}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={inputClass(!!errors.email)}
                  />
                </FieldShell>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <FieldShell id="workspace" label="Workspace name" error={errors.workspace}>
                  <input
                    id="workspace"
                    type="text"
                    autoComplete="organization"
                    placeholder="Acme Labs"
                    value={data.workspace}
                    onChange={(e) => setField("workspace", e.target.value)}
                    aria-invalid={errors.workspace ? true : undefined}
                    aria-describedby={errors.workspace ? "workspace-error" : undefined}
                    className={inputClass(!!errors.workspace)}
                  />
                </FieldShell>
                <FieldShell id="teamSize" label="Team size" error={errors.teamSize}>
                  <select
                    id="teamSize"
                    value={data.teamSize}
                    onChange={(e) => setField("teamSize", e.target.value)}
                    aria-invalid={errors.teamSize ? true : undefined}
                    aria-describedby={errors.teamSize ? "teamSize-error" : undefined}
                    className={inputClass(!!errors.teamSize)}
                  >
                    <option value="">Select team size…</option>
                    {teamSizes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </>
            ) : null}

            {step === 3 ? (
              <>
                {data.invites.map((value, i) => {
                  const key = "invite-" + i;
                  const err = errors[key];
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <FieldShell id={key} label={"Teammate " + (i + 1) + " email"} error={err}>
                          <input
                            id={key}
                            type="email"
                            autoComplete="off"
                            placeholder="teammate@company.com"
                            value={value}
                            onChange={(e) => setInvite(i, e.target.value)}
                            aria-invalid={err ? true : undefined}
                            aria-describedby={err ? key + "-error" : undefined}
                            className={inputClass(!!err)}
                          />
                        </FieldShell>
                      </div>
                      {data.invites.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              invites: d.invites.filter((_, idx) => idx !== i),
                            }));
                            setErrors({});
                          }}
                          aria-label={"Remove teammate " + (i + 1)}
                          className={
                            "mt-7 grid size-11 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 " +
                            focusRing
                          }
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
                {data.invites.length < MAX_INVITES ? (
                  <button
                    type="button"
                    onClick={() => setData((d) => ({ ...d, invites: [...d.invites, ""] }))}
                    className={
                      "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 " +
                      focusRing
                    }
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    Add another teammate
                  </button>
                ) : null}
              </>
            ) : null}

            {step === 4 ? (
              <>
                <fieldset>
                  <legend className="text-sm font-medium text-slate-900">Theme</legend>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    {themes.map((t) => {
                      const checked = data.theme === t.value;
                      return (
                        <label
                          key={t.value}
                          className={
                            "relative flex min-h-11 cursor-pointer flex-col rounded-xl border p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-600 " +
                            (checked
                              ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                              : "border-slate-300 bg-white hover:bg-slate-50")
                          }
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={t.value}
                            checked={checked}
                            onChange={() => setField("theme", t.value)}
                            className="sr-only"
                          />
                          <span className="flex items-center justify-between text-sm font-medium text-slate-900">
                            {t.label}
                            {checked ? (
                              <Check className="size-4 text-indigo-700" aria-hidden="true" />
                            ) : null}
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
                    onChange={(e) => setField("digest", e.target.checked)}
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
            ) : null}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={step === 1}
              className={
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 " +
                focusRing
              }
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back
            </button>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {step === 3 && !hasInvites ? (
                <button
                  type="button"
                  onClick={() => goTo(4)}
                  className={
                    "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 " +
                    focusRing
                  }
                >
                  Skip for now
                </button>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className={
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70 " +
                  focusRing
                }
              >
                {step === steps.length ? (
                  <>
                    {submitting ? "Finishing…" : "Finish setup"}
                    <Check className="size-4" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Next: {nextLabel}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {"Step " + step + " of " + steps.length + ": " + steps[step - 1].label}
          </p>
        </form>

        <SummaryCard data={data} />
      </div>
    </div>
  );
}

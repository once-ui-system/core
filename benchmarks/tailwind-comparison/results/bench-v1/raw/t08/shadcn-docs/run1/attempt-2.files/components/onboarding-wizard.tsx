"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/step-indicator";
import { SummaryCard } from "@/components/summary-card";
import {
  STORAGE_KEY,
  initialData,
  product,
  steps,
  teamSizes,
  themes,
  type OnboardingData,
  type ThemeValue,
} from "@/lib/data";

type Errors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const invitePlaceholders = ["tomas@acmelabs.io", "priya@acmelabs.io", "jonas@acmelabs.io"];

function validate(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name (at least 2 characters).";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!EMAIL_RE.test(data.email.trim()))
      errors.email = "Enter a valid email, like maya@acmelabs.io.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Select your team size.";
  }
  if (step === 2) {
    const seen = new Set<string>();
    const own = data.email.trim().toLowerCase();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!EMAIL_RE.test(value)) errors[`invite${i}`] = "Enter a valid email address or leave it blank.";
      else if (value === own) errors[`invite${i}`] = "That's your own email. Invite a teammate instead.";
      else if (seen.has(value)) errors[`invite${i}`] = "This email is already in the list.";
      else seen.add(value);
    });
  }
  return errors;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isLast = step === steps.length - 1;

  function update<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function clearError(key: string) {
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function updateInvite(index: number, value: string) {
    setData((d) => {
      const invites: OnboardingData["invites"] = [d.invites[0], d.invites[1], d.invites[2]];
      invites[index] = value;
      return { ...d, invites };
    });
    clearError(`invite${index}`);
  }

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function focusFirstInvalid() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
    focusHeading();
  }

  function skipInvites() {
    setData((d) => ({ ...d, invites: ["", "", ""] }));
    setErrors({});
    setStep((s) => s + 1);
    focusHeading();
  }

  function goNext() {
    const found = validate(step, data);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      focusFirstInvalid();
      return;
    }
    if (!isLast) {
      setStep((s) => s + 1);
      focusHeading();
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage unavailable; continue anyway
    }
    router.push("/welcome");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    goNext();
  }

  const current = steps[step];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold">{product.name}</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Set up your Lumen workspace
          </h1>
          <p className="mt-1 text-muted-foreground">
            {product.tagline}. Four quick steps and you&apos;re in.
          </p>
        </div>
        <StepIndicator current={step} />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <form ref={formRef} onSubmit={onSubmit} noValidate>
            <CardHeader>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-xl leading-tight font-semibold outline-none"
              >
                {current.title}
              </h2>
              <CardDescription>{current.description}</CardDescription>
            </CardHeader>

            <CardContent className="py-6">
              {step === 0 && (
                <FieldGroup>
                  <Field data-invalid={errors.name ? true : undefined}>
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      autoComplete="name"
                      placeholder="Maya Okafor"
                      value={data.name}
                      onChange={(e) => {
                        update("name", e.target.value);
                        clearError("name");
                      }}
                      aria-invalid={errors.name ? true : undefined}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
                  </Field>
                  <Field data-invalid={errors.email ? true : undefined}>
                    <FieldLabel htmlFor="email">Work email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="maya@acmelabs.io"
                      value={data.email}
                      onChange={(e) => {
                        update("email", e.target.value);
                        clearError("email");
                      }}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? "email-error" : "email-hint"}
                    />
                    {errors.email ? (
                      <FieldError id="email-error">{errors.email}</FieldError>
                    ) : (
                      <FieldDescription id="email-hint">
                        We&apos;ll send your sign-in link here.
                      </FieldDescription>
                    )}
                  </Field>
                </FieldGroup>
              )}

              {step === 1 && (
                <FieldGroup>
                  <Field data-invalid={errors.workspace ? true : undefined}>
                    <FieldLabel htmlFor="workspace">Workspace name</FieldLabel>
                    <Input
                      id="workspace"
                      name="workspace"
                      autoComplete="organization"
                      placeholder="Acme Labs"
                      value={data.workspace}
                      onChange={(e) => {
                        update("workspace", e.target.value);
                        clearError("workspace");
                      }}
                      aria-invalid={errors.workspace ? true : undefined}
                      aria-describedby={errors.workspace ? "workspace-error" : undefined}
                    />
                    {errors.workspace && (
                      <FieldError id="workspace-error">{errors.workspace}</FieldError>
                    )}
                  </Field>
                  <Field data-invalid={errors.teamSize ? true : undefined}>
                    <FieldLabel htmlFor="teamSize">Team size</FieldLabel>
                    <Select
                      value={data.teamSize}
                      onValueChange={(v) => {
                        update("teamSize", v);
                        clearError("teamSize");
                      }}
                    >
                      <SelectTrigger
                        id="teamSize"
                        className="w-full"
                        aria-invalid={errors.teamSize ? true : undefined}
                        aria-describedby={errors.teamSize ? "teamSize-error" : undefined}
                      >
                        <SelectValue placeholder="Select team size" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.teamSize && (
                      <FieldError id="teamSize-error">{errors.teamSize}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
              )}

              {step === 2 && (
                <FieldGroup>
                  {data.invites.map((value, i) => {
                    const err = errors[`invite${i}`];
                    return (
                      <Field key={i} data-invalid={err ? true : undefined}>
                        <FieldLabel htmlFor={`invite${i}`}>
                          Teammate {i + 1}{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FieldLabel>
                        <Input
                          id={`invite${i}`}
                          name={`invite${i}`}
                          type="email"
                          autoComplete="off"
                          placeholder={invitePlaceholders[i]}
                          value={value}
                          onChange={(e) => updateInvite(i, e.target.value)}
                          aria-invalid={err ? true : undefined}
                          aria-describedby={err ? `invite${i}-error` : undefined}
                        />
                        {err && <FieldError id={`invite${i}-error`}>{err}</FieldError>}
                      </Field>
                    );
                  })}
                </FieldGroup>
              )}

              {step === 3 && (
                <FieldGroup>
                  <fieldset className="flex min-w-0 flex-col">
                    <legend className="mb-3 text-sm font-medium">Theme</legend>
                    <RadioGroup
                      value={data.theme}
                      onValueChange={(v) => update("theme", v as ThemeValue)}
                      className="grid gap-3 sm:grid-cols-3"
                    >
                      {themes.map((t) => (
                        <Label
                          key={t.value}
                          htmlFor={`theme-${t.value}`}
                          className="cursor-pointer items-start gap-3 rounded-md border p-4 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                        >
                          <RadioGroupItem
                            id={`theme-${t.value}`}
                            value={t.value}
                            className="mt-0.5"
                          />
                          <span className="flex flex-col gap-1.5">
                            <span>{t.label}</span>
                            <span className="text-xs leading-snug font-normal text-muted-foreground">
                              {t.description}
                            </span>
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </fieldset>
                  <div className="flex items-start justify-between gap-4 rounded-md border p-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="digest">Weekly digest</Label>
                      <p id="digest-hint" className="text-sm text-muted-foreground">
                        A Monday email with top events, new issues and funnel changes.
                      </p>
                    </div>
                    <Switch
                      id="digest"
                      checked={data.digest}
                      onCheckedChange={(v) => update("digest", v)}
                      aria-describedby="digest-hint"
                    />
                  </div>
                </FieldGroup>
              )}
            </CardContent>

            <CardFooter className="flex-wrap justify-between gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft aria-hidden="true" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {step === 2 && (
                  <Button type="button" variant="ghost" onClick={skipInvites}>
                    Skip for now
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {isLast ? (
                    <>
                      {submitting ? "Finishing…" : "Finish setup"}
                      <Check aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>

        <aside aria-label="Summary of your setup" className="lg:sticky lg:top-8">
          <SummaryCard data={data} />
        </aside>
      </div>
    </div>
  );
}

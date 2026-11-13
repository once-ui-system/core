`NativeSelect` is a plain server-safe component with no portal, so I'll use it for team size. Radix `Select`, `RadioGroup`, `Switch` and `Checkbox` are all unneeded complexity risks, so I'll also swap the radio cards for native radio inputs and keep `Switch` (a simple button) and `Checkbox`.

I'll keep the remaining logic identical.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type StepId = "account" | "workspace" | "invite" | "preferences";

export const steps: { id: StepId; title: string; description: string }[] = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name the home for your team's analytics and issues.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Bring up to three teammates along. You can skip this.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Choose how Lumen looks and how often it writes to you.",
  },
];

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-30", label: "16–30 people" },
  { value: "31-50", label: "31–50 people" },
];

export const themes = [
  { value: "light", label: "Light", description: "Bright and clean for daytime work." },
  { value: "dark", label: "Dark", description: "Easier on the eyes late at night." },
  { value: "system", label: "System", description: "Match your device setting." },
] as const;

export type ThemeValue = (typeof themes)[number]["value"];

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
  theme: ThemeValue;
  digest: boolean;
};

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: ["", "", ""],
  theme: "system",
  digest: true,
};

export const STORAGE_KEY = "lumen-onboarding";

export const nextSteps = [
  {
    id: "project",
    title: "Create your first project",
    description:
      "Group events and issues by product area, such as Web app or Mobile.",
  },
  {
    id: "snippet",
    title: "Install the tracking snippet",
    description:
      "Paste one script tag into your app to start capturing page views and events.",
  },
  {
    id: "issue",
    title: "File your first issue",
    description:
      "Link it to a funnel drop-off so the whole team sees the context.",
  },
  {
    id: "board",
    title: "Pin a weekly metrics board",
    description:
      "Choose three numbers your team should look at every Monday.",
  },
];
```

```tsx components/step-indicator.tsx
"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { steps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="mb-3 text-sm text-muted-foreground sm:hidden">
        Step {current + 1} of {steps.length}:{" "}
        <span className="font-medium text-foreground">{steps[current].title}</span>
      </p>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const status = done ? " (completed)" : active ? " (current step)" : "";
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center gap-2", index < steps.length - 1 && "flex-1")}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary ring-4 ring-primary/15",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                  "max-sm:sr-only"
                )}
              >
                {step.title}
                <span className="sr-only">{status}</span>
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("h-px min-w-3 flex-1", done ? "bg-primary" : "bg-border")}
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
"use client";

import type { ReactNode } from "react";
import { Mail, User, Building2, Users, Palette, BellRing, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { teamSizes, themes, type OnboardingData } from "@/lib/data";

function Row({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words">{children}</dd>
      </div>
    </div>
  );
}

function Empty({ children = "Not set yet" }: { children?: ReactNode }) {
  return <span className="font-normal text-muted-foreground">{children}</span>;
}

export function SummaryCard({ data }: { data: OnboardingData }) {
  const invites = data.invites.map((i) => i.trim()).filter(Boolean);
  const size = teamSizes.find((t) => t.value === data.teamSize)?.label;
  const theme = themes.find((t) => t.value === data.theme)?.label;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base leading-none font-semibold">Your setup so far</h2>
        <CardDescription>Updates as you fill in each step.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4">
          <Row icon={<User className="size-4" aria-hidden="true" />} label="Name">
            {data.name.trim() || <Empty />}
          </Row>
          <Row icon={<Mail className="size-4" aria-hidden="true" />} label="Work email">
            {data.email.trim() || <Empty />}
          </Row>
          <Row icon={<Building2 className="size-4" aria-hidden="true" />} label="Workspace">
            {data.workspace.trim() || <Empty />}
          </Row>
          <Row icon={<Users className="size-4" aria-hidden="true" />} label="Team size">
            {size ?? <Empty />}
          </Row>
          <Row icon={<UserPlus className="size-4" aria-hidden="true" />} label="Invited teammates">
            {invites.length ? (
              <ul className="flex flex-col gap-1">
                {invites.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No invites</Empty>
            )}
          </Row>
          <Row icon={<Palette className="size-4" aria-hidden="true" />} label="Theme">
            <Badge variant="secondary">{theme}</Badge>
          </Row>
          <Row icon={<BellRing className="size-4" aria-hidden="true" />} label="Weekly digest">
            <Badge variant={data.digest ? "default" : "outline"}>
              {data.digest ? "On" : "Off"}
            </Badge>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
```

```tsx components/onboarding-wizard.tsx
"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/step-indicator";
import { SummaryCard } from "@/components/summary-card";
import { cn } from "@/lib/utils";
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
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function focusFirstInvalid() {
    window.requestAnimationFrame(() => {
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
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage unavailable; continue anyway
    }
    router.push("/welcome");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
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
                    <NativeSelect
                      id="teamSize"
                      name="teamSize"
                      className="w-full"
                      value={data.teamSize}
                      onChange={(e) => {
                        update("teamSize", e.target.value);
                        clearError("teamSize");
                      }}
                      aria-invalid={errors.teamSize ? true : undefined}
                      aria-describedby={errors.teamSize ? "teamSize-error" : undefined}
                    >
                      <NativeSelectOption value="">Select team size</NativeSelectOption>
                      {teamSizes.map((t) => (
                        <NativeSelectOption key={t.value} value={t.value}>
                          {t.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
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
                    <div className="grid gap-3 sm:grid-cols-3">
                      {themes.map((t) => {
                        const selected = data.theme === t.value;
                        return (
                          <label
                            key={t.value}
                            htmlFor={`theme-${t.value}`}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm font-medium has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                              selected && "border-primary bg-primary/5"
                            )}
                          >
                            <input
                              type="radio"
                              id={`theme-${t.value}`}
                              name="theme"
                              value={t.value}
                              checked={selected}
                              onChange={() => update("theme", t.value as ThemeValue)}
                              className="mt-0.5 size-4 accent-primary"
                            />
                            <span className="flex flex-col gap-1.5">
                              <span>{t.label}</span>
                              <span className="text-xs leading-snug font-normal text-muted-foreground">
                                {t.description}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
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
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen workspace in four quick steps.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-muted/30">
      <OnboardingWizard />
    </main>
  );
}
```

```tsx components/welcome-content.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { STORAGE_KEY, nextSteps, user, type OnboardingData } from "@/lib/data";

function readSaved(): Partial<OnboardingData> | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<OnboardingData>) : null;
  } catch {
    return null;
  }
}

export function WelcomeContent() {
  const [saved, setSaved] = useState<Partial<OnboardingData> | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // sessionStorage only exists in the browser, so read it after mount.
    setSaved(readSaved());
  }, []);

  const name = (saved?.name || user.name).trim();
  const firstName = name.split(/\s+/)[0];
  const workspace = saved?.workspace?.trim() || "Acme Labs";
  const doneCount = nextSteps.filter((s) => checked[s.id]).length;
  const percent = Math.round((doneCount / nextSteps.length) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PartyPopper className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">{workspace}</span> is ready.
            {saved?.email ? (
              <> We sent a sign-in link to {saved.email}.</>
            ) : (
              <> Here&apos;s what to do next.</>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg leading-none font-semibold">Your next steps</h2>
          <CardDescription>
            Four small things that get a team value from Lumen in its first week.
          </CardDescription>
          <div className="flex items-center gap-3 pt-2">
            <Progress value={percent} aria-label="Checklist progress" className="flex-1" />
            <span className="text-sm text-muted-foreground tabular-nums">
              {doneCount} of {nextSteps.length} done
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {nextSteps.map((item) => {
              const isDone = !!checked[item.id];
              return (
                <li key={item.id}>
                  <div className="flex items-start gap-3 rounded-md border p-4">
                    <Checkbox
                      id={`step-${item.id}`}
                      checked={isDone}
                      onCheckedChange={(v) =>
                        setChecked((c) => ({ ...c, [item.id]: v === true }))
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`step-${item.id}`}
                      className="flex-col items-start gap-1.5 leading-snug"
                    >
                      <span className={isDone ? "text-muted-foreground line-through" : undefined}>
                        {item.title}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </Label>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-muted-foreground">Signed in as {user.role.toLowerCase()}</p>
          <Button asChild variant="outline">
            <Link href="/">Run setup again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import { WelcomeContent } from "@/components/welcome-content";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here are your next steps.",
};

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <WelcomeContent />
    </main>
  );
}
```
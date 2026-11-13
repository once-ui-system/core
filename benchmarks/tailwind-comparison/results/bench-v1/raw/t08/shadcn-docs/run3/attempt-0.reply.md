Now the files.

```ts lib/data.ts
import type { LucideIcon } from "lucide-react";
import {
  BarChart3Icon,
  BugIcon,
  PlugIcon,
  UserRoundIcon,
  UsersRoundIcon,
} from "lucide-react";

export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking, in one calm place.",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const STEPS = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name your team's home in Lumen.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Bring up to three teammates along.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Make Lumen feel right.",
  },
] as const;

export const TEAM_SIZES = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51-200", label: "51–200 people" },
] as const;

export const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export const MAX_INVITES = 3;

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const NEXT_STEPS: ChecklistItem[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add a photo and a short bio so teammates recognise you.",
    icon: UserRoundIcon,
  },
  {
    id: "sdk",
    title: "Install the Lumen snippet",
    description:
      "Paste two lines into your app to start collecting product events.",
    icon: PlugIcon,
  },
  {
    id: "issue",
    title: "File your first issue",
    description: "Track a bug or a to-do and assign it to a teammate.",
    icon: BugIcon,
  },
  {
    id: "dashboard",
    title: "Build a starter dashboard",
    description: "Pin signups, active users and open issues to one board.",
    icon: BarChart3Icon,
  },
  {
    id: "team",
    title: "Check in on your invites",
    description: "See who has joined and resend any pending invitations.",
    icon: UsersRoundIcon,
  },
];
```

```ts lib/onboarding.ts
import { MAX_INVITES, TEAM_SIZES, user } from "@/lib/data";

export type Theme = "light" | "dark" | "system";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: Theme;
  digest: boolean;
}

export type Errors = Record<string, string>;

export const STORAGE_KEY = "lumen-onboarding";

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: Array.from({ length: MAX_INVITES }, () => ""),
  theme: "system",
  digest: true,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FREE_MAIL = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    const email = data.email.trim().toLowerCase();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (!EMAIL_RE.test(email)) {
      errors.email = "That doesn't look like a valid email address.";
    } else if (FREE_MAIL.includes(email.split("@")[1])) {
      errors.email = "Please use your work email, not a personal address.";
    }
  }

  if (step === 1) {
    const ws = data.workspace.trim();
    if (ws.length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    } else if (ws.length > 40) {
      errors.workspace = "Workspace names can be up to 40 characters.";
    }
    if (!data.teamSize) {
      errors.teamSize = "Choose the size of your team.";
    }
  }

  if (step === 2) {
    const seen = new Set<string>();
    const own = data.email.trim().toLowerCase();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!EMAIL_RE.test(value)) {
        errors[`invite-${i}`] = "Enter a valid email address or leave it empty.";
      } else if (value === own) {
        errors[`invite-${i}`] = "That's your own email. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors[`invite-${i}`] = "You've already added this email.";
      } else {
        seen.add(value);
      }
    });
  }

  return errors;
}

export function teamSizeLabel(value: string): string {
  return TEAM_SIZES.find((t) => t.value === value)?.label ?? "";
}

export function filledInvites(data: OnboardingData): string[] {
  return data.invites.map((e) => e.trim()).filter(Boolean);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || user.name.split(" ")[0];
}
```

```tsx components/onboarding/stepper.tsx
import { CheckIcon } from "lucide-react";

import { STEPS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="text-sm font-medium text-muted-foreground sm:hidden">
        Step {current + 1} of {STEPS.length}:{" "}
        <span className="text-foreground">{STEPS[current].title}</span>
      </p>
      <ol className="mt-3 flex items-center gap-2 sm:mt-0">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2",
                i < STEPS.length - 1 && "flex-1"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-foreground ring-4 ring-ring/20",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {done ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
                <span className="sr-only">
                  {done ? " (completed)" : active ? " (current step)" : ""}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px min-w-3 flex-1 transition-colors",
                    done ? "bg-primary" : "bg-border"
                  )}
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

```tsx components/onboarding/steps.tsx
"use client";

import { MAX_INVITES, TEAM_SIZES, THEMES } from "@/lib/data";
import type { Errors, OnboardingData, Theme } from "@/lib/onboarding";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

interface StepProps {
  data: OnboardingData;
  errors: Errors;
  update: (patch: Partial<OnboardingData>) => void;
}

export function AccountStep({ data, errors, update }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="name">Full name</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Maya Okafor"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <FieldError id="name-error">{errors.name}</FieldError>}
      </Field>
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@acmelabs.io"
          value={data.email}
          onChange={(e) => update({ email: e.target.value })}
          aria-invalid={!!errors.email}
          aria-describedby={
            errors.email ? "email-error" : "email-description"
          }
        />
        {errors.email ? (
          <FieldError id="email-error">{errors.email}</FieldError>
        ) : (
          <FieldDescription id="email-description">
            We'll send your sign-in link and billing receipts here.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  );
}

export function WorkspaceStep({ data, errors, update }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={!!errors.workspace}>
        <FieldLabel htmlFor="workspace">Workspace name</FieldLabel>
        <Input
          id="workspace"
          name="workspace"
          autoComplete="organization"
          placeholder="Acme Labs"
          value={data.workspace}
          onChange={(e) => update({ workspace: e.target.value })}
          aria-invalid={!!errors.workspace}
          aria-describedby={
            errors.workspace ? "workspace-error" : "workspace-description"
          }
        />
        {errors.workspace ? (
          <FieldError id="workspace-error">{errors.workspace}</FieldError>
        ) : (
          <FieldDescription id="workspace-description">
            Usually your company or team name. You can change it later.
          </FieldDescription>
        )}
      </Field>
      <Field data-invalid={!!errors.teamSize}>
        <FieldLabel htmlFor="team-size">Team size</FieldLabel>
        <Select
          value={data.teamSize}
          onValueChange={(teamSize) => update({ teamSize })}
        >
          <SelectTrigger
            id="team-size"
            className="w-full"
            aria-invalid={!!errors.teamSize}
            aria-describedby={errors.teamSize ? "team-size-error" : undefined}
          >
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {TEAM_SIZES.map((size) => (
                <SelectItem key={size.value} value={size.value}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {errors.teamSize && (
          <FieldError id="team-size-error">{errors.teamSize}</FieldError>
        )}
      </Field>
    </FieldGroup>
  );
}

export function InviteStep({ data, errors, update }: StepProps) {
  const setInvite = (index: number, value: string) => {
    const invites = [...data.invites];
    invites[index] = value;
    update({ invites });
  };

  return (
    <FieldSet>
      <FieldLegend variant="label">Teammate emails</FieldLegend>
      <FieldDescription>
        Optional. Invite up to {MAX_INVITES} people now, or skip this step and
        do it later from Settings.
      </FieldDescription>
      <FieldGroup className="gap-5">
        {Array.from({ length: MAX_INVITES }, (_, i) => {
          const key = `invite-${i}`;
          return (
            <Field key={key} data-invalid={!!errors[key]}>
              <FieldLabel htmlFor={key}>Teammate {i + 1}</FieldLabel>
              <Input
                id={key}
                name={key}
                type="email"
                autoComplete="off"
                placeholder={
                  ["daniel@acmelabs.io", "priya@acmelabs.io", "tomas@acmelabs.io"][i]
                }
                value={data.invites[i] ?? ""}
                onChange={(e) => setInvite(i, e.target.value)}
                aria-invalid={!!errors[key]}
                aria-describedby={errors[key] ? `${key}-error` : undefined}
              />
              {errors[key] && (
                <FieldError id={`${key}-error`}>{errors[key]}</FieldError>
              )}
            </Field>
          );
        })}
      </FieldGroup>
    </FieldSet>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
} as const;

export function PreferencesStep({ data, update }: StepProps) {
  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">Theme</FieldLegend>
        <ToggleGroup
          type="single"
          variant="outline"
          value={data.theme}
          onValueChange={(value) => {
            if (value) update({ theme: value as Theme });
          }}
          aria-label="Theme"
          className="w-full sm:w-fit"
        >
          {THEMES.map((theme) => {
            const Icon = THEME_ICONS[theme.value];
            return (
              <ToggleGroupItem
                key={theme.value}
                value={theme.value}
                className="flex-1 sm:flex-none"
              >
                <Icon aria-hidden="true" />
                {theme.label}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <FieldDescription>
          Applied right away so you can preview it.
        </FieldDescription>
      </FieldSet>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="digest">Weekly digest</FieldLabel>
          <FieldDescription>
            A Monday email with new issues, active users and what changed last
            week.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="digest"
          checked={data.digest}
          onCheckedChange={(digest) => update({ digest })}
        />
      </Field>
    </FieldGroup>
  );
}
```

```tsx components/onboarding/summary-card.tsx
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  filledInvites,
  teamSizeLabel,
  type OnboardingData,
} from "@/lib/onboarding";
import { THEMES } from "@/lib/data";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  );
}

const EMPTY = <span className="text-muted-foreground">Not set yet</span>;

export function SummaryCard({
  data,
  step,
}: {
  data: OnboardingData;
  step: number;
}) {
  const invites = filledInvites(data);
  const themeLabel = THEMES.find((t) => t.value === data.theme)?.label;

  return (
    <Card aria-label="Your setup so far" role="region">
      <CardHeader>
        <CardTitle>Your setup so far</CardTitle>
        <CardDescription>
          This fills in as you go. Nothing is saved until you finish.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col gap-4">
          <Row label="Name">{data.name.trim() || EMPTY}</Row>
          <Row label="Work email">{data.email.trim() || EMPTY}</Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Workspace">{data.workspace.trim() || EMPTY}</Row>
          <Row label="Team size">{teamSizeLabel(data.teamSize) || EMPTY}</Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Invitations">
            {invites.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {invites.map((email) => (
                  <li key={email} className="break-all">
                    {email}
                  </li>
                ))}
              </ul>
            ) : step > 2 ? (
              <span className="text-muted-foreground">Skipped</span>
            ) : (
              EMPTY
            )}
          </Row>
        </dl>
        <Separator />
        <dl className="flex flex-col gap-4">
          <Row label="Theme">{themeLabel}</Row>
          <Row label="Weekly digest">
            <Badge variant={data.digest ? "default" : "secondary"}>
              {data.digest ? "On" : "Off"}
            </Badge>
          </Row>
        </dl>
      </CardContent>
    </Card>
  );
}
```

```tsx components/onboarding/wizard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { STEPS, product } from "@/lib/data";
import {
  STORAGE_KEY,
  filledInvites,
  initialData,
  validateStep,
  type Errors,
  type OnboardingData,
} from "@/lib/onboarding";
import { Stepper } from "@/components/onboarding/stepper";
import { SummaryCard } from "@/components/onboarding/summary-card";
import {
  AccountStep,
  InviteStep,
  PreferencesStep,
  WorkspaceStep,
} from "@/components/onboarding/steps";

function applyTheme(theme: OnboardingData["theme"]) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  // Move focus to the step heading when the step changes (not on first render).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Preview the chosen theme live.
  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);

  const update = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    // Clear errors for fields being edited.
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
        if (key === "invites") {
          Object.keys(next).forEach((k) => {
            if (k.startsWith("invite-")) delete next[k];
          });
        }
      }
      return next;
    });
  };

  const isLast = step === STEPS.length - 1;
  const isInviteStep = step === 2;
  const noInvites = filledInvites(data).length === 0;

  const goNext = () => {
    const found = validateStep(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      requestAnimationFrame(() => {
        const el = document.getElementById(
          firstKey === "teamSize" ? "team-size" : firstKey
        );
        el?.focus();
      });
      return;
    }
    setErrors({});
    if (isLast) {
      setSubmitting(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage can be unavailable; the welcome page falls back to defaults.
      }
      router.push("/welcome");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const current = STEPS[step];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {product.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Let's set up your workspace
        </h1>
        <p className="text-muted-foreground">{product.tagline}</p>
      </header>

      <Stepper current={step} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
            className="flex flex-col gap-6"
          >
            <CardHeader>
              <CardTitle>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg leading-tight outline-none"
                >
                  {current.title}
                </h2>
              </CardTitle>
              <CardDescription>{current.description}</CardDescription>
            </CardHeader>
            <CardContent aria-live="polite">
              {step === 0 && (
                <AccountStep data={data} errors={errors} update={update} />
              )}
              {step === 1 && (
                <WorkspaceStep data={data} errors={errors} update={update} />
              )}
              {step === 2 && (
                <InviteStep data={data} errors={errors} update={update} />
              )}
              {step === 3 && (
                <PreferencesStep data={data} errors={errors} update={update} />
              )}
            </CardContent>
            <CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className="w-full sm:w-auto"
              >
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Finishing…
                  </>
                ) : isLast ? (
                  <>
                    <CheckIcon data-icon="inline-start" />
                    Finish setup
                  </>
                ) : isInviteStep && noInvites ? (
                  <>
                    Skip for now
                    <ArrowRightIcon data-icon="inline-end" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRightIcon data-icon="inline-end" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <SummaryCard data={data} step={step} />
      </div>
    </div>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";

import { Wizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = {
  title: "Set up your workspace · Lumen",
  description:
    "Create your Lumen account, name your workspace, invite teammates and choose your preferences.",
};

export default function Page() {
  return (
    <main className="min-h-dvh bg-muted/30">
      <Wizard />
    </main>
  );
}
```

```tsx components/onboarding/welcome-content.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CircleCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { NEXT_STEPS, product, user } from "@/lib/data";
import {
  STORAGE_KEY,
  filledInvites,
  firstName,
  type OnboardingData,
} from "@/lib/onboarding";

const fallback: Pick<OnboardingData, "name" | "workspace" | "invites"> = {
  name: user.name,
  workspace: "Acme Labs",
  invites: [],
};

export function WelcomeContent() {
  const [info, setInfo] = useState(fallback);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingData>;
        setInfo({
          name: parsed.name?.trim() || fallback.name,
          workspace: parsed.workspace?.trim() || fallback.workspace,
          invites: Array.isArray(parsed.invites) ? parsed.invites : [],
        });
      }
    } catch {
      // Ignore malformed or unavailable storage and keep the defaults.
    }
  }, []);

  const doneCount = NEXT_STEPS.filter((s) => checked[s.id]).length;
  const percent = Math.round((doneCount / NEXT_STEPS.length) * 100);
  const invited = filledInvites({
    ...({} as OnboardingData),
    invites: info.invites,
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CircleCheckIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            You're all set, {firstName(info.name)}
          </h1>
          <p className="text-muted-foreground">
            <strong className="font-medium text-foreground">
              {info.workspace}
            </strong>{" "}
            is ready on {product.name}.
            {invited > 0
              ? ` We've sent ${invited} ${invited === 1 ? "invitation" : "invitations"}.`
              : " You can invite teammates any time from Settings."}
          </p>
        </div>
        <Badge variant="secondary">Role: {user.role}</Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-lg leading-tight">Your next steps</h2>
          </CardTitle>
          <CardDescription>
            Five small things that get a team productive in its first week.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {doneCount} of {NEXT_STEPS.length} done
              </span>
            </div>
            <Progress
              value={percent}
              aria-label="Checklist progress"
            />
          </div>
          <ul className="flex flex-col gap-2">
            {NEXT_STEPS.map((item) => {
              const Icon = item.icon;
              const id = `step-${item.id}`;
              return (
                <li key={item.id}>
                  <Label
                    htmlFor={id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:bg-muted/50"
                  >
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={!!checked[item.id]}
                      onCheckedChange={(value) =>
                        setChecked((prev) => ({
                          ...prev,
                          [item.id]: value === true,
                        }))
                      }
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm leading-snug font-medium">
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {item.title}
                      </span>
                      <span className="text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to setup
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Tick items off as you go.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";

import { WelcomeContent } from "@/components/onboarding/welcome-content";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function WelcomePage() {
  return (
    <main className="min-h-dvh bg-muted/30">
      <WelcomeContent />
    </main>
  );
}
```
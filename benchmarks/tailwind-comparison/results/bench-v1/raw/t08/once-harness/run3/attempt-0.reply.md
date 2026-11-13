That's all I need. Writing the files now.

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  description: "A product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type StepId = "account" | "workspace" | "invite" | "preferences";

export const steps: { id: StepId; label: string; title: string; description: string }[] = [
  {
    id: "account",
    label: "Account",
    title: "Create your account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    label: "Workspace",
    title: "Set up your workspace",
    description: "A workspace holds your projects, events and issues.",
  },
  {
    id: "invite",
    label: "Invite",
    title: "Invite your team",
    description: "Add up to three teammates now. You can skip this and invite people later.",
  },
  {
    id: "preferences",
    label: "Preferences",
    title: "Choose your preferences",
    description: "Pick how Lumen looks and how often we email you.",
  },
];

export const teamSizeOptions = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more" },
];

export const themeOptions: { value: string; label: string; icon: IconName }[] = [
  { value: "system", label: "System", icon: "computer" },
  { value: "light", label: "Light", icon: "light" },
  { value: "dark", label: "Dark", icon: "dark" },
];

export const checklist: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Install the tracking snippet",
    description: "Paste one script tag into your app to start collecting events within minutes.",
    icon: "code",
  },
  {
    title: "Create your first project",
    description: "Group events and issues for a single product, such as your web app or mobile client.",
    icon: "folder",
  },
  {
    title: "Triage the first issue",
    description: "Link a crash report to an issue and assign it to someone on your team.",
    icon: "flag",
  },
  {
    title: "Build a weekly dashboard",
    description: "Pin sign-ups, active users and open bugs so Monday stand-ups take five minutes.",
    icon: "barChart",
  },
];

export const STORAGE_KEY = "lumen-onboarding";

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: string;
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

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

```tsx components/Onboarding.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Checkbox,
  Column,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Select,
  Switch,
  Tag,
  Text,
} from "@once-ui-system/core";
import {
  emailPattern,
  initialData,
  product,
  steps,
  STORAGE_KEY,
  teamSizeOptions,
  themeOptions,
  type OnboardingData,
} from "@/lib/data";

type Errors = Partial<Record<string, string>>;

function validate(stepIndex: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (stepIndex === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!emailPattern.test(data.email.trim())) errors.email = "Enter a valid email, like name@company.com.";
  }
  if (stepIndex === 1) {
    if (data.workspace.trim().length < 2) errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (stepIndex === 2) {
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!emailPattern.test(value)) errors[`invite${i}`] = "Enter a valid email address.";
      else if (value === data.email.trim().toLowerCase()) errors[`invite${i}`] = "That's your own email.";
      else if (seen.has(value)) errors[`invite${i}`] = "This email is already listed.";
      seen.add(value);
    });
  }
  return errors;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <Column gap="12" fillWidth>
      <Row as="ol" gap="8" fillWidth aria-label="Onboarding progress" margin="0" padding="0" style={{ listStyle: "none" }}>
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Column
              as="li"
              key={step.id}
              flex={1}
              gap="8"
              aria-current={active ? "step" : undefined}
            >
              <Row
                height="4"
                radius="full"
                background={done || active ? "brand-strong" : "neutral-alpha-medium"}
                style={{ opacity: active || done ? 1 : 0.6 }}
              />
              <Row gap="8" vertical="center">
                <Row
                  center
                  width="24"
                  height="24"
                  radius="full"
                  background={done ? "brand-strong" : active ? "brand-alpha-medium" : "neutral-alpha-weak"}
                  onBackground={done ? "brand-strong" : "neutral-strong"}
                  style={{ flexShrink: 0 }}
                >
                  {done ? (
                    <Icon name="check" size="xs" onSolid="brand-strong" />
                  ) : (
                    <Text textVariant="label-strong-xs">{i + 1}</Text>
                  )}
                </Row>
                <Text
                  textVariant="label-default-s"
                  onBackground={active ? "neutral-strong" : "neutral-weak"}
                  s={{ hide: !active }}
                >
                  {step.label}
                  <VisuallyStatus done={done} active={active} />
                </Text>
              </Row>
            </Column>
          );
        })}
      </Row>
      <Text textVariant="label-default-s" onBackground="neutral-weak" aria-live="polite">
        Step {current + 1} of {steps.length}
      </Text>
    </Column>
  );
}

function VisuallyStatus({ done, active }: { done: boolean; active: boolean }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
      }}
    >
      {done ? " (completed)" : active ? " (current step)" : ""}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <Column gap="4">
      <Text textVariant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        textVariant="body-default-s"
        onBackground={empty ? "neutral-weak" : "neutral-strong"}
        style={{ overflowWrap: "anywhere" }}
      >
        {empty ? "Not set yet" : value}
      </Text>
    </Column>
  );
}

function Summary({ data, current }: { data: OnboardingData; current: number }) {
  const invites = data.invites.map((e) => e.trim()).filter(Boolean);
  const teamLabel = teamSizeOptions.find((o) => o.value === data.teamSize)?.label ?? "";
  const themeLabel = themeOptions.find((o) => o.value === data.theme)?.label ?? "";
  return (
    <Column
      as="aside"
      aria-label="Setup summary"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="20"
      fillWidth
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Your setup
        </Heading>
        <Tag size="s" tone="brand" label={`${Math.min(current + 1, 4)}/4`} />
      </Row>
      <Column gap="12">
        <Text textVariant="label-strong-s" onBackground="brand-medium">
          Account
        </Text>
        <SummaryRow label="Name" value={data.name.trim()} />
        <SummaryRow label="Work email" value={data.email.trim()} />
      </Column>
      <Column gap="12" borderTop paddingTop="16">
        <Text textVariant="label-strong-s" onBackground="brand-medium">
          Workspace
        </Text>
        <SummaryRow label="Name" value={data.workspace.trim()} />
        <SummaryRow label="Team size" value={teamLabel} />
      </Column>
      <Column gap="12" borderTop paddingTop="16">
        <Text textVariant="label-strong-s" onBackground="brand-medium">
          Invites
        </Text>
        {invites.length === 0 ? (
          <Text textVariant="body-default-s" onBackground="neutral-weak">
            {current > 2 ? "Skipped for now" : "No teammates added yet"}
          </Text>
        ) : (
          <Column as="ul" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {invites.map((email) => (
              <Row as="li" key={email} gap="8" vertical="center">
                <Icon name="mail" size="xs" onBackground="neutral-weak" />
                <Text textVariant="body-default-s" style={{ overflowWrap: "anywhere" }}>
                  {email}
                </Text>
              </Row>
            ))}
          </Column>
        )}
      </Column>
      <Column gap="12" borderTop paddingTop="16">
        <Text textVariant="label-strong-s" onBackground="brand-medium">
          Preferences
        </Text>
        <SummaryRow label="Theme" value={themeLabel} />
        <SummaryRow label="Weekly digest" value={data.digest ? "On, every Monday" : "Off"} />
      </Column>
    </Column>
  );
}

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const updateInvite = (index: number, value: string) => {
    setData((prev) => {
      const invites = [...prev.invites];
      invites[index] = value;
      return { ...prev, invites };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`invite${index}`];
      return next;
    });
  };

  const focusHeading = () => {
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const goBack = () => {
    if (step === 0) return;
    setErrors({});
    setStep(step - 1);
    focusHeading();
  };

  const goNext = () => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    if (isLast) {
      setSubmitting(true);
      try {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            name: data.name.trim(),
            workspace: data.workspace.trim(),
            invites: data.invites.map((e) => e.trim()).filter(Boolean).length,
            digest: data.digest,
          }),
        );
      } catch {
        // storage unavailable; the welcome page falls back to defaults
      }
      router.push("/welcome");
      return;
    }
    setStep(step + 1);
    focusHeading();
  };

  const skipInvites = () => {
    setData((prev) => ({ ...prev, invites: ["", "", ""] }));
    setErrors({});
    setStep(step + 1);
    focusHeading();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goNext();
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32" id="main">
      <Column maxWidth="l" fillWidth gap="32">
        <Row gap="12" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-strong">
            <Icon name="sparkle" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text textVariant="heading-strong-l">{product.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Product analytics and issue tracking for small teams
            </Text>
          </Column>
        </Row>

        <StepIndicator current={step} />

        <Row gap="32" fillWidth vertical="start" m={{ direction: "column" }} s={{ direction: "column" }}>
          <Column
            as="form"
            onSubmit={onSubmit}
            noValidate
            aria-labelledby="step-title"
            background="surface"
            border
            radius="l"
            padding="32"
            gap="24"
            flex={3}
            fillWidth
            s={{ padding: "20" }}
          >
            <Column gap="8">
              <Heading
                as="h1"
                id="step-title"
                textVariant="heading-strong-xl"
                tabIndex={-1}
                ref={headingRef}
                style={{ outline: "none" }}
              >
                {current.title}
              </Heading>
              <Text textVariant="body-default-m" onBackground="neutral-weak">
                {current.description}
              </Text>
            </Column>

            {step === 0 && (
              <Column gap="16">
                <Input
                  id="name"
                  label="Full name"
                  autoComplete="name"
                  value={data.name}
                  onValueChange={(v) => update("name", v)}
                  error={!!errors.name}
                  errorMessage={errors.name}
                  aria-required="true"
                />
                <Input
                  id="email"
                  label="Work email"
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onValueChange={(v) => update("email", v)}
                  error={!!errors.email}
                  errorMessage={errors.email}
                  description="We'll send sign-in links and billing receipts here."
                  aria-required="true"
                />
              </Column>
            )}

            {step === 1 && (
              <Column gap="16">
                <Input
                  id="workspace"
                  label="Workspace name"
                  value={data.workspace}
                  onValueChange={(v) => update("workspace", v)}
                  error={!!errors.workspace}
                  errorMessage={errors.workspace}
                  description="Usually your company or team name, like Acme Labs."
                  aria-required="true"
                />
                <Column gap="8">
                  <Select
                    id="teamSize"
                    label="Team size"
                    options={teamSizeOptions}
                    value={data.teamSize}
                    onValueChange={(v) => update("teamSize", Array.isArray(v) ? (v[0] ?? "") : v)}
                    error={!!errors.teamSize}
                    errorMessage={errors.teamSize}
                  />
                </Column>
              </Column>
            )}

            {step === 2 && (
              <Column gap="16">
                {data.invites.map((value, i) => (
                  <Input
                    key={i}
                    id={`invite-${i}`}
                    label={`Teammate ${i + 1} email (optional)`}
                    type="email"
                    autoComplete="off"
                    value={value}
                    onValueChange={(v) => updateInvite(i, v)}
                    error={!!errors[`invite${i}`]}
                    errorMessage={errors[`invite${i}`]}
                  />
                ))}
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Teammates join as Members. You can change roles later in Settings.
                </Text>
              </Column>
            )}

            {step === 3 && (
              <Column gap="24">
                <Column gap="8">
                  <Text as="p" id="theme-label" textVariant="label-strong-s">
                    Theme
                  </Text>
                  <SegmentedControl
                    aria-labelledby="theme-label"
                    semantics="radio"
                    value={data.theme}
                    onValueChange={(v) => update("theme", v)}
                    buttons={themeOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                      prefixIcon: o.icon,
                    }))}
                  />
                </Column>
                <Switch
                  id="digest"
                  label="Weekly digest"
                  description="A Monday email with new sign-ups, top issues and what shipped."
                  checked={data.digest}
                  onCheckedChange={(v) => update("digest", v)}
                />
              </Column>
            )}

            <Row gap="12" horizontal="between" vertical="center" wrap paddingTop="8">
              <Button
                type="button"
                variant="tertiary"
                prefixIcon="chevronLeft"
                onClick={goBack}
                disabled={step === 0 || submitting}
              >
                Back
              </Button>
              <Row gap="12" vertical="center" wrap horizontal="end">
                {step === 2 && (
                  <Button type="button" variant="secondary" onClick={skipInvites}>
                    Skip for now
                  </Button>
                )}
                <Button
                  type="submit"
                  suffixIcon={isLast ? "check" : "chevronRight"}
                  loading={submitting}
                >
                  {isLast ? "Finish setup" : "Next"}
                </Button>
              </Row>
            </Row>
          </Column>

          <Column flex={2} fillWidth m={{ fillWidth: true }}>
            <Summary data={data} current={step} />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx components/Welcome.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { checklist, product, STORAGE_KEY, user } from "@/lib/data";

type Saved = { name: string; workspace: string; invites: number; digest: boolean };

export function Welcome() {
  const [saved, setSaved] = useState<Saved | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const fullName = saved?.name || user.name;
  const firstName = fullName.split(" ")[0];
  const workspace = saved?.workspace || "Acme Labs";

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16" horizontal="center" align="center">
          <Row center width="64" height="64" radius="full" background="success-alpha-medium">
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Tag tone="success" size="s" label="Setup complete" />
          <Heading as="h1" textVariant="display-strong-xs">
            You&apos;re all set, {firstName}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak" wrap="balance">
            {workspace} is ready on {product.name}.
            {saved && saved.invites > 0
              ? ` We sent ${saved.invites} invite${saved.invites === 1 ? "" : "s"} to your teammates.`
              : " Invite teammates any time from Settings."}
            {saved ? (saved.digest ? " Your first digest arrives Monday." : "") : ""}
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="20" s={{ padding: "16" }}>
          <Column gap="4">
            <Heading as="h2" textVariant="heading-strong-l">
              Next steps
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              Four quick things that get the most out of your first week.
            </Text>
          </Column>
          <Column as="ol" gap="16" margin="0" padding="0" style={{ listStyle: "none" }}>
            {checklist.map((item, i) => (
              <Row as="li" key={item.title} gap="16" vertical="start">
                <Row
                  center
                  width="40"
                  height="40"
                  radius="m"
                  background="brand-alpha-weak"
                  style={{ flexShrink: 0 }}
                >
                  <Icon name={item.icon} onBackground="brand-strong" />
                </Row>
                <Column gap="4" flex={1}>
                  <Text textVariant="label-strong-m">
                    {i + 1}. {item.title}
                  </Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.description}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" horizontal="center" wrap>
          <Button href="/" variant="secondary" prefixIcon="refresh">
            Run setup again
          </Button>
          <Button href="/welcome" suffixIcon="arrowRight">
            Open dashboard
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Onboarding } from "@/components/Onboarding";

export default function Page() {
  return <Onboarding />;
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import { Welcome } from "@/components/Welcome";

export const metadata: Metadata = { title: "Welcome to Lumen" };

export default function Page() {
  return <Welcome />;
}
```
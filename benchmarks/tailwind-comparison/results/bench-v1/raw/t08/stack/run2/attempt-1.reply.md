The error is a stray 1.x `isChecked` prop on the Switch, which I've removed. Everything else is unchanged.

```ts src/lib/data.ts
import type { IconName } from "@once-ui-system/core";

export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type TeamSize = "1-5" | "6-15" | "16-50" | "51-200";

export const teamSizes: { value: TeamSize; label: string }[] = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51-200", label: "51–200 people" },
];

export type ThemeChoice = "system" | "light" | "dark";

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const MAX_INVITES = 3;

export const steps = [
  { id: "account", label: "Account", hint: "Who you are" },
  { id: "workspace", label: "Workspace", hint: "Your team's home" },
  { id: "invite", label: "Invite", hint: "Bring teammates" },
  { id: "preferences", label: "Preferences", hint: "Make it yours" },
] as const;

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: TeamSize | "";
  invites: string[];
  theme: ThemeChoice;
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

export type StepErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

const FREE_MAIL = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];

export function validateStep(step: number, data: OnboardingData): StepErrors {
  const errors: StepErrors = {};

  if (step === 0) {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    const email = data.email.trim().toLowerCase();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (!isEmail(email)) {
      errors.email = "That doesn't look like an email address, e.g. maya@acmelabs.io.";
    } else if (FREE_MAIL.includes(email.split("@")[1])) {
      errors.email = "Use your work email so teammates can find you.";
    }
  }

  if (step === 1) {
    const ws = data.workspace.trim();
    if (ws.length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    } else if (ws.length > 40) {
      errors.workspace = "Keep the workspace name under 40 characters.";
    }
    if (!data.teamSize) {
      errors.teamSize = "Choose your team size.";
    }
  }

  if (step === 2) {
    const own = data.email.trim().toLowerCase();
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!isEmail(value)) {
        errors[`invite${i}`] = "Enter a valid email address or leave this blank.";
      } else if (value === own) {
        errors[`invite${i}`] = "That's your own address. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors[`invite${i}`] = "You've already added this address.";
      } else {
        seen.add(value);
      }
    });
  }

  return errors;
}

export type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  minutes: number;
};

export const nextSteps: ChecklistItem[] = [
  {
    id: "snippet",
    title: "Install the Lumen snippet",
    description: "Paste one script tag into your app to start capturing events and errors.",
    icon: "code",
    minutes: 5,
  },
  {
    id: "issue",
    title: "File your first issue",
    description: "Turn a rough bug report into a tracked issue with an owner and a priority.",
    icon: "flag",
    minutes: 2,
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description: "Start with weekly active users, then add the funnel your team cares about.",
    icon: "barChart",
    minutes: 4,
  },
  {
    id: "slack",
    title: "Connect your team chat",
    description: "Get new regressions and release summaries where your team already talks.",
    icon: "chat",
    minutes: 3,
  },
];
```

```tsx src/components/onboarding/Onboarding.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
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
  useTheme,
} from "@once-ui-system/core";
import {
  MAX_INVITES,
  STORAGE_KEY,
  initialData,
  product,
  steps,
  teamSizes,
  themeOptions,
  validateStep,
  type OnboardingData,
  type StepErrors,
  type ThemeChoice,
} from "@/lib/data";

function Stepper({ current }: { current: number }) {
  return (
    <Column as="nav" aria-label="Onboarding progress" fillWidth gap="12">
      <Text variant="label-default-s" onBackground="neutral-weak" aria-live="polite">
        Step {current + 1} of {steps.length}: {steps[current].label}
      </Text>
      <Row as="ol" fillWidth gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
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
              <div
                aria-hidden="true"
                style={{
                  height: 4,
                  borderRadius: 4,
                  background:
                    done || active ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)",
                  opacity: active ? 1 : done ? 0.7 : 1,
                }}
              />
              <Row gap="8" vertical="center">
                <Row
                  center
                  width="24"
                  height="24"
                  radius="full"
                  background={done ? "brand-medium" : active ? "brand-strong" : "neutral-alpha-weak"}
                  onBackground={active || done ? "brand-strong" : "neutral-medium"}
                  border={active ? "brand-alpha-strong" : "neutral-alpha-weak"}
                  style={{ flexShrink: 0 }}
                >
                  {done ? (
                    <Icon name="check" size="xs" decorative />
                  ) : (
                    <Text variant="label-strong-xs" aria-hidden="true">
                      {i + 1}
                    </Text>
                  )}
                </Row>
                <Text
                  variant={active ? "label-strong-s" : "label-default-s"}
                  onBackground={active ? "neutral-strong" : "neutral-weak"}
                  s={{ hide: !active }}
                >
                  {step.label}
                  <span
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      overflow: "hidden",
                      clip: "rect(0 0 0 0)",
                    }}
                  >
                    {done ? " (completed)" : active ? " (current)" : " (upcoming)"}
                  </span>
                </Text>
              </Row>
            </Column>
          );
        })}
      </Row>
    </Column>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <Column gap="4">
      <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        as="dd"
        variant="body-default-s"
        onBackground={empty ? "neutral-weak" : "neutral-strong"}
        style={{ margin: 0, overflowWrap: "anywhere" }}
      >
        {empty ? "Not set yet" : value}
      </Text>
    </Column>
  );
}

function Summary({ data, step }: { data: OnboardingData; step: number }) {
  const invites = data.invites.map((v) => v.trim()).filter(Boolean);
  const sizeLabel = teamSizes.find((t) => t.value === data.teamSize)?.label ?? "";
  const themeLabel = themeOptions.find((t) => t.value === data.theme)?.label ?? "";

  return (
    <Column
      as="aside"
      aria-label="Setup summary"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="20"
    >
      <Row horizontal="between" vertical="center" gap="8">
        <Heading as="h2" variant="heading-strong-m">
          Your setup
        </Heading>
        <Tag size="s" scheme={step === steps.length - 1 ? "success" : "neutral"}>
          {step === steps.length - 1 ? "Almost done" : "In progress"}
        </Tag>
      </Row>

      <Column gap="16">
        <Text variant="label-strong-xs" onBackground="brand-medium">
          ACCOUNT
        </Text>
        <Column as="dl" gap="16" margin="0">
          <SummaryRow label="Name" value={data.name.trim()} />
          <SummaryRow label="Work email" value={data.email.trim()} />
        </Column>
      </Column>

      <Column gap="16" borderTop paddingTop="16">
        <Text variant="label-strong-xs" onBackground="brand-medium">
          WORKSPACE
        </Text>
        <Column as="dl" gap="16" margin="0">
          <SummaryRow label="Name" value={data.workspace.trim()} />
          <SummaryRow label="Team size" value={sizeLabel} />
        </Column>
      </Column>

      <Column gap="8" borderTop paddingTop="16">
        <Text variant="label-strong-xs" onBackground="brand-medium">
          INVITES
        </Text>
        {invites.length === 0 ? (
          <Text variant="body-default-s" onBackground="neutral-weak">
            {step > 2 ? "Skipped for now" : "No teammates added yet"}
          </Text>
        ) : (
          <Column as="ul" gap="4" margin="0" padding="0" style={{ listStyle: "none" }}>
            {invites.map((email) => (
              <Text
                as="li"
                key={email}
                variant="body-default-s"
                style={{ overflowWrap: "anywhere" }}
              >
                {email}
              </Text>
            ))}
          </Column>
        )}
      </Column>

      <Column gap="16" borderTop paddingTop="16">
        <Text variant="label-strong-xs" onBackground="brand-medium">
          PREFERENCES
        </Text>
        <Column as="dl" gap="16" margin="0">
          <SummaryRow label="Theme" value={themeLabel} />
          <SummaryRow label="Weekly digest" value={data.digest ? "On, every Monday" : "Off"} />
        </Column>
      </Column>
    </Column>
  );
}

export function Onboarding() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<StepErrors>({});
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const clearError = (key: string) => {
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    clearError(key as string);
  };

  const updateInvite = (index: number, value: string) => {
    setData((d) => ({ ...d, invites: d.invites.map((v, i) => (i === index ? value : v)) }));
    clearError(`invite${index}`);
  };

  const goTo = (n: number) => {
    setStep(n);
    setErrors({});
    // Move focus to the new step's heading so keyboard and screen-reader users land in context.
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const focusFirstError = (errs: StepErrors) => {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(`field-${first}`)?.focus();
    });
  };

  const finish = () => {
    setFinishing(true);
    try {
      const payload = {
        name: data.name.trim(),
        workspace: data.workspace.trim(),
        invites: data.invites.map((v) => v.trim()).filter(Boolean).length,
        digest: data.digest,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage can be unavailable (private mode); the welcome page has a fallback.
    }
    router.push("/welcome");
  };

  const handleNext = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    if (step < steps.length - 1) {
      goTo(step + 1);
    } else {
      finish();
    }
  };

  const skipInvites = () => {
    setData((d) => ({ ...d, invites: ["", "", ""] }));
    goTo(step + 1);
  };

  const errorCount = Object.keys(errors).length;
  const isLast = step === steps.length - 1;

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      s={{ paddingY: "24" }}
    >
      <Column maxWidth="l" fillWidth gap="32">
        <Row gap="12" vertical="center">
          <Row
            center
            width="40"
            height="40"
            radius="m"
            background="brand-strong"
            onBackground="brand-strong"
          >
            <Icon name="bolt" size="s" decorative />
          </Row>
          <Column gap="2">
            <Text variant="heading-strong-m">{product.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              Set up your workspace in about two minutes
            </Text>
          </Column>
        </Row>

        <Stepper current={step} />

        <Row gap="32" fillWidth vertical="start" m={{ gap: "24" }} s={{ direction: "column" }}>
          <Column
            as="section"
            aria-labelledby="step-heading"
            flex={3}
            fillWidth
            background="surface"
            border
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="24"
            style={{ minWidth: 0 }}
          >
            <Column gap="8">
              <Heading
                as="h1"
                id="step-heading"
                ref={headingRef}
                tabIndex={-1}
                variant="display-strong-xs"
                style={{ outline: "none" }}
              >
                {step === 0 && "Create your account"}
                {step === 1 && "Name your workspace"}
                {step === 2 && "Invite your teammates"}
                {step === 3 && "Make Lumen yours"}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {step === 0 && "We'll use these details for your profile and sign-in."}
                {step === 1 && "A workspace holds your projects, issues and dashboards."}
                {step === 2 &&
                  "Add up to three teammates now. You can always invite more later, or skip this step."}
                {step === 3 && "Choose how Lumen looks and what lands in your inbox."}
              </Text>
            </Column>

            {errorCount > 0 && (
              <Row
                role="alert"
                gap="8"
                padding="12"
                radius="m"
                background="danger-alpha-weak"
                border="danger-alpha-medium"
                vertical="start"
              >
                <Icon name="danger" size="s" onBackground="danger-strong" decorative />
                <Text variant="body-default-s" onBackground="danger-strong">
                  {errorCount === 1
                    ? "Fix 1 field below to continue."
                    : `Fix ${errorCount} fields below to continue.`}
                </Text>
              </Row>
            )}

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              <Column gap="24">
                {step === 0 && (
                  <Column gap="16">
                    <Input
                      id="field-name"
                      label="Full name"
                      autoComplete="name"
                      value={data.name}
                      onChange={(e) => update("name", e.target.value)}
                      error={Boolean(errors.name)}
                      errorMessage={errors.name}
                      aria-required="true"
                    />
                    <Input
                      id="field-email"
                      label="Work email"
                      type="email"
                      autoComplete="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      error={Boolean(errors.email)}
                      errorMessage={errors.email}
                      description={errors.email ? undefined : "For example maya@acmelabs.io"}
                      aria-required="true"
                    />
                  </Column>
                )}

                {step === 1 && (
                  <Column gap="16">
                    <Input
                      id="field-workspace"
                      label="Workspace name"
                      autoComplete="organization"
                      value={data.workspace}
                      onChange={(e) => update("workspace", e.target.value)}
                      error={Boolean(errors.workspace)}
                      errorMessage={errors.workspace}
                      aria-required="true"
                    />
                    <Select
                      id="field-teamSize"
                      label="Team size"
                      value={data.teamSize}
                      options={teamSizes.map((t) => ({ value: t.value, label: t.label }))}
                      onSelect={(v) =>
                        update(
                          "teamSize",
                          (Array.isArray(v) ? v[0] : v) as OnboardingData["teamSize"],
                        )
                      }
                      error={Boolean(errors.teamSize)}
                      errorMessage={errors.teamSize}
                    />
                  </Column>
                )}

                {step === 2 && (
                  <Column gap="16">
                    {Array.from({ length: MAX_INVITES }, (_, i) => (
                      <Input
                        key={i}
                        id={`field-invite${i}`}
                        label={`Teammate ${i + 1} email (optional)`}
                        type="email"
                        autoComplete="off"
                        value={data.invites[i] ?? ""}
                        onChange={(e) => updateInvite(i, e.target.value)}
                        error={Boolean(errors[`invite${i}`])}
                        errorMessage={errors[`invite${i}`]}
                      />
                    ))}
                  </Column>
                )}

                {step === 3 && (
                  <Column gap="24">
                    <Column gap="8" role="group" aria-labelledby="theme-label">
                      <Text id="theme-label" variant="label-default-s">
                        Theme
                      </Text>
                      <SegmentedControl
                        fillWidth
                        semantics="radio"
                        buttons={themeOptions.map((t) => ({ value: t.value, label: t.label }))}
                        value={data.theme}
                        onChange={(v) => {
                          const choice = v as ThemeChoice;
                          update("theme", choice);
                          setTheme(choice);
                        }}
                      />
                      <Text variant="body-default-xs" onBackground="neutral-weak">
                        The theme applies right away, so you can preview it.
                      </Text>
                    </Column>
                    <Row
                      background="neutral-alpha-weak"
                      radius="m"
                      padding="16"
                      border="neutral-alpha-weak"
                    >
                      <Switch
                        checked={data.digest}
                        onToggle={(checked) => update("digest", checked)}
                        label="Weekly digest"
                        description="A Monday summary of new issues, resolved bugs and key metric changes."
                        ariaLabel="Weekly digest"
                      />
                    </Row>
                  </Column>
                )}

                <Row
                  gap="12"
                  vertical="center"
                  horizontal="between"
                  wrap
                  borderTop
                  paddingTop="24"
                >
                  <Button
                    type="button"
                    variant="tertiary"
                    prefixIcon="arrowLeft"
                    label="Back"
                    onClick={() => goTo(step - 1)}
                    disabled={step === 0 || finishing}
                  />
                  <Row gap="8" wrap vertical="center">
                    {step === 2 && (
                      <Button
                        type="button"
                        variant="secondary"
                        label="Skip for now"
                        onClick={skipInvites}
                      />
                    )}
                    <Button
                      type="submit"
                      label={isLast ? "Finish setup" : "Next"}
                      suffixIcon={isLast ? "check" : "arrowRight"}
                      loading={finishing}
                    />
                  </Row>
                </Row>
              </Column>
            </form>
          </Column>

          <Column flex={2} fillWidth style={{ minWidth: 0 }}>
            <Summary data={data} step={step} />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = {
  title: "Get started - Lumen",
  description: "Set up your Lumen workspace in four quick steps.",
};

export default function Page() {
  return <Onboarding />;
}
```

```tsx src/components/onboarding/WelcomeChecklist.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Column,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { STORAGE_KEY, nextSteps, product, user } from "@/lib/data";

type Saved = { name: string; workspace: string; invites: number; digest: boolean };

export function WelcomeChecklist() {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const firstName = (saved?.name || user.name).split(" ")[0];
  const workspace = saved?.workspace || "";
  const completed = nextSteps.filter((s) => done[s.id]).length;
  const allDone = completed === nextSteps.length;

  return (
    <Column
      as="main"
      id="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="48"
      s={{ paddingY: "24" }}
    >
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16">
          <Row
            center
            width="56"
            height="56"
            radius="full"
            background="success-medium"
            onBackground="success-strong"
          >
            <Icon name="check" size="l" decorative />
          </Row>
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            {workspace ? `${workspace} is` : "Your workspace is"} ready on {product.name}.
            {saved && saved.invites > 0
              ? ` We've sent ${saved.invites} ${saved.invites === 1 ? "invitation" : "invitations"}.`
              : ""}
            {saved?.digest ? " Your first weekly digest arrives Monday." : ""}
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          s={{ padding: "16" }}
          gap="16"
        >
          <Row horizontal="between" vertical="center" gap="12" wrap>
            <Heading as="h2" id="checklist-heading" variant="heading-strong-l">
              Next steps
            </Heading>
            <Tag size="m" scheme={allDone ? "success" : "neutral"} aria-live="polite">
              {completed} of {nextSteps.length} done
            </Tag>
          </Row>

          <Column as="ul" margin="0" padding="0" gap="8" style={{ listStyle: "none" }}>
            {nextSteps.map((item) => (
              <Row
                as="li"
                key={item.id}
                gap="12"
                padding="16"
                radius="m"
                border="neutral-alpha-weak"
                background={done[item.id] ? "success-alpha-weak" : "transparent"}
                vertical="start"
              >
                <Checkbox
                  checked={Boolean(done[item.id])}
                  onToggle={(checked) => setDone((d) => ({ ...d, [item.id]: checked }))}
                  label={
                    <Row gap="8" vertical="center" wrap>
                      <Icon name={item.icon} size="s" onBackground="brand-medium" decorative />
                      <Text variant="label-strong-m">{item.title}</Text>
                      <Tag size="s">{item.minutes} min</Tag>
                    </Row>
                  }
                  description={item.description}
                />
              </Row>
            ))}
          </Column>
        </Column>

        <Row gap="12" wrap>
          <Button href="/" label="Back to setup" variant="secondary" prefixIcon="arrowLeft" />
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx src/app/welcome/page.tsx
import type { Metadata } from "next";
import { WelcomeChecklist } from "@/components/onboarding/WelcomeChecklist";

export const metadata: Metadata = {
  title: "Welcome - Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function Page() {
  return <WelcomeChecklist />;
}
```
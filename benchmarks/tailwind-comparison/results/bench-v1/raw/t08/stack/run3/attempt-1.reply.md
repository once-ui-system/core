Confirmed: `src/lib/onboarding.ts` is missing from the project, so it was never picked up. The spec suggests `src/lib/data.ts`, so I'll move the data there. `src/lib/data/` is already a folder, so a `data.ts` beside it could be ambiguous when `@/lib/data` is resolved. I'll use a clearly named file, `src/lib/onboarding-data.ts`, and point every import at it. I'm resending every file in full.

```ts src/lib/onboarding-data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export const demoUser = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ThemeChoice = "system" | "light" | "dark";

export type OnboardingData = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
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

export const steps = [
  { id: "account", title: "Account", hint: "Tell us who you are" },
  { id: "workspace", title: "Workspace", hint: "Name your team's space" },
  { id: "invite", title: "Invite", hint: "Bring teammates along" },
  { id: "preferences", title: "Preferences", hint: "Make Lumen yours" },
] as const;

export const teamSizeOptions: { value: string; label: string }[] = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2 to 5 people" },
  { value: "6-15", label: "6 to 15 people" },
  { value: "16-50", label: "16 to 50 people" },
  { value: "50+", label: "More than 50" },
];

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const checklist = [
  {
    title: "Connect your first project",
    description:
      "Install the Lumen snippet or import a repository to start collecting events.",
    icon: "code",
  },
  {
    title: "Create your first issue",
    description: "Capture a bug or task and assign it to someone on your team.",
    icon: "checkbox",
  },
  {
    title: "Build a dashboard",
    description:
      "Pick a few metrics, like weekly active users and open bugs, and pin them.",
    icon: "barChart",
  },
  {
    title: "Invite the rest of your team",
    description: "Teammates get access to the same projects and dashboards.",
    icon: "people",
  },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export type InviteErrors = [string | undefined, string | undefined, string | undefined];

export type Errors = {
  name?: string;
  email?: string;
  workspace?: string;
  teamSize?: string;
  invites?: InviteErrors;
};

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!isEmail(data.email))
      errors.email = "That doesn't look like a valid email address.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (2 characters or more).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (step === 2) {
    const invErrors: InviteErrors = [undefined, undefined, undefined];
    const seen = new Set<string>();
    if (data.email.trim()) seen.add(data.email.trim().toLowerCase());
    let any = false;
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (!v) return;
      if (!isEmail(v)) {
        invErrors[i] = "Enter a valid email address, or leave it empty.";
        any = true;
      } else if (seen.has(v)) {
        invErrors[i] = "This email is already used.";
        any = true;
      } else {
        seen.add(v);
      }
    });
    if (any) errors.invites = invErrors;
  }
  return errors;
}
```

```tsx src/app/page.tsx
import { Column } from "@once-ui-system/core";
import { Wizard } from "@/components/onboarding/Wizard";

export const metadata = {
  title: "Get started with Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="32">
      <Wizard />
    </Column>
  );
}
```

```tsx src/components/onboarding/Wizard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Column,
  Grid,
  Heading,
  Input,
  Row,
  SegmentedControl,
  Select,
  Switch,
  Text,
  useTheme,
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  type Errors,
  type InviteErrors,
  type OnboardingData,
  type ThemeChoice,
  initialData,
  product,
  steps,
  teamSizeOptions,
  themeOptions,
  validateStep,
} from "@/lib/onboarding-data";
import { StepIndicator } from "./StepIndicator";
import { Summary } from "./Summary";

type FieldKey = "name" | "email" | "workspace" | "teamSize";

export function Wizard() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [skipped, setSkipped] = useState(false);
  const headingWrapRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingWrapRef.current?.focus();
  }, [step]);

  const updateField = (key: FieldKey, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next: Errors = { ...e };
      delete next[key];
      return next;
    });
  };

  const updateInvite = (index: number, value: string) => {
    setData((d) => {
      const invites: OnboardingData["invites"] = [...d.invites];
      invites[index] = value;
      return { ...d, invites };
    });
    setErrors((e) => {
      if (!e.invites?.[index]) return e;
      const invites: InviteErrors = [...e.invites];
      invites[index] = undefined;
      return { ...e, invites };
    });
  };

  const chooseTheme = (value: string) => {
    const t = value as ThemeChoice;
    setData((d) => ({ ...d, theme: t }));
    setTheme(t);
  };

  const goNext = () => {
    const found = validateStep(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/welcome");
    }
  };

  const goBack = () => {
    setErrors({});
    if (step > 0) setStep(step - 1);
  };

  const skipInvites = () => {
    setData((d) => ({ ...d, invites: ["", "", ""] }));
    setErrors({});
    setSkipped(true);
    setStep(3);
  };

  const last = step === steps.length - 1;

  return (
    <Column fillWidth maxWidth="l" gap="32">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="brand-medium">
          {product.name} setup
        </Text>
        <Heading as="h1" variant="display-strong-xs">
          Let's get your team set up
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Four short steps. You can change everything later in settings.
        </Text>
      </Column>

      <StepIndicator current={step} />

      <Grid columns="2" gap="32" s={{ columns: 1 }} fillWidth>
        <Column
          as="section"
          aria-labelledby="step-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="24"
        >
          <div
            ref={headingWrapRef}
            tabIndex={-1}
            style={{
              outline: "none",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              Step {step + 1} of {steps.length}
            </Text>
            <Heading as="h2" id="step-heading" variant="heading-strong-l">
              {steps[step].title}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {steps[step].hint}
            </Text>
          </div>

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
          >
            <Column gap="24">
              {step === 0 && (
                <Column gap="16">
                  <Input
                    id="name"
                    label="Full name"
                    autoComplete="name"
                    value={data.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={Boolean(errors.name)}
                    errorMessage={errors.name}
                    aria-required="true"
                  />
                  <Input
                    id="email"
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                    aria-required="true"
                  />
                </Column>
              )}

              {step === 1 && (
                <Column gap="16">
                  <Input
                    id="workspace"
                    label="Workspace name"
                    autoComplete="organization"
                    value={data.workspace}
                    onChange={(e) => updateField("workspace", e.target.value)}
                    error={Boolean(errors.workspace)}
                    errorMessage={errors.workspace}
                    aria-required="true"
                  />
                  <Select
                    id="teamSize"
                    label="Team size"
                    options={teamSizeOptions}
                    value={data.teamSize}
                    onSelect={(v) =>
                      updateField("teamSize", Array.isArray(v) ? (v[0] ?? "") : v)
                    }
                    error={Boolean(errors.teamSize)}
                    errorMessage={errors.teamSize}
                  />
                </Column>
              )}

              {step === 2 && (
                <Column gap="16">
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    Add up to three teammates. They'll get an email invitation
                    once your workspace is ready.
                  </Text>
                  {[0, 1, 2].map((i) => (
                    <Input
                      key={i}
                      id={`invite-${i}`}
                      label={`Teammate ${i + 1} email (optional)`}
                      type="email"
                      autoComplete="off"
                      value={data.invites[i]}
                      onChange={(e) => updateInvite(i, e.target.value)}
                      error={Boolean(errors.invites?.[i])}
                      errorMessage={errors.invites?.[i]}
                    />
                  ))}
                </Column>
              )}

              {step === 3 && (
                <Column gap="24">
                  <Column gap="8">
                    <Text variant="label-default-m">Theme</Text>
                    <SegmentedControl
                      semantics="radio"
                      fillWidth
                      value={data.theme}
                      onChange={chooseTheme}
                      buttons={themeOptions.map((o) => ({
                        value: o.value,
                        label: o.label,
                      }))}
                    />
                  </Column>
                  <Switch
                    label="Weekly digest"
                    description="A Monday email with new issues, closed bugs and your top metrics."
                    checked={data.digest}
                    onToggle={(v) => setData((d) => ({ ...d, digest: v }))}
                  />
                </Column>
              )}

              <Row gap="12" horizontal="between" vertical="center" wrap>
                <Button
                  type="button"
                  variant="tertiary"
                  prefixIcon="chevronLeft"
                  label="Back"
                  onClick={goBack}
                  disabled={step === 0}
                />
                <Row gap="8" wrap>
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
                    label={last ? "Finish setup" : "Next"}
                    suffixIcon={last ? "check" : "chevronRight"}
                  />
                </Row>
              </Row>
            </Column>
          </form>
        </Column>

        <Summary data={data} skipped={skipped} />
      </Grid>
      <VisuallyHidden>
        <span aria-live="polite">
          Step {step + 1} of {steps.length}: {steps[step].title}
        </span>
      </VisuallyHidden>
    </Column>
  );
}
```

```tsx src/components/onboarding/StepIndicator.tsx
import { Column, Icon, Row, Text, VisuallyHidden } from "@once-ui-system/core";
import { steps } from "@/lib/onboarding-data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Setup progress">
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              style={{ flex: "1 1 120px", minWidth: 0 }}
            >
              <Column gap="8">
                <div
                  aria-hidden="true"
                  style={{
                    height: "4px",
                    borderRadius: "2px",
                    background:
                      done || active
                        ? "var(--brand-solid-strong)"
                        : "var(--neutral-alpha-medium)",
                    opacity: done ? 0.6 : 1,
                  }}
                />
                <Row gap="8" vertical="center">
                  <Row
                    center
                    width="24"
                    height="24"
                    radius="full"
                    background={done || active ? "brand-strong" : "neutral-alpha-weak"}
                    onBackground={done || active ? "brand-strong" : "neutral-medium"}
                  >
                    {done ? (
                      <Icon name="check" size="xs" />
                    ) : (
                      <Text variant="label-strong-xs">{i + 1}</Text>
                    )}
                  </Row>
                  <Text
                    variant={active ? "label-strong-s" : "label-default-s"}
                    onBackground={active ? "neutral-strong" : "neutral-weak"}
                  >
                    {s.title}
                    <VisuallyHidden>
                      {done ? " (completed)" : active ? " (current step)" : ""}
                    </VisuallyHidden>
                  </Text>
                </Row>
              </Column>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

```tsx src/components/onboarding/Summary.tsx
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import {
  type OnboardingData,
  teamSizeOptions,
  themeOptions,
} from "@/lib/onboarding-data";

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <Column gap="4">
      <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        as="dd"
        variant="body-default-m"
        onBackground={value ? "neutral-strong" : "neutral-weak"}
        style={{ margin: 0, overflowWrap: "anywhere" }}
      >
        {value || "Not provided yet"}
      </Text>
    </Column>
  );
}

export function Summary({
  data,
  skipped,
}: {
  data: OnboardingData;
  skipped: boolean;
}) {
  const teamLabel = teamSizeOptions.find((o) => o.value === data.teamSize)?.label;
  const themeLabel = themeOptions.find((o) => o.value === data.theme)?.label;
  const invites = data.invites.map((v) => v.trim()).filter(Boolean);

  return (
    <Column
      as="aside"
      aria-label="Your setup so far"
      background="surface"
      border
      radius="l"
      padding="24"
      gap="24"
      style={{ alignSelf: "start" }}
    >
      <Column gap="4">
        <Heading as="h2" variant="heading-strong-m">
          Your setup so far
        </Heading>
        <Text variant="body-default-s" onBackground="neutral-weak">
          This updates as you fill in each step.
        </Text>
      </Column>

      <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
        <SummaryRow label="Name" value={data.name.trim()} />
        <SummaryRow label="Work email" value={data.email.trim()} />
        <SummaryRow label="Workspace" value={data.workspace.trim()} />
        <SummaryRow label="Team size" value={teamLabel} />
        <Column gap="4">
          <Text as="dt" variant="label-default-xs" onBackground="neutral-weak">
            Invitations
          </Text>
          <dd style={{ margin: 0 }}>
            {invites.length > 0 ? (
              <Row gap="8" wrap>
                {invites.map((e) => (
                  <Tag key={e} size="m" label={e} />
                ))}
              </Row>
            ) : (
              <Text variant="body-default-m" onBackground="neutral-weak">
                {skipped ? "Skipped for now" : "No one invited yet"}
              </Text>
            )}
          </dd>
        </Column>
        <SummaryRow label="Theme" value={themeLabel} />
        <SummaryRow label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </dl>
    </Column>
  );
}
```

```tsx src/app/welcome/page.tsx
import { Button, Column, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { checklist, demoUser, product } from "@/lib/onboarding-data";

export const metadata = {
  title: "Welcome to Lumen",
  description: "Your workspace is ready. Here is what to do next.",
};

export default function Page() {
  const firstName = demoUser.name.split(" ")[0];

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="40">
      <Column fillWidth maxWidth="s" gap="32">
        <Column gap="16" horizontal="start">
          <Row
            center
            width="48"
            height="48"
            radius="full"
            background="success-alpha-weak"
            onBackground="success-strong"
          >
            <Icon name="check" size="m" />
          </Row>
          <Text variant="label-default-s" onBackground="brand-medium">
            Setup complete
          </Text>
          <Heading as="h1" variant="display-strong-s">
            You're all set, {firstName}
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Your {product.name} workspace is ready. Here are four things worth
            doing in your first session.
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="checklist-heading"
          background="surface"
          border
          radius="l"
          padding="24"
          gap="24"
        >
          <Heading as="h2" id="checklist-heading" variant="heading-strong-l">
            Next steps
          </Heading>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {checklist.map((item, i) => (
              <li key={item.title}>
                <Row gap="16" vertical="start">
                  <Row
                    center
                    width="40"
                    height="40"
                    radius="m"
                    background="brand-alpha-weak"
                    onBackground="brand-strong"
                    style={{ flexShrink: 0 }}
                  >
                    <Icon name={item.icon} size="s" />
                  </Row>
                  <Column gap="4" flex={1}>
                    <Text variant="heading-strong-s">
                      {i + 1}. {item.title}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.description}
                    </Text>
                  </Column>
                </Row>
              </li>
            ))}
          </ol>
        </Column>

        <Row gap="12" wrap>
          <Button href="/app" label="Open my workspace" suffixIcon="arrowRight" />
          <Button
            href="/"
            variant="secondary"
            label="Back to setup"
            prefixIcon="arrowLeft"
          />
        </Row>
      </Column>
    </Column>
  );
}
```
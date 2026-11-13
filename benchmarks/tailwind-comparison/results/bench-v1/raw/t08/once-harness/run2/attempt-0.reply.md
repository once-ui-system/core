```ts lib/data.ts
export const product = {
  name: "Lumen",
  tagline: "Product analytics and issue tracking for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export const STORAGE_KEY = "lumen-onboarding-v1";

export type Theme = "light" | "dark" | "system";
export type Digest = "weekly" | "monthly" | "off";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: [string, string, string];
  theme: Theme;
  digest: boolean;
}

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
  { id: "workspace", title: "Workspace", hint: "Name your team's home" },
  { id: "invite", title: "Invite", hint: "Bring teammates along" },
  { id: "preferences", title: "Preferences", hint: "Make Lumen yours" },
] as const;

export const teamSizes = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-50", label: "16–50" },
  { value: "50+", label: "50+" },
];

export const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const nextSteps = [
  {
    icon: "cube",
    title: "Create your first project",
    text: "Group issues and events by product, like “Acme Mobile” or “Billing API”.",
  },
  {
    icon: "code",
    title: "Install the tracking snippet",
    text: "Paste two lines into your app to start collecting page views and errors.",
  },
  {
    icon: "bolt",
    title: "File your first issue",
    text: "Capture a bug from a failed event, or write one up by hand.",
  },
  {
    icon: "people",
    title: "Check on your invites",
    text: "Teammates you invited can join as soon as they accept their email.",
  },
] as const;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

```tsx components/SummaryCard.tsx
import { Column, Row, Text, Heading, Icon, Avatar, Tag } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { type OnboardingData, product } from "@/lib/data";

function Item({
  icon,
  label,
  value,
  placeholder,
}: {
  icon: IconName;
  label: string;
  value: string;
  placeholder: string;
}) {
  const filled = value.trim().length > 0;
  return (
    <Row gap="12" vertical="start">
      <Row fit paddingTop="2">
        <Icon name={icon} size="s" onBackground="neutral-weak" />
      </Row>
      <Column gap="2" flex={1}>
        <Text textVariant="label-default-xs" onBackground="neutral-weak">
          {label}
        </Text>
        <Text
          textVariant="body-default-s"
          onBackground={filled ? "neutral-strong" : "neutral-weak"}
          style={{ overflowWrap: "anywhere" }}
        >
          {filled ? value : placeholder}
        </Text>
      </Column>
    </Row>
  );
}

export function SummaryCard({ data }: { data: OnboardingData }) {
  const invites = data.invites.map((i) => i.trim()).filter(Boolean);
  const themeLabel = data.theme.charAt(0).toUpperCase() + data.theme.slice(1);

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
      <Row gap="12" vertical="center">
        <Avatar value={data.name.trim() || undefined} size="m" empty={!data.name.trim()} />
        <Column gap="2" flex={1}>
          <Heading as="h2" textVariant="heading-strong-m" style={{ overflowWrap: "anywhere" }}>
            {data.workspace.trim() || "Your workspace"}
          </Heading>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            {product.name} setup summary
          </Text>
        </Column>
        <Tag label="Draft" size="s" tone="neutral" />
      </Row>

      <Column gap="16" borderTop paddingTop="20">
        <Item icon="person" label="Name" value={data.name} placeholder="Not entered yet" />
        <Item icon="mail" label="Work email" value={data.email} placeholder="Not entered yet" />
        <Item
          icon="organization"
          label="Workspace"
          value={data.workspace}
          placeholder="Not named yet"
        />
        <Item
          icon="people"
          label="Team size"
          value={data.teamSize ? `${data.teamSize} people` : ""}
          placeholder="Not chosen yet"
        />
        <Item
          icon="send"
          label="Invites"
          value={invites.join(", ")}
          placeholder="No teammates invited"
        />
        <Item
          icon="settings"
          label="Preferences"
          value={`${themeLabel} theme · Weekly digest ${data.digest ? "on" : "off"}`}
          placeholder=""
        />
      </Column>
    </Column>
  );
}
```

```tsx components/Wizard.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Column,
  Heading,
  Icon,
  Input,
  Row,
  SegmentedControl,
  Switch,
  Text,
  VisuallyHidden,
  useTheme,
} from "@once-ui-system/core";
import { SummaryCard } from "@/components/SummaryCard";
import {
  type OnboardingData,
  type Theme,
  STORAGE_KEY,
  emailPattern,
  initialData,
  product,
  steps,
  teamSizes,
  themeOptions,
  user,
} from "@/lib/data";

type Errors = Partial<Record<"name" | "email" | "workspace" | "teamSize" | "invite0" | "invite1" | "invite2", string>>;

function validate(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!emailPattern.test(data.email.trim())) errors.email = "Enter a valid email, like name@company.com.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2) errors.workspace = "Give your workspace a name (2+ characters).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (step === 2) {
    const seen = new Set<string>([data.email.trim().toLowerCase()]);
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      const key = `invite${i}` as "invite0" | "invite1" | "invite2";
      if (!emailPattern.test(value)) errors[key] = "Enter a valid email address.";
      else if (seen.has(value)) errors[key] = "This email is already used.";
      else seen.add(value);
    });
  }
  return errors;
}

function StepIndicator({ current }: { current: number }) {
  return (
    <Column as="nav" aria-label="Progress" fillWidth gap="12">
      <Row as="ol" fillWidth gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <Column
              as="li"
              key={s.id}
              flex={1}
              gap="8"
              aria-current={active ? "step" : undefined}
            >
              <Row
                fillWidth
                radius="full"
                background={done || active ? "brand-strong" : "neutral-medium"}
                style={{ height: 4 }}
              />
              <Row gap="8" vertical="center">
                <Row
                  fit
                  center
                  radius="full"
                  width={24}
                  height={24}
                  background={done ? "brand-strong" : active ? "brand-alpha-weak" : "neutral-alpha-weak"}
                  onBackground={done ? "brand-strong" : undefined}
                  style={{ flexShrink: 0 }}
                >
                  {done ? (
                    <Icon name="check" size="xs" onSolid="brand-strong" />
                  ) : (
                    <Text
                      textVariant="label-strong-xs"
                      onBackground={active ? "brand-strong" : "neutral-weak"}
                    >
                      {i + 1}
                    </Text>
                  )}
                </Row>
                <Text
                  textVariant="label-default-s"
                  onBackground={active ? "neutral-strong" : "neutral-weak"}
                  s={{ hide: !active }}
                >
                  {s.title}
                </Text>
                <VisuallyHidden>
                  {done ? " (completed)" : active ? " (current step)" : ""}
                </VisuallyHidden>
              </Row>
            </Column>
          );
        })}
      </Row>
    </Column>
  );
}

export function Wizard() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const setInvite = (index: number, value: string) => {
    setData((d) => {
      const invites = [...d.invites] as OnboardingData["invites"];
      invites[index] = value;
      return { ...d, invites };
    });
    setErrors((e) => ({ ...e, [`invite${index}`]: undefined }));
  };

  const clear = (key: keyof Errors) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const goNext = () => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* storage unavailable: the welcome page falls back to defaults */
      }
      router.push("/welcome");
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const skipInvites = () => {
    setData((d) => ({ ...d, invites: ["", "", ""] }));
    setErrors({});
    setStep(3);
  };

  const chooseTheme = (value: string) => {
    const t = value as Theme;
    update("theme", t);
    setTheme(t);
  };

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32" id="main">
      <Column maxWidth="l" fillWidth gap="32">
        <Row gap="12" vertical="center">
          <Row fit center radius="m" background="brand-strong" width={40} height={40}>
            <Icon name="sparkle" size="s" onSolid="brand-strong" />
          </Row>
          <Column gap="2">
            <Text textVariant="heading-strong-l">{product.name}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              Set up your workspace in about two minutes
            </Text>
          </Column>
        </Row>

        <StepIndicator current={step} />

        <Row
          fillWidth
          gap="24"
          vertical="start"
          m={{ direction: "column" }}
          s={{ direction: "column" }}
        >
          <Column
            as="form"
            noValidate
            aria-labelledby="step-title"
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              goNext();
            }}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="24"
            flex={3}
            fillWidth
          >
            <Column gap="4">
              <Text textVariant="label-default-s" onBackground="brand-medium">
                Step {step + 1} of {steps.length}
              </Text>
              <Heading
                as="h1"
                id="step-title"
                ref={headingRef}
                tabIndex={-1}
                textVariant="display-strong-xs"
                style={{ outline: "none" }}
              >
                {current.title}
              </Heading>
              <Text textVariant="body-default-m" onBackground="neutral-weak">
                {current.hint}
              </Text>
            </Column>

            <div role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              {errorCount > 0 ? `${errorCount} ${errorCount === 1 ? "error" : "errors"} to fix before continuing.` : ""}
            </div>

            {step === 0 && (
              <Column gap="16">
                <Input
                  id="name"
                  name="name"
                  label="Full name"
                  placeholder={user.name}
                  autoComplete="name"
                  value={data.name}
                  onChange={(e) => {
                    update("name", e.target.value);
                    clear("name");
                  }}
                  error={Boolean(errors.name)}
                  errorMessage={errors.name}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Work email"
                  placeholder={user.email}
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => {
                    update("email", e.target.value);
                    clear("email");
                  }}
                  error={Boolean(errors.email)}
                  errorMessage={errors.email}
                />
              </Column>
            )}

            {step === 1 && (
              <Column gap="24">
                <Input
                  id="workspace"
                  name="workspace"
                  label="Workspace name"
                  placeholder="Acme Labs"
                  autoComplete="organization"
                  value={data.workspace}
                  onChange={(e) => {
                    update("workspace", e.target.value);
                    clear("workspace");
                  }}
                  error={Boolean(errors.workspace)}
                  errorMessage={errors.workspace}
                />
                <Column gap="8" role="group" aria-labelledby="size-label">
                  <Text id="size-label" textVariant="label-default-s">
                    Team size
                  </Text>
                  <SegmentedControl
                    semantics="radio"
                    aria-labelledby="size-label"
                    buttons={teamSizes}
                    value={data.teamSize}
                    onValueChange={(v) => {
                      update("teamSize", v);
                      clear("teamSize");
                    }}
                  />
                  {errors.teamSize && (
                    <Row gap="8" vertical="center" onBackground="danger-medium">
                      <Icon name="danger" size="xs" onBackground="danger-medium" />
                      <Text role="alert" textVariant="body-default-s" onBackground="danger-medium">
                        {errors.teamSize}
                      </Text>
                    </Row>
                  )}
                </Column>
              </Column>
            )}

            {step === 2 && (
              <Column gap="16">
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  Add up to three teammates. They&apos;ll get an email invite. You can always do this later.
                </Text>
                {[0, 1, 2].map((i) => {
                  const key = `invite${i}` as "invite0" | "invite1" | "invite2";
                  return (
                    <Input
                      key={key}
                      id={`invite-${i}`}
                      name={`invite-${i}`}
                      type="email"
                      label={`Teammate ${i + 1} email (optional)`}
                      placeholder={["sam@acmelabs.io", "priya@acmelabs.io", "leo@acmelabs.io"][i]}
                      autoComplete="off"
                      value={data.invites[i]}
                      onChange={(e) => setInvite(i, e.target.value)}
                      error={Boolean(errors[key])}
                      errorMessage={errors[key]}
                    />
                  );
                })}
              </Column>
            )}

            {step === 3 && (
              <Column gap="24">
                <Column gap="8" role="group" aria-labelledby="theme-label">
                  <Text id="theme-label" textVariant="label-default-s">
                    Theme
                  </Text>
                  <SegmentedControl
                    semantics="radio"
                    aria-labelledby="theme-label"
                    buttons={themeOptions}
                    value={data.theme}
                    onValueChange={chooseTheme}
                  />
                </Column>
                <Switch
                  id="digest"
                  label="Weekly digest"
                  description="A Monday email with new issues, top events and what your team closed."
                  checked={data.digest}
                  onCheckedChange={(checked) => update("digest", checked)}
                />
              </Column>
            )}

            <Row gap="12" vertical="center" wrap horizontal="between" borderTop paddingTop="20">
              <Button
                type="button"
                variant="secondary"
                prefixIcon="chevronLeft"
                onClick={goBack}
                disabled={step === 0}
              >
                Back
              </Button>
              <Row gap="8" vertical="center" wrap>
                {step === 2 && (
                  <Button type="button" variant="tertiary" onClick={skipInvites}>
                    Skip for now
                  </Button>
                )}
                <Button
                  type="submit"
                  loading={submitting}
                  suffixIcon={isLast ? "check" : "chevronRight"}
                >
                  {isLast ? "Finish setup" : "Next"}
                </Button>
              </Row>
            </Row>
          </Column>

          <Column flex={2} fillWidth>
            <SummaryCard data={data} />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import { Wizard } from "@/components/Wizard";

export default function Page() {
  return <Wizard />;
}
```

```tsx components/WelcomeView.tsx
"use client";

import { useEffect, useState } from "react";
import { Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { STORAGE_KEY, nextSteps, product, user } from "@/lib/data";

interface Saved {
  name?: string;
  workspace?: string;
  invites?: string[];
}

export function WelcomeView() {
  const [saved, setSaved] = useState<Saved>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      /* ignore unreadable storage */
    }
  }, []);

  const firstName = (saved.name?.trim() || user.name).split(" ")[0];
  const workspace = saved.workspace?.trim() || "Acme Labs";
  const inviteCount = (saved.invites ?? []).filter((i) => i.trim()).length;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
      <Column maxWidth="s" fillWidth gap="32">
        <Column gap="16" horizontal="center" align="center">
          <Row fit center radius="full" background="success-alpha-weak" width={64} height={64}>
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Tag label={`${workspace} is ready`} tone="success" size="m" />
          <Heading as="h1" textVariant="display-strong-s" wrap="balance">
            Welcome to {product.name}, {firstName}
          </Heading>
          <Text textVariant="body-default-m" onBackground="neutral-weak" wrap="balance">
            Your workspace is set up
            {inviteCount > 0
              ? ` and ${inviteCount} ${inviteCount === 1 ? "invite is" : "invites are"} on the way`
              : ""}
            . Here is what to do next to get value from {product.name} today.
          </Text>
        </Column>

        <Column
          as="ol"
          background="surface"
          border
          radius="l"
          padding="8"
          margin="0"
          aria-label="Next steps"
          style={{ listStyle: "none" }}
        >
          {nextSteps.map((item, i) => (
            <Row
              as="li"
              key={item.title}
              gap="16"
              padding="16"
              vertical="start"
              borderTop={i > 0}
            >
              <Row fit center radius="m" background="brand-alpha-weak" width={40} height={40} style={{ flexShrink: 0 }}>
                <Icon name={item.icon} size="s" onBackground="brand-strong" />
              </Row>
              <Column gap="4" flex={1}>
                <Text textVariant="heading-strong-s">{item.title}</Text>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {item.text}
                </Text>
              </Column>
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {i + 1}/{nextSteps.length}
              </Text>
            </Row>
          ))}
        </Column>

        <Row gap="12" horizontal="center" wrap>
          <Button href="/" variant="secondary" prefixIcon="chevronLeft">
            Back to setup
          </Button>
          <Button href="/welcome" suffixIcon="arrowRight">
            Create first project
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import { WelcomeView } from "@/components/WelcomeView";

export const metadata: Metadata = { title: "Welcome to Lumen" };

export default function Page() {
  return <WelcomeView />;
}
```
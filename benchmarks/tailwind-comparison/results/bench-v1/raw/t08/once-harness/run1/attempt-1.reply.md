Confirmed: Heading has no `variant` prop, only `textVariant`, and it has no `id` in its listed props (it may pass native attributes through, but I'll sidestep it by putting the id on a wrapper). Other type risks I'm removing:

-   `Text` breakpoint props accept only `hide`, so `s={{ hide: !active }}` is fine.
-   `Tag` with `prefixIcon` is fine.
-   The `Text as="legend"` and `Column as="fieldset"` combination is risky, so I'll use plain `div`s with `role="group"` and `aria-labelledby`.
-   Native attributes like `noValidate` and `autoComplete` on the components are uncertain, so I'll drop `noValidate` and use `onSubmit` only. `autoComplete` goes on Input, which takes native attributes.
-   The `SummaryRow` icon union was narrow, so I'll use `IconName`.

```ts lib/data.ts
import type { IconName } from "@once-ui-system/core";

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

export const steps = [
  {
    id: "account",
    title: "Account",
    heading: "Create your account",
    blurb: "Tell us who you are so teammates recognise your invites.",
  },
  {
    id: "workspace",
    title: "Workspace",
    heading: "Set up your workspace",
    blurb: "A workspace holds your projects, events and issues in one place.",
  },
  {
    id: "invite",
    title: "Invite",
    heading: "Invite your teammates",
    blurb: "Add up to three people now. You can always invite more later.",
  },
  {
    id: "preferences",
    title: "Preferences",
    heading: "Choose your preferences",
    blurb: "Pick how Lumen looks and how often we email you.",
  },
];

export const teamSizes = [
  { value: "1", label: "Just me" },
  { value: "2-5", label: "2–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "50+", label: "More than 50 people" },
];

export const themeOptions: {
  value: "system" | "light" | "dark";
  label: string;
  prefixIcon: IconName;
}[] = [
  { value: "system", label: "System", prefixIcon: "computer" },
  { value: "light", label: "Light", prefixIcon: "light" },
  { value: "dark", label: "Dark", prefixIcon: "dark" },
];

export const placeholders = {
  name: user.name,
  email: user.email,
  workspace: "Acme Labs",
};

export const nextSteps: {
  icon: IconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "code",
    title: "Install the Lumen snippet",
    description:
      "Paste one script tag into your app to start capturing page views and events.",
  },
  {
    icon: "flag",
    title: "Create your first project",
    description:
      "Group events, funnels and issues for a single product or service.",
  },
  {
    icon: "people",
    title: "Check your teammates' invites",
    description:
      "Invitations are valid for seven days. Resend any that go unanswered.",
  },
  {
    icon: "bell",
    title: "Connect Slack for issue alerts",
    description:
      "Get a message when a new issue crosses your error-rate threshold.",
  },
];
```

```tsx components/Onboarding.tsx
"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Column,
  Grid,
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
import type { IconName } from "@once-ui-system/core";
import {
  placeholders,
  product,
  steps,
  teamSizes,
  themeOptions,
  user,
} from "@/lib/data";

type ThemeChoice = "system" | "light" | "dark";

type FormState = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: ThemeChoice;
  digest: boolean;
};

type Errors = Record<string, string | undefined>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FREE_MAIL = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
];

function validate(step: number, form: FormState): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (form.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters).";
    }
    const email = form.email.trim();
    if (!email) {
      errors.email = "Enter your work email.";
    } else if (!EMAIL_RE.test(email)) {
      errors.email = "That doesn't look like a valid email address.";
    } else if (FREE_MAIL.includes(email.split("@")[1].toLowerCase())) {
      errors.email = "Use your work email rather than a personal address.";
    }
  }
  if (step === 1) {
    if (form.workspace.trim().length < 2) {
      errors.workspace = "Name your workspace (at least 2 characters).";
    }
    if (!form.teamSize) {
      errors.teamSize = "Choose your team size.";
    }
  }
  if (step === 2) {
    const own = form.email.trim().toLowerCase();
    const seen = new Set<string>();
    form.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!EMAIL_RE.test(value)) {
        errors["invite" + i] = "Enter a valid email address or leave it blank.";
      } else if (value === own) {
        errors["invite" + i] = "That's your own email. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors["invite" + i] = "This email is already in the list.";
      } else {
        seen.add(value);
      }
    });
  }
  return errors;
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  const empty = value === "";
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
          onBackground={empty ? "neutral-weak" : "neutral-strong"}
          style={{ overflowWrap: "anywhere" }}
        >
          {empty ? "Not added yet" : value}
        </Text>
      </Column>
    </Row>
  );
}

export function Onboarding() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    workspace: "",
    teamSize: "",
    invites: ["", "", ""],
    theme: "system",
    digest: true,
  });

  const isLast = step === steps.length - 1;
  const current = steps[step];

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const updateInvite = (index: number, value: string) => {
    setForm((prev) => {
      const invites = [...prev.invites];
      invites[index] = value;
      return { ...prev, invites };
    });
    clearError("invite" + index);
  };

  const goTo = (target: number) => {
    setStep(target);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleBack = () => {
    if (step > 0) goTo(step - 1);
  };

  const handleNext = () => {
    const found = validate(step, form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    if (isLast) {
      setSubmitting(true);
      setTheme(form.theme);
      router.push("/welcome");
      return;
    }
    goTo(step + 1);
  };

  const handleSkip = () => {
    setForm((prev) => ({ ...prev, invites: ["", "", ""] }));
    goTo(step + 1);
  };

  const filledInvites = form.invites.map((v) => v.trim()).filter(Boolean);
  const teamLabel =
    teamSizes.find((t) => t.value === form.teamSize)?.label ?? "";
  const themeLabel =
    themeOptions.find((t) => t.value === form.theme)?.label ?? "";

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="32"
      s={{ paddingY: "24" }}
    >
      <Column maxWidth="l" fillWidth gap="32">
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Row gap="12" vertical="center">
            <Row
              fit
              center
              padding="8"
              radius="m"
              background="brand-medium"
              border="brand-alpha-medium"
            >
              <Icon name="sparkle" size="s" onBackground="brand-strong" />
            </Row>
            <Text textVariant="heading-strong-l">{product.name}</Text>
          </Row>
          <Text textVariant="label-default-s" onBackground="neutral-weak">
            Step {step + 1} of {steps.length}
          </Text>
        </Row>

        <nav aria-label="Onboarding progress">
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              gap: "0.5rem",
              width: "100%",
            }}
          >
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={s.id}
                  aria-current={active ? "step" : undefined}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Column gap="8" fillWidth>
                    <Row
                      fillWidth
                      radius="full"
                      background={
                        done || active ? "brand-strong" : "neutral-medium"
                      }
                      style={{ height: 4 }}
                    />
                    <Row gap="8" vertical="center">
                      <Row
                        fit
                        center
                        radius="full"
                        background={
                          done
                            ? "brand-strong"
                            : active
                              ? "brand-medium"
                              : "neutral-weak"
                        }
                        border={
                          active ? "brand-alpha-strong" : "neutral-alpha-weak"
                        }
                        style={{ width: 24, height: 24, flexShrink: 0 }}
                      >
                        {done ? (
                          <Icon
                            name="check"
                            size="xs"
                            onBackground="brand-strong"
                          />
                        ) : (
                          <Text
                            textVariant="label-strong-xs"
                            onBackground={
                              active ? "brand-strong" : "neutral-weak"
                            }
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
                    </Row>
                  </Column>
                </li>
              );
            })}
          </ol>
        </nav>

        <Grid columns="2" gap="24" s={{ columns: "1" }} fillWidth>
          <Column
            as="section"
            aria-labelledby="step-heading"
            background="surface"
            border
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="24"
          >
            <Column gap="8">
              <div ref={headingRef} tabIndex={-1} style={{ outline: "none" }}>
                <Heading as="h1" id="step-heading" textVariant="display-strong-xs">
                  {current.heading}
                </Heading>
              </div>
              <Text onBackground="neutral-weak" textVariant="body-default-m">
                {current.blurb}
              </Text>
            </Column>

            <Column
              as="form"
              gap="24"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                handleNext();
              }}
            >
              {step === 0 && (
                <Column gap="16">
                  <Input
                    id="name"
                    label="Full name"
                    autoComplete="name"
                    value={form.name}
                    onValueChange={(v) => update("name", v)}
                    error={Boolean(errors.name)}
                    errorMessage={errors.name}
                    aria-required
                  />
                  <Input
                    id="email"
                    label="Work email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onValueChange={(v) => update("email", v)}
                    error={Boolean(errors.email)}
                    errorMessage={errors.email}
                    description={"For example " + placeholders.email}
                    aria-required
                  />
                </Column>
              )}

              {step === 1 && (
                <Column gap="16">
                  <Input
                    id="workspace"
                    label="Workspace name"
                    autoComplete="organization"
                    value={form.workspace}
                    onValueChange={(v) => update("workspace", v)}
                    error={Boolean(errors.workspace)}
                    errorMessage={errors.workspace}
                    description={"For example " + placeholders.workspace}
                    aria-required
                  />
                  <Select
                    id="teamSize"
                    label="Team size"
                    options={teamSizes}
                    value={form.teamSize}
                    onValueChange={(v) =>
                      update("teamSize", Array.isArray(v) ? (v[0] ?? "") : v)
                    }
                    error={Boolean(errors.teamSize)}
                    errorMessage={errors.teamSize}
                  />
                </Column>
              )}

              {step === 2 && (
                <Column gap="16">
                  {form.invites.map((value, i) => (
                    <Input
                      key={i}
                      id={"invite" + i}
                      label={"Teammate " + (i + 1) + " email (optional)"}
                      type="email"
                      autoComplete="off"
                      value={value}
                      onValueChange={(v) => updateInvite(i, v)}
                      error={Boolean(errors["invite" + i])}
                      errorMessage={errors["invite" + i]}
                    />
                  ))}
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Teammates join as members. You stay the{" "}
                    {user.role.toLowerCase()} of the workspace.
                  </Text>
                </Column>
              )}

              {step === 3 && (
                <Column gap="24">
                  <Column gap="8">
                    <Text textVariant="label-default-s" id="theme-label">
                      Theme
                    </Text>
                    <div role="group" aria-labelledby="theme-label">
                      <SegmentedControl
                        semantics="radio"
                        buttons={themeOptions.map((t) => ({
                          value: t.value,
                          label: t.label,
                          prefixIcon: t.prefixIcon,
                        }))}
                        value={form.theme}
                        onValueChange={(v) => update("theme", v as ThemeChoice)}
                      />
                    </div>
                  </Column>
                  <Switch
                    id="digest"
                    label="Weekly digest"
                    description="A Monday email with your top events, new issues and what changed since last week."
                    checked={form.digest}
                    onCheckedChange={(c) => update("digest", c)}
                  />
                </Column>
              )}

              <Row
                horizontal="between"
                vertical="center"
                gap="12"
                wrap
                paddingTop="16"
                borderTop
              >
                <Button
                  type="button"
                  variant="tertiary"
                  prefixIcon="arrowLeft"
                  onClick={handleBack}
                  disabled={step === 0}
                >
                  Back
                </Button>
                <Row gap="8" vertical="center">
                  {step === 2 && (
                    <Button type="button" variant="ghost" onClick={handleSkip}>
                      Skip for now
                    </Button>
                  )}
                  <Button
                    type="submit"
                    suffixIcon={isLast ? "check" : "arrowRight"}
                    loading={submitting}
                  >
                    {isLast ? "Finish setup" : "Next"}
                  </Button>
                </Row>
              </Row>
            </Column>
          </Column>

          <Column
            as="aside"
            aria-label="Summary of your setup"
            background="surface"
            border
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="20"
          >
            <Row horizontal="between" vertical="center" gap="8">
              <Text as="h2" textVariant="heading-strong-m">
                Your setup
              </Text>
              <Tag
                size="s"
                tone="neutral"
                label={step + 1 + "/" + steps.length}
              />
            </Row>
            <Column gap="16" aria-live="polite">
              <SummaryRow icon="person" label="Name" value={form.name.trim()} />
              <SummaryRow
                icon="mail"
                label="Work email"
                value={form.email.trim()}
              />
              <SummaryRow
                icon="organization"
                label="Workspace"
                value={form.workspace.trim()}
              />
              <SummaryRow icon="people" label="Team size" value={teamLabel} />
              <SummaryRow
                icon="send"
                label="Invites"
                value={
                  filledInvites.length > 0
                    ? filledInvites.join(", ")
                    : step > 2
                      ? "Skipped"
                      : ""
                }
              />
              <SummaryRow
                icon="sparkle"
                label="Theme"
                value={step >= 3 ? themeLabel : ""}
              />
              <SummaryRow
                icon="bell"
                label="Weekly digest"
                value={step >= 3 ? (form.digest ? "On" : "Off") : ""}
              />
            </Column>
            <Row gap="8" vertical="start" paddingTop="16" borderTop>
              <Icon name="info" size="s" onBackground="neutral-weak" />
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                {product.tagline}. Nothing is saved until you finish.
              </Text>
            </Row>
          </Column>
        </Grid>
      </Column>
    </Column>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Onboarding } from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account, workspace, team and preferences.",
};

export default function Page() {
  return <Onboarding />;
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import { Welcome } from "@/components/Welcome";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function WelcomePage() {
  return <Welcome />;
}
```

```tsx components/Welcome.tsx
"use client";

import {
  Button,
  Column,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import { nextSteps, product, user } from "@/lib/data";

export function Welcome() {
  const firstName = user.name.split(" ")[0];
  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="16"
      paddingY="64"
      s={{ paddingY: "32" }}
    >
      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="16" horizontal="start">
          <Row
            fit
            center
            radius="full"
            background="success-medium"
            border="success-alpha-medium"
            style={{ width: 56, height: 56 }}
          >
            <Icon name="check" size="l" onBackground="success-strong" />
          </Row>
          <Tag
            tone="success"
            size="m"
            label="Setup complete"
            prefixIcon="check"
          />
          <Heading as="h1" textVariant="display-strong-s">
            You&apos;re all set, {firstName}
          </Heading>
          <Text textVariant="body-default-l" onBackground="neutral-weak">
            Your {product.name} workspace is ready. Four quick steps will get
            your team seeing real data today.
          </Text>
        </Column>

        <Column
          as="section"
          aria-labelledby="next-steps"
          background="surface"
          border
          radius="l"
          padding="32"
          s={{ padding: "20" }}
          gap="24"
        >
          <Heading as="h2" id="next-steps" textVariant="heading-strong-l">
            Next steps
          </Heading>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            {nextSteps.map((item, i) => (
              <li key={item.title}>
                <Row gap="16" vertical="start">
                  <Row
                    fit
                    center
                    radius="m"
                    background="neutral-medium"
                    border="neutral-alpha-weak"
                    style={{ width: 40, height: 40, flexShrink: 0 }}
                  >
                    <Icon
                      name={item.icon}
                      size="s"
                      onBackground="neutral-strong"
                    />
                  </Row>
                  <Column gap="4" flex={1}>
                    <Text textVariant="heading-strong-s">
                      {i + 1}. {item.title}
                    </Text>
                    <Text
                      textVariant="body-default-s"
                      onBackground="neutral-weak"
                    >
                      {item.description}
                    </Text>
                  </Column>
                </Row>
              </li>
            ))}
          </ol>
        </Column>

        <Row gap="12" wrap vertical="center">
          <Button href="/" suffixIcon="arrowRight">
            Open dashboard
          </Button>
          <Button href="/" variant="tertiary">
            Restart onboarding
          </Button>
        </Row>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          Signed in as {user.email} ({user.role})
        </Text>
      </Column>
    </Column>
  );
}
```
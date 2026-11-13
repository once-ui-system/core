"use client";

import { useRef, useState } from "react";
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
import type { Theme } from "@once-ui-system/core";
import {
  placeholders,
  product,
  steps,
  teamSizes,
  themeOptions,
  user,
} from "@/lib/data";

type FormState = {
  name: string;
  email: string;
  workspace: string;
  teamSize: string;
  invites: string[];
  theme: Theme;
  digest: boolean;
};

type Errors = Partial<Record<string, string>>;

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
        errors[`invite${i}`] = "Enter a valid email address or leave it blank.";
      } else if (value === own) {
        errors[`invite${i}`] = "That's your own email. Invite a teammate instead.";
      } else if (seen.has(value)) {
        errors[`invite${i}`] = "This email is already in the list.";
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
  icon: "person" | "mail" | "organization" | "people" | "sparkle" | "bell";
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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const updateInvite = (index: number, value: string) => {
    setForm((prev) => {
      const invites = [...prev.invites];
      invites[index] = value;
      return { ...prev, invites };
    });
    setErrors((prev) => {
      if (!prev[`invite${index}`]) return prev;
      const next = { ...prev };
      delete next[`invite${index}`];
      return next;
    });
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
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="32" s={{ paddingY: "24" }}>
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
          <Row
            as="ol"
            fillWidth
            gap="8"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
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
                      background={done ? "brand-strong" : active ? "brand-medium" : "neutral-weak"}
                      border={active ? "brand-alpha-strong" : "neutral-alpha-weak"}
                      style={{ width: 24, height: 24, flexShrink: 0 }}
                    >
                      {done ? (
                        <Icon name="check" size="xs" onBackground="brand-strong" decorative />
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
                    {done && (
                      <Text
                        textVariant="label-default-xs"
                        onBackground="neutral-weak"
                        s={{ hide: true }}
                      >
                        Done
                      </Text>
                    )}
                  </Row>
                </Column>
              );
            })}
          </Row>
        </nav>

        <Grid
          columns="2"
          gap="24"
          s={{ columns: 1 }}
          style={{ gridTemplateColumns: undefined }}
          className="onboarding-grid"
        >
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
                <Heading as="h1" id="step-heading" variant="display-strong-xs">
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
              noValidate
              onSubmit={(e: React.FormEvent) => {
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
                    description={`For example ${placeholders.email}`}
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
                    description={`For example ${placeholders.workspace}`}
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
                      id={`invite${i}`}
                      label={`Teammate ${i + 1} email (optional)`}
                      type="email"
                      autoComplete="off"
                      value={value}
                      onValueChange={(v) => updateInvite(i, v)}
                      error={Boolean(errors[`invite${i}`])}
                      errorMessage={errors[`invite${i}`]}
                    />
                  ))}
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    Teammates join as members. You stay the {user.role.toLowerCase()} of the workspace.
                  </Text>
                </Column>
              )}

              {step === 3 && (
                <Column gap="24">
                  <Column gap="8" as="fieldset" style={{ border: 0, margin: 0, padding: 0 }}>
                    <Text as="legend" textVariant="label-default-s">
                      Theme
                    </Text>
                    <SegmentedControl
                      semantics="radio"
                      buttons={themeOptions.map((t) => ({
                        value: t.value,
                        label: t.label,
                        prefixIcon: t.prefixIcon,
                      }))}
                      value={form.theme}
                      onValueChange={(v) => update("theme", v as Theme)}
                    />
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
                paddingTop="8"
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
            style={{ alignSelf: "start" }}
          >
            <Row horizontal="between" vertical="center" gap="8">
              <Text as="h2" textVariant="heading-strong-m">
                Your setup
              </Text>
              <Tag size="s" tone="neutral" label={`${step + 1}/${steps.length}`} />
            </Row>
            <Column gap="16" aria-live="polite">
              <SummaryRow icon="person" label="Name" value={form.name.trim()} />
              <SummaryRow icon="mail" label="Work email" value={form.email.trim()} />
              <SummaryRow icon="organization" label="Workspace" value={form.workspace.trim()} />
              <SummaryRow icon="people" label="Team size" value={teamLabel} />
              <SummaryRow
                icon="mail"
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
      <style>{`
        .onboarding-grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: start; }
        @media (max-width: 768px) { .onboarding-grid { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </Column>
  );
}

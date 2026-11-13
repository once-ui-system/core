"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  useTheme,
  VisuallyHidden,
} from "@once-ui-system/core";
import {
  type OnboardingData,
  type ThemeChoice,
  STORAGE_KEY,
  demoUser,
  initialOnboarding,
  product,
  steps,
  teamSizes,
  themeOptions,
} from "@/lib/data";

type Errors = Partial<Record<"name" | "email" | "workspace" | "teamSize" | "invites0" | "invites1" | "invites2", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!EMAIL_RE.test(data.email.trim())) errors.email = "Enter a valid email, like name@company.com.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2) errors.workspace = "Name your workspace (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Choose your team size.";
  }
  if (step === 2) {
    const seen = new Set<string>([data.email.trim().toLowerCase()]);
    data.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      const key = `invites${i}` as keyof Errors;
      if (!EMAIL_RE.test(value)) errors[key] = "Enter a valid email address.";
      else if (seen.has(value)) errors[key] = "This email is already used.";
      else seen.add(value);
    });
  }
  return errors;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <Column gap="4">
      <Text variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text
        variant="body-default-m"
        onBackground={empty ? "neutral-weak" : "neutral-strong"}
        style={{ overflowWrap: "anywhere" }}
      >
        {empty ? "Not set yet" : value}
      </Text>
    </Column>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboarding);
  const [errors, setErrors] = useState<Errors>({});
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Move focus to the step heading after navigating, so keyboard and screen-reader users land on the new step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof Errors];
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
      const key = `invites${index}` as keyof Errors;
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const chooseTheme = (value: string) => {
    const theme = value as ThemeChoice;
    update("theme", theme);
    setTheme(theme);
  };

  const goNext = () => {
    const found = validate(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    if (isLast) {
      setFinishing(true);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage can be unavailable (private mode); the welcome page falls back to defaults.
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

  const skipInvites = () => {
    setData((prev) => ({ ...prev, invites: ["", "", ""] }));
    setErrors({});
    setStep((s) => s + 1);
  };

  const filledInvites = data.invites.map((v) => v.trim()).filter(Boolean);
  const teamLabel = teamSizes.find((t) => t.value === data.teamSize)?.label ?? "";
  const themeLabel = themeOptions.find((t) => t.value === data.theme)?.label ?? "";
  const errorCount = Object.keys(errors).length;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="32" s={{ paddingY: "24" }}>
      <Column maxWidth={72} fillWidth gap="32">
        <Row horizontal="between" vertical="center" gap="16" wrap>
          <Row gap="12" vertical="center">
            <Row
              width="40"
              height="40"
              radius="m"
              background="brand-medium"
              center
              aria-hidden="true"
            >
              <Icon name="sparkle" onBackground="brand-strong" />
            </Row>
            <Column>
              <Text variant="heading-strong-l">{product.name}</Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Setting up for {demoUser.name}'s team
              </Text>
            </Column>
          </Row>
          <Text variant="label-default-s" onBackground="neutral-weak">
            About 2 minutes
          </Text>
        </Row>

        <nav aria-label="Onboarding progress">
          <Row
            as="ol"
            fillWidth
            gap="8"
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
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
                    height="4"
                    radius="full"
                    background={done || active ? "brand-strong" : "neutral-alpha-medium"}
                    style={{ opacity: active || done ? 1 : 0.8 }}
                  />
                  <Row gap="8" vertical="center">
                    <Row
                      width="24"
                      height="24"
                      radius="full"
                      center
                      background={done ? "brand-strong" : active ? "brand-alpha-medium" : "neutral-alpha-weak"}
                      border={active ? "brand-alpha-strong" : "transparent"}
                      style={{ flexShrink: 0 }}
                    >
                      {done ? (
                        <Icon name="check" size="xs" onSolid="brand-strong" />
                      ) : (
                        <Text variant="label-strong-xs" onBackground={active ? "brand-strong" : "neutral-weak"}>
                          {i + 1}
                        </Text>
                      )}
                    </Row>
                    <Text
                      variant={active ? "label-strong-s" : "label-default-s"}
                      onBackground={active ? "neutral-strong" : "neutral-weak"}
                      s={{ hide: !active }}
                    >
                      {s.label}
                    </Text>
                    <VisuallyHidden>
                      {done ? " (completed)" : active ? " (current step)" : " (not started)"}
                    </VisuallyHidden>
                  </Row>
                </Column>
              );
            })}
          </Row>
          <VisuallyHidden as="p" aria-live="polite">
            Step {step + 1} of {steps.length}: {current.label}
          </VisuallyHidden>
        </nav>

        <Row gap="24" s={{ direction: "column" }} vertical="start" fillWidth>
          <Column
            as="section"
            aria-labelledby="step-title"
            flex={3}
            fillWidth
            background="surface"
            border
            radius="l"
            padding="32"
            gap="24"
            s={{ padding: "20" }}
          >
            <Column gap="8">
              <Text variant="label-default-s" onBackground="brand-medium">
                Step {step + 1} of {steps.length}
              </Text>
              <Heading
                as="h1"
                id="step-title"
                variant="display-strong-xs"
                ref={headingRef}
                tabIndex={-1}
                style={{ outline: "none" }}
              >
                {current.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {current.description}
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
                vertical="center"
              >
                <Icon name="warning" onBackground="danger-strong" />
                <Text variant="body-default-s" onBackground="danger-strong">
                  {errorCount === 1 ? "Fix the highlighted field to continue." : "Fix the highlighted fields to continue."}
                </Text>
              </Row>
            )}

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
                      onChange={(e) => update("name", e.target.value)}
                      error={Boolean(errors.name)}
                      errorMessage={errors.name}
                      aria-required="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      label="Work email"
                      autoComplete="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      error={Boolean(errors.email)}
                      errorMessage={errors.email}
                      description="Use the address your team knows you by."
                      aria-required="true"
                    />
                  </Column>
                )}

                {step === 1 && (
                  <Column gap="24">
                    <Input
                      id="workspace"
                      label="Workspace name"
                      autoComplete="organization"
                      value={data.workspace}
                      onChange={(e) => update("workspace", e.target.value)}
                      error={Boolean(errors.workspace)}
                      errorMessage={errors.workspace}
                      aria-required="true"
                    />
                    <Column as="fieldset" gap="12" margin="0" padding="0" border="transparent">
                      <Text as="legend" variant="label-default-m" padding="0">
                        Team size
                      </Text>
                      <SegmentedControl
                        fillWidth
                        semantics="radio"
                        value={data.teamSize}
                        onChange={(v) => update("teamSize", v)}
                        buttons={teamSizes.map((t) => ({ value: t.value, label: t.label }))}
                      />
                      {errors.teamSize && (
                        <Text role="alert" variant="body-default-s" onBackground="danger-strong">
                          {errors.teamSize}
                        </Text>
                      )}
                    </Column>
                  </Column>
                )}

                {step === 2 && (
                  <Column gap="16">
                    {data.invites.map((value, i) => (
                      <Input
                        key={`invite-${i}`}
                        id={`invite-${i}`}
                        type="email"
                        label={`Teammate ${i + 1} email`}
                        autoComplete="off"
                        value={value}
                        onChange={(e) => updateInvite(i, e.target.value)}
                        error={Boolean(errors[`invites${i}` as keyof Errors])}
                        errorMessage={errors[`invites${i}` as keyof Errors]}
                      />
                    ))}
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      Invitees join as members. You can change roles from Settings later.
                    </Text>
                  </Column>
                )}

                {step === 3 && (
                  <Column gap="24">
                    <Column as="fieldset" gap="12" margin="0" padding="0" border="transparent">
                      <Text as="legend" variant="label-default-m" padding="0">
                        Theme
                      </Text>
                      <SegmentedControl
                        fillWidth
                        semantics="radio"
                        value={data.theme}
                        onChange={chooseTheme}
                        buttons={themeOptions.map((t) => ({ value: t.value, label: t.label }))}
                      />
                    </Column>
                    <Switch
                      label="Weekly digest"
                      description="A Monday email with new issues, top events and what your team shipped."
                      checked={data.digest}
                      onToggle={(checked) => update("digest", checked)}
                    />
                  </Column>
                )}

                <Row gap="12" horizontal="between" vertical="center" wrap>
                  <Button
                    type="button"
                    variant="secondary"
                    label="Back"
                    prefixIcon="arrowLeft"
                    onClick={goBack}
                    disabled={step === 0 || finishing}
                  />
                  <Row gap="8" vertical="center" wrap>
                    {step === 2 && (
                      <Button type="button" variant="tertiary" label="Skip for now" onClick={skipInvites} />
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

          <Column
            as="aside"
            aria-labelledby="summary-title"
            flex={2}
            fillWidth
            background="surface"
            border
            radius="l"
            padding="24"
            gap="20"
          >
            <Column gap="4">
              <Heading as="h2" id="summary-title" variant="heading-strong-m">
                Your setup so far
              </Heading>
              <Text variant="body-default-s" onBackground="neutral-weak">
                Updates as you fill in each step.
              </Text>
            </Column>
            <Column gap="16" aria-live="polite">
              <SummaryRow label="Name" value={data.name.trim()} />
              <SummaryRow label="Work email" value={data.email.trim()} />
              <SummaryRow label="Workspace" value={data.workspace.trim()} />
              <SummaryRow label="Team size" value={teamLabel} />
              <SummaryRow
                label="Invites"
                value={filledInvites.length ? filledInvites.join(", ") : ""}
              />
              <SummaryRow label="Theme" value={step >= 3 ? themeLabel : ""} />
              <SummaryRow
                label="Weekly digest"
                value={step >= 3 ? (data.digest ? "On" : "Off") : ""}
              />
            </Column>
          </Column>
        </Row>
      </Column>
    </Column>
  );
}

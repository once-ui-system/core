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
  steps,
  teamSizes,
  themeOptions,
  validateStep,
  type OnboardingData,
  type StepErrors,
  type ThemeChoice,
} from "@/lib/data";
import { product } from "@/lib/data";

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
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
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

      <Column as="dl" gap="16" margin="0">
        <Text as="dt" variant="label-strong-xs" onBackground="brand-medium">
          ACCOUNT
        </Text>
        <SummaryRow label="Name" value={data.name.trim()} />
        <SummaryRow label="Work email" value={data.email.trim()} />
      </Column>

      <Column as="dl" gap="16" margin="0" borderTop paddingTop="16">
        <Text as="dt" variant="label-strong-xs" onBackground="brand-medium">
          WORKSPACE
        </Text>
        <SummaryRow label="Name" value={data.workspace.trim()} />
        <SummaryRow label="Team size" value={sizeLabel} />
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

      <Column as="dl" gap="16" margin="0" borderTop paddingTop="16">
        <Text as="dt" variant="label-strong-xs" onBackground="brand-medium">
          PREFERENCES
        </Text>
        <SummaryRow label="Theme" value={themeLabel} />
        <SummaryRow label="Weekly digest" value={data.digest ? "On, every Monday" : "Off"} />
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

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  };

  const updateInvite = (index: number, value: string) => {
    setData((d) => ({ ...d, invites: d.invites.map((v, i) => (i === index ? value : v)) }));
    const k = `invite${index}`;
    if (errors[k]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[k];
        return next;
      });
    }
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
      const el = document.getElementById(`field-${first}`);
      el?.focus();
    });
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

  const errorCount = Object.keys(errors).length;
  const isLast = step === steps.length - 1;

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="32" s={{ paddingY: "24" }}>
      <Column maxWidth="l" fillWidth gap="32">
        <Row gap="12" vertical="center">
          <Row center width="40" height="40" radius="m" background="brand-strong" onBackground="brand-strong">
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

        <Row gap="32" fillWidth vertical="start" s={{ direction: "column" }} m={{ gap: "24" }}>
          <Column
            as="section"
            aria-labelledby="step-heading"
            flex={3}
            minWidth={0}
            fillWidth
            background="surface"
            border
            radius="l"
            padding="32"
            s={{ padding: "20" }}
            gap="24"
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
                    <Column gap="8">
                      <Select
                        id="field-teamSize"
                        label="Team size"
                        value={data.teamSize}
                        options={teamSizes.map((t) => ({ value: t.value, label: t.label }))}
                        onSelect={(v) => update("teamSize", (Array.isArray(v) ? v[0] : v) as OnboardingData["teamSize"])}
                        error={Boolean(errors.teamSize)}
                        errorMessage={errors.teamSize}
                      />
                    </Column>
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
                    <Column gap="8" as="div" role="group" aria-labelledby="theme-label">
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
                        isChecked={undefined}
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

          <Column flex={2} minWidth={0} fillWidth s={{ flex: undefined }}>
            <Summary data={data} step={step} />
          </Column>
        </Row>
      </Column>
    </Column>
  );
}

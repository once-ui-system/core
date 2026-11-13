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

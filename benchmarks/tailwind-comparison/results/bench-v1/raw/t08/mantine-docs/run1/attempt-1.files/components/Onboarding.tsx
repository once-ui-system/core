"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Select,
  SegmentedControl,
  Stack,
  Stepper,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCheck } from "@tabler/icons-react";
import {
  Errors,
  OnboardingData,
  STORAGE_KEY,
  ThemeChoice,
  initialData,
  product,
  steps,
  teamSizes,
  themeOptions,
  user,
  validateStep,
} from "@/lib/data";
import { SummaryCard } from "./SummaryCard";

const stepTitles = [
  "Tell us about you",
  "Set up your workspace",
  "Invite your teammates",
  "Choose your preferences",
];

const stepHints = [
  "We'll use this to create your Lumen account.",
  "A workspace holds your projects, events and issues.",
  "Add up to three teammates now. You can skip this and invite people later.",
  "Tune how Lumen looks and how often it emails you.",
];

const invitePlaceholders = ["sam@acmelabs.io", "priya@acmelabs.io", "leo@acmelabs.io"];

export function Onboarding() {
  const router = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const [active, setActive] = useState(0);
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
  }, [active]);

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const clearError = (key: string) =>
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const setInvite = (i: number, value: string) => {
    setData((d) => {
      const invites: OnboardingData["invites"] = [...d.invites];
      invites[i] = value;
      return { ...d, invites };
    });
    clearError(`invite${i}`);
  };

  const next = () => {
    const found = validateStep(active, data);
    const hasErrors = Object.values(found).some(Boolean);
    setErrors(found);
    if (hasErrors) return;
    if (active < steps.length - 1) {
      setActive(active + 1);
      return;
    }
    setSubmitting(true);
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: data.name.trim(), workspace: data.workspace.trim() })
      );
    } catch {
      // storage unavailable; the welcome page falls back to defaults
    }
    router.push("/welcome");
  };

  const back = () => {
    setErrors({});
    setActive((a) => Math.max(0, a - 1));
  };

  const skipInvites = () => {
    setErrors({});
    setData((d) => ({ ...d, invites: ["", "", ""] }));
    setActive(3);
  };

  const isLast = active === steps.length - 1;

  return (
    <Container size="lg" py={{ base: "lg", sm: "xl" }}>
      <Stack gap="xl">
        <Box component="header">
          <Text size="sm" fw={700} c="blue" tt="uppercase" style={{ letterSpacing: 1 }}>
            {product.name}
          </Text>
          <Title order={1} size="h2" mt={4}>
            Welcome to Lumen
          </Title>
          <Text c="dimmed" mt={4} maw={560}>
            Product analytics and issue tracking for small software teams. Four quick steps and
            you&apos;re in.
          </Text>
        </Box>

        <Stepper
          active={active}
          size="sm"
          allowNextStepsSelect={false}
          onStepClick={(i) => {
            setErrors({});
            setActive(i);
          }}
          aria-label="Onboarding progress"
          styles={{ steps: { flexWrap: "wrap", rowGap: 12 } }}
        >
          {steps.map((s) => (
            <Stepper.Step key={s.label} label={s.label} description={s.description} />
          ))}
        </Stepper>

        <Grid gap="lg">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card
              withBorder
              radius="md"
              padding="lg"
              component="form"
              noValidate
              aria-labelledby="step-title"
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                next();
              }}
            >
              <Text size="sm" c="dimmed">
                Step {active + 1} of {steps.length}
              </Text>
              <Title
                order={2}
                size="h3"
                id="step-title"
                ref={headingRef}
                tabIndex={-1}
                style={{ outline: "none" }}
              >
                {stepTitles[active]}
              </Title>
              <Text c="dimmed" size="sm" mt={4} mb="lg">
                {stepHints[active]}
              </Text>

              <Stack gap="md">
                {active === 0 && (
                  <>
                    <TextInput
                      label="Full name"
                      placeholder={user.name}
                      autoComplete="name"
                      withAsterisk
                      value={data.name}
                      error={errors.name}
                      onChange={(e) => {
                        update("name", e.currentTarget.value);
                        clearError("name");
                      }}
                    />
                    <TextInput
                      label="Work email"
                      type="email"
                      placeholder={user.email}
                      autoComplete="email"
                      withAsterisk
                      description="Use the address your team knows you by."
                      value={data.email}
                      error={errors.email}
                      onChange={(e) => {
                        update("email", e.currentTarget.value);
                        clearError("email");
                      }}
                    />
                  </>
                )}

                {active === 1 && (
                  <>
                    <TextInput
                      label="Workspace name"
                      placeholder="Acme Labs"
                      withAsterisk
                      value={data.workspace}
                      error={errors.workspace}
                      onChange={(e) => {
                        update("workspace", e.currentTarget.value);
                        clearError("workspace");
                      }}
                    />
                    <Select
                      label="Team size"
                      placeholder="Select team size"
                      withAsterisk
                      data={teamSizes}
                      allowDeselect={false}
                      value={data.teamSize}
                      error={errors.teamSize}
                      onChange={(v) => {
                        update("teamSize", v);
                        clearError("teamSize");
                      }}
                    />
                  </>
                )}

                {active === 2 &&
                  data.invites.map((value, i) => (
                    <TextInput
                      key={i}
                      label={`Teammate ${i + 1} email`}
                      type="email"
                      placeholder={invitePlaceholders[i]}
                      autoComplete="off"
                      value={value}
                      error={errors[`invite${i}`]}
                      onChange={(e) => setInvite(i, e.currentTarget.value)}
                    />
                  ))}

                {active === 3 && (
                  <>
                    <Box role="group" aria-labelledby="theme-label">
                      <Text size="sm" fw={500} id="theme-label" mb={4}>
                        Theme
                      </Text>
                      <SegmentedControl
                        fullWidth
                        data={themeOptions}
                        value={data.theme}
                        onChange={(v) => {
                          const choice = v as ThemeChoice;
                          update("theme", choice);
                          setColorScheme(choice);
                        }}
                      />
                    </Box>
                    <Switch
                      label="Send me the weekly digest"
                      description="A Monday summary of new issues, top events and what shipped."
                      checked={data.digest}
                      onChange={(e) => update("digest", e.currentTarget.checked)}
                    />
                  </>
                )}
              </Stack>

              <Group justify="space-between" mt="xl" wrap="wrap">
                <Button
                  variant="default"
                  type="button"
                  onClick={back}
                  disabled={active === 0 || submitting}
                  leftSection={<IconArrowLeft size={16} aria-hidden="true" />}
                >
                  Back
                </Button>
                <Group gap="sm">
                  {active === 2 && (
                    <Button variant="subtle" type="button" onClick={skipInvites}>
                      Skip for now
                    </Button>
                  )}
                  <Button
                    type="submit"
                    loading={submitting}
                    rightSection={
                      isLast ? (
                        <IconCheck size={16} aria-hidden="true" />
                      ) : (
                        <IconArrowRight size={16} aria-hidden="true" />
                      )
                    }
                  >
                    {isLast ? "Finish setup" : "Next"}
                  </Button>
                </Group>
              </Group>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <SummaryCard data={data} step={active} />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}

Now I'll write the files. The theme preference will apply live via `useMantineColorScheme` when chosen.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ThemeChoice = "light" | "dark" | "auto";

export interface OnboardingData {
  name: string;
  email: string;
  workspace: string;
  teamSize: string | null;
  invites: [string, string, string];
  theme: ThemeChoice;
  digest: boolean;
}

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: null,
  invites: ["", "", ""],
  theme: "auto",
  digest: true,
};

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51+ people" },
];

export const steps = [
  { label: "Account", description: "About you" },
  { label: "Workspace", description: "Your team" },
  { label: "Invite", description: "Add teammates" },
  { label: "Preferences", description: "Make it yours" },
] as const;

export const themeOptions: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "System" },
];

export const checklist = [
  {
    title: "Install the Lumen snippet",
    text: "Paste the tracking snippet into your app to start collecting product events.",
  },
  {
    title: "Create your first project",
    text: "Group events and issues by product, for example “Web app” or “Mobile”.",
  },
  {
    title: "Log an issue from a session",
    text: "Spot a problem in a user session and turn it into a tracked issue in one click.",
  },
  {
    title: "Connect your repository",
    text: "Link GitHub so issues close automatically when a fix is merged.",
  },
];

export const STORAGE_KEY = "lumen-onboarding";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export type Errors = Record<string, string | undefined>;

export function validateStep(step: number, data: OnboardingData): Errors {
  const errors: Errors = {};
  if (step === 0) {
    if (data.name.trim().length < 2) errors.name = "Enter your full name (at least 2 characters).";
    if (!data.email.trim()) errors.email = "Enter your work email.";
    else if (!isEmail(data.email)) errors.email = "Enter a valid email address, like maya@acmelabs.io.";
  }
  if (step === 1) {
    if (data.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!data.teamSize) errors.teamSize = "Select your team size.";
  }
  if (step === 2) {
    const seen = new Set<string>();
    data.invites.forEach((raw, i) => {
      const v = raw.trim().toLowerCase();
      if (!v) return;
      if (!isEmail(v)) errors[`invite${i}`] = "Enter a valid email address.";
      else if (v === data.email.trim().toLowerCase())
        errors[`invite${i}`] = "That's your own email. Invite a teammate instead.";
      else if (seen.has(v)) errors[`invite${i}`] = "This email is already in the list.";
      else seen.add(v);
    });
  }
  return errors;
}
```

```tsx components/SummaryCard.tsx
import { Badge, Card, Divider, Group, List, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { OnboardingData, teamSizes, themeOptions } from "@/lib/data";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <Group justify="space-between" wrap="nowrap" align="flex-start" gap="md">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      {value ? (
        <Text size="sm" fw={500} ta="right" style={{ wordBreak: "break-word" }}>
          {value}
        </Text>
      ) : (
        <Text size="sm" c="dimmed" fs="italic" ta="right">
          Not set yet
        </Text>
      )}
    </Group>
  );
}

export function SummaryCard({ data, step }: { data: OnboardingData; step: number }) {
  const invites = data.invites.map((e) => e.trim()).filter(Boolean);
  const size = teamSizes.find((t) => t.value === data.teamSize)?.label ?? null;
  const theme = themeOptions.find((t) => t.value === data.theme)?.label ?? null;

  return (
    <Card withBorder radius="md" padding="lg" component="aside" aria-labelledby="summary-title">
      <Group justify="space-between" mb="md">
        <Title order={2} size="h4" id="summary-title">
          Your setup
        </Title>
        <Badge variant="light" size="sm">
          Step {step + 1} of 4
        </Badge>
      </Group>

      <Stack gap="sm">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Account
        </Text>
        <Row label="Name" value={data.name.trim() || null} />
        <Row label="Email" value={data.email.trim() || null} />

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Workspace
        </Text>
        <Row label="Name" value={data.workspace.trim() || null} />
        <Row label="Team size" value={size} />

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Invites
        </Text>
        {invites.length > 0 ? (
          <List
            size="sm"
            spacing={4}
            icon={
              <ThemeIcon size={16} radius="xl" variant="light">
                <IconCheck size={11} aria-hidden="true" />
              </ThemeIcon>
            }
          >
            {invites.map((e, i) => (
              <List.Item key={`${e}-${i}`} style={{ wordBreak: "break-word" }}>
                {e}
              </List.Item>
            ))}
          </List>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            {step >= 3 ? "No teammates invited" : "Not set yet"}
          </Text>
        )}

        <Divider my="xs" />
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Preferences
        </Text>
        <Row label="Theme" value={theme} />
        <Row label="Weekly digest" value={data.digest ? "On" : "Off"} />
      </Stack>
    </Card>
  );
}
```

```tsx components/Onboarding.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Select,
  SegmentedControl,
  SimpleGrid,
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
      const invites = [...d.invites] as OnboardingData["invites"];
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
            you're in.
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
          styles={{
            steps: { flexWrap: "wrap", rowGap: 12 },
          }}
        >
          {steps.map((s) => (
            <Stepper.Step key={s.label} label={s.label} description={s.description} />
          ))}
        </Stepper>

        <SimpleGrid cols={{ base: 1, md: 5 }} spacing="lg">
          <Box style={{ gridColumn: undefined }} className="wizard-main">
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
              <Text size="sm" c="dimmed" id="step-progress">
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

              <Stack gap="md" aria-live="polite">
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
                      placeholder={["sam@acmelabs.io", "priya@acmelabs.io", "leo@acmelabs.io"][i]}
                      autoComplete="off"
                      value={value}
                      error={errors[`invite${i}`]}
                      onChange={(e) => setInvite(i, e.currentTarget.value)}
                    />
                  ))}

                {active === 3 && (
                  <>
                    <Box>
                      <Text component="label" size="sm" fw={500} id="theme-label" display="block" mb={4}>
                        Theme
                      </Text>
                      <SegmentedControl
                        fullWidth
                        aria-labelledby="theme-label"
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
          </Box>

          <Box className="wizard-summary">
            <SummaryCard data={data} step={active} />
          </Box>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
```

The `SimpleGrid` with `md: 5` columns would put each child in one column; I'll rewrite the layout with a proper 3/2 split using `Grid` instead.

```tsx components/Onboarding.tsx
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

        <Grid gutter="lg">
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
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Onboarding } from "@/components/Onboarding";

export const metadata: Metadata = {
  title: "Get started · Lumen",
  description: "Set up your Lumen account and workspace in four quick steps.",
};

export default function Page() {
  return (
    <main>
      <Onboarding />
    </main>
  );
}
```

```tsx components/WelcomeContent.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  List,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconCheck, IconCircleDashed } from "@tabler/icons-react";
import { STORAGE_KEY, checklist, user } from "@/lib/data";

interface Saved {
  name?: string;
  workspace?: string;
}

export function WelcomeContent() {
  const [saved, setSaved] = useState<Saved>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      // ignore unreadable storage
    }
  }, []);

  const firstName = (saved.name || user.name).split(" ")[0];
  const workspace = saved.workspace || "your workspace";

  return (
    <Container size="sm" py={{ base: "xl", sm: 60 }}>
      <Stack gap="xl">
        <Stack gap="xs" align="flex-start">
          <ThemeIcon size={48} radius="xl" color="green" variant="light">
            <IconCheck size={28} aria-hidden="true" />
          </ThemeIcon>
          <Badge variant="light" color="green">
            Setup complete
          </Badge>
          <Title order={1} size="h2">
            You&apos;re all set, {firstName}!
          </Title>
          <Text c="dimmed">
            {workspace === "your workspace" ? "Your workspace is" : `${workspace} is`} ready. Here
            are a few things to do next to get the most out of Lumen.
          </Text>
        </Stack>

        <Card withBorder radius="md" padding="lg" component="section" aria-labelledby="next-steps">
          <Title order={2} size="h4" id="next-steps" mb="md">
            Your next steps
          </Title>
          <List
            spacing="md"
            center={false}
            icon={
              <ThemeIcon size={24} radius="xl" variant="light">
                <IconCircleDashed size={16} aria-hidden="true" />
              </ThemeIcon>
            }
          >
            {checklist.map((item) => (
              <List.Item key={item.title}>
                <Box>
                  <Text fw={600}>{item.title}</Text>
                  <Text size="sm" c="dimmed">
                    {item.text}
                  </Text>
                </Box>
              </List.Item>
            ))}
          </List>
        </Card>

        <Group>
          <Button component={Link} href="/">
            Back to onboarding
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import { WelcomeContent } from "@/components/WelcomeContent";

export const metadata: Metadata = {
  title: "Welcome · Lumen",
  description: "Your Lumen workspace is ready. Here's what to do next.",
};

export default function WelcomePage() {
  return (
    <main>
      <WelcomeContent />
    </main>
  );
}
```
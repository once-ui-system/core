That was much more than I needed. I have enough to build the app with Chakra primitives, so here are the files.

```tsx lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
} as const;

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const wizardSteps = [
  { title: "Account", description: "About you" },
  { title: "Workspace", description: "Your team's home" },
  { title: "Invite", description: "Bring teammates" },
  { title: "Preferences", description: "Make it yours" },
] as const;

export const teamSizeOptions = [
  { value: "1-5", label: "1 to 5 people" },
  { value: "6-15", label: "6 to 15 people" },
  { value: "16-50", label: "16 to 50 people" },
  { value: "51+", label: "More than 50 people" },
] as const;

export type TeamSize = (typeof teamSizeOptions)[number]["value"];
export type ThemeChoice = "light" | "dark" | "system";

export const themeOptions: {
  value: ThemeChoice;
  label: string;
  description: string;
}[] = [
  { value: "light", label: "Light", description: "Bright and crisp" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
];

export const maxInvites = 3;

export const nextStepsChecklist = [
  {
    title: "Connect your first data source",
    description:
      "Install the Lumen snippet or connect your repository to start collecting events.",
  },
  {
    title: "Create your first project",
    description:
      "Projects group dashboards and issues, so start with the product you ship most often.",
  },
  {
    title: "Triage the sample issues",
    description:
      "We added three example issues so you can try labels, assignees and priorities.",
  },
  {
    title: "Build a weekly metrics dashboard",
    description:
      "Pin active users, error rate and open issues to one board for your Monday stand-up.",
  },
];
```

```tsx lib/wizard.ts
import { maxInvites, type TeamSize, type ThemeChoice } from "@/lib/data";

export interface WizardValues {
  name: string;
  email: string;
  workspace: string;
  teamSize: TeamSize | "";
  invites: string[];
  theme: ThemeChoice;
  digest: boolean;
}

export type WizardErrors = Record<string, string>;

export const initialValues: WizardValues = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: Array.from({ length: maxInvites }, () => ""),
  theme: "system",
  digest: true,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateStep(step: number, v: WizardValues): WizardErrors {
  const errors: WizardErrors = {};

  if (step === 0) {
    if (v.name.trim().length < 2) errors.name = "Enter your full name.";
    if (!v.email.trim()) errors.email = "Enter your work email.";
    else if (!emailPattern.test(v.email.trim()))
      errors.email = "Enter a valid email, like name@company.com.";
  }

  if (step === 1) {
    if (v.workspace.trim().length < 2)
      errors.workspace = "Give your workspace a name (at least 2 characters).";
    if (!v.teamSize) errors.teamSize = "Choose your team size.";
  }

  if (step === 2) {
    const seen = new Set<string>();
    seen.add(v.email.trim().toLowerCase());
    v.invites.forEach((raw, i) => {
      const value = raw.trim().toLowerCase();
      if (!value) return;
      if (!emailPattern.test(value))
        errors[`invite${i}`] = "Enter a valid email address.";
      else if (seen.has(value))
        errors[`invite${i}`] =
          value === v.email.trim().toLowerCase()
            ? "That's your own email."
            : "This email is already in the list.";
      else seen.add(value);
    });
  }

  return errors;
}
```

```tsx components/onboarding/step-indicator.tsx
"use client";

import { Box, Circle, Flex, List, Text } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import { wizardSteps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <Box as="nav" aria-label="Onboarding progress">
      <Text srOnly aria-live="polite">
        Step {current + 1} of {wizardSteps.length}: {wizardSteps[current].title}
      </Text>
      <List.Root as="ol" listStyle="none" m="0" p="0" display="flex" gap="0">
        {wizardSteps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <List.Item
              key={step.title}
              flex={i === wizardSteps.length - 1 ? "0 0 auto" : "1"}
              display="flex"
              alignItems="center"
              aria-current={active ? "step" : undefined}
              minW="0"
            >
              <Flex align="center" gap="3" minW="0">
                <Circle
                  size="8"
                  flexShrink={0}
                  borderWidth="2px"
                  borderColor={done || active ? "blue.solid" : "border"}
                  bg={done ? "blue.solid" : "transparent"}
                  color={done ? "white" : active ? "blue.fg" : "fg.muted"}
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {done ? <LuCheck aria-hidden /> : i + 1}
                </Circle>
                <Box display={{ base: "none", md: "block" }} minW="0">
                  <Text
                    textStyle="sm"
                    fontWeight="semibold"
                    color={active || done ? "fg" : "fg.muted"}
                    lineClamp={1}
                  >
                    {step.title}
                    <Text as="span" srOnly>
                      {done ? " (completed)" : active ? " (current)" : ""}
                    </Text>
                  </Text>
                  <Text textStyle="xs" color="fg.muted" lineClamp={1}>
                    {step.description}
                  </Text>
                </Box>
              </Flex>
              {i < wizardSteps.length - 1 && (
                <Box
                  aria-hidden
                  flex="1"
                  h="2px"
                  mx="3"
                  minW="3"
                  bg={done ? "blue.solid" : "border"}
                />
              )}
            </List.Item>
          );
        })}
      </List.Root>
    </Box>
  );
}
```

```tsx components/onboarding/summary-card.tsx
"use client";

import { Badge, Box, Card, DataList, Heading, Text } from "@chakra-ui/react";
import { teamSizeOptions, themeOptions } from "@/lib/data";
import type { WizardValues } from "@/lib/wizard";

function Value({ children }: { children?: string }) {
  return children ? (
    <Text wordBreak="break-word">{children}</Text>
  ) : (
    <Text color="fg.subtle" fontStyle="italic">
      Not entered yet
    </Text>
  );
}

export function SummaryCard({ values }: { values: WizardValues }) {
  const teamSize = teamSizeOptions.find((o) => o.value === values.teamSize);
  const theme = themeOptions.find((o) => o.value === values.theme);
  const invites = values.invites.map((e) => e.trim()).filter(Boolean);

  return (
    <Card.Root variant="subtle" as="aside" aria-labelledby="summary-heading">
      <Card.Header>
        <Heading as="h2" id="summary-heading" size="md">
          Your setup so far
        </Heading>
        <Text textStyle="sm" color="fg.muted">
          Updates as you type.
        </Text>
      </Card.Header>
      <Card.Body>
        <DataList.Root orientation="vertical" gap="4">
          <DataList.Item>
            <DataList.ItemLabel>Name</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.name.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Work email</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.email.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Workspace</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{values.workspace.trim()}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Team size</DataList.ItemLabel>
            <DataList.ItemValue>
              <Value>{teamSize?.label}</Value>
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Invites</DataList.ItemLabel>
            <DataList.ItemValue>
              {invites.length ? (
                <Box display="flex" flexDirection="column" gap="1">
                  {invites.map((e) => (
                    <Text key={e} wordBreak="break-word">
                      {e}
                    </Text>
                  ))}
                </Box>
              ) : (
                <Text color="fg.subtle" fontStyle="italic">
                  None yet
                </Text>
              )}
            </DataList.ItemValue>
          </DataList.Item>
          <DataList.Item>
            <DataList.ItemLabel>Preferences</DataList.ItemLabel>
            <DataList.ItemValue>
              <Box display="flex" gap="2" flexWrap="wrap">
                <Badge colorPalette="blue">{theme?.label} theme</Badge>
                <Badge colorPalette={values.digest ? "green" : "gray"}>
                  {values.digest ? "Weekly digest on" : "Weekly digest off"}
                </Badge>
              </Box>
            </DataList.ItemValue>
          </DataList.Item>
        </DataList.Root>
      </Card.Body>
    </Card.Root>
  );
}
```

```tsx components/onboarding/wizard.tsx
"use client";

import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Fieldset,
  Heading,
  Input,
  NativeSelect,
  RadioCard,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuCheck } from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import {
  maxInvites,
  product,
  teamSizeOptions,
  themeOptions,
  wizardSteps,
  type TeamSize,
  type ThemeChoice,
} from "@/lib/data";
import {
  initialValues,
  validateStep,
  type WizardErrors,
  type WizardValues,
} from "@/lib/wizard";
import { StepIndicator } from "./step-indicator";
import { SummaryCard } from "./summary-card";

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>(initialValues);
  const [errors, setErrors] = useState<WizardErrors>({});
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const isLast = step === wizardSteps.length - 1;

  function update<K extends keyof WizardValues>(key: K, value: WizardValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function updateInvite(index: number, value: string) {
    setValues((prev) => {
      const invites = [...prev.invites];
      invites[index] = value;
      return { ...prev, invites };
    });
    setErrors((prev) => {
      if (!Object.keys(prev).some((k) => k.startsWith("invite"))) return prev;
      const next: WizardErrors = {};
      for (const [k, v] of Object.entries(prev))
        if (!k.startsWith("invite")) next[k] = v;
      return next;
    });
  }

  function focusFirstError(errs: WizardErrors) {
    const first = Object.keys(errs)[0];
    if (!first) return;
    requestAnimationFrame(() => {
      document.getElementById(`field-${first}`)?.focus();
    });
  }

  function goNext() {
    const errs = validateStep(step, values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }
    if (isLast) {
      setFinishing(true);
      router.push("/welcome");
      return;
    }
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  function skipInvites() {
    setErrors({});
    setValues((prev) => ({ ...prev, invites: initialValues.invites }));
    setStep((s) => s + 1);
  }

  const stepInfo = wizardSteps[step];

  return (
    <Box maxW="6xl" mx="auto" px={{ base: "4", md: "8" }} py={{ base: "6", md: "12" }}>
      <Stack gap="2" mb={{ base: "6", md: "8" }}>
        <Text textStyle="sm" fontWeight="semibold" color="blue.fg">
          Welcome to {product.name}
        </Text>
        <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
          Let&apos;s set up your workspace
        </Heading>
        <Text color="fg.muted" maxW="2xl">
          Four quick steps and your team can start tracking product usage and
          issues in one place.
        </Text>
      </Stack>

      <Box mb={{ base: "6", md: "8" }}>
        <StepIndicator current={step} />
      </Box>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={{ base: "6", lg: "8" }}
        align="flex-start"
      >
        <Card.Root
          as="form"
          flex="1"
          w="full"
          minW="0"
          noValidate
          aria-labelledby="step-heading"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            goNext();
          }}
        >
          <Card.Header>
            <Text textStyle="xs" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              Step {step + 1} of {wizardSteps.length}
            </Text>
            <Heading
              as="h2"
              id="step-heading"
              size="xl"
              ref={headingRef}
              tabIndex={-1}
              outline="none"
            >
              {step === 0 && "Create your account"}
              {step === 1 && "Name your workspace"}
              {step === 2 && "Invite your teammates"}
              {step === 3 && "Choose your preferences"}
            </Heading>
            <Text color="fg.muted" textStyle="sm">
              {stepInfo.description}
              {step === 2 && ". You can add up to three people now and more later."}
            </Text>
          </Card.Header>

          <Card.Body>
            {step === 0 && (
              <Stack gap="5">
                <Field.Root required invalid={!!errors.name}>
                  <Field.Label>
                    Full name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    id="field-name"
                    name="name"
                    autoComplete="name"
                    placeholder="e.g. Maya Okafor"
                    value={values.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                  <Field.ErrorText>{errors.name}</Field.ErrorText>
                </Field.Root>
                <Field.Root required invalid={!!errors.email}>
                  <Field.Label>
                    Work email <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    id="field-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="e.g. maya@acmelabs.io"
                    value={values.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                  <Field.HelperText>
                    We&apos;ll send your sign-in link and billing receipts here.
                  </Field.HelperText>
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                </Field.Root>
              </Stack>
            )}

            {step === 1 && (
              <Stack gap="5">
                <Field.Root required invalid={!!errors.workspace}>
                  <Field.Label>
                    Workspace name <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    id="field-workspace"
                    name="workspace"
                    autoComplete="organization"
                    placeholder="e.g. Acme Labs"
                    value={values.workspace}
                    onChange={(e) => update("workspace", e.target.value)}
                  />
                  <Field.HelperText>
                    Usually your company or team name.
                  </Field.HelperText>
                  <Field.ErrorText>{errors.workspace}</Field.ErrorText>
                </Field.Root>
                <Field.Root required invalid={!!errors.teamSize}>
                  <Field.Label>
                    Team size <Field.RequiredIndicator />
                  </Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      id="field-teamSize"
                      name="teamSize"
                      value={values.teamSize}
                      onChange={(e) =>
                        update("teamSize", e.target.value as TeamSize | "")
                      }
                    >
                      <option value="">Select team size</option>
                      {teamSizeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.teamSize}</Field.ErrorText>
                </Field.Root>
              </Stack>
            )}

            {step === 2 && (
              <Stack gap="5">
                {Array.from({ length: maxInvites }, (_, i) => (
                  <Field.Root key={i} invalid={!!errors[`invite${i}`]}>
                    <Field.Label>
                      Teammate {i + 1}
                      <Field.RequiredIndicator
                        fallback={
                          <Text as="span" color="fg.muted" fontWeight="normal">
                            (optional)
                          </Text>
                        }
                      />
                    </Field.Label>
                    <Input
                      id={`field-invite${i}`}
                      name={`invite${i}`}
                      type="email"
                      autoComplete="off"
                      placeholder={
                        ["jonas@acmelabs.io", "priya@acmelabs.io", "tomas@acmelabs.io"][i]
                      }
                      value={values.invites[i] ?? ""}
                      onChange={(e) => updateInvite(i, e.target.value)}
                    />
                    <Field.ErrorText>{errors[`invite${i}`]}</Field.ErrorText>
                  </Field.Root>
                ))}
                <Text textStyle="sm" color="fg.muted">
                  Invitees join as Members. You&apos;re the Owner and can change
                  roles at any time.
                </Text>
              </Stack>
            )}

            {step === 3 && (
              <Stack gap="6">
                <Fieldset.Root>
                  <RadioCard.Root
                    value={values.theme}
                    onValueChange={(e) =>
                      e.value && update("theme", e.value as ThemeChoice)
                    }
                    orientation="vertical"
                    colorPalette="blue"
                  >
                    <RadioCard.Label>
                      <Text fontWeight="medium">Theme</Text>
                    </RadioCard.Label>
                    <Flex gap="3" direction={{ base: "column", sm: "row" }}>
                      {themeOptions.map((o) => (
                        <RadioCard.Item key={o.value} value={o.value} flex="1">
                          <RadioCard.ItemHiddenInput />
                          <RadioCard.ItemControl>
                            <RadioCard.ItemContent>
                              <RadioCard.ItemText>{o.label}</RadioCard.ItemText>
                              <RadioCard.ItemDescription>
                                {o.description}
                              </RadioCard.ItemDescription>
                            </RadioCard.ItemContent>
                            <RadioCard.ItemIndicator />
                          </RadioCard.ItemControl>
                        </RadioCard.Item>
                      ))}
                    </Flex>
                  </RadioCard.Root>
                </Fieldset.Root>

                <Switch
                  colorPalette="blue"
                  checked={values.digest}
                  onCheckedChange={(e) => update("digest", e.checked)}
                >
                  Send me a weekly digest of activity and open issues
                </Switch>
              </Stack>
            )}
          </Card.Body>

          <Card.Footer
            justifyContent="space-between"
            flexWrap="wrap"
            gap="3"
          >
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0}
            >
              <LuArrowLeft aria-hidden /> Back
            </Button>
            <Flex gap="3" wrap="wrap" justify="flex-end">
              {step === 2 && (
                <Button type="button" variant="ghost" onClick={skipInvites}>
                  Skip for now
                </Button>
              )}
              <Button
                type="submit"
                colorPalette="blue"
                loading={finishing}
                loadingText="Finishing"
              >
                {isLast ? (
                  <>
                    Finish <LuCheck aria-hidden />
                  </>
                ) : (
                  <>
                    Next <LuArrowRight aria-hidden />
                  </>
                )}
              </Button>
            </Flex>
          </Card.Footer>
        </Card.Root>

        <Box w={{ base: "full", lg: "sm" }} flexShrink={0}>
          <SummaryCard values={values} />
        </Box>
      </Flex>
    </Box>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Box } from "@chakra-ui/react";
import { Wizard } from "@/components/onboarding/wizard";

export const metadata: Metadata = {
  title: "Get started | Lumen",
  description:
    "Set up your Lumen workspace in four quick steps: account, workspace, invites and preferences.",
};

export default function Page() {
  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Wizard />
    </Box>
  );
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next";
import {
  Badge,
  Box,
  Button,
  Card,
  Circle,
  Heading,
  HStack,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft, LuCheck, LuPartyPopper } from "react-icons/lu";
import { nextStepsChecklist, product, user } from "@/lib/data";

export const metadata: Metadata = {
  title: "You're all set | Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function WelcomePage() {
  const firstName = user.name.split(" ")[0];

  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Box
        maxW="2xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "16" }}
      >
        <Stack gap="6">
          <Stack gap="4" align="flex-start">
            <Circle size="12" bg="green.subtle" color="green.fg">
              <LuPartyPopper size={24} aria-hidden />
            </Circle>
            <Stack gap="2">
              <HStack gap="2" wrap="wrap">
                <Badge colorPalette="green">Setup complete</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </HStack>
              <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
                You&apos;re all set, {firstName}!
              </Heading>
              <Text color="fg.muted">
                Your {product.name} workspace is ready for {user.email}. Here
                are four things to do next to get value from{" "}
                {product.name} this week.
              </Text>
            </Stack>
          </Stack>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="lg">
                Your next steps
              </Heading>
            </Card.Header>
            <Card.Body>
              <List.Root as="ol" listStyle="none" m="0" p="0" gap="5">
                {nextStepsChecklist.map((item, i) => (
                  <List.Item key={item.title}>
                    <HStack align="flex-start" gap="4">
                      <Circle
                        size="7"
                        flexShrink={0}
                        mt="0.5"
                        borderWidth="2px"
                        borderColor="blue.solid"
                        color="blue.fg"
                        fontSize="sm"
                        fontWeight="semibold"
                      >
                        {i === 0 ? <LuCheck aria-hidden /> : i + 1}
                      </Circle>
                      <Box minW="0">
                        <Text fontWeight="semibold">{item.title}</Text>
                        <Text textStyle="sm" color="fg.muted">
                          {item.description}
                        </Text>
                      </Box>
                    </HStack>
                  </List.Item>
                ))}
              </List.Root>
            </Card.Body>
            <Card.Footer>
              <Button asChild variant="outline">
                <NextLink href="/">
                  <LuArrowLeft aria-hidden /> Back to onboarding
                </NextLink>
              </Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </Box>
    </Box>
  );
}
```
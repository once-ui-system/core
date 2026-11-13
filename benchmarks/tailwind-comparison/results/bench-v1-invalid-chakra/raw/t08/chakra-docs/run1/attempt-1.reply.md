Error #418 is a hydration mismatch, and it appears on both routes, so the cause is something shared. The likely culprits:

1. **Nested `<main>`**: `app/page.tsx` wrapped the wizard in `<main>`, and `/welcome` used `as="main"` on a Box. This is not a mismatch by itself, but I'll make it clean with a single landmark per page.
2. **Invalid HTML nesting**: `Switch.Label` and `Checkbox.Label` render a `<span>`, and I put `<Box>` (a `div`) and `<Text>` (a `p`) inside them. Browsers repair invalid nesting during parsing, which causes the hydration mismatch, so I'll use `Span` and `display="block"` instead.
3. **`Card.Root as="section"`**: this one is fine, but I'll keep it simple.

Both routes fail because of the shared invalid nesting inside labels, plus the `<p>` inside spans on `/welcome`. On `/` the problem is the `Box` and `Text` inside `Switch.Label`. I'll fix the nesting in both places and also avoid `<p>` inside `<dt>`/`<dd>` in the summary.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking in one calm workspace.",
} as const

export const sampleUser = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const

export type StepId = "account" | "workspace" | "invite" | "preferences"

export interface StepMeta {
  id: StepId
  title: string
  short: string
  description: string
}

export const steps: readonly StepMeta[] = [
  {
    id: "account",
    title: "Create your account",
    short: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Set up your workspace",
    short: "Workspace",
    description: "A workspace holds your projects, issues and dashboards.",
  },
  {
    id: "invite",
    title: "Invite your teammates",
    short: "Invite",
    description: "Add up to three people now. You can always invite more later.",
  },
  {
    id: "preferences",
    title: "Choose your preferences",
    short: "Preferences",
    description: "Pick how Lumen looks and how often we email you.",
  },
]

export const teamSizes = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more people" },
] as const

export type ThemeChoice = "light" | "dark" | "system"

export const themeOptions: readonly {
  value: ThemeChoice
  label: string
  description: string
}[] = [
  { value: "light", label: "Light", description: "Bright and clear" },
  { value: "dark", label: "Dark", description: "Easy on the eyes" },
  { value: "system", label: "System", description: "Match your device" },
]

export const MAX_INVITES = 3

export interface OnboardingData {
  name: string
  email: string
  workspace: string
  teamSize: string
  invites: string[]
  theme: ThemeChoice
  weeklyDigest: boolean
}

export const initialData: OnboardingData = {
  name: "",
  email: "",
  workspace: "",
  teamSize: "",
  invites: ["", "", ""],
  theme: "system",
  weeklyDigest: true,
}

export const STORAGE_KEY = "lumen:onboarding"

export const nextSteps = [
  {
    id: "project",
    title: "Create your first project",
    description:
      "Group issues and analytics for one product, for example “Acme Mobile App”.",
  },
  {
    id: "snippet",
    title: "Install the tracking snippet",
    description:
      "Add the Lumen snippet to your app to start collecting events within minutes.",
  },
  {
    id: "issue",
    title: "Log your first issue",
    description:
      "Capture a bug or task and assign it to yourself or a teammate.",
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description:
      "Start with weekly active users or issues closed per week.",
  },
] as const
```

```ts lib/validation.ts
import { MAX_INVITES, type OnboardingData, type StepId } from "@/lib/data"

export type Errors = Record<string, string>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function validateStep(id: StepId, data: OnboardingData): Errors {
  const errors: Errors = {}

  if (id === "account") {
    if (data.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters)."
    }
    if (data.email.trim() === "") {
      errors.email = "Enter your work email."
    } else if (!isEmail(data.email)) {
      errors.email = "Enter a valid email address, like maya@acmelabs.io."
    }
  }

  if (id === "workspace") {
    if (data.workspace.trim().length < 2) {
      errors.workspace = "Give your workspace a name (at least 2 characters)."
    }
    if (data.teamSize === "") {
      errors.teamSize = "Choose your team size."
    }
  }

  if (id === "invite") {
    const seen = new Set<string>()
    seen.add(data.email.trim().toLowerCase())
    for (let i = 0; i < MAX_INVITES; i++) {
      const raw = (data.invites[i] ?? "").trim()
      if (raw === "") continue
      const key = raw.toLowerCase()
      if (!isEmail(raw)) {
        errors[`invite-${i}`] = "Enter a valid email address."
      } else if (seen.has(key)) {
        errors[`invite-${i}`] =
          key === data.email.trim().toLowerCase()
            ? "That's your own email. Invite a teammate instead."
            : "This email is already in the list."
      }
      seen.add(key)
    }
  }

  return errors
}
```

```tsx components/onboarding/step-indicator.tsx
import { Box, Flex, Icon, Span, Text } from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { steps } from "@/lib/data"

interface StepIndicatorProps {
  current: number
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <Box as="nav" aria-label="Onboarding progress">
      <Text
        textStyle="sm"
        color="fg.muted"
        mb="3"
        display={{ base: "block", md: "none" }}
        aria-hidden="true"
      >
        Step {current + 1} of {steps.length}: {steps[current].short}
      </Text>
      <Flex as="ol" listStyleType="none" m="0" p="0" align="center" gap="2">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          const last = index === steps.length - 1
          return (
            <Flex
              as="li"
              key={step.id}
              align="center"
              gap="2"
              flex={last ? "0 0 auto" : "1"}
              aria-current={active ? "step" : undefined}
            >
              <Flex align="center" gap="2" flex="0 0 auto">
                <Flex
                  align="center"
                  justify="center"
                  boxSize="8"
                  rounded="full"
                  borderWidth="2px"
                  borderColor={done || active ? "colorPalette.solid" : "border"}
                  bg={done ? "colorPalette.solid" : "transparent"}
                  color={
                    done
                      ? "colorPalette.contrast"
                      : active
                        ? "colorPalette.fg"
                        : "fg.muted"
                  }
                  colorPalette="blue"
                  fontWeight="semibold"
                  textStyle="sm"
                >
                  {done ? (
                    <Icon boxSize="4" aria-hidden="true">
                      <LuCheck />
                    </Icon>
                  ) : (
                    <Span aria-hidden="true">{index + 1}</Span>
                  )}
                </Flex>
                <Span
                  textStyle="sm"
                  fontWeight={active ? "semibold" : "medium"}
                  color={active ? "fg" : "fg.muted"}
                  display={{ base: "none", md: "inline" }}
                >
                  {step.short}
                </Span>
                <Span srOnly>
                  {done ? "Completed: " : active ? "Current step: " : "Upcoming: "}
                  {step.short}
                  {` (step ${index + 1} of ${steps.length})`}
                </Span>
              </Flex>
              {!last && (
                <Box
                  flex="1"
                  h="2px"
                  minW="4"
                  rounded="full"
                  bg={done ? "blue.solid" : "border"}
                  aria-hidden="true"
                />
              )}
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}
```

```tsx components/onboarding/summary-card.tsx
import { Badge, Box, Card, Heading, Span, Stack } from "@chakra-ui/react"
import {
  MAX_INVITES,
  teamSizes,
  themeOptions,
  type OnboardingData,
} from "@/lib/data"
import { isEmail } from "@/lib/validation"

interface SummaryCardProps {
  data: OnboardingData
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Box
        as="dt"
        textStyle="xs"
        color="fg.muted"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        {label}
      </Box>
      <Box as="dd" m="0" mt="0.5" textStyle="sm" wordBreak="break-word">
        {children}
      </Box>
    </Box>
  )
}

function Empty({ children = "Not set yet" }: { children?: React.ReactNode }) {
  return <Span color="fg.subtle">{children}</Span>
}

export function SummaryCard({ data }: SummaryCardProps) {
  const teamSizeLabel = teamSizes.find((t) => t.value === data.teamSize)?.label
  const themeLabel = themeOptions.find((t) => t.value === data.theme)?.label
  const invites = data.invites
    .slice(0, MAX_INVITES)
    .map((e) => e.trim())
    .filter((e) => e !== "" && isEmail(e))

  return (
    <Card.Root variant="outline" aria-labelledby="summary-heading">
      <Card.Header>
        <Heading as="h2" id="summary-heading" size="md">
          Your setup so far
        </Heading>
        <Card.Description>
          This updates as you fill in each step.
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack as="dl" m="0" gap="4">
          <Row label="Name">{data.name.trim() || <Empty />}</Row>
          <Row label="Work email">{data.email.trim() || <Empty />}</Row>
          <Row label="Workspace">{data.workspace.trim() || <Empty />}</Row>
          <Row label="Team size">{teamSizeLabel ?? <Empty />}</Row>
          <Row label="Invitations">
            {invites.length === 0 ? (
              <Empty>No one invited yet</Empty>
            ) : (
              <Stack gap="1" as="ul" listStyleType="none" m="0" p="0">
                {invites.map((email) => (
                  <li key={email}>{email}</li>
                ))}
              </Stack>
            )}
          </Row>
          <Row label="Theme">
            <Badge variant="subtle">{themeLabel}</Badge>
          </Row>
          <Row label="Weekly digest">
            <Badge
              variant="subtle"
              colorPalette={data.weeklyDigest ? "green" : "gray"}
            >
              {data.weeklyDigest ? "On" : "Off"}
            </Badge>
          </Row>
        </Stack>
      </Card.Body>
    </Card.Root>
  )
}
```

```tsx components/onboarding/onboarding-wizard.tsx
"use client"

import {
  Box,
  Button,
  Card,
  Field,
  Flex,
  Grid,
  Heading,
  Input,
  NativeSelect,
  RadioCard,
  Span,
  Stack,
  Switch,
  Text,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { LuArrowLeft, LuArrowRight, LuCheck } from "react-icons/lu"
import { useColorMode } from "@/components/ui/color-mode"
import {
  initialData,
  MAX_INVITES,
  product,
  STORAGE_KEY,
  steps,
  teamSizes,
  themeOptions,
  type OnboardingData,
  type ThemeChoice,
} from "@/lib/data"
import { validateStep, type Errors } from "@/lib/validation"
import { StepIndicator } from "./step-indicator"
import { SummaryCard } from "./summary-card"

const invitePlaceholders = [
  "jon@acmelabs.io",
  "priya@acmelabs.io",
  "tomas@acmelabs.io",
]

export function OnboardingWizard() {
  const router = useRouter()
  const { setColorMode } = useColorMode()
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [errors, setErrors] = useState<Errors>({})
  const [finishing, setFinishing] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const didMount = useRef(false)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  // Move focus to the step heading after navigating (not on first render).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    headingRef.current?.focus()
  }, [stepIndex])

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }))
      setErrors((prev) => {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    },
    [],
  )

  const updateInvite = (index: number, value: string) => {
    setData((prev) => {
      const invites = [...prev.invites]
      invites[index] = value
      return { ...prev, invites }
    })
    setErrors((prev) => {
      const k = `invite-${index}`
      if (!(k in prev)) return prev
      const next = { ...prev }
      delete next[k]
      return next
    })
  }

  const focusFirstError = (errs: Errors) => {
    const firstKey = Object.keys(errs)[0]
    if (!firstKey) return
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(
        `[data-field="${firstKey}"]`,
      )
      el?.focus()
    })
  }

  const handleNext = () => {
    const errs = validateStep(step.id, data)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs)
      return
    }
    if (isLast) {
      finish()
      return
    }
    setStepIndex((i) => i + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStepIndex((i) => Math.max(0, i - 1))
  }

  const handleSkip = () => {
    setErrors({})
    setData((prev) => ({ ...prev, invites: ["", "", ""] }))
    setStepIndex((i) => i + 1)
  }

  const finish = () => {
    setFinishing(true)
    try {
      const payload = {
        ...data,
        invites: data.invites
          .map((e) => e.trim())
          .filter((e) => e !== "")
          .slice(0, MAX_INVITES),
      }
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Storage may be unavailable; /welcome falls back to sample content.
    }
    router.push("/welcome")
  }

  const invalid = (key: string) => key in errors

  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        maxW="6xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "6", md: "12" }}
      >
        <Stack gap="2" mb={{ base: "6", md: "8" }}>
          <Text
            textStyle="sm"
            fontWeight="semibold"
            color="blue.fg"
            letterSpacing="wide"
          >
            {product.name}
          </Text>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            Welcome to Lumen
          </Heading>
          <Text color="fg.muted" maxW="2xl">
            {product.tagline} Four quick steps and your team is ready to go.
          </Text>
        </Stack>

        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 1.6fr) minmax(0, 1fr)",
          }}
          gap={{ base: "6", lg: "8" }}
          alignItems="start"
        >
          <Card.Root variant="elevated" aria-labelledby="step-heading">
            <Card.Body gap="6">
              <StepIndicator current={stepIndex} />

              <Box>
                <Heading
                  as="h2"
                  id="step-heading"
                  size="lg"
                  tabIndex={-1}
                  ref={headingRef}
                  outline="none"
                >
                  {step.title}
                </Heading>
                <Text color="fg.muted" mt="1">
                  {step.description}
                </Text>
              </Box>

              <form
                ref={formRef}
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  handleNext()
                }}
              >
                <Stack gap="5">
                  {step.id === "account" && (
                    <>
                      <Field.Root invalid={invalid("name")} required>
                        <Field.Label>
                          Full name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="name"
                          name="name"
                          autoComplete="name"
                          placeholder="Maya Okafor"
                          value={data.name}
                          onChange={(e) => update("name", e.target.value)}
                        />
                        <Field.ErrorText>{errors.name}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={invalid("email")} required>
                        <Field.Label>
                          Work email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="maya@acmelabs.io"
                          value={data.email}
                          onChange={(e) => update("email", e.target.value)}
                        />
                        <Field.HelperText>
                          We’ll send your sign-in link here.
                        </Field.HelperText>
                        <Field.ErrorText>{errors.email}</Field.ErrorText>
                      </Field.Root>
                    </>
                  )}

                  {step.id === "workspace" && (
                    <>
                      <Field.Root invalid={invalid("workspace")} required>
                        <Field.Label>
                          Workspace name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          data-field="workspace"
                          name="workspace"
                          autoComplete="organization"
                          placeholder="Acme Labs"
                          value={data.workspace}
                          onChange={(e) => update("workspace", e.target.value)}
                        />
                        <Field.HelperText>
                          Usually your company or team name.
                        </Field.HelperText>
                        <Field.ErrorText>{errors.workspace}</Field.ErrorText>
                      </Field.Root>
                      <Field.Root invalid={invalid("teamSize")} required>
                        <Field.Label>
                          Team size <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            data-field="teamSize"
                            name="teamSize"
                            value={data.teamSize}
                            onChange={(e) => update("teamSize", e.target.value)}
                          >
                            <option value="">Select team size</option>
                            {teamSizes.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        <Field.ErrorText>{errors.teamSize}</Field.ErrorText>
                      </Field.Root>
                    </>
                  )}

                  {step.id === "invite" && (
                    <>
                      {Array.from({ length: MAX_INVITES }, (_, i) => (
                        <Field.Root key={i} invalid={invalid(`invite-${i}`)}>
                          <Field.Label>Teammate {i + 1} email</Field.Label>
                          <Input
                            data-field={`invite-${i}`}
                            name={`invite-${i}`}
                            type="email"
                            autoComplete="off"
                            placeholder={invitePlaceholders[i]}
                            value={data.invites[i] ?? ""}
                            onChange={(e) => updateInvite(i, e.target.value)}
                          />
                          <Field.ErrorText>
                            {errors[`invite-${i}`]}
                          </Field.ErrorText>
                        </Field.Root>
                      ))}
                      <Text textStyle="sm" color="fg.muted">
                        Leave these blank to skip. Teammates join as Members;
                        you stay the Owner.
                      </Text>
                    </>
                  )}

                  {step.id === "preferences" && (
                    <>
                      <RadioCard.Root
                        value={data.theme}
                        onValueChange={(e) => {
                          const v = e.value as ThemeChoice | null
                          if (!v) return
                          update("theme", v)
                          setColorMode(v === "system" ? getSystemMode() : v)
                        }}
                        orientation="vertical"
                        colorPalette="blue"
                      >
                        <RadioCard.Label>Theme</RadioCard.Label>
                        <Grid
                          templateColumns={{
                            base: "minmax(0, 1fr)",
                            sm: "repeat(3, minmax(0, 1fr))",
                          }}
                          gap="3"
                        >
                          {themeOptions.map((opt) => (
                            <RadioCard.Item key={opt.value} value={opt.value}>
                              <RadioCard.ItemHiddenInput />
                              <RadioCard.ItemControl>
                                <RadioCard.ItemContent>
                                  <RadioCard.ItemText>
                                    {opt.label}
                                  </RadioCard.ItemText>
                                  <RadioCard.ItemDescription>
                                    {opt.description}
                                  </RadioCard.ItemDescription>
                                </RadioCard.ItemContent>
                                <RadioCard.ItemIndicator />
                              </RadioCard.ItemControl>
                            </RadioCard.Item>
                          ))}
                        </Grid>
                      </RadioCard.Root>

                      <Switch.Root
                        checked={data.weeklyDigest}
                        onCheckedChange={(e) =>
                          update("weeklyDigest", e.checked)
                        }
                        colorPalette="blue"
                        alignItems="flex-start"
                      >
                        <Switch.HiddenInput name="weeklyDigest" />
                        <Switch.Control mt="1">
                          <Switch.Thumb />
                        </Switch.Control>
                        <Switch.Label>
                          <Span display="block" fontWeight="medium">
                            Weekly digest email
                          </Span>
                          <Span
                            display="block"
                            textStyle="sm"
                            color="fg.muted"
                            fontWeight="normal"
                          >
                            A Monday summary of new issues, closed work and key
                            metrics.
                          </Span>
                        </Switch.Label>
                      </Switch.Root>
                    </>
                  )}

                  <Flex
                    mt="2"
                    gap="3"
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={isFirst || finishing}
                    >
                      <LuArrowLeft aria-hidden="true" />
                      Back
                    </Button>
                    <Flex gap="3" wrap="wrap" justify="flex-end">
                      {step.id === "invite" && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleSkip}
                        >
                          Skip for now
                        </Button>
                      )}
                      <Button
                        type="submit"
                        colorPalette="blue"
                        loading={finishing}
                        loadingText="Finishing…"
                      >
                        {isLast ? "Finish setup" : "Next"}
                        {isLast ? (
                          <LuCheck aria-hidden="true" />
                        ) : (
                          <LuArrowRight aria-hidden="true" />
                        )}
                      </Button>
                    </Flex>
                  </Flex>
                </Stack>
              </form>
            </Card.Body>
          </Card.Root>

          <SummaryCard data={data} />
        </Grid>
      </Box>
    </Box>
  )
}

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}
```

```tsx components/welcome/welcome-content.tsx
"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Icon,
  Progress,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { useEffect, useState } from "react"
import { LuPartyPopper, LuRotateCcw } from "react-icons/lu"
import {
  nextSteps,
  product,
  sampleUser,
  STORAGE_KEY,
  type OnboardingData,
} from "@/lib/data"

interface WelcomeInfo {
  name: string
  email: string
  workspace: string
  invited: number
}

const fallback: WelcomeInfo = {
  name: sampleUser.name,
  email: sampleUser.email,
  workspace: "Acme Labs",
  invited: 0,
}

function readInfo(): WelcomeInfo {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<OnboardingData>
    return {
      name: parsed.name?.trim() || fallback.name,
      email: parsed.email?.trim() || fallback.email,
      workspace: parsed.workspace?.trim() || fallback.workspace,
      invited: Array.isArray(parsed.invites) ? parsed.invites.length : 0,
    }
  } catch {
    return fallback
  }
}

export function WelcomeContent() {
  const [info, setInfo] = useState<WelcomeInfo>(fallback)
  const [done, setDone] = useState<string[]>([])

  useEffect(() => {
    setInfo(readInfo())
  }, [])

  const firstName = info.name.split(" ")[0]
  const progress = Math.round((done.length / nextSteps.length) * 100)

  const toggle = (id: string, checked: boolean) => {
    setDone((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    )
  }

  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        maxW="3xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "16" }}
      >
        <Stack gap="3" mb="8" align="flex-start">
          <Flex
            align="center"
            justify="center"
            boxSize="12"
            rounded="full"
            bg="green.subtle"
            color="green.fg"
          >
            <Icon boxSize="6" aria-hidden="true">
              <LuPartyPopper />
            </Icon>
          </Flex>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            You’re all set, {firstName}!
          </Heading>
          <Text color="fg.muted" fontSize="lg">
            <Span color="fg" fontWeight="semibold">
              {info.workspace}
            </Span>{" "}
            is ready on {product.name}. We sent a sign-in link to {info.email}
            {info.invited > 0
              ? ` and invited ${info.invited} teammate${info.invited === 1 ? "" : "s"}.`
              : "."}
          </Text>
        </Stack>

        <Card.Root variant="elevated" aria-labelledby="next-heading">
          <Card.Header>
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
              <Heading as="h2" id="next-heading" size="lg">
                Your next steps
              </Heading>
              <Badge
                variant="subtle"
                colorPalette={progress === 100 ? "green" : "blue"}
              >
                {done.length} of {nextSteps.length} done
              </Badge>
            </Flex>
            <Progress.Root
              value={progress}
              size="sm"
              colorPalette="blue"
              mt="3"
              aria-label="Checklist progress"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Card.Header>
          <Card.Body>
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="4">
              {nextSteps.map((item) => {
                const checked = done.includes(item.id)
                return (
                  <li key={item.id}>
                    <Checkbox.Root
                      alignItems="flex-start"
                      colorPalette="blue"
                      checked={checked}
                      onCheckedChange={(e) =>
                        toggle(item.id, e.checked === true)
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control mt="0.5" />
                      <Checkbox.Label>
                        <Span
                          display="block"
                          fontWeight="medium"
                          textDecoration={checked ? "line-through" : "none"}
                          color={checked ? "fg.muted" : "fg"}
                        >
                          {item.title}
                        </Span>
                        <Span
                          display="block"
                          textStyle="sm"
                          color="fg.muted"
                          fontWeight="normal"
                        >
                          {item.description}
                        </Span>
                      </Checkbox.Label>
                    </Checkbox.Root>
                  </li>
                )
              })}
            </Stack>
          </Card.Body>
          <Card.Footer>
            <Button asChild variant="ghost" size="sm">
              <NextLink href="/">
                <LuRotateCcw aria-hidden="true" />
                Run onboarding again
              </NextLink>
            </Button>
          </Card.Footer>
        </Card.Root>
      </Box>
    </Box>
  )
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next"
import { WelcomeContent } from "@/components/welcome/welcome-content"

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
}

export default function WelcomePage() {
  return (
    <main>
      <WelcomeContent />
    </main>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Get started with Lumen",
  description:
    "Set up your Lumen account, workspace, teammates and preferences in four quick steps.",
}

export default function Page() {
  return (
    <main>
      <OnboardingWizard />
    </main>
  )
}
```
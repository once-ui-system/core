The alias is fine (`@/*` maps to the project root). The real problem is that my earlier reply never delivered `lib/data.ts`, `lib/onboarding.ts`, and the `components/onboarding/*` files in a form that got written, so those modules don't exist. The `implicit any` errors are a knock-on effect of the unresolved imports.

I'm re-emitting every file in full. To reduce risk, I also made these changes:
- Explicit parameter types everywhere, so nothing depends on inference across module boundaries.
- `lib/data.ts` is a plain `.ts` file with no JSX, importing icons from `lucide-react`.
- The `'` characters in JSX text are replaced with `&apos;` or moved into JS strings.

```ts lib/data.ts
import {
  BarChart3Icon,
  BugIcon,
  PlugIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
  tagline: "Product analytics and issue tracking, in one calm place.",
} as const

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const

export type TeamSizeOption = {
  value: string
  label: string
}

export const teamSizes: TeamSizeOption[] = [
  { value: "1-5", label: "1–5 people" },
  { value: "6-15", label: "6–15 people" },
  { value: "16-50", label: "16–50 people" },
  { value: "51+", label: "51 or more people" },
]

export type ThemeValue = "light" | "dark" | "system"

export type ThemeOption = {
  value: ThemeValue
  label: string
}

export const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export type StepId = "account" | "workspace" | "invite" | "preferences"

export type StepDefinition = {
  id: StepId
  title: string
  description: string
}

export const steps: StepDefinition[] = [
  {
    id: "account",
    title: "Account",
    description: "Tell us who you are so teammates recognise you.",
  },
  {
    id: "workspace",
    title: "Workspace",
    description: "Name the home for your projects, events and issues.",
  },
  {
    id: "invite",
    title: "Invite",
    description: "Add up to three teammates. You can skip this and invite later.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Choose how Lumen looks and how often it keeps you posted.",
  },
]

export const MAX_INVITES = 3

export type ChecklistItem = {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export const nextSteps: ChecklistItem[] = [
  {
    id: "install",
    title: "Install the tracking snippet",
    description:
      "Paste the Lumen snippet into your app to start collecting page views and events.",
    icon: PlugIcon,
  },
  {
    id: "issue",
    title: "File your first issue",
    description:
      "Capture a bug or task and assign it, so the board is not empty on day one.",
    icon: BugIcon,
  },
  {
    id: "dashboard",
    title: "Pin a metric to your dashboard",
    description:
      "Start with weekly active users, then add the funnel your team cares about most.",
    icon: BarChart3Icon,
  },
  {
    id: "teammates",
    title: "Check on your teammates' invites",
    description:
      "Invites expire after seven days. Resend any that have not been accepted.",
    icon: UsersIcon,
  },
]
```

```ts lib/onboarding.ts
import { MAX_INVITES, teamSizes, type ThemeValue } from "@/lib/data"

export type OnboardingState = {
  name: string
  email: string
  workspaceName: string
  teamSize: string
  invites: string[]
  theme: ThemeValue
  weeklyDigest: boolean
}

export const initialState: OnboardingState = {
  name: "",
  email: "",
  workspaceName: "",
  teamSize: "",
  invites: Array.from({ length: MAX_INVITES }, () => ""),
  theme: "system",
  weeklyDigest: true,
}

export type StepErrors = {
  name?: string
  email?: string
  workspaceName?: string
  teamSize?: string
  invites?: (string | undefined)[]
  invitesSummary?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

export function filledInvites(invites: string[]): string[] {
  return invites
    .map((email: string) => email.trim())
    .filter((email: string) => email.length > 0)
}

export function validateStep(
  index: number,
  state: OnboardingState
): StepErrors {
  const errors: StepErrors = {}

  if (index === 0) {
    if (state.name.trim().length < 2) {
      errors.name = "Enter your full name (at least 2 characters)."
    }
    if (state.email.trim().length === 0) {
      errors.email = "Enter your work email."
    } else if (!isValidEmail(state.email)) {
      errors.email = "Enter a valid email address, like name@company.com."
    }
  }

  if (index === 1) {
    if (state.workspaceName.trim().length < 2) {
      errors.workspaceName = "Give your workspace a name (at least 2 characters)."
    }
    if (!teamSizes.some((option) => option.value === state.teamSize)) {
      errors.teamSize = "Choose the size of your team."
    }
  }

  if (index === 2) {
    const own = state.email.trim().toLowerCase()
    const seen = new Set<string>()
    const perField: (string | undefined)[] = state.invites.map(
      (raw: string): string | undefined => {
        const email = raw.trim().toLowerCase()
        if (email.length === 0) return undefined
        if (!isValidEmail(email)) return "Enter a valid email address."
        if (email === own) {
          return "That is your own email. Invite a teammate instead."
        }
        if (seen.has(email)) return "This email is already in the list."
        seen.add(email)
        return undefined
      }
    )
    if (perField.some((message) => message !== undefined)) {
      errors.invites = perField
      errors.invitesSummary = "Fix the highlighted emails, or clear them to skip."
    }
  }

  return errors
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.values(errors).some((value) => value !== undefined)
}

const STORAGE_KEY = "lumen-onboarding"

export function saveOnboarding(state: OnboardingState): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode); the welcome page has a fallback.
  }
}

export function loadOnboarding(): OnboardingState | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OnboardingState>
    return { ...initialState, ...parsed }
  } catch {
    return null
  }
}
```

```tsx components/onboarding/step-indicator.tsx
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { StepDefinition } from "@/lib/data"

type StepIndicatorProps = {
  steps: StepDefinition[]
  current: number
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="mb-3 text-sm font-medium text-muted-foreground sm:hidden">
        Step {current + 1} of {steps.length}:{" "}
        <span className="text-foreground">{steps[current].title}</span>
      </p>
      <ol className="flex items-center gap-2">
        {steps.map((step: StepDefinition, index: number) => {
          const isComplete = index < current
          const isCurrent = index === current
          const isLast = index === steps.length - 1
          return (
            <li
              key={step.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn("flex items-center gap-2", !isLast && "flex-1")}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  isComplete &&
                    "border-primary bg-primary text-primary-foreground",
                  isCurrent &&
                    "border-primary text-foreground ring-4 ring-ring/20",
                  !isComplete && !isCurrent && "text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
                <span className="sr-only">
                  {isComplete
                    ? " (completed)"
                    : isCurrent
                      ? " (current step)"
                      : ""}
                </span>
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px min-w-3 flex-1 transition-colors",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

```tsx components/onboarding/summary-card.tsx
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { teamSizes, themeOptions } from "@/lib/data"
import { filledInvites, type OnboardingState } from "@/lib/onboarding"

type SummaryCardProps = {
  state: OnboardingState
}

type RowProps = {
  label: string
  value: string
  placeholder: string
}

function Row({ label, value, placeholder }: RowProps) {
  const hasValue = value.trim().length > 0
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={
          hasValue
            ? "text-sm break-words"
            : "text-sm text-muted-foreground italic"
        }
      >
        {hasValue ? value : placeholder}
      </dd>
    </div>
  )
}

export function SummaryCard({ state }: SummaryCardProps) {
  const invites = filledInvites(state.invites)
  const teamSizeLabel =
    teamSizes.find((option) => option.value === state.teamSize)?.label ?? ""
  const themeLabel =
    themeOptions.find((option) => option.value === state.theme)?.label ?? ""

  return (
    <Card role="region" aria-labelledby="summary-title">
      <CardHeader>
        <CardTitle id="summary-title">Your setup so far</CardTitle>
        <CardDescription>
          Updates as you type. Nothing is saved until you finish.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <section aria-label="Account" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <dl className="flex flex-col gap-3">
            <Row label="Name" value={state.name} placeholder="Not entered yet" />
            <Row
              label="Work email"
              value={state.email}
              placeholder="Not entered yet"
            />
          </dl>
        </section>
        <Separator />
        <section aria-label="Workspace" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Workspace</h3>
          <dl className="flex flex-col gap-3">
            <Row
              label="Name"
              value={state.workspaceName}
              placeholder="Not entered yet"
            />
            <Row
              label="Team size"
              value={teamSizeLabel}
              placeholder="Not chosen yet"
            />
          </dl>
        </section>
        <Separator />
        <section aria-label="Invites" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Invites</h3>
          {invites.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {invites.map((email: string) => (
                <li key={email} className="max-w-full">
                  <Badge variant="secondary" className="max-w-full break-all">
                    {email}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No teammates added yet
            </p>
          )}
        </section>
        <Separator />
        <section aria-label="Preferences" className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Preferences</h3>
          <dl className="flex flex-col gap-3">
            <Row label="Theme" value={themeLabel} placeholder="System" />
            <Row
              label="Weekly digest"
              value={state.weeklyDigest ? "On, every Monday" : "Off"}
              placeholder="Off"
            />
          </dl>
        </section>
      </CardContent>
    </Card>
  )
}
```

```tsx components/onboarding/steps.tsx
"use client"

import { MailIcon } from "lucide-react"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  MAX_INVITES,
  teamSizes,
  themeOptions,
  type ThemeValue,
} from "@/lib/data"
import type { OnboardingState, StepErrors } from "@/lib/onboarding"

type StepProps = {
  state: OnboardingState
  errors: StepErrors
  onChange: (patch: Partial<OnboardingState>) => void
}

export function AccountStep({ state, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={errors.name ? true : undefined}>
        <FieldLabel htmlFor="name">Full name</FieldLabel>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Maya Okafor"
          value={state.name}
          onChange={(event) => onChange({ name: event.target.value })}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error">{errors.name}</FieldError>
      </Field>
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="maya@acmelabs.io"
          value={state.email}
          onChange={(event) => onChange({ email: event.target.value })}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : "email-description"}
        />
        {errors.email ? (
          <FieldError id="email-error">{errors.email}</FieldError>
        ) : (
          <FieldDescription id="email-description">
            We will send your sign-in link and receipts here.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  )
}

export function WorkspaceStep({ state, errors, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field data-invalid={errors.workspaceName ? true : undefined}>
        <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
        <Input
          id="workspace-name"
          name="workspaceName"
          autoComplete="organization"
          placeholder="Acme Labs"
          value={state.workspaceName}
          onChange={(event) => onChange({ workspaceName: event.target.value })}
          aria-invalid={errors.workspaceName ? true : undefined}
          aria-describedby={
            errors.workspaceName ? "workspace-name-error" : undefined
          }
        />
        <FieldError id="workspace-name-error">{errors.workspaceName}</FieldError>
      </Field>
      <Field data-invalid={errors.teamSize ? true : undefined}>
        <FieldLabel htmlFor="team-size">Team size</FieldLabel>
        <Select
          value={state.teamSize}
          onValueChange={(value: string) => onChange({ teamSize: value })}
        >
          <SelectTrigger
            id="team-size"
            className="w-full"
            aria-invalid={errors.teamSize ? true : undefined}
            aria-describedby={errors.teamSize ? "team-size-error" : undefined}
          >
            <SelectValue placeholder="Select team size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {teamSizes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldError id="team-size-error">{errors.teamSize}</FieldError>
      </Field>
    </FieldGroup>
  )
}

export function InviteStep({ state, errors, onChange }: StepProps) {
  const updateInvite = (index: number, value: string) => {
    const invites = state.invites.map((current: string, i: number) =>
      i === index ? value : current
    )
    onChange({ invites })
  }

  return (
    <FieldSet>
      <FieldLegend variant="label">
        Teammate emails (up to {MAX_INVITES})
      </FieldLegend>
      <FieldDescription>
        They will get an email invite once you finish. Leave all fields empty to
        skip this step.
      </FieldDescription>
      {errors.invitesSummary ? (
        <FieldError>{errors.invitesSummary}</FieldError>
      ) : null}
      <FieldGroup className="gap-5">
        {Array.from({ length: MAX_INVITES }, (_, index: number) => {
          const message = errors.invites?.[index]
          const id = `invite-${index + 1}`
          return (
            <Field key={id} data-invalid={message ? true : undefined}>
              <FieldLabel htmlFor={id} className="sr-only">
                Teammate {index + 1} email
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  id={id}
                  name={id}
                  type="email"
                  autoComplete="off"
                  placeholder={`teammate${index + 1}@acmelabs.io`}
                  value={state.invites[index] ?? ""}
                  onChange={(event) => updateInvite(index, event.target.value)}
                  aria-invalid={message ? true : undefined}
                  aria-describedby={message ? `${id}-error` : undefined}
                />
              </InputGroup>
              <FieldError id={`${id}-error`}>{message}</FieldError>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}

export function PreferencesStep({ state, onChange }: StepProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldTitle id="theme-label">Theme</FieldTitle>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby="theme-label"
          value={state.theme}
          onValueChange={(value: string) => {
            if (value) onChange({ theme: value as ThemeValue })
          }}
          className="w-full sm:w-fit"
        >
          {themeOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="flex-1 sm:flex-none"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldDescription>
          &quot;System&quot; follows your device&apos;s appearance setting.
        </FieldDescription>
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="weekly-digest">Weekly digest</FieldLabel>
          <FieldDescription>
            A Monday email with your top events, new issues and what changed.
          </FieldDescription>
        </FieldContent>
        <Switch
          id="weekly-digest"
          checked={state.weeklyDigest}
          onCheckedChange={(checked: boolean) =>
            onChange({ weeklyDigest: checked })
          }
        />
      </Field>
    </FieldGroup>
  )
}
```

```tsx components/onboarding/wizard.tsx
"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { product, steps } from "@/lib/data"
import {
  hasErrors,
  initialState,
  saveOnboarding,
  validateStep,
  type OnboardingState,
  type StepErrors,
} from "@/lib/onboarding"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import { SummaryCard } from "@/components/onboarding/summary-card"
import {
  AccountStep,
  InviteStep,
  PreferencesStep,
  WorkspaceStep,
} from "@/components/onboarding/steps"

export function Wizard() {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState<number>(0)
  const [state, setState] = useState<OnboardingState>(initialState)
  const [errors, setErrors] = useState<StepErrors>({})
  const [submitting, setSubmitting] = useState<boolean>(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  const handleChange = (patch: Partial<OnboardingState>) => {
    setState((current: OnboardingState) => ({ ...current, ...patch }))
    // Clear errors for the fields being edited; they are re-checked on Next.
    setErrors((current: StepErrors) => {
      const next: StepErrors = { ...current }
      if ("name" in patch) delete next.name
      if ("email" in patch) delete next.email
      if ("workspaceName" in patch) delete next.workspaceName
      if ("teamSize" in patch) delete next.teamSize
      if ("invites" in patch) {
        delete next.invites
        delete next.invitesSummary
      }
      return next
    })
  }

  const goTo = (index: number) => {
    setErrors({})
    setStepIndex(index)
    // Move focus to the new step heading for keyboard and screen-reader users.
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  const handleBack = () => {
    if (!isFirst) goTo(stepIndex - 1)
  }

  const handleNext = () => {
    const found = validateStep(stepIndex, state)
    if (hasErrors(found)) {
      setErrors(found)
      requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>("[aria-invalid='true']")
          ?.focus()
      })
      return
    }
    if (isLast) {
      setSubmitting(true)
      saveOnboarding(state)
      router.push("/welcome")
      return
    }
    goTo(stepIndex + 1)
  }

  const renderStep = () => {
    const props = { state, errors, onChange: handleChange }
    switch (step.id) {
      case "account":
        return <AccountStep {...props} />
      case "workspace":
        return <WorkspaceStep {...props} />
      case "invite":
        return <InviteStep {...props} />
      case "preferences":
        return <PreferencesStep {...props} />
    }
  }

  const hasInvites = state.invites.some(
    (email: string) => email.trim().length > 0
  )

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {product.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Set up your workspace
        </h1>
        <p className="text-muted-foreground">{product.tagline}</p>
      </header>

      <StepIndicator steps={steps} current={stepIndex} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <form
            ref={formRef}
            noValidate
            aria-labelledby="step-heading"
            onSubmit={(event) => {
              event.preventDefault()
              handleNext()
            }}
            className="flex flex-col gap-6"
          >
            <CardHeader>
              <h2
                id="step-heading"
                ref={headingRef}
                tabIndex={-1}
                className="text-xl leading-none font-semibold outline-none"
              >
                {step.title}
              </h2>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStep()}</CardContent>
            <CardFooter className="justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isFirst || submitting}
              >
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Finishing…
                  </>
                ) : isLast ? (
                  <>
                    <CheckIcon data-icon="inline-start" />
                    Finish setup
                  </>
                ) : stepIndex === 2 && !hasInvites ? (
                  <>
                    Skip for now
                    <ArrowRightIcon data-icon="inline-end" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRightIcon data-icon="inline-end" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <aside aria-label="Setup summary" className="lg:sticky lg:top-8">
          <SummaryCard state={state} />
        </aside>
      </div>
    </div>
  )
}
```

```tsx components/onboarding/welcome-content.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckCircle2Icon, ListChecksIcon, RotateCcwIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  nextSteps,
  product,
  teamSizes,
  themeOptions,
  user,
  type ChecklistItem,
} from "@/lib/data"
import { filledInvites, loadOnboarding } from "@/lib/onboarding"

type Details = {
  firstName: string
  workspace: string
  teamSize: string
  invites: number
  theme: string
  digest: boolean
}

const fallback: Details = {
  firstName: user.name.split(" ")[0],
  workspace: "Acme Labs",
  teamSize: "",
  invites: 0,
  theme: "System",
  digest: true,
}

export function WelcomeContent() {
  const [details, setDetails] = useState<Details>(fallback)
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const saved = loadOnboarding()
    if (!saved) return
    setDetails({
      firstName: saved.name.trim().split(/\s+/)[0] || fallback.firstName,
      workspace: saved.workspaceName.trim() || fallback.workspace,
      teamSize:
        teamSizes.find((option) => option.value === saved.teamSize)?.label ?? "",
      invites: filledInvites(saved.invites).length,
      theme:
        themeOptions.find((option) => option.value === saved.theme)?.label ??
        "System",
      digest: saved.weeklyDigest,
    })
  }, [])

  const completed = nextSteps.filter(
    (item: ChecklistItem) => done[item.id]
  ).length
  const percent = Math.round((completed / nextSteps.length) * 100)
  const allDone = completed === nextSteps.length

  const toggle = (id: string, checked: boolean) =>
    setDone((current: Record<string, boolean>) => ({
      ...current,
      [id]: checked,
    }))

  const markAll = () => {
    setDone(
      allDone
        ? {}
        : Object.fromEntries(
            nextSteps.map((item: ChecklistItem): [string, boolean] => [
              item.id,
              true,
            ])
          )
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-start gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2Icon className="size-6" aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {product.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          You&apos;re all set, {details.firstName}
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">
            {details.workspace}
          </span>{" "}
          is ready.{" "}
          {details.invites > 0
            ? `${details.invites} ${
                details.invites === 1 ? "invite is" : "invites are"
              } on the way.`
            : "Invite teammates whenever you like."}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{user.role}</Badge>
          {details.teamSize ? (
            <Badge variant="outline">{details.teamSize}</Badge>
          ) : null}
          <Badge variant="outline">Theme: {details.theme}</Badge>
          <Badge variant="outline">
            Weekly digest: {details.digest ? "on" : "off"}
          </Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <h2 className="leading-none font-semibold">Your next steps</h2>
          <CardDescription>
            Four quick things that get the most out of Lumen in your first week.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" aria-live="polite">
                {completed} of {nextSteps.length} done
              </span>
            </div>
            <Progress
              value={percent}
              aria-label="Checklist progress"
              aria-valuetext={`${completed} of ${nextSteps.length} steps done`}
            />
          </div>
          <Separator />
          <ul className="flex flex-col gap-4">
            {nextSteps.map((item: ChecklistItem) => {
              const checked = Boolean(done[item.id])
              const Icon = item.icon
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <Checkbox
                    id={`todo-${item.id}`}
                    checked={checked}
                    onCheckedChange={(value) => toggle(item.id, value === true)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`todo-${item.id}`}
                    className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
                  >
                    <span
                      className={
                        checked
                          ? "flex items-center gap-2 text-sm font-medium text-muted-foreground line-through"
                          : "flex items-center gap-2 text-sm font-medium"
                      }
                    >
                      <Icon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      {item.title}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {item.description}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
          <Button variant="outline" asChild>
            <Link href="/">
              <RotateCcwIcon data-icon="inline-start" />
              Back to setup
            </Link>
          </Button>
          <Button type="button" onClick={markAll}>
            <ListChecksIcon data-icon="inline-start" />
            {allDone ? "Clear checklist" : "Mark all as done"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

```tsx app/page.tsx
import type { Metadata } from "next"

import { Wizard } from "@/components/onboarding/wizard"

export const metadata: Metadata = {
  title: "Set up your workspace · Lumen",
  description:
    "Create your Lumen account, name your workspace, invite teammates and choose your preferences.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-muted/30">
      <Wizard />
    </main>
  )
}
```

```tsx app/welcome/page.tsx
import type { Metadata } from "next"

import { WelcomeContent } from "@/components/onboarding/welcome-content"

export const metadata: Metadata = {
  title: "Welcome to Lumen",
  description: "Your workspace is ready. Here is what to do next.",
}

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-muted/30">
      <WelcomeContent />
    </main>
  )
}
```
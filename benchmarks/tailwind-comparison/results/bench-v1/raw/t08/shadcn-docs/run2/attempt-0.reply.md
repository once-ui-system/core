A few things to correct: `CardTitle` has no `asChild`, `FieldError` renders `role="alert"` only when it has content (good), and the Spinner carries its own `aria-label`. I'll rewrite the wizard with a real heading and finalize the remaining files.

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
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<OnboardingState>(initialState)
  const [errors, setErrors] = useState<StepErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  const handleChange = (patch: Partial<OnboardingState>) => {
    setState((current) => ({ ...current, ...patch }))
    // Clear errors for the fields being edited; they are re-checked on Next.
    setErrors((current) => {
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

  const hasInvites = state.invites.some((email) => email.trim().length > 0)

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

```tsx components/onboarding/welcome-content.tsx
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { nextSteps, product, teamSizes, themeOptions, user } from "@/lib/data"
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

  const completed = nextSteps.filter((item) => done[item.id]).length
  const percent = Math.round((completed / nextSteps.length) * 100)

  const toggle = (id: string, checked: boolean) =>
    setDone((current) => ({ ...current, [id]: checked }))

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
          You're all set, {details.firstName}
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{details.workspace}</span>{" "}
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
          <CardTitle>
            <h2>Your next steps</h2>
          </CardTitle>
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
            {nextSteps.map((item) => {
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
            <Link href="/">Review setup</Link>
          </Button>
          <Button asChild>
            <Link href="/welcome">
              Open your dashboard
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

The "Open your dashboard" button linking back to `/welcome` is a dead end; I'll replace it with a non-navigating, honest control by making the footer a single "Review setup" link plus a toast-free "Mark all done" action.

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
import { nextSteps, product, teamSizes, themeOptions, user } from "@/lib/data"
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

  const completed = nextSteps.filter((item) => done[item.id]).length
  const percent = Math.round((completed / nextSteps.length) * 100)
  const allDone = completed === nextSteps.length

  const toggle = (id: string, checked: boolean) =>
    setDone((current) => ({ ...current, [id]: checked }))

  const markAll = () => {
    setDone(
      allDone
        ? {}
        : Object.fromEntries(nextSteps.map((item) => [item.id, true]))
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
          You're all set, {details.firstName}
        </h1>
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{details.workspace}</span>{" "}
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
            {nextSteps.map((item) => {
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
          <Button onClick={markAll}>
            <ListChecksIcon data-icon="inline-start" />
            {allDone ? "Clear checklist" : "Mark all as done"}
          </Button>
        </CardFooter>
      </Card>
    </div>
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
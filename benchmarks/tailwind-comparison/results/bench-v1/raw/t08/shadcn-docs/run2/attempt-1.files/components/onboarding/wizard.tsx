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

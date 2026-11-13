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

import { CheckIcon } from "lucide-react";

import { STEPS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="text-sm font-medium text-muted-foreground sm:hidden">
        Step {current + 1} of {STEPS.length}:{" "}
        <span className="text-foreground">{STEPS[current].title}</span>
      </p>
      <ol className="mt-3 flex items-center gap-2 sm:mt-0">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2",
                i < STEPS.length - 1 && "flex-1"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-foreground ring-4 ring-ring/20",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {done ? (
                  <CheckIcon className="size-4" aria-hidden="true" />
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
                <span className="sr-only">
                  {done ? " (completed)" : active ? " (current step)" : ""}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px min-w-3 flex-1 transition-colors",
                    done ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

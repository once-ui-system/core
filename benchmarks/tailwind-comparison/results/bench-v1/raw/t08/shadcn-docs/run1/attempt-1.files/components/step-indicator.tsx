"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { steps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Onboarding progress">
      <p className="mb-3 text-sm text-muted-foreground sm:hidden">
        Step {current + 1} of {steps.length}:{" "}
        <span className="font-medium text-foreground">{steps[current].title}</span>
      </p>
      <ol className="flex items-center gap-2">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const status = done ? " (completed)" : active ? " (current step)" : "";
          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center gap-2", index < steps.length - 1 && "flex-1")}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-primary ring-4 ring-primary/15",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                  "max-sm:sr-only"
                )}
              >
                {step.title}
                <span className="sr-only">{status}</span>
              </span>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn("h-px min-w-3 flex-1", done ? "bg-primary" : "bg-border")}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

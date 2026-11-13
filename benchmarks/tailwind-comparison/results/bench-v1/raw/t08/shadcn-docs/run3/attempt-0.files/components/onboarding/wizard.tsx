"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { STEPS, product } from "@/lib/data";
import {
  STORAGE_KEY,
  filledInvites,
  initialData,
  validateStep,
  type Errors,
  type OnboardingData,
} from "@/lib/onboarding";
import { Stepper } from "@/components/onboarding/stepper";
import { SummaryCard } from "@/components/onboarding/summary-card";
import {
  AccountStep,
  InviteStep,
  PreferencesStep,
  WorkspaceStep,
} from "@/components/onboarding/steps";

function applyTheme(theme: OnboardingData["theme"]) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function Wizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);

  // Move focus to the step heading when the step changes (not on first render).
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // Preview the chosen theme live.
  useEffect(() => {
    applyTheme(data.theme);
  }, [data.theme]);

  const update = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    // Clear errors for fields being edited.
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        delete next[key];
        if (key === "invites") {
          Object.keys(next).forEach((k) => {
            if (k.startsWith("invite-")) delete next[k];
          });
        }
      }
      return next;
    });
  };

  const isLast = step === STEPS.length - 1;
  const isInviteStep = step === 2;
  const noInvites = filledInvites(data).length === 0;

  const goNext = () => {
    const found = validateStep(step, data);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      requestAnimationFrame(() => {
        const el = document.getElementById(
          firstKey === "teamSize" ? "team-size" : firstKey
        );
        el?.focus();
      });
      return;
    }
    setErrors({});
    if (isLast) {
      setSubmitting(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Storage can be unavailable; the welcome page falls back to defaults.
      }
      router.push("/welcome");
      return;
    }
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const current = STEPS[step];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {product.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Let's set up your workspace
        </h1>
        <p className="text-muted-foreground">{product.tagline}</p>
      </header>

      <Stepper current={step} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
            className="flex flex-col gap-6"
          >
            <CardHeader>
              <CardTitle>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg leading-tight outline-none"
                >
                  {current.title}
                </h2>
              </CardTitle>
              <CardDescription>{current.description}</CardDescription>
            </CardHeader>
            <CardContent aria-live="polite">
              {step === 0 && (
                <AccountStep data={data} errors={errors} update={update} />
              )}
              {step === 1 && (
                <WorkspaceStep data={data} errors={errors} update={update} />
              )}
              {step === 2 && (
                <InviteStep data={data} errors={errors} update={update} />
              )}
              {step === 3 && (
                <PreferencesStep data={data} errors={errors} update={update} />
              )}
            </CardContent>
            <CardFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={step === 0 || submitting}
                className="w-full sm:w-auto"
              >
                <ArrowLeftIcon data-icon="inline-start" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
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
                ) : isInviteStep && noInvites ? (
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

        <SummaryCard data={data} step={step} />
      </div>
    </div>
  );
}

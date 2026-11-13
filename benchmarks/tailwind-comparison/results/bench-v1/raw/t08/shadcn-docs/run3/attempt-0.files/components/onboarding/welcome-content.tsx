"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CircleCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { NEXT_STEPS, product, user } from "@/lib/data";
import {
  STORAGE_KEY,
  filledInvites,
  firstName,
  type OnboardingData,
} from "@/lib/onboarding";

const fallback: Pick<OnboardingData, "name" | "workspace" | "invites"> = {
  name: user.name,
  workspace: "Acme Labs",
  invites: [],
};

export function WelcomeContent() {
  const [info, setInfo] = useState(fallback);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingData>;
        setInfo({
          name: parsed.name?.trim() || fallback.name,
          workspace: parsed.workspace?.trim() || fallback.workspace,
          invites: Array.isArray(parsed.invites) ? parsed.invites : [],
        });
      }
    } catch {
      // Ignore malformed or unavailable storage and keep the defaults.
    }
  }, []);

  const doneCount = NEXT_STEPS.filter((s) => checked[s.id]).length;
  const percent = Math.round((doneCount / NEXT_STEPS.length) * 100);
  const invited = filledInvites({
    ...({} as OnboardingData),
    invites: info.invites,
  }).length;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col items-start gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CircleCheckIcon className="size-6" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            You're all set, {firstName(info.name)}
          </h1>
          <p className="text-muted-foreground">
            <strong className="font-medium text-foreground">
              {info.workspace}
            </strong>{" "}
            is ready on {product.name}.
            {invited > 0
              ? ` We've sent ${invited} ${invited === 1 ? "invitation" : "invitations"}.`
              : " You can invite teammates any time from Settings."}
          </p>
        </div>
        <Badge variant="secondary">Role: {user.role}</Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2 className="text-lg leading-tight">Your next steps</h2>
          </CardTitle>
          <CardDescription>
            Five small things that get a team productive in its first week.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {doneCount} of {NEXT_STEPS.length} done
              </span>
            </div>
            <Progress
              value={percent}
              aria-label="Checklist progress"
            />
          </div>
          <ul className="flex flex-col gap-2">
            {NEXT_STEPS.map((item) => {
              const Icon = item.icon;
              const id = `step-${item.id}`;
              return (
                <li key={item.id}>
                  <Label
                    htmlFor={id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-[[data-state=checked]]:bg-muted/50"
                  >
                    <Checkbox
                      id={id}
                      className="mt-0.5"
                      checked={!!checked[item.id]}
                      onCheckedChange={(value) =>
                        setChecked((prev) => ({
                          ...prev,
                          [item.id]: value === true,
                        }))
                      }
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center gap-2 text-sm leading-snug font-medium">
                        <Icon
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {item.title}
                      </span>
                      <span className="text-sm leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Label>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <ArrowLeftIcon data-icon="inline-start" />
              Back to setup
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Tick items off as you go.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

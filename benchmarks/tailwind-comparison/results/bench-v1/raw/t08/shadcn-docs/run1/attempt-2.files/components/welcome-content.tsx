"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { STORAGE_KEY, nextSteps, user, type OnboardingData } from "@/lib/data";

function readSaved(): Partial<OnboardingData> | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<OnboardingData>) : null;
  } catch {
    return null;
  }
}

export function WelcomeContent() {
  const [saved, setSaved] = useState<Partial<OnboardingData> | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // sessionStorage only exists in the browser, so read it after mount.
    setSaved(readSaved());
  }, []);

  const name = (saved?.name || user.name).trim();
  const firstName = name.split(/\s+/)[0];
  const workspace = saved?.workspace?.trim() || "Acme Labs";
  const doneCount = nextSteps.filter((s) => checked[s.id]).length;
  const percent = Math.round((doneCount / nextSteps.length) * 100);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PartyPopper className="size-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            You&apos;re all set, {firstName}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">{workspace}</span> is ready.
            {saved?.email ? (
              <> We sent a sign-in link to {saved.email}.</>
            ) : (
              <> Here&apos;s what to do next.</>
            )}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg leading-none font-semibold">Your next steps</h2>
          <CardDescription>
            Four small things that get a team value from Lumen in its first week.
          </CardDescription>
          <div className="flex items-center gap-3 pt-2">
            <Progress value={percent} aria-label="Checklist progress" className="flex-1" />
            <span className="text-sm text-muted-foreground tabular-nums">
              {doneCount} of {nextSteps.length} done
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {nextSteps.map((item) => {
              const isDone = !!checked[item.id];
              return (
                <li key={item.id}>
                  <div className="flex items-start gap-3 rounded-md border p-4">
                    <Checkbox
                      id={`step-${item.id}`}
                      checked={isDone}
                      onCheckedChange={(v) =>
                        setChecked((c) => ({ ...c, [item.id]: v === true }))
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`step-${item.id}`}
                      className="flex-col items-start gap-1.5 leading-snug"
                    >
                      <span className={isDone ? "text-muted-foreground line-through" : undefined}>
                        {item.title}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {item.description}
                      </span>
                    </Label>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
        <CardFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-muted-foreground">Signed in as {user.role.toLowerCase()}</p>
          <Button asChild variant="outline">
            <Link href="/">Run setup again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

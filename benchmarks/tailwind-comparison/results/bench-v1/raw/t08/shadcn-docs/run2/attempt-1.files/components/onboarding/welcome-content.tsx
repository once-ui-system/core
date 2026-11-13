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

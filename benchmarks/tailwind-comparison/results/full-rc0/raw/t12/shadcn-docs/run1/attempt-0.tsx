"use client"

import { useId, useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import {
  AnnoyedIcon,
  FrownIcon,
  LaughIcon,
  MehIcon,
  MessageSquarePlusIcon,
  SmileIcon,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Rating = {
  value: string
  label: string
  icon: LucideIcon
  prompt: string
}

const RATINGS: Rating[] = [
  {
    value: "1",
    label: "Very unhappy",
    icon: AnnoyedIcon,
    prompt: "What went wrong?",
  },
  {
    value: "2",
    label: "Unhappy",
    icon: FrownIcon,
    prompt: "What could we do better?",
  },
  {
    value: "3",
    label: "Okay",
    icon: MehIcon,
    prompt: "What would make it great?",
  },
  {
    value: "4",
    label: "Happy",
    icon: SmileIcon,
    prompt: "What did you like most?",
  },
  {
    value: "5",
    label: "Delighted",
    icon: LaughIcon,
    prompt: "What did you love?",
  },
]

const MAX_LENGTH = 500

const RECENT_RELEASES = [
  {
    title: "Shared dashboards",
    date: "Mar 12",
    body: "Invite teammates to view and comment on any dashboard without needing a seat.",
  },
  {
    title: "Faster CSV exports",
    date: "Feb 27",
    body: "Exports of up to 1M rows now finish in under 20 seconds and run in the background.",
  },
  {
    title: "Scheduled digests",
    date: "Feb 05",
    body: "Get a weekly summary of your key metrics delivered every Monday morning.",
  },
]

export default function Page() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState("")
  const [message, setMessage] = useState("")
  const [showError, setShowError] = useState(false)

  const ratingLabelId = useId()
  const messageId = useId()
  const errorId = useId()
  const countId = useId()

  const selected = RATINGS.find((r) => r.value === rating)

  function resetForm() {
    setRating("")
    setMessage("")
    setShowError(false)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setShowError(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) {
      setShowError(true)
      return
    }
    const trimmed = message.trim()
    toast.success("Thanks for your feedback!", {
      description: trimmed
        ? `You rated us "${selected.label}". We read every message.`
        : `You rated us "${selected.label}". We appreciate you taking the time.`,
    })
    setOpen(false)
    resetForm()
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit">
            Version 2.14
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            What&apos;s new in Northwind Analytics
          </h1>
          <p className="max-w-prose text-muted-foreground">
            We ship improvements every two weeks. Here is what landed recently
            &mdash; and we would love to hear how it is working for you.
          </p>
        </header>

        <section aria-label="Recent releases" className="grid gap-4">
          {RECENT_RELEASES.map((release) => (
            <Card key={release.title}>
              <CardHeader>
                <div className="flex items-baseline justify-between gap-4">
                  <CardTitle>{release.title}</CardTitle>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {release.date}
                  </span>
                </div>
                <CardDescription>{release.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
          <Card>
            <CardContent className="text-sm text-muted-foreground">
              Have an idea or ran into a problem? Use the feedback button in the
              corner of the screen to send us a note. It goes straight to the
              product team.
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed right-4 bottom-4 z-40 rounded-full px-5 shadow-lg sm:right-6 sm:bottom-6"
          >
            <MessageSquarePlusIcon aria-hidden="true" />
            Feedback
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} noValidate className="grid gap-5">
            <DialogHeader>
              <DialogTitle>Send us your feedback</DialogTitle>
              <DialogDescription>
                Tell us how we are doing. It only takes a minute and helps us
                decide what to build next.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label id={ratingLabelId}>How was your experience?</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                spacing={2}
                value={rating}
                onValueChange={(value) => {
                  setRating(value)
                  if (value) setShowError(false)
                }}
                aria-labelledby={ratingLabelId}
                aria-describedby={showError ? errorId : undefined}
                className="w-full flex-wrap"
              >
                {RATINGS.map((r) => {
                  const Icon = r.icon
                  return (
                    <ToggleGroupItem
                      key={r.value}
                      value={r.value}
                      aria-label={r.label}
                      title={r.label}
                      className="h-11 min-w-11 flex-1 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground sm:flex-none sm:px-4"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
              <p
                className="min-h-5 text-sm text-muted-foreground"
                aria-live="polite"
              >
                {selected ? selected.label : "Select a rating"}
              </p>
              {showError && (
                <p
                  id={errorId}
                  role="alert"
                  className="text-sm font-normal text-destructive"
                >
                  Please choose a rating before sending.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor={messageId}>
                {selected ? selected.prompt : "Anything else you want to share?"}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id={messageId}
                value={message}
                maxLength={MAX_LENGTH}
                onChange={(e) => setMessage(e.target.value)}
                aria-describedby={countId}
                placeholder="Share a detail, a bug you hit, or a feature you wish we had."
                className="min-h-28 resize-none"
              />
              <p
                id={countId}
                className="text-right text-xs text-muted-foreground"
              >
                {message.length}/{MAX_LENGTH}
              </p>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Send feedback</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

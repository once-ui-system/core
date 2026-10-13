"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  AngryIcon,
  CheckCircle2Icon,
  FrownIcon,
  LayoutDashboardIcon,
  MehIcon,
  MessageSquareIcon,
  SmileIcon,
  SparklesIcon,
  LaughIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Rating = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Terrible", icon: AngryIcon },
  { value: "2", label: "Poor", icon: FrownIcon },
  { value: "3", label: "Okay", icon: MehIcon },
  { value: "4", label: "Good", icon: SmileIcon },
  { value: "5", label: "Great", icon: LaughIcon },
];

const MAX_LENGTH = 500;

const STATS = [
  {
    label: "Active members",
    value: "1,284",
    change: "+12% vs last month",
    icon: UsersIcon,
  },
  {
    label: "Avg. response time",
    value: "2h 14m",
    change: "-18 min vs last week",
    icon: ClockIcon,
  },
  {
    label: "Tasks completed",
    value: "3,902",
    change: "+7.4% vs last month",
    icon: TrendingUpIcon,
  },
];

const UPDATES = [
  {
    title: "Roadmap view is now available",
    description:
      "Plan quarterly milestones on a timeline and share it with stakeholders.",
    tag: "New",
  },
  {
    title: "Faster CSV exports",
    description:
      "Exports of up to 100,000 rows now finish in under ten seconds.",
    tag: "Improved",
  },
  {
    title: "Keyboard shortcuts cheat sheet",
    description: "Press ? anywhere in the app to see every available shortcut.",
    tag: "New",
  },
];

function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ratingLabelId = useId();
  const messageId = useId();
  const messageHelpId = useId();
  const errorId = useId();

  const selected = RATINGS.find((r) => r.value === rating);

  function resetForm() {
    setRating("");
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) {
      setShowError(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!rating) {
      setShowError(true);
      return;
    }

    setSubmitting(true);
    // Simulate a network round trip without calling any external API.
    window.setTimeout(() => {
      const label = selected?.label ?? "your";
      setOpen(false);
      resetForm();
      toast.success("Thanks for your feedback!", {
        description: `We received your "${label}" rating and will review it shortly.`,
      });
    }, 700);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-5 shadow-lg sm:right-6 sm:bottom-6"
        >
          <MessageSquareIcon aria-hidden="true" />
          Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Tell us how Northwind is working for you. Every message is read by
              our product team.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label id={ratingLabelId}>How would you rate your experience?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={rating}
              onValueChange={(value) => {
                // Radix allows deselecting; keep the current rating instead.
                if (!value) return;
                setRating(value);
                setShowError(false);
              }}
              aria-labelledby={ratingLabelId}
              aria-describedby={showError ? errorId : undefined}
              aria-invalid={showError || undefined}
              disabled={submitting}
              className="w-full flex-wrap"
            >
              {RATINGS.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={`${value} out of 5, ${label}`}
                  className="h-auto flex-1 flex-col gap-1 px-2 py-2 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground"
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {showError ? (
              <p
                id={errorId}
                role="alert"
                className="text-sm text-destructive"
              >
                Please choose a rating before sending.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={messageId}>
              Anything you&apos;d like to add?{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
              maxLength={MAX_LENGTH}
              rows={4}
              disabled={submitting}
              placeholder="What worked well? What could be better?"
              aria-describedby={messageHelpId}
              className="max-h-48 resize-none"
            />
            <p
              id={messageHelpId}
              className="text-right text-xs text-muted-foreground"
            >
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LayoutDashboardIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Northwind</p>
            <p className="truncate text-xs text-muted-foreground">
              Team workspace
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-8 pb-28 sm:px-6 sm:pt-10">
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Workspace overview
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            A snapshot of how your team is doing this month.
          </p>
        </div>

        <section
          aria-label="Key metrics"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {STATS.map(({ label, value, change, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardDescription>{label}</CardDescription>
                <Icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{change}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section aria-labelledby="updates-heading" className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <SparklesIcon className="size-4" aria-hidden="true" />
            <h2 id="updates-heading" className="text-lg font-semibold">
              What&apos;s new
            </h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-3">
            {UPDATES.map((update) => (
              <li key={update.title}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {update.title}
                      </CardTitle>
                      <Badge variant="secondary">{update.tag}</Badge>
                    </div>
                    <CardDescription>{update.description}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2Icon className="size-4" aria-hidden="true" />
          Spotted something off? Use the Feedback button in the corner to tell
          us.
        </p>
      </main>

      <FeedbackWidget />
    </div>
  );
}

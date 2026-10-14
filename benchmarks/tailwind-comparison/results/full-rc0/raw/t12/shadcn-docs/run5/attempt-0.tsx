"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  Frown,
  Meh,
  Smile,
  SmilePlus,
  Angry,
  MessageSquareHeart,
  Send,
  Loader2,
  Rocket,
  Gauge,
  ShieldCheck,
  Users,
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

type Rating = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Terrible", icon: Angry },
  { value: "2", label: "Poor", icon: Frown },
  { value: "3", label: "Okay", icon: Meh },
  { value: "4", label: "Good", icon: Smile },
  { value: "5", label: "Excellent", icon: SmilePlus },
];

const TOPICS: string[] = ["Bug", "Idea", "Design", "Performance", "Other"];

const MAX_LENGTH = 500;
const MIN_LENGTH = 10;

const HIGHLIGHTS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Rocket,
    title: "Faster deploys",
    body: "Preview builds now finish in under 40 seconds on average, down from nearly two minutes last quarter.",
  },
  {
    icon: Gauge,
    title: "Usage insights",
    body: "The new analytics tab breaks down requests by region, route and status code with 30 days of history.",
  },
  {
    icon: ShieldCheck,
    title: "Safer access",
    body: "Role-based permissions and audit logs make it easier to review who changed what, and when.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    body: "Invite collaborators, share environments and keep project settings in sync across your whole team.",
  },
];

function FeedbackWidget() {
  const uid = useId();
  const ratingLabelId = `${uid}-rating-label`;
  const topicLabelId = `${uid}-topic-label`;
  const messageId = `${uid}-message`;
  const messageHelpId = `${uid}-message-help`;
  const errorId = `${uid}-error`;

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<string>("");
  const [topic, setTopic] = useState<string>("Idea");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const trimmed = message.trim();
  const ratingError = attempted && rating === "";
  const messageError = attempted && trimmed.length < MIN_LENGTH;
  const selectedRating = RATINGS.find((r) => r.value === rating);

  function reset() {
    setRating("");
    setTopic("Idea");
    setMessage("");
    setAttempted(false);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (rating === "" || trimmed.length < MIN_LENGTH) return;

    setSubmitting(true);
    // Simulated network round-trip.
    await new Promise<void>((resolve) => setTimeout(resolve, 900));

    toast.success("Thanks for your feedback!", {
      description: selectedRating
        ? `You rated us "${selectedRating.label}". We read every message.`
        : "We read every message.",
    });
    setSubmitting(false);
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-5 shadow-lg sm:right-6 sm:bottom-6"
        >
          <MessageSquareHeart aria-hidden="true" />
          Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Tell us how Northwind is working for you. It takes less than a
              minute.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label id={ratingLabelId}>How would you rate your experience?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={rating}
              onValueChange={(value) => setRating(value)}
              aria-labelledby={ratingLabelId}
              aria-describedby={ratingError ? `${errorId}-rating` : undefined}
              className="grid w-full grid-cols-5"
            >
              {RATINGS.map((item) => {
                const Icon = item.icon;
                return (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={`${item.value} of 5: ${item.label}`}
                    className="h-auto w-full flex-col gap-1 px-1 py-2 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span className="text-[11px] leading-none font-medium">
                      {item.label}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {ratingError && (
              <p
                id={`${errorId}-rating`}
                role="alert"
                className="text-sm text-destructive"
              >
                Please pick a rating.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label id={topicLabelId}>What is this about?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={2}
              value={topic}
              onValueChange={(value) => {
                if (value) setTopic(value);
              }}
              aria-labelledby={topicLabelId}
              className="w-full flex-wrap"
            >
              {TOPICS.map((item) => (
                <ToggleGroupItem
                  key={item}
                  value={item}
                  className="rounded-full data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {item}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={messageId}>Your message</Label>
            <Textarea
              id={messageId}
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="e.g. The new analytics tab is great, but I'd love to export the charts as CSV."
              aria-invalid={messageError}
              aria-describedby={`${messageHelpId}${
                messageError ? ` ${errorId}-message` : ""
              }`}
              className="min-h-28 resize-none"
            />
            <div className="flex items-start justify-between gap-3 text-xs">
              <p
                id={`${errorId}-message`}
                role={messageError ? "alert" : undefined}
                className="text-sm text-destructive"
              >
                {messageError
                  ? `Please write at least ${MIN_LENGTH} characters.`
                  : null}
              </p>
              <p
                id={messageHelpId}
                className="ml-auto shrink-0 text-muted-foreground tabular-nums"
              >
                {message.length}/{MAX_LENGTH}
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Send aria-hidden="true" />
              )}
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
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold tracking-tight">
            Northwind
          </span>
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-6">
            <a href="#highlights" className="rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
              Highlights
            </a>
            <a href="#changelog" className="rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
              Changelog
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-12 pb-32 sm:px-6 sm:pt-20">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Release 4.2 · March update
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Ship faster, with fewer surprises.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Northwind brings deploys, analytics and team access together in one
            calm workspace. Take a look around, then tell us what you think
            using the feedback button in the corner.
          </p>
        </section>

        <section
          id="highlights"
          aria-labelledby="highlights-heading"
          className="mt-14"
        >
          <h2
            id="highlights-heading"
            className="text-xl font-semibold tracking-tight"
          >
            What&apos;s new
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
                >
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          id="changelog"
          aria-labelledby="changelog-heading"
          className="mt-14"
        >
          <h2
            id="changelog-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Recent changes
          </h2>
          <ul className="mt-6 divide-y rounded-xl border">
            {[
              {
                date: "Mar 18",
                text: "Added CSV export for deployment logs.",
              },
              {
                date: "Mar 11",
                text: "Fixed a bug where environment variables were not synced to preview builds.",
              },
              {
                date: "Mar 04",
                text: "Improved cold-start times for edge functions by roughly 35%.",
              },
            ].map((entry) => (
              <li
                key={entry.date}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <span className="w-16 shrink-0 text-sm font-medium tabular-nums text-muted-foreground">
                  {entry.date}
                </span>
                <span className="text-sm">{entry.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}

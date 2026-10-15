```tsx
"use client";

import * as React from "react";
import {
  Bug,
  CheckCircle2,
  Frown,
  Lightbulb,
  Meh,
  MessageSquareHeart,
  MessageSquareText,
  Smile,
  SmilePlus,
  Sparkles,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

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

type Topic = {
  value: string;
  label: string;
  icon: LucideIcon;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Frustrating", icon: Frown },
  { value: "2", label: "Not great", icon: Meh },
  { value: "3", label: "Okay", icon: Meh },
  { value: "4", label: "Good", icon: Smile },
  { value: "5", label: "Delightful", icon: SmilePlus },
];

const TOPICS: Topic[] = [
  { value: "idea", label: "Idea", icon: Lightbulb },
  { value: "bug", label: "Bug", icon: Bug },
  { value: "praise", label: "Praise", icon: Sparkles },
  { value: "other", label: "Other", icon: MessageSquareText },
];

const MAX_LENGTH = 500;

const HIGHLIGHTS = [
  {
    title: "Offline trail maps",
    body: "Download any region before you lose signal. Maps stay sharp down to 10 meter contours.",
  },
  {
    title: "Group check-ins",
    body: "Share a live location with up to eight friends and get notified when everyone reaches the summit.",
  },
  {
    title: "Weather windows",
    body: "Hourly forecasts at trailhead elevation, so you know when to start and when to turn back.",
  },
];

function FeedbackWidget() {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState("");
  const [topic, setTopic] = React.useState("idea");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [showErrors, setShowErrors] = React.useState(false);

  const ratingError = showErrors && rating === "";
  const messageError = showErrors && message.trim().length < 10;

  const reset = () => {
    setRating("");
    setTopic("idea");
    setMessage("");
    setShowErrors(false);
    setSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    if (rating === "" || message.trim().length < 10) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    const selected = RATINGS.find((r) => r.value === rating);

    window.setTimeout(() => {
      setOpen(false);
      reset();
      toast.success("Thanks for your feedback!", {
        description: `We logged your "${selected?.label ?? "rating"}" note. The team reads every message.`,
      });
    }, 700);
  };

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
              Tell us how Trailhead is working for you. It takes less than a
              minute.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label id="rating-label">How was your experience?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={rating}
              onValueChange={(value) => setRating(value)}
              aria-labelledby="rating-label"
              aria-describedby={ratingError ? "rating-error" : undefined}
              aria-invalid={ratingError || undefined}
              className="grid w-full grid-cols-5"
            >
              {RATINGS.map((item) => {
                const Icon = item.icon;
                return (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={`${item.value} of 5: ${item.label}`}
                    className="h-14 w-full flex-col gap-0.5 px-1 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span aria-hidden="true" className="font-semibold">
                      {item.value}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            <div
              className="flex justify-between text-xs text-muted-foreground"
              aria-hidden="true"
            >
              <span>Frustrating</span>
              <span>Delightful</span>
            </div>
            <p aria-live="polite" className="min-h-4 text-xs">
              {ratingError ? (
                <span id="rating-error" className="text-destructive">
                  Please pick a rating.
                </span>
              ) : rating !== "" ? (
                <span className="text-muted-foreground">
                  You selected: {RATINGS.find((r) => r.value === rating)?.label}
                </span>
              ) : null}
            </p>
          </div>

          <div className="grid gap-2">
            <Label id="topic-label">What is this about?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={topic}
              onValueChange={(value) => {
                if (value) setTopic(value);
              }}
              aria-labelledby="topic-label"
              className="flex w-full flex-wrap"
            >
              {TOPICS.map((item) => {
                const Icon = item.icon;
                return (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    size="sm"
                    className="gap-1.5 rounded-full px-3 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  >
                    <Icon aria-hidden="true" />
                    {item.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-message">Your message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value.slice(0, MAX_LENGTH))
              }
              placeholder="e.g. The offline map for the Cascades region would not finish downloading on mobile data."
              rows={4}
              maxLength={MAX_LENGTH}
              aria-invalid={messageError || undefined}
              aria-describedby="message-hint"
              className="max-h-48 min-h-24 resize-none"
            />
            <div
              id="message-hint"
              className="flex items-start justify-between gap-3 text-xs"
            >
              <span
                aria-live="polite"
                className={
                  messageError ? "text-destructive" : "text-muted-foreground"
                }
              >
                {messageError
                  ? "Please write at least 10 characters."
                  : "The more detail, the better."}
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {message.length}/{MAX_LENGTH}
              </span>
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
                <>
                  <Loader2 aria-hidden="true" className="animate-spin" />
                  Sending…
                </>
              ) : (
                "Send feedback"
              )}
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-base font-semibold tracking-tight">
            Trailhead
          </span>
          <nav aria-label="Primary" className="flex gap-4 text-sm text-muted-foreground sm:gap-6">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#changelog" className="hover:text-foreground">
              Changelog
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-12 pb-32 sm:px-6 sm:pt-20">
        <section className="max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <CheckCircle2 aria-hidden="true" className="size-3.5" />
            Version 4.2 is now available
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Plan the hike. Leave the signal behind.
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Trailhead keeps your maps, weather and group in one place, even when
            your phone has no bars. Tried the new release? We would love to hear
            how it went.
          </p>
        </section>

        <section id="features" aria-labelledby="features-heading" className="mt-14 sm:mt-20">
          <h2 id="features-heading" className="text-xl font-semibold tracking-tight">
            What is new in 4.2
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="rounded-xl border p-5">
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section id="changelog" aria-labelledby="changelog-heading" className="mt-14 sm:mt-20">
          <h2 id="changelog-heading" className="text-xl font-semibold tracking-tight">
            Recent changes
          </h2>
          <ul className="mt-4 divide-y rounded-xl border text-sm">
            <li className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
              <span>Faster route recalculation when you leave the trail</span>
              <span className="text-muted-foreground">March 12</span>
            </li>
            <li className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
              <span>Fixed crash when importing GPX files over 20 MB</span>
              <span className="text-muted-foreground">March 4</span>
            </li>
            <li className="flex flex-col gap-1 p-4 sm:flex-row sm:justify-between">
              <span>New dark map style for night navigation</span>
              <span className="text-muted-foreground">February 21</span>
            </li>
          </ul>
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}
```
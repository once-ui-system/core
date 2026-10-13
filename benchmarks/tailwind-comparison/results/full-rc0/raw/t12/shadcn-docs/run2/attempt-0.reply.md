```tsx
"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import {
  Angry,
  Frown,
  Heart,
  Laugh,
  MessageSquareHeart,
  Meh,
  Smile,
  Sparkles,
  Zap,
  ShieldCheck,
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
  prompt: string;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Awful", icon: Angry, prompt: "What went wrong?" },
  { value: "2", label: "Poor", icon: Frown, prompt: "What could we do better?" },
  { value: "3", label: "Okay", icon: Meh, prompt: "What would make it great?" },
  { value: "4", label: "Good", icon: Smile, prompt: "What did you like most?" },
  { value: "5", label: "Love it", icon: Laugh, prompt: "What made your day?" },
];

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Faster project sync",
    body: "Workspaces now sync in under two seconds, even on large boards with thousands of cards.",
  },
  {
    icon: ShieldCheck,
    title: "Granular permissions",
    body: "Give contractors view-only access to a single board without exposing the rest of your workspace.",
  },
  {
    icon: Sparkles,
    title: "Smart summaries",
    body: "Weekly digests highlight blocked tasks, overdue items and who is waiting on whom.",
  },
];

const MAX_LENGTH = 500;

function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const ratingLabelId = useId();
  const messageId = useId();
  const errorId = useId();
  const counterId = useId();

  const selected = RATINGS.find((r) => r.value === rating);

  function reset() {
    setRating("");
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    // Simulate a network round trip.
    await new Promise((resolve) => setTimeout(resolve, 600));
    const label = selected?.label ?? "";
    setOpen(false);
    reset();
    toast.success("Thanks for your feedback!", {
      description: `We recorded your "${label}" rating. Our team reads every response.`,
    });
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

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Tell us how Tidewater is working for you. It takes less than a
              minute.
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
                setRating(value);
                if (value) setShowError(false);
              }}
              aria-labelledby={ratingLabelId}
              aria-describedby={showError ? errorId : undefined}
              className="grid w-full grid-cols-5"
            >
              {RATINGS.map((item) => {
                const Icon = item.icon;
                return (
                  <ToggleGroupItem
                    key={item.value}
                    value={item.value}
                    aria-label={`${item.label} (${item.value} of 5)`}
                    className="h-auto w-full flex-col gap-1 px-1 py-2 data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-foreground"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span className="text-[11px] leading-none font-medium">
                      {item.label}
                    </span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {showError && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                Please pick a rating before sending.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor={messageId}>
              {selected ? selected.prompt : "Anything you'd like to add?"}{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id={messageId}
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              aria-describedby={counterId}
              placeholder="e.g. The new board filters are great, but I couldn't find how to save a view."
              className="min-h-28 resize-none"
            />
            <p
              id={counterId}
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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Heart aria-hidden="true" className="size-4" />
            </span>
            Tidewater
          </div>
          <nav aria-label="Primary" className="flex gap-4 text-sm text-muted-foreground sm:gap-6">
            <span>Boards</span>
            <span>Roadmap</span>
            <span className="hidden sm:inline">Changelog</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-12 pb-32 sm:px-6 sm:pt-20">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Release 4.12 · March 2025
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Plan work the way your team actually does it
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Tidewater brings boards, timelines and weekly digests together so
            nothing slips between meetings. Try the latest release and tell us
            what you think using the feedback button in the corner.
          </p>
        </section>

        <section
          aria-labelledby="highlights-heading"
          className="mt-12 sm:mt-16"
        >
          <h2 id="highlights-heading" className="text-xl font-semibold">
            What&apos;s new
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="rounded-xl border bg-card p-5 text-card-foreground shadow-xs"
                >
                  <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <h3 className="mt-4 font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}
```
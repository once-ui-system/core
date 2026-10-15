"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  Angry,
  Frown,
  Laugh,
  Meh,
  MessageSquarePlus,
  Send,
  Smile,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  { value: "1", label: "Terrible", icon: Angry, prompt: "What went wrong?" },
  { value: "2", label: "Poor", icon: Frown, prompt: "What could we fix first?" },
  { value: "3", label: "Okay", icon: Meh, prompt: "What would make it better?" },
  { value: "4", label: "Good", icon: Smile, prompt: "What did you enjoy most?" },
  { value: "5", label: "Great", icon: Laugh, prompt: "What made it great?" },
];

const MAX_LENGTH = 500;

const HIGHLIGHTS = [
  {
    title: "Shared workspaces",
    body: "Invite teammates to a project and see their edits appear live, with per-section comment threads.",
  },
  {
    title: "Scheduled exports",
    body: "Send a weekly PDF or CSV summary to your clients every Monday at 8:00 without lifting a finger.",
  },
  {
    title: "Usage insights",
    body: "Track which reports your team opens most and trim the ones nobody reads.",
  },
];

function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const selected = RATINGS.find((r) => r.value === rating);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setShowError(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) {
      setShowError(true);
      return;
    }
    toast.success("Thanks for your feedback!", {
      description: `You rated your experience "${selected.label}". Our team reads every note.`,
    });
    setOpen(false);
    setRating("");
    setMessage("");
    setShowError(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-5 shadow-lg sm:right-6 sm:bottom-6"
        >
          <MessageSquarePlus aria-hidden="true" />
          Feedback
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Share your feedback</DialogTitle>
            <DialogDescription>
              Tell us how Ledgerly is working for you. It takes less than a
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
              onValueChange={(value) => {
                if (value) {
                  setRating(value);
                  setShowError(false);
                }
              }}
              aria-labelledby="rating-label"
              aria-describedby={showError ? "rating-error" : undefined}
              className="flex w-full flex-wrap"
            >
              {RATINGS.map((r) => {
                const Icon = r.icon;
                return (
                  <ToggleGroupItem
                    key={r.value}
                    value={r.value}
                    aria-label={`${r.value} of 5: ${r.label}`}
                    className="h-auto flex-1 basis-[4.5rem] flex-col gap-1 rounded-lg py-2 data-[state=on]:border-primary data-[state=on]:bg-primary/10"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    <span className="text-xs">{r.label}</span>
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
            {showError && (
              <p
                id="rating-error"
                role="alert"
                className="text-sm text-destructive"
              >
                Please pick a rating before sending.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="feedback-message">
              {selected ? selected.prompt : "Anything you'd like to add?"}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. The new export screen is great, but I couldn't find where to change the date format."
              className="min-h-28 resize-none"
              aria-describedby="feedback-count"
            />
            <p
              id="feedback-count"
              className="text-right text-xs text-muted-foreground tabular-nums"
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
            <Button type="submit">
              <Send aria-hidden="true" />
              Send feedback
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
          <span className="text-lg font-semibold tracking-tight">Ledgerly</span>
          <nav aria-label="Primary" className="flex gap-4 text-sm text-muted-foreground">
            <span>Reports</span>
            <span>Clients</span>
            <span className="hidden sm:inline">Billing</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            What&apos;s new in March
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Reporting that keeps your whole team on the same page
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            We shipped three updates this month based on requests from
            customers like you. Try them out, then let us know how they work
            with the feedback button in the corner.
          </p>
        </section>

        <section
          aria-label="Recent updates"
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="rounded-xl border bg-card p-5 shadow-xs">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}

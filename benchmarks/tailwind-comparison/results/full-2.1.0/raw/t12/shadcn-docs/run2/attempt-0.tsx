"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircleIcon,
  AngryIcon,
  FrownIcon,
  Loader2Icon,
  MehIcon,
  MessageSquarePlusIcon,
  SmileIcon,
  LaughIcon,
  ReceiptIcon,
  CreditCardIcon,
  UsersIcon,
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

const RATINGS: Rating[] = [
  { value: "1", label: "Terrible", icon: AngryIcon },
  { value: "2", label: "Poor", icon: FrownIcon },
  { value: "3", label: "Okay", icon: MehIcon },
  { value: "4", label: "Good", icon: SmileIcon },
  { value: "5", label: "Excellent", icon: LaughIcon },
];

const MAX_COMMENT_LENGTH = 500;

const SUMMARY_CARDS: {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Outstanding invoices",
    value: "$12,480.00",
    note: "7 invoices, 2 overdue",
    icon: ReceiptIcon,
  },
  {
    title: "Next payment",
    value: "Mar 14",
    note: "Visa ending in 4242",
    icon: CreditCardIcon,
  },
  {
    title: "Seats in use",
    value: "18 / 25",
    note: "7 seats available on the Team plan",
    icon: UsersIcon,
  },
];

const RECENT_INVOICES = [
  { id: "INV-2041", client: "Northwind Traders", amount: "$3,200.00", status: "Paid" },
  { id: "INV-2040", client: "Bluebird Studio", amount: "$1,150.00", status: "Pending" },
  { id: "INV-2039", client: "Harbor & Finch LLP", amount: "$4,830.00", status: "Overdue" },
  { id: "INV-2038", client: "Lumen Health", amount: "$2,400.00", status: "Paid" },
];

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  Pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  Overdue: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

function FeedbackWidget() {
  const baseId = useId();
  const ratingLabelId = `${baseId}-rating-label`;
  const ratingErrorId = `${baseId}-rating-error`;
  const commentId = `${baseId}-comment`;
  const commentHintId = `${baseId}-comment-hint`;

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [showRatingError, setShowRatingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const ratingGroupRef = useRef<HTMLDivElement>(null);

  const selected = RATINGS.find((r) => r.value === rating);

  function reset() {
    setRating("");
    setComment("");
    setShowRatingError(false);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  function handleRatingChange(value: string) {
    // Radix returns "" when the active chip is clicked again; allow deselecting.
    setRating(value);
    if (value) setShowRatingError(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!rating) {
      setShowRatingError(true);
      ratingGroupRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      const label = selected?.label ?? "your";
      setOpen(false);
      reset();
      toast.success("Thanks for your feedback!", {
        description: `We recorded a rating of "${label}". Our team reads every response.`,
      });
    }, 900);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-5 shadow-lg sm:right-6 sm:bottom-6"
        >
          <MessageSquarePlusIcon aria-hidden="true" />
          <span className="hidden sm:inline">Feedback</span>
          <span className="sr-only sm:hidden">Give feedback</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <DialogHeader>
            <DialogTitle>Send us your feedback</DialogTitle>
            <DialogDescription>
              Tell us how Acme Billing is working for you. It takes less than a minute.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label id={ratingLabelId} className="leading-snug">
              How would you rate your experience?
            </Label>
            <ToggleGroup
              ref={ratingGroupRef}
              type="single"
              variant="outline"
              spacing={2}
              value={rating}
              onValueChange={handleRatingChange}
              disabled={submitting}
              aria-labelledby={ratingLabelId}
              aria-describedby={showRatingError ? ratingErrorId : undefined}
              aria-invalid={showRatingError || undefined}
              className="grid w-full grid-cols-5 gap-1.5 sm:gap-2"
            >
              {RATINGS.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={`${value} of 5: ${label}`}
                  className="h-auto min-w-0 flex-col gap-1 px-1 py-2.5 text-xs data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="max-w-full truncate" aria-hidden="true">
                    {label}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="min-h-5 text-sm" aria-live="polite">
              {showRatingError ? (
                <span
                  id={ratingErrorId}
                  className="flex items-center gap-1.5 text-destructive"
                >
                  <AlertCircleIcon className="size-4" aria-hidden="true" />
                  Please choose a rating before sending.
                </span>
              ) : selected ? (
                <span className="text-muted-foreground">
                  You selected: {selected.label}
                </span>
              ) : null}
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor={commentId}>
                Anything else we should know?{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <span
                className="text-xs text-muted-foreground tabular-nums"
                aria-hidden="true"
              >
                {comment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
            <Textarea
              id={commentId}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={MAX_COMMENT_LENGTH}
              disabled={submitting}
              aria-describedby={commentHintId}
              placeholder="e.g. Exporting invoices to CSV would save me hours each month."
              className="min-h-28 resize-none"
            />
            <p id={commentHintId} className="sr-only">
              Maximum {MAX_COMMENT_LENGTH} characters. {comment.length} used.
            </p>
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
                  <Loader2Icon className="animate-spin" aria-hidden="true" />
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
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <ReceiptIcon className="size-4" />
            </div>
            <span className="text-base font-semibold">Acme Billing</span>
          </div>
          <p className="truncate text-sm text-muted-foreground">
            maya.ortiz@northwind.example
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Billing overview
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track invoices, payments and seat usage for your workspace.
          </p>
        </div>

        <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUMMARY_CARDS.map(({ title, value, note, icon: Icon }) => (
            <div key={title} className="rounded-xl border bg-background p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </div>
          ))}
        </section>

        <section aria-labelledby="recent-invoices" className="mt-8">
          <h2 id="recent-invoices" className="mb-3 text-lg font-semibold">
            Recent invoices
          </h2>
          <ul className="divide-y rounded-xl border bg-background shadow-xs">
            {RECENT_INVOICES.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{invoice.client}</p>
                  <p className="text-xs text-muted-foreground">{invoice.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium tabular-nums">
                    {invoice.amount}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[invoice.status]}`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}

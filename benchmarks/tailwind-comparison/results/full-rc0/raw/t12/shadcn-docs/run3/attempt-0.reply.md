```tsx
"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  AngryIcon,
  CheckCircle2Icon,
  FrownIcon,
  MehIcon,
  MessageSquareHeartIcon,
  SmileIcon,
  SendIcon,
  LaughIcon,
  TrendingUpIcon,
  ReceiptTextIcon,
  UsersIcon,
  ClockIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Rating = {
  value: string;
  label: string;
  icon: typeof SmileIcon;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Very unhappy", icon: AngryIcon },
  { value: "2", label: "Unhappy", icon: FrownIcon },
  { value: "3", label: "Neutral", icon: MehIcon },
  { value: "4", label: "Happy", icon: SmileIcon },
  { value: "5", label: "Delighted", icon: LaughIcon },
];

const MAX_LENGTH = 500;

const STATS = [
  {
    label: "Outstanding invoices",
    value: "$18,420",
    note: "7 invoices across 5 clients",
    icon: ReceiptTextIcon,
  },
  {
    label: "Collected this month",
    value: "$42,915",
    note: "+12.4% vs. last month",
    icon: TrendingUpIcon,
  },
  {
    label: "Active clients",
    value: "38",
    note: "3 new since Monday",
    icon: UsersIcon,
  },
  {
    label: "Avg. days to payment",
    value: "11.2",
    note: "Down from 14.6 days",
    icon: ClockIcon,
  },
];

const RECENT = [
  { client: "Northwind Studio", invoice: "INV-2041", amount: "$3,200.00", status: "Paid" },
  { client: "Harbor & Pine", invoice: "INV-2040", amount: "$1,480.00", status: "Pending" },
  { client: "Alder Labs", invoice: "INV-2039", amount: "$6,750.00", status: "Paid" },
  { client: "Kestrel Coffee Co.", invoice: "INV-2038", amount: "$920.00", status: "Overdue" },
];

function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const messageId = useId();
  const counterId = useId();

  const selected = RATINGS.find((r) => r.value === rating);

  function reset() {
    setRating("");
    setMessage("");
    setError(null);
    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    setOpen(next);
    if (!next) reset();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!selected) {
      setError("Please choose a rating before sending.");
      return;
    }

    setError(null);
    setSubmitting(true);
    // Simulate a network round-trip.
    await new Promise((resolve) => setTimeout(resolve, 900));

    toast.success("Thanks for your feedback!", {
      description: `You rated your experience “${selected.label}”. Our team reads every message.`,
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
          <MessageSquareHeartIcon aria-hidden="true" />
          <span>Feedback</span>
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
            <Label id={ratingLabelId}>How was your experience?</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={2}
              value={rating}
              onValueChange={(value) => {
                setRating(value);
                if (value) setError(null);
              }}
              aria-labelledby={ratingLabelId}
              aria-describedby={error ? ratingErrorId : undefined}
              aria-invalid={error ? true : undefined}
              className="grid w-full grid-cols-5 gap-2"
            >
              {RATINGS.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={label}
                  title={label}
                  className="h-12 w-full data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p
              className="min-h-5 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {selected ? selected.label : "Select one of the five faces."}
            </p>
            {error ? (
              <p
                id={ratingErrorId}
                role="alert"
                className="flex items-center gap-1.5 text-sm text-destructive"
              >
                <AlertCircleIcon className="size-4" aria-hidden="true" />
                {error}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor={messageId}>
                Anything we should know?{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <span
                id={counterId}
                className="text-xs text-muted-foreground tabular-nums"
              >
                {message.length}/{MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id={messageId}
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
              aria-describedby={counterId}
              placeholder="e.g. I'd love to schedule recurring invoices for retainer clients."
              className="min-h-28 resize-none"
            />
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
                  <Spinner aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  <SendIcon aria-hidden="true" />
                  Send feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function statusVariant(status: string) {
  if (status === "Paid") return "secondary" as const;
  if (status === "Overdue") return "destructive" as const;
  return "outline" as const;
}

export default function Page() {
  return (
    <div className="min-h-dvh bg-muted/30">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 pb-28 sm:px-6 sm:py-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Ledgerly · Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Good morning, Priya
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Here is where your billing stands today. Spotted something
            confusing or missing? Use the feedback button in the corner and let
            us know.
          </p>
        </header>

        <section
          aria-label="Key figures"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map(({ label, value, note, icon: Icon }) => (
            <Card key={label} className="gap-3 py-5">
              <CardHeader className="gap-1">
                <div className="flex items-center justify-between gap-2">
                  <CardDescription>{label}</CardDescription>
                  <Icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section aria-labelledby="recent-heading">
          <Card>
            <CardHeader>
              <CardTitle id="recent-heading">Recent invoices</CardTitle>
              <CardDescription>
                The four most recently issued invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {RECENT.map((item) => (
                  <li
                    key={item.invoice}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.invoice}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {item.amount}
                      </span>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status === "Paid" ? (
                          <CheckCircle2Icon aria-hidden="true" />
                        ) : null}
                        {item.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>

      <FeedbackWidget />
    </div>
  );
}
```
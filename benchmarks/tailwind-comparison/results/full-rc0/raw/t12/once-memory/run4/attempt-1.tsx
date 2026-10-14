"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { CSSProperties, FormEvent, KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Heading,
  Row,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";

type Rating = {
  value: number;
  label: string;
  emoji: string;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Poor", emoji: "😞" },
  { value: 2, label: "Fair", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "🤩" },
];

const MAX_LENGTH = 500;

const RECENT_UPDATES: { title: string; body: string; date: string }[] = [
  {
    title: "Faster project imports",
    body: "Importing a CSV with 10,000 rows now finishes in under four seconds, down from about thirty.",
    date: "Mar 12",
  },
  {
    title: "Shared dashboards",
    body: "Invite teammates to a dashboard with view-only or edit access, and revoke links at any time.",
    date: "Feb 27",
  },
  {
    title: "Dark mode refinements",
    body: "Improved contrast on charts, tables and form controls so long reporting sessions are easier on the eyes.",
    date: "Feb 9",
  },
];

const chipBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  minHeight: "2.75rem",
  padding: "0 1rem",
  borderRadius: "999px",
  borderWidth: "1px",
  borderStyle: "solid",
  fontFamily: "var(--font-label)",
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "background 120ms ease, border-color 120ms ease",
};

function RatingChips({
  value,
  onChange,
  labelledBy,
  invalid,
  describedBy,
}: {
  value: number | null;
  onChange: (next: number) => void;
  labelledBy: string;
  invalid: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % RATINGS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + RATINGS.length) % RATINGS.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = RATINGS.length - 1;
    }
    if (next >= 0) {
      event.preventDefault();
      onChange(RATINGS[next].value);
      refs.current[next]?.focus();
    }
  };

  const selectedIndex = RATINGS.findIndex((r) => r.value === value);

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      {RATINGS.map((rating, index) => {
        const checked = rating.value === value;
        const focusable = checked || (selectedIndex === -1 && index === 0);
        return (
          <button
            key={rating.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={focusable ? 0 : -1}
            onClick={() => onChange(rating.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={{
              ...chipBase,
              color: checked ? "var(--brand-on-background-strong)" : "var(--neutral-on-background-strong)",
              background: checked ? "var(--brand-alpha-medium)" : "var(--surface-background)",
              borderColor: checked
                ? "var(--brand-border-strong)"
                : invalid
                  ? "var(--danger-border-strong)"
                  : "var(--neutral-border-medium)",
              fontWeight: checked ? 600 : 400,
            }}
          >
            <span aria-hidden="true" style={{ fontSize: "1.125rem", lineHeight: 1 }}>
              {rating.emoji}
            </span>
            <span>{rating.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Page() {
  const { addToast } = useToast();
  const uid = useId();
  const ratingLabelId = `${uid}-rating-label`;
  const ratingErrorId = `${uid}-rating-error`;

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const ratingError = submitted && rating === null;
  const messageError = submitted && message.trim().length === 0;

  const reset = useCallback(() => {
    setRating(null);
    setMessage("");
    setSubmitted(false);
    setSubmitting(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
    // Return focus to the trigger once the dialog has unmounted.
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [reset]);

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      setSubmitted(true);
      if (rating === null || message.trim().length === 0) return;

      setSubmitting(true);
      const chosen = RATINGS.find((r) => r.value === rating);
      window.setTimeout(() => {
        addToast({
          variant: "success",
          message: `Thanks for your feedback! You rated us "${chosen?.label ?? rating}".`,
        });
        setOpen(false);
        reset();
        window.setTimeout(() => triggerRef.current?.focus(), 0);
      }, 400);
    },
    [addToast, message, rating, reset],
  );

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="l"
      paddingTop="xl"
      paddingBottom="xl"
      gap="xl"
      style={{ minHeight: "100vh" }}
    >
      <Column maxWidth={40} fillWidth gap="32">
        <Column gap="12" paddingTop="24">
          <Text variant="label-default-s" onBackground="brand-weak">
            Product updates
          </Text>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            What&apos;s new in Meridian Analytics
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            A quick look at what the team shipped this quarter. Tried something and have thoughts? Use the
            feedback button in the corner of your screen. We read every message.
          </Text>
        </Column>

        <Column gap="16" as="section" aria-label="Recent updates">
          {RECENT_UPDATES.map((item) => (
            <Column
              key={item.title}
              as="article"
              background="surface"
              border="neutral-medium"
              radius="l"
              padding="20"
              gap="8"
            >
              <Row horizontal="between" vertical="center" gap="12" wrap>
                <Heading as="h2" variant="heading-strong-m">
                  {item.title}
                </Heading>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {item.date}
                </Text>
              </Row>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {item.body}
              </Text>
            </Column>
          ))}
        </Column>
      </Column>

      <div
        style={{
          position: "fixed",
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          zIndex: 5,
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            minHeight: "3rem",
            padding: "0 1.25rem",
            borderRadius: "999px",
            border: "1px solid var(--brand-border-strong)",
            background: "var(--brand-solid-strong)",
            color: "var(--brand-on-solid-strong)",
            fontFamily: "var(--font-label)",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <span aria-hidden="true">💬</span>
          <span>Feedback</span>
        </button>
      </div>

      <Dialog
        open={open}
        onClose={close}
        title="Send us your feedback"
        description="Tell us how Meridian is working for you. It takes less than a minute."
        footer={
          <Row fillWidth horizontal="end" gap="8" wrap>
            <Button variant="tertiary" size="m" onClick={close} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="m" onClick={() => handleSubmit()} loading={submitting}>
              Send feedback
            </Button>
          </Row>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          <Column gap="20" fillWidth>
            <Column gap="8">
              <Text id={ratingLabelId} variant="label-default-s" onBackground="neutral-strong">
                How would you rate your experience?
              </Text>
              <RatingChips
                value={rating}
                onChange={setRating}
                labelledBy={ratingLabelId}
                invalid={ratingError}
                describedBy={ratingError ? ratingErrorId : undefined}
              />
              {ratingError && (
                <Text id={ratingErrorId} role="alert" variant="body-default-s" onBackground="danger-medium">
                  Please choose a rating.
                </Text>
              )}
            </Column>

            <Textarea
              id={`${uid}-message`}
              label="What could we improve?"
              lines={4}
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(event) => setMessage(event.target.value)}
              error={messageError}
              errorMessage={messageError ? "Please share a few words with us." : undefined}
            />
            <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
              {message.length}/{MAX_LENGTH} characters
            </Text>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

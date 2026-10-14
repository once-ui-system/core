"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Heading,
  Icon,
  Row,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";

type Rating = {
  value: number;
  label: string;
  emoji: string;
  hint: string;
};

const RATINGS: Rating[] = [
  { value: 1, label: "Poor", emoji: "😞", hint: "Something is badly broken" },
  { value: 2, label: "Fair", emoji: "🙁", hint: "It needs real work" },
  { value: 3, label: "Okay", emoji: "😐", hint: "Does the job, nothing more" },
  { value: 4, label: "Good", emoji: "🙂", hint: "Works well for me" },
  { value: 5, label: "Great", emoji: "🤩", hint: "I love using it" },
];

const RECENT_UPDATES: { title: string; date: string; body: string }[] = [
  {
    title: "Shared dashboards",
    date: "Mar 12",
    body: "Invite teammates to view and comment on any dashboard without needing a paid seat.",
  },
  {
    title: "Faster CSV exports",
    date: "Feb 27",
    body: "Exports of large reports are now generated in the background and delivered by email.",
  },
  {
    title: "Dark mode refinements",
    date: "Feb 09",
    body: "Improved contrast on charts, tables and form controls across the whole workspace.",
  },
];

const MAX_LENGTH = 500;

type RatingChipsProps = {
  value: number | null;
  onChange: (value: number) => void;
  labelledBy: string;
  describedBy?: string;
};

function RatingChips({ value, onChange, labelledBy, describedBy }: RatingChipsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusAndSelect = (index: number) => {
    const next = (index + RATINGS.length) % RATINGS.length;
    onChange(RATINGS[next].value);
    refs.current[next]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(RATINGS.length - 1);
        break;
      default:
        break;
    }
  };

  // Roving tabindex: the selected chip is tabbable, or the first one if none is selected.
  const tabbableIndex = value === null ? 0 : RATINGS.findIndex((r) => r.value === value);

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--static-space-8)",
      }}
    >
      {RATINGS.map((rating, index) => {
        const selected = rating.value === value;
        return (
          <button
            key={rating.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${rating.value} of 5, ${rating.label}`}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onChange(rating.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={{
              flex: "1 1 4.5rem",
              minWidth: "4.25rem",
              minHeight: "3.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              padding: "var(--static-space-8) var(--static-space-12)",
              borderRadius: "var(--radius-m)",
              border: selected
                ? "2px solid var(--brand-solid-strong)"
                : "1px solid var(--neutral-alpha-medium)",
              background: selected ? "var(--brand-alpha-weak)" : "var(--surface-background)",
              color: "var(--neutral-on-background-strong)",
              cursor: "pointer",
              font: "inherit",
              transition: "background 150ms ease, border-color 150ms ease, transform 150ms ease",
            }}
          >
            <span aria-hidden="true" style={{ fontSize: "1.375rem", lineHeight: 1 }}>
              {rating.emoji}
            </span>
            <span aria-hidden="true" style={{ fontSize: "0.8125rem", fontWeight: selected ? 600 : 500 }}>
              {rating.label}
            </span>
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
  const ratingHintId = `${uid}-rating-hint`;
  const commentId = `${uid}-comment`;

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedRating = useMemo(() => RATINGS.find((r) => r.value === rating) ?? null, [rating]);

  const ratingError = showErrors && rating === null;
  const commentError = showErrors && rating !== null && rating <= 2 && comment.trim().length < 10;

  const reset = useCallback(() => {
    setRating(null);
    setComment("");
    setShowErrors(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    // Return focus to the trigger once the dialog has unmounted.
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [submitting]);

  const handleSubmit = useCallback(() => {
    setShowErrors(true);
    if (rating === null) return;
    if (rating <= 2 && comment.trim().length < 10) return;

    setSubmitting(true);
    // Simulate a short network round trip.
    window.setTimeout(() => {
      setOpen(false);
      addToast({
        variant: "success",
        message: "Thanks for your feedback! Our team reads every response.",
      });
      reset();
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    }, 700);
  }, [addToast, comment, rating, reset]);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="m" paddingTop="xl" paddingBottom="128">
      <Column fillWidth maxWidth={48} gap="40">
        <Column gap="12">
          <Row gap="8" vertical="center">
            <Icon name="chat" size="s" onBackground="brand-weak" />
            <Text variant="label-default-s" onBackground="brand-weak">
              Northwind Analytics
            </Text>
          </Row>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Reports that explain themselves
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            Build dashboards, schedule exports and share insights with your team. We ship improvements every
            two weeks, and your feedback decides what comes next.
          </Text>
        </Column>

        <Column as="section" gap="16" aria-labelledby={`${uid}-updates`}>
          <Heading as="h2" id={`${uid}-updates`} variant="heading-strong-l">
            Recent updates
          </Heading>
          <Column gap="12">
            {RECENT_UPDATES.map((update) => (
              <Column
                key={update.title}
                as="article"
                gap="8"
                padding="l"
                radius="l"
                border="neutral-alpha-medium"
                background="surface"
              >
                <Row horizontal="between" vertical="center" gap="12" wrap>
                  <Heading as="h3" variant="heading-strong-m">
                    {update.title}
                  </Heading>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {update.date}
                  </Text>
                </Row>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {update.body}
                </Text>
              </Column>
            ))}
          </Column>
        </Column>
      </Column>

      <div
        style={{
          position: "fixed",
          right: "max(var(--static-space-16), env(safe-area-inset-right))",
          bottom: "max(var(--static-space-16), env(safe-area-inset-bottom))",
          zIndex: 10,
        }}
      >
        <Button
          ref={triggerRef}
          variant="primary"
          size="l"
          prefixIcon="chat"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          Feedback
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="Tell us how Northwind Analytics is working for you."
        footer={
          <Row fillWidth horizontal="end" gap="8" wrap>
            <Button variant="tertiary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Send feedback
            </Button>
          </Row>
        }
      >
        <Column gap="24" fillWidth paddingTop="8">
          <Column gap="12">
            <Text id={ratingLabelId} variant="label-strong-m">
              How would you rate your experience?
            </Text>
            <RatingChips
              value={rating}
              onChange={setRating}
              labelledBy={ratingLabelId}
              describedBy={ratingError ? ratingHintId : undefined}
            />
            <div id={ratingHintId} aria-live="polite" style={{ minHeight: "1.25rem" }}>
              {ratingError ? (
                <Text variant="body-default-s" onBackground="danger-medium" role="alert">
                  Please choose a rating before sending.
                </Text>
              ) : selectedRating ? (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {selectedRating.hint}
                </Text>
              ) : (
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Select one option from 1 (poor) to 5 (great).
                </Text>
              )}
            </div>
          </Column>

          <Column gap="8">
            <Textarea
              id={commentId}
              label="Anything you'd like to add?"
              lines={4}
              value={comment}
              maxLength={MAX_LENGTH}
              onChange={(event) => setComment(event.target.value)}
              error={commentError}
              errorMessage={commentError ? "Please tell us a bit more (at least 10 characters)." : undefined}
              description={`${comment.length}/${MAX_LENGTH}`}
            />
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}

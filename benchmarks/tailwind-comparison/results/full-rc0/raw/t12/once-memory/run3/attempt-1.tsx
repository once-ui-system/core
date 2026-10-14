"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Button,
  Column,
  Dialog,
  Flex,
  Heading,
  Row,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";

interface Rating {
  value: number;
  label: string;
  emoji: string;
}

const RATINGS: Rating[] = [
  { value: 1, label: "Poor", emoji: "😞" },
  { value: 2, label: "Fair", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😍" },
];

const MAX_LENGTH = 500;

const RELEASE_NOTES: { title: string; body: string }[] = [
  {
    title: "Faster project sync",
    body: "Workspaces with more than 200 files now sync in under two seconds thanks to incremental diffing.",
  },
  {
    title: "Shared dashboards",
    body: "Invite teammates to a dashboard with view-only or edit access, and revoke links at any time.",
  },
  {
    title: "Keyboard shortcuts",
    body: "Press ? anywhere in the app to see every shortcut, including the new command palette on Ctrl+K.",
  },
];

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const ratingLabelId = useId();
  const errorId = useId();

  const reset = useCallback(() => {
    setRating(null);
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    reset();
    // Return focus to the floating trigger once the dialog has unmounted.
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, [reset]);

  const handleSubmit = useCallback(() => {
    if (rating === null) {
      setShowError(true);
      radioRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    // Simulated network round trip; nothing is sent anywhere.
    window.setTimeout(() => {
      const chosen = RATINGS.find((r) => r.value === rating);
      setOpen(false);
      reset();
      addToast({
        variant: "success",
        message: `Thanks for your feedback! You rated us "${chosen?.label ?? ""}".`,
      });
      window.setTimeout(() => triggerRef.current?.focus(), 0);
    }, 600);
  }, [addToast, rating, reset]);

  const selectRating = (value: number) => {
    setRating(value);
    setShowError(false);
  };

  const handleRadioKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
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
      selectRating(RATINGS[next].value);
      radioRefs.current[next]?.focus();
    }
  };

  // Roving tabindex: the checked chip (or the first one) is the tab stop.
  const tabStopIndex = rating === null ? 0 : RATINGS.findIndex((r) => r.value === rating);

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="l"
      paddingTop="64"
      paddingBottom="160"
      gap="48"
    >
      <Column maxWidth={40} fillWidth gap="32">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="brand-weak">
            Release 4.12 · March 2025
          </Text>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            What&apos;s new in Northwind Studio
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
            A faster sync engine, shared dashboards and a command palette are now available for every
            workspace. Tried them out? Tell us how it went with the feedback button in the corner.
          </Text>
        </Column>

        <Column gap="16" as="section" aria-label="Release notes">
          {RELEASE_NOTES.map((note) => (
            <Column
              key={note.title}
              as="article"
              padding="20"
              gap="8"
              radius="l"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Heading as="h2" variant="heading-strong-m">
                {note.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {note.body}
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
        <Button
          ref={triggerRef}
          variant="primary"
          size="l"
          prefixIcon="chat"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          Feedback
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="Your input helps us decide what to build next."
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
          <Column gap="12" fillWidth>
            <Text id={ratingLabelId} variant="label-default-m">
              How would you rate your experience?
            </Text>
            <div
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-describedby={showError ? errorId : undefined}
              aria-required="true"
              style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
            >
              {RATINGS.map((item, index) => {
                const checked = rating === item.value;
                return (
                  <button
                    key={item.value}
                    ref={(el) => {
                      radioRefs.current[index] = el;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={index === tabStopIndex ? 0 : -1}
                    onClick={() => selectRating(item.value)}
                    onKeyDown={(e) => handleRadioKeyDown(e, index)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 0.9rem",
                      minHeight: "2.75rem",
                      borderRadius: "999px",
                      cursor: "pointer",
                      font: "inherit",
                      fontSize: "0.9rem",
                      fontWeight: checked ? 600 : 400,
                      color: checked
                        ? "var(--brand-on-background-strong)"
                        : "var(--neutral-on-background-strong)",
                      background: checked
                        ? "var(--brand-alpha-weak)"
                        : "var(--surface-background)",
                      border: checked
                        ? "1px solid var(--brand-border-strong)"
                        : "1px solid var(--neutral-border-medium)",
                      transition: "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <span aria-hidden="true">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            {showError && (
              <Text id={errorId} role="alert" variant="body-default-s" onBackground="danger-medium">
                Please choose a rating before sending.
              </Text>
            )}
          </Column>

          <Column gap="8" fillWidth>
            <Textarea
              id="feedback-message"
              label="Tell us more (optional)"
              lines={4}
              resize="vertical"
              value={message}
              maxLength={MAX_LENGTH}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Flex fillWidth horizontal="end">
              <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                {message.length}/{MAX_LENGTH}
              </Text>
            </Flex>
          </Column>
        </Column>
      </Dialog>
    </Column>
  );
}

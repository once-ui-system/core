"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, FormEvent, KeyboardEvent } from "react";
import {
  Badge,
  Button,
  Column,
  Dialog,
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
  { value: 1, label: "Frustrating", emoji: "😞" },
  { value: 2, label: "Poor", emoji: "😕" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Excellent", emoji: "🤩" },
];

const HIGHLIGHTS: { title: string; body: string }[] = [
  {
    title: "Shared dashboards",
    body: "Pin the charts your team checks every morning and share them with a single link.",
  },
  {
    title: "Scheduled exports",
    body: "Send weekly CSV summaries of revenue, signups and churn straight to your inbox.",
  },
  {
    title: "Faster search",
    body: "Jump to any customer, invoice or report with the new command menu.",
  },
];

const MAX_LENGTH = 500;

const floatingStyle: CSSProperties = {
  position: "fixed",
  right: "max(16px, env(safe-area-inset-right))",
  bottom: "max(16px, env(safe-area-inset-bottom))",
  zIndex: 50,
};

const chipBase: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  flex: "1 1 88px",
  minWidth: 72,
  minHeight: 72,
  padding: "10px 8px",
  borderRadius: 12,
  borderWidth: 1,
  borderStyle: "solid",
  cursor: "pointer",
  font: "inherit",
  color: "var(--neutral-on-background-strong)",
  transition: "background-color 120ms ease, border-color 120ms ease",
};

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const groupLabelId = useId();
  const errorId = useId();
  const countId = useId();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const reset = useCallback(() => {
    setRating(null);
    setComment("");
    setError(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setOpen(false);
    reset();
  }, [reset]);

  const selectAt = useCallback((index: number) => {
    const count = RATINGS.length;
    const next = ((index % count) + count) % count;
    setRating(RATINGS[next].value);
    setError(null);
    chipRefs.current[next]?.focus();
  }, []);

  const onChipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        selectAt(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        selectAt(index - 1);
        break;
      case "Home":
        event.preventDefault();
        selectAt(0);
        break;
      case "End":
        event.preventDefault();
        selectAt(RATINGS.length - 1);
        break;
      default:
        break;
    }
  };

  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (submitting) return;
    if (rating === null) {
      setError("Please choose a rating before sending.");
      chipRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      const chosen = RATINGS.find((r) => r.value === rating);
      setOpen(false);
      reset();
      addToast({
        variant: "success",
        message: `Thanks for your feedback${chosen ? ` (${chosen.label.toLowerCase()})` : ""}! We read every note.`,
      });
    }, 700);
  };

  // Roving tabindex: the selected chip is tabbable, or the first one if none selected.
  const tabbableIndex = rating === null ? 0 : RATINGS.findIndex((r) => r.value === rating);

  return (
    <>
      <Column
        as="main"
        fillWidth
        horizontal="center"
        paddingX="l"
        paddingY="xl"
        style={{ minHeight: "100vh" }}
      >
        <Column maxWidth={48} fillWidth gap="32" paddingBottom="80">
          <Column gap="16">
            <Badge title="Release 4.2" icon="sparkle" />
            <Heading as="h1" variant="display-strong-s" wrap="balance">
              Northwind Analytics
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Your reports, dashboards and exports in one calm workspace. Here is what changed in
              this release. Tell us how it feels using the feedback button in the corner.
            </Text>
          </Column>

          <Column as="section" gap="16" aria-label="Release highlights">
            {HIGHLIGHTS.map((item) => (
              <Column
                key={item.title}
                padding="20"
                gap="8"
                radius="l"
                border="neutral-alpha-medium"
                background="surface"
              >
                <Heading as="h2" variant="heading-strong-m">
                  {item.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {item.body}
                </Text>
              </Column>
            ))}
          </Column>
        </Column>
      </Column>

      <div style={floatingStyle}>
        <Button
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
        description="How was your experience with this release? It takes less than a minute."
        footer={
          <Row gap="8" horizontal="end" fillWidth wrap>
            <Button variant="tertiary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="feedback-form"
              loading={submitting}
              disabled={submitting}
            >
              Send feedback
            </Button>
          </Row>
        }
      >
        <form id="feedback-form" onSubmit={submit} noValidate>
          <Column gap="20" fillWidth>
            <Column gap="8" fillWidth>
              <Text id={groupLabelId} variant="label-default-s" onBackground="neutral-strong">
                Overall rating
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={groupLabelId}
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {RATINGS.map((item, index) => {
                  const selected = rating === item.value;
                  return (
                    <button
                      key={item.value}
                      ref={(el) => {
                        chipRefs.current[index] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={index === tabbableIndex ? 0 : -1}
                      onClick={() => {
                        setRating(item.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => onChipKeyDown(e, index)}
                      style={{
                        ...chipBase,
                        backgroundColor: selected
                          ? "var(--brand-alpha-weak)"
                          : "var(--surface-background)",
                        borderColor: selected
                          ? "var(--brand-solid-strong)"
                          : "var(--neutral-alpha-medium)",
                        boxShadow: selected ? "0 0 0 1px var(--brand-solid-strong)" : "none",
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1 }}>
                        {item.emoji}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: selected ? 600 : 500 }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {error && (
                <Text id={errorId} role="alert" variant="body-default-s" onBackground="danger-weak">
                  {error}
                </Text>
              )}
            </Column>

            <Column gap="8" fillWidth>
              <Textarea
                id="feedback-comment"
                label="Anything we should know? (optional)"
                lines={4}
                value={comment}
                maxLength={MAX_LENGTH}
                aria-describedby={countId}
                onChange={(e) => setComment(e.target.value)}
              />
              <Text id={countId} variant="body-default-xs" onBackground="neutral-weak" align="right">
                {comment.length}/{MAX_LENGTH}
              </Text>
            </Column>
          </Column>
        </form>
      </Dialog>
    </>
  );
}

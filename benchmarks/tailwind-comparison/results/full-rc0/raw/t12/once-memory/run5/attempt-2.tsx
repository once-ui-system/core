"use client";

import { useCallback, useId, useState } from "react";
import type { FormEvent } from "react";
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
  { value: 1, label: "Frustrating", emoji: "😞" },
  { value: 2, label: "Poor", emoji: "🙁" },
  { value: 3, label: "Okay", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Excellent", emoji: "😍" },
];

const MAX_LENGTH = 500;

const RECENT_RELEASES = [
  {
    title: "Shared dashboards",
    date: "May 14",
    description:
      "Invite teammates to view and comment on any dashboard without needing a paid seat.",
  },
  {
    title: "Faster CSV exports",
    date: "May 2",
    description:
      "Exports of up to 250,000 rows now finish in under ten seconds and arrive by email.",
  },
  {
    title: "Scheduled digests",
    date: "Apr 21",
    description:
      "Get a weekly summary of your key metrics every Monday morning, in your timezone.",
  },
];

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const groupLabelId = useId();
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
  }, [reset]);

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (rating === null) {
        setShowError(true);
        return;
      }
      setSubmitting(true);
      // Simulated request so the loading state is visible.
      window.setTimeout(() => {
        setOpen(false);
        reset();
        addToast({
          variant: "success",
          message: "Thanks for your feedback! Our team reads every note.",
        });
      }, 600);
    },
    [rating, reset, addToast],
  );

  return (
    <Column
      as="main"
      fillWidth
      horizontal="center"
      paddingX="l"
      paddingY="xl"
      gap="xl"
      style={{ minHeight: "100vh" }}
    >
      <Column fillWidth maxWidth={40} gap="32" paddingTop="32">
        <Column gap="12">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Northwind Analytics · Product updates
          </Text>
          <Heading as="h1" variant="display-strong-s">
            What&apos;s new this spring
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            We ship improvements every couple of weeks. Here are the latest
            releases, and we&apos;d love to hear how they work for you.
          </Text>
        </Column>

        <Column gap="16" as="section" aria-label="Recent releases">
          {RECENT_RELEASES.map((release) => (
            <Column
              key={release.title}
              as="article"
              padding="20"
              gap="8"
              radius="l"
              border="neutral-alpha-medium"
              background="surface"
            >
              <Row horizontal="between" vertical="center" gap="12" wrap>
                <Heading as="h2" variant="heading-strong-m">
                  {release.title}
                </Heading>
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {release.date}
                </Text>
              </Row>
              <Text variant="body-default-m" onBackground="neutral-weak">
                {release.description}
              </Text>
            </Column>
          ))}
        </Column>
      </Column>

      <div
        style={{
          position: "fixed",
          right: "max(16px, env(safe-area-inset-right))",
          bottom: "max(16px, env(safe-area-inset-bottom))",
          zIndex: 10,
        }}
      >
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
        title="Send us your feedback"
        description="Tell us how things are going. It only takes a minute."
        footer={
          <Row fillWidth horizontal="end" gap="8" wrap>
            <Button variant="tertiary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              loading={submitting}
              disabled={submitting}
            >
              Send feedback
            </Button>
          </Row>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          <Column gap="24" fillWidth>
            <Column gap="12" fillWidth>
              <Text id={groupLabelId} variant="label-strong-m">
                How would you rate your experience?
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={groupLabelId}
                aria-describedby={showError && rating === null ? errorId : undefined}
                style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {RATINGS.map((item) => {
                  const selected = rating === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setRating(item.value);
                        setShowError(false);
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        minHeight: 44,
                        padding: "8px 14px",
                        borderRadius: 999,
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: 14,
                        fontWeight: selected ? 600 : 500,
                        color: "var(--neutral-on-background-strong)",
                        background: selected
                          ? "var(--brand-alpha-medium)"
                          : "var(--neutral-alpha-weak)",
                        border: selected
                          ? "2px solid var(--brand-solid-medium)"
                          : "2px solid var(--neutral-alpha-medium)",
                        transition: "background 120ms ease, border-color 120ms ease",
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: 18 }}>
                        {item.emoji}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {showError && rating === null && (
                <Text id={errorId} role="alert" variant="body-default-s" onBackground="danger-medium">
                  Please choose a rating before sending.
                </Text>
              )}
            </Column>

            <Column gap="8" fillWidth>
              <Textarea
                id="feedback-message"
                label="Anything you'd like to add? (optional)"
                lines={4}
                value={message}
                maxLength={MAX_LENGTH}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Text variant="body-default-xs" onBackground="neutral-weak" aria-live="polite">
                {message.length}/{MAX_LENGTH} characters
              </Text>
            </Column>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

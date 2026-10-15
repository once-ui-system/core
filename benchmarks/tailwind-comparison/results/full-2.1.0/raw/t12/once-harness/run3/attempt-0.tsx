"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  Badge,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Row,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Rating = {
  value: number;
  label: string;
  icon: IconName;
};

const RATINGS: readonly Rating[] = [
  { value: 1, label: "Frustrating", icon: "dislike" },
  { value: 2, label: "Not great", icon: "danger" },
  { value: 3, label: "It's okay", icon: "minus" },
  { value: 4, label: "Good", icon: "like" },
  { value: 5, label: "Loved it", icon: "heart" },
];

const FOLLOW_UPS: Record<number, string> = {
  1: "What went wrong? Tell us what blocked you.",
  2: "What could we do better?",
  3: "What would make this a better experience?",
  4: "What did you like most?",
  5: "What made your day? We'd love to know.",
};

type Metric = { label: string; value: string; trend: string; icon: IconName };

const METRICS: readonly Metric[] = [
  { label: "Notes captured", value: "1,284", trend: "+12% this week", icon: "document" },
  { label: "Shared notebooks", value: "37", trend: "+3 new", icon: "folder" },
  { label: "Avg. sync time", value: "0.8s", trend: "−120ms vs. last month", icon: "bolt" },
];

type Activity = { title: string; meta: string; icon: IconName };

const ACTIVITY: readonly Activity[] = [
  { title: "Q3 research interviews", meta: "Edited by Priya Nair · 12 min ago", icon: "edit" },
  { title: "Onboarding checklist v2", meta: "Shared with Design team · 1 hr ago", icon: "link" },
  { title: "Launch retro notes", meta: "Created by Tomás Reyes · Yesterday", icon: "plus" },
  { title: "Customer call — Hartwell & Co.", meta: "Tagged #pricing · Yesterday", icon: "tag" },
];

const MAX_LENGTH = 500;

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [ratingError, setRatingError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const groupLabelId = useId();
  const ratingErrorId = useId();
  const textareaId = useId();

  const reset = useCallback(() => {
    setRating(null);
    setMessage("");
    setRatingError(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const selectRating = useCallback((value: number) => {
    setRating(value);
    setRatingError(false);
  }, []);

  const handleRadioKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % RATINGS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + RATINGS.length) % RATINGS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = RATINGS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectRating(RATINGS[next].value);
    radioRefs.current[next]?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (rating === null) {
      setRatingError(true);
      radioRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    const chosen = RATINGS.find((r) => r.value === rating);
    // Simulated network round-trip, entirely local.
    window.setTimeout(() => {
      setOpen(false);
      reset();
      addToast({
        variant: "success",
        message: `Thanks for the feedback! You rated Fieldnote "${chosen?.label ?? ""}".`,
      });
    }, 600);
  };

  // Roving tabindex: the checked radio is tabbable, or the first one if none is checked.
  const tabbableIndex = rating === null ? 0 : RATINGS.findIndex((r) => r.value === rating);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      <Column maxWidth="m" fillWidth gap="40">
        <Column gap="12">
          <Row>
            <Badge title="Workspace · Acme Studio" icon="organization" />
          </Row>
          <Heading as="h1" variant="display-strong-s">
            Good morning, Dana
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Here's what's happening across your notebooks today. Spotted something off or have an
            idea? Use the feedback button in the corner — we read every message.
          </Text>
        </Column>

        <Grid columns="3" s={{ columns: "1" }} gap="16" fillWidth>
          {METRICS.map((metric) => (
            <Column key={metric.label} background="surface" border radius="l" padding="24" gap="12">
              <Row gap="8" vertical="center" onBackground="neutral-weak">
                <Icon name={metric.icon} size="s" />
                <Text variant="label-default-s">{metric.label}</Text>
              </Row>
              <Text variant="display-strong-xs">{metric.value}</Text>
              <Text variant="body-default-s" onBackground="success-weak">
                {metric.trend}
              </Text>
            </Column>
          ))}
        </Grid>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-l">
            Recent activity
          </Heading>
          <Column as="ul" gap="0" margin="0" padding="0" style={{ listStyle: "none" }}>
            {ACTIVITY.map((item, index) => (
              <Row
                as="li"
                key={item.title}
                gap="16"
                vertical="center"
                paddingY="12"
                borderTop={index === 0 ? false : true}
              >
                <Row
                  center
                  background="neutral-alpha-weak"
                  radius="m"
                  width={40}
                  height={40}
                  minWidth={40}
                  onBackground="neutral-medium"
                >
                  <Icon name={item.icon} size="s" />
                </Row>
                <Column gap="4" fillWidth>
                  <Text variant="body-strong-m">{item.title}</Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {item.meta}
                  </Text>
                </Column>
              </Row>
            ))}
          </Column>
        </Column>
      </Column>

      {/* Floating trigger */}
      <Row
        ref={triggerRef}
        position="fixed"
        right="24"
        bottom="24"
        s={{ right: "16", bottom: "16" }}
        zIndex={5}
      >
        <Button
          data-border="rounded"
          size="l"
          rounded
          prefixIcon="chat"
          label="Feedback"
          weight="strong"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        />
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Share your feedback"
        description="Tell us how Fieldnote is working for you. It takes less than a minute."
      >
        <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
          <Column gap="24" fillWidth>
            <Column gap="12" fillWidth>
              <Text id={groupLabelId} variant="label-strong-s">
                How was your experience?
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={groupLabelId}
                aria-describedby={ratingError ? ratingErrorId : undefined}
                aria-required="true"
                style={{ display: "flex", flexWrap: "wrap", gap: "var(--static-space-8)" }}
              >
                {RATINGS.map((item, index) => {
                  const checked = rating === item.value;
                  return (
                    <button
                      key={item.value}
                      ref={(node) => {
                        radioRefs.current[index] = node;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={checked}
                      tabIndex={index === tabbableIndex ? 0 : -1}
                      onClick={() => selectRating(item.value)}
                      onKeyDown={(event) => handleRadioKeyDown(event, index)}
                      disabled={submitting}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "var(--static-space-8)",
                        padding: "var(--static-space-8) var(--static-space-16)",
                        borderRadius: "var(--radius-full)",
                        border: `1px solid ${
                          checked
                            ? "var(--brand-solid-strong)"
                            : ratingError
                              ? "var(--danger-solid-strong)"
                              : "var(--neutral-alpha-medium)"
                        }`,
                        background: checked ? "var(--brand-alpha-weak)" : "var(--surface-background)",
                        color: "var(--neutral-on-background-strong)",
                        font: "inherit",
                        fontSize: "var(--font-size-s)",
                        cursor: submitting ? "default" : "pointer",
                        transition: "background 120ms ease, border-color 120ms ease",
                      }}
                    >
                      <Icon name={item.icon} size="xs" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {ratingError && (
                <Text
                  id={ratingErrorId}
                  role="alert"
                  variant="body-default-s"
                  onBackground="danger-medium"
                >
                  Please pick a rating before sending.
                </Text>
              )}
            </Column>

            <Textarea
              id={textareaId}
              label={rating === null ? "Anything you'd like to add?" : FOLLOW_UPS[rating]}
              placeholder="Share details, ideas or steps to reproduce…"
              lines={4}
              resize="vertical"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
              disabled={submitting}
              description={`${message.length}/${MAX_LENGTH} characters · optional`}
            />

            <Row gap="12" horizontal="end" fillWidth s={{ direction: "column-reverse" }}>
              <Button
                type="button"
                variant="tertiary"
                label="Cancel"
                onClick={handleClose}
                disabled={submitting}
                data-border="rounded"
              />
              <Button
                type="submit"
                label={submitting ? "Sending…" : "Send feedback"}
                prefixIcon="send"
                loading={submitting}
                data-border="rounded"
              />
            </Row>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}

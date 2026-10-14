"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, SubmitEvent } from "react";
import {
  Background,
  Badge,
  Button,
  Chip,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Row,
  Tag,
  Text,
  Textarea,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Rating = {
  value: string;
  label: string;
  icon: IconName;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Frustrating", icon: "dislike" },
  { value: "2", label: "Needs work", icon: "warning" },
  { value: "3", label: "It's okay", icon: "minus" },
  { value: "4", label: "Pretty good", icon: "like" },
  { value: "5", label: "Love it", icon: "heart" },
];

const TOPICS: string[] = ["Navigation", "Performance", "Design", "Reports", "Something else"];

const MAX_LENGTH = 500;

const HIGHLIGHTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "barChart",
    title: "Weekly digest",
    text: "Revenue, signups and churn summarised every Monday at 8:00, ready to forward to your team.",
  },
  {
    icon: "bolt",
    title: "Faster exports",
    text: "CSV exports of up to 200,000 rows now finish in under ten seconds instead of a few minutes.",
  },
  {
    icon: "security",
    title: "Roles and permissions",
    text: "Give finance read-only access to billing while product managers keep full control of dashboards.",
  },
];

const unstyledButton = {
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
  borderRadius: "var(--radius-full)",
  display: "inline-flex",
} as const;

type RatingChipProps = {
  rating: Rating;
  checked: boolean;
  focusable: boolean;
  onSelect: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
};

function RatingChip({ rating, checked, focusable, onSelect, onKeyDown, buttonRef }: RatingChipProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={focusable ? 0 : -1}
      onClick={() => onSelect(rating.value)}
      onKeyDown={onKeyDown}
      style={unstyledButton}
    >
      <Chip
        label={rating.label}
        prefixIcon={rating.icon}
        selected={checked}
        paddingX="12"
        paddingY="8"
        pointerEvents="none"
      />
    </button>
  );
}

export default function Page() {
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<string>("");
  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const ratingRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const topicLabelId = useId();
  const textareaId = useId();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resetForm = useCallback(() => {
    setRating("");
    setTopics([]);
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }, []);

  const focusTrigger = useCallback(() => {
    window.setTimeout(() => {
      triggerRef.current?.querySelector<HTMLElement>("button")?.focus();
    }, 50);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    focusTrigger();
  }, [submitting, focusTrigger]);

  const handleRatingKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % RATINGS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + RATINGS.length) % RATINGS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = RATINGS.length - 1;
    if (next === -1) return;
    event.preventDefault();
    setRating(RATINGS[next].value);
    setShowError(false);
    ratingRefs.current[next]?.focus();
  };

  const toggleTopic = (topic: string) => {
    setTopics((current) =>
      current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic],
    );
  };

  const handleSubmit = () => {
    if (submitting) return;
    if (!rating) {
      setShowError(true);
      ratingRefs.current[0]?.focus();
      return;
    }
    setSubmitting(true);
    timerRef.current = setTimeout(() => {
      const chosen = RATINGS.find((r) => r.value === rating);
      setOpen(false);
      resetForm();
      addToast({
        variant: "success",
        message: `Thanks for the feedback${chosen ? ` — you rated us "${chosen.label}"` : ""}. We read every message.`,
      });
      focusTrigger();
    }, 900);
  };

  // Roving tabindex: the selected chip is the tab stop, or the first one when nothing is selected.
  const focusableIndex = Math.max(
    0,
    RATINGS.findIndex((r) => r.value === rating),
  );

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64" s={{ paddingY: "40" }}>
      <Column fillWidth horizontal="center" paddingY="48">
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
            x: 50,
            y: 0,
            width: 150,
            height: 80,
            opacity: 60,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />
        <Column zIndex={1} fillWidth maxWidth="l" gap="104" s={{ gap: "64" }}>
          <Column horizontal="center" align="center" gap="24" paddingTop="40">
            <Badge icon="sparkle" title="Release 4.12 · March update" />
            <Heading as="h1" variant="display-strong-l" wrap="balance">
              Analytics your whole team will actually open
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Northwind Metrics turns raw events into clear dashboards, scheduled digests and alerts that tell you
              what changed and why.
            </Text>
            <Row gap="12" wrap horizontal="center">
              <Button label="Open dashboard" suffixIcon="arrowRight" />
              <Button label="Read the changelog" variant="secondary" />
            </Row>
          </Column>

          <Column gap="32">
            <Column gap="8">
              <Text variant="label-default-s" onBackground="brand-medium">
                What&apos;s new
              </Text>
              <Heading as="h2" variant="display-strong-xs">
                Shipped this month
              </Heading>
            </Column>
            <Grid columns="3" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
              {HIGHLIGHTS.map((item) => (
                <Column key={item.title} background="surface" border radius="l" padding="24" gap="16">
                  <Row
                    center
                    width={40}
                    height={40}
                    radius="m"
                    background="brand-alpha-weak"
                    onBackground="brand-strong"
                  >
                    <Icon name={item.icon} size="m" />
                  </Row>
                  <Column gap="8">
                    <Heading as="h3" variant="heading-strong-m">
                      {item.title}
                    </Heading>
                    <Text variant="body-default-m" onBackground="neutral-weak">
                      {item.text}
                    </Text>
                  </Column>
                </Column>
              ))}
            </Grid>
          </Column>

          <Column background="surface" border radius="l" padding="32" gap="16" s={{ padding: "24" }}>
            <Row gap="12" vertical="center" wrap>
              <Tag scheme="success" label="Beta" prefixIcon="check" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                Anomaly alerts
              </Text>
            </Row>
            <Heading as="h2" variant="display-strong-xs">
              Tell us how the new reports feel
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              We&apos;re still tuning the report builder. Use the feedback button in the corner of the screen to tell
              us what works and what gets in your way — it takes less than a minute.
            </Text>
          </Column>
        </Column>
      </Column>

      <Row
        ref={triggerRef}
        position="fixed"
        bottom="24"
        right="24"
        s={{ bottom: "16", right: "16" }}
        zIndex={2}
      >
        <Button
          variant="primary"
          size="l"
          rounded
          prefixIcon="chat"
          label="Feedback"
          onClick={() => setOpen(true)}
          data-border="rounded"
          aria-haspopup="dialog"
        />
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Send us your feedback"
        description="Rate your experience and tell us what we could do better."
        closeOnClickaway={!submitting}
        footer={
          <Row fillWidth gap="12" horizontal="end" wrap>
            <Button label="Cancel" variant="tertiary" onClick={handleClose} disabled={submitting} />
            <Button
              label={submitting ? "Sending…" : "Send feedback"}
              prefixIcon="send"
              onClick={handleSubmit}
              loading={submitting}
            />
          </Row>
        }
      >
        <Column
          as="form"
          fillWidth
          gap="24"
          onSubmit={(event: SubmitEvent<HTMLDivElement>) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Column gap="12">
            <Text id={ratingLabelId} variant="label-strong-m">
              How was your experience?
            </Text>
            <Row
              wrap
              gap="8"
              role="radiogroup"
              aria-labelledby={ratingLabelId}
              aria-required="true"
              aria-invalid={showError}
              aria-describedby={showError ? ratingErrorId : undefined}
            >
              {RATINGS.map((item, index) => (
                <RatingChip
                  key={item.value}
                  rating={item}
                  checked={rating === item.value}
                  focusable={index === focusableIndex}
                  onSelect={(value) => {
                    setRating(value);
                    setShowError(false);
                  }}
                  onKeyDown={(event) => handleRatingKeyDown(event, index)}
                  buttonRef={(node) => {
                    ratingRefs.current[index] = node;
                  }}
                />
              ))}
            </Row>
            {showError && (
              <Row id={ratingErrorId} role="alert" gap="8" vertical="center" onBackground="danger-medium">
                <Icon name="danger" size="xs" />
                <Text variant="body-default-s">Please pick a rating before sending.</Text>
              </Row>
            )}
          </Column>

          <Column gap="12">
            <Text id={topicLabelId} variant="label-strong-m">
              What is this about?{" "}
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                (optional)
              </Text>
            </Text>
            <Row wrap gap="8" role="group" aria-labelledby={topicLabelId}>
              {TOPICS.map((topic) => {
                const active = topics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTopic(topic)}
                    style={unstyledButton}
                  >
                    <Chip
                      label={topic}
                      selected={active}
                      prefixIcon={active ? "check" : undefined}
                      paddingX="12"
                      paddingY="8"
                      pointerEvents="none"
                    />
                  </button>
                );
              })}
            </Row>
          </Column>

          <Textarea
            id={textareaId}
            label="Your comments"
            placeholder="What worked well? What was confusing or missing?"
            lines={4}
            resize="vertical"
            value={message}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(event.target.value.slice(0, MAX_LENGTH))
            }
            maxLength={MAX_LENGTH}
            characterCount
            description={`Up to ${MAX_LENGTH} characters. Please don't include passwords or card numbers.`}
          />
        </Column>
      </Dialog>
    </Column>
  );
}

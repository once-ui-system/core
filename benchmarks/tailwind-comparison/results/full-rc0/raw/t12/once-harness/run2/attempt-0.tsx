"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Background,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  Line,
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
  hint: string;
  icon: IconName;
};

type Topic = {
  value: string;
  label: string;
};

const RATINGS: Rating[] = [
  { value: "1", label: "Frustrating", hint: "Something is broken or confusing", icon: "dislike" },
  { value: "2", label: "Needs work", hint: "It gets in my way", icon: "warning" },
  { value: "3", label: "Okay", hint: "Does the job", icon: "smiley" },
  { value: "4", label: "Good", hint: "I like using it", icon: "like" },
  { value: "5", label: "Delightful", hint: "I'd recommend it", icon: "heart" },
];

const TOPICS: Topic[] = [
  { value: "billing", label: "Billing" },
  { value: "reports", label: "Reports" },
  { value: "integrations", label: "Integrations" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Something else" },
];

const MAX_LENGTH = 500;

const HIGHLIGHTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "barChart",
    title: "Live revenue reports",
    text: "Monthly recurring revenue, churn and expansion in one view, refreshed every few minutes.",
  },
  {
    icon: "payment",
    title: "Invoices that reconcile",
    text: "Match payouts to invoices automatically and export clean ledgers for your accountant.",
  },
  {
    icon: "link",
    title: "Connects to your stack",
    text: "Sync customers from your CRM and push events to the tools your team already uses.",
  },
];

type RatingGroupProps = {
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
  describedBy?: string;
  invalid: boolean;
};

function RatingGroup({ value, onChange, labelledBy, describedBy, invalid }: RatingGroupProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = RATINGS.findIndex((r) => r.value === value);
  // Roving tabindex: the selected radio is the tab stop, or the first one when nothing is picked.
  const tabStopIndex = selectedIndex === -1 ? 0 : selectedIndex;

  const move = useCallback(
    (index: number) => {
      const next = (index + RATINGS.length) % RATINGS.length;
      onChange(RATINGS[next].value);
      refs.current[next]?.focus();
    },
    [onChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(index - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(RATINGS.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required="true"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(5.5rem, 1fr))",
        gap: "0.5rem",
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
            aria-label={`${rating.value} of 5: ${rating.label}. ${rating.hint}`}
            tabIndex={index === tabStopIndex ? 0 : -1}
            onClick={() => onChange(rating.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              borderRadius: "var(--radius-m)",
            }}
          >
            <Column
              fillWidth
              center
              gap="8"
              paddingX="8"
              paddingY="12"
              radius="m"
              border={selected ? "brand-alpha-strong" : invalid ? "danger-alpha-medium" : true}
              background={selected ? "brand-alpha-weak" : "surface"}
              transition="micro-medium"
            >
              <Icon
                name={rating.icon}
                size="m"
                onBackground={selected ? "brand-strong" : "neutral-medium"}
              />
              <Text
                variant="label-default-s"
                onBackground={selected ? "brand-strong" : "neutral-strong"}
                align="center"
              >
                {rating.label}
              </Text>
            </Column>
          </button>
        );
      })}
    </div>
  );
}

type TopicGroupProps = {
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
};

function TopicGroup({ value, onChange, labelledBy }: TopicGroupProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
    >
      {TOPICS.map((topic) => {
        const selected = topic.value === value;
        return (
          <button
            key={topic.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? "" : topic.value)}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              borderRadius: "var(--radius-full)",
            }}
          >
            <Row
              paddingX="12"
              paddingY="8"
              vertical="center"
              gap="8"
              radius="full"
              border={selected ? "brand-alpha-strong" : true}
              background={selected ? "brand-alpha-weak" : "surface"}
              transition="micro-medium"
            >
              {selected && <Icon name="check" size="xs" onBackground="brand-strong" />}
              <Text
                variant="label-default-s"
                onBackground={selected ? "brand-strong" : "neutral-strong"}
              >
                {topic.label}
              </Text>
            </Row>
          </button>
        );
      })}
    </div>
  );
}

export default function Page() {
  const { addToast } = useToast();

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerWrapRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const resetForm = useCallback(() => {
    setRating("");
    setTopic("");
    setMessage("");
    setShowError(false);
  }, []);

  const closeDialog = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    // Return focus to the floating trigger once the dialog has unmounted.
    requestAnimationFrame(() => {
      triggerWrapRef.current?.querySelector<HTMLElement>("button")?.focus();
    });
  }, [submitting]);

  const handleRatingChange = useCallback((next: string) => {
    setRating(next);
    setShowError(false);
  }, []);

  const handleSubmit = () => {
    if (!rating) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    // Simulated network round trip.
    timerRef.current = setTimeout(() => {
      const picked = RATINGS.find((r) => r.value === rating);
      setSubmitting(false);
      setOpen(false);
      resetForm();
      addToast({
        variant: "success",
        message: `Thanks for the feedback${picked ? ` — you rated us ${picked.value}/5` : ""}. Our team reads every note.`,
      });
      requestAnimationFrame(() => {
        triggerWrapRef.current?.querySelector<HTMLElement>("button")?.focus();
      });
    }, 900);
  };

  const remaining = MAX_LENGTH - message.length;

  return (
    <Column as="main" fillWidth horizontal="center">
      <Column fillWidth horizontal="center" paddingX="24" paddingTop="80" paddingBottom="128">
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

        <Column zIndex={1} maxWidth="l" gap="104">
          <Column gap="24" horizontal="center" align="center" maxWidth={40} marginX="auto">
            <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Ledgerly 3.2 is out" />
            <Heading as="h1" variant="display-strong-l" wrap="balance">
              Know where your revenue stands, every morning
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
              Ledgerly turns payment data into a clear picture of growth, churn and cash flow, so
              finance and product teams can stop reconciling spreadsheets.
            </Text>
            <Row gap="12" wrap horizontal="center">
              <Button
                size="l"
                arrowIcon
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
              >
                Tell us what you think
              </Button>
              <Button size="l" variant="secondary" href="#highlights">
                See what&apos;s new
              </Button>
            </Row>
          </Column>

          <Column gap="40" id="highlights">
            <Column gap="8" horizontal="center" align="center">
              <Text variant="label-default-s" onBackground="brand-medium">
                What&apos;s new
              </Text>
              <Heading as="h2" variant="display-strong-xs">
                Built for the people closing the books
              </Heading>
            </Column>
            <Grid columns="3" gap="16" s={{ columns: 1 }} m={{ columns: 1 }}>
              {HIGHLIGHTS.map((item) => (
                <Column
                  key={item.title}
                  background="surface"
                  border
                  radius="l"
                  padding="24"
                  gap="16"
                >
                  <Row
                    center
                    width={3}
                    height={3}
                    radius="m"
                    background="brand-alpha-weak"
                  >
                    <Icon name={item.icon} size="m" onBackground="brand-strong" />
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

          <Column gap="24" horizontal="center" align="center">
            <Line width="40" />
            <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
              Used by 2,400 finance teams. Your feedback goes straight to the people building it.
            </Text>
          </Column>
        </Column>
      </Column>

      {/* Floating trigger */}
      <div
        ref={triggerWrapRef}
        style={{
          position: "fixed",
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "max(1rem, env(safe-area-inset-bottom))",
          zIndex: 5,
        }}
      >
        <Button
          size="l"
          rounded
          prefixIcon="chat"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          Feedback
        </Button>
      </div>

      <Dialog
        open={open}
        onClose={closeDialog}
        title="Share your feedback"
        description="Tell us how Ledgerly is working for you. It takes under a minute."
        footer={
          <Row fillWidth gap="12" horizontal="end" wrap>
            <Button variant="tertiary" onClick={closeDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              suffixIcon="send"
            >
              Send feedback
            </Button>
          </Row>
        }
      >
        <Column
          as="form"
          fillWidth
          gap="24"
          onSubmit={(event: React.FormEvent) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Column gap="12">
            <Text id="rating-label" variant="label-strong-m">
              How would you rate your experience?
            </Text>
            <RatingGroup
              value={rating}
              onChange={handleRatingChange}
              labelledBy="rating-label"
              describedBy={showError ? "rating-error" : undefined}
              invalid={showError}
            />
            <div aria-live="polite" style={{ minHeight: "1.25rem" }}>
              {showError && (
                <Row id="rating-error" gap="8" vertical="center" role="alert">
                  <Icon name="danger" size="xs" onBackground="danger-medium" />
                  <Text variant="body-default-s" onBackground="danger-medium">
                    Please choose a rating before sending.
                  </Text>
                </Row>
              )}
            </div>
          </Column>

          <Column gap="12">
            <Text id="topic-label" variant="label-strong-m">
              What is this about?{" "}
              <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                (optional)
              </Text>
            </Text>
            <TopicGroup value={topic} onChange={setTopic} labelledBy="topic-label" />
          </Column>

          <Textarea
            id="feedback-message"
            label="Anything else we should know?"
            placeholder="What worked well, what didn't, or what you wish it did…"
            lines={4}
            resize="vertical"
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
            description={
              <span aria-live="polite">
                {remaining} character{remaining === 1 ? "" : "s"} left
              </span>
            }
          />
        </Column>
      </Dialog>
    </Column>
  );
}

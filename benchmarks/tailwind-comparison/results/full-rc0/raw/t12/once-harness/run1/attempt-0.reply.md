I have what I need. Key facts:

-   `Toast` via `useToast().addToast({ variant, message })`.
-   `Chip`: `selected` defaults to `true`, so I must pass it explicitly. It's a div with `onClick`, so for accessibility I'll wrap it in a radio-style group using `role="radiogroup"` and handle keyboard myself. A more robust option is `ToggleButton` (a real button) with `selected`, which is accessible out of the box.
-   `Dialog` takes `open`, `onClose`, `title`, `description`, `footer`.
-   `Textarea` requires `id`.

I'll build the page with a small mock product surface behind the floating trigger, so the widget has realistic context.

```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Background,
  Badge,
  Button,
  Column,
  Dialog,
  Grid,
  Heading,
  Icon,
  IconButton,
  Line,
  Row,
  Tag,
  Text,
  Textarea,
  ToggleButton,
  useToast,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Rating = {
  value: string;
  label: string;
  icon: IconName;
  prompt: string;
};

const RATINGS: Rating[] = [
  { value: "love", label: "Love it", icon: "heart", prompt: "What do you love most about it?" },
  { value: "good", label: "Works well", icon: "like", prompt: "What's working well for you?" },
  { value: "idea", label: "I have an idea", icon: "sparkle", prompt: "What would you like to see next?" },
  { value: "confusing", label: "Confusing", icon: "help", prompt: "What was hard to figure out?" },
  { value: "bug", label: "Something broke", icon: "danger", prompt: "What happened, and what did you expect?" },
];

const MAX_LENGTH = 500;

const RECENT_ACTIVITY: { id: string; title: string; meta: string; tag: string }[] = [
  { id: "a1", title: "Quarterly roadmap review", meta: "Edited 12 minutes ago by Priya N.", tag: "Planning" },
  { id: "a2", title: "Onboarding checklist v3", meta: "Edited 2 hours ago by Marcus L.", tag: "Docs" },
  { id: "a3", title: "Customer interview notes", meta: "Edited yesterday by Elena R.", tag: "Research" },
];

const STATS: { id: string; label: string; value: string; icon: IconName }[] = [
  { id: "s1", label: "Active projects", value: "14", icon: "folder" },
  { id: "s2", label: "Tasks done this week", value: "86", icon: "check" },
  { id: "s3", label: "Teammates online", value: "9", icon: "person" },
];

export default function Page() {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageId = useId();
  const groupLabelId = useId();

  const selected = RATINGS.find((r) => r.value === rating);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    setRating("");
    setMessage("");
    setShowError(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    setOpen(false);
  }, [submitting]);

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (submitting) return;
      if (!rating) {
        setShowError(true);
        return;
      }
      setSubmitting(true);
      // Simulated network round-trip; nothing leaves the page.
      timerRef.current = setTimeout(() => {
        setOpen(false);
        reset();
        addToast({
          variant: "success",
          message: "Thanks! Your feedback was sent to the product team.",
        });
      }, 700);
    },
    [addToast, rating, reset, submitting],
  );

  const handleRadioKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const currentIndex = RATINGS.findIndex((r) => r.value === rating);
    const nextIndex =
      currentIndex === -1
        ? forward
          ? 0
          : RATINGS.length - 1
        : (currentIndex + (forward ? 1 : -1) + RATINGS.length) % RATINGS.length;
    setRating(RATINGS[nextIndex].value);
    setShowError(false);
    const buttons = event.currentTarget.querySelectorAll<HTMLElement>("button");
    buttons[nextIndex]?.focus();
  };

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="24" paddingY="48" s={{ paddingX: "16", paddingY: "32" }}>
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
          height: 70,
          opacity: 50,
        }}
        dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
      />

      <Column zIndex={1} maxWidth="m" fillWidth gap="40">
        <Column gap="16">
          <Badge icon="sparkle" title="Workspace beta" />
          <Heading as="h1" variant="display-strong-s">
            Good morning, Dana
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Here is what your team has been working on. Use the feedback button in the corner to tell us what to
            improve.
          </Text>
        </Column>

        <Grid columns="3" gap="16" s={{ columns: 1 }}>
          {STATS.map((stat) => (
            <Column key={stat.id} background="surface" border radius="l" padding="24" gap="12">
              <Row gap="8" vertical="center">
                <Icon name={stat.icon} size="s" onBackground="brand-medium" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                  {stat.label}
                </Text>
              </Row>
              <Heading as="h2" variant="display-strong-xs">
                {stat.value}
              </Heading>
            </Column>
          ))}
        </Grid>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" variant="heading-strong-l">
            Recent activity
          </Heading>
          <Column gap="16">
            {RECENT_ACTIVITY.map((item, index) => (
              <Column key={item.id} gap="16">
                {index > 0 && <Line />}
                <Row horizontal="between" vertical="center" gap="16" wrap>
                  <Column gap="4" flex={1} minWidth={12}>
                    <Text variant="body-strong-m">{item.title}</Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {item.meta}
                    </Text>
                  </Column>
                  <Tag size="s" label={item.tag} />
                </Row>
              </Column>
            ))}
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
          aria-haspopup="dialog"
          aria-expanded={open}
        />
      </Row>

      <Dialog
        open={open}
        onClose={handleClose}
        title="Send us your feedback"
        description="It takes less than a minute, and every note is read by a real person."
        footer={
          <Row fillWidth horizontal="end" gap="8" s={{ direction: "column-reverse" }}>
            <Button variant="tertiary" label="Cancel" onClick={handleClose} disabled={submitting} />
            <Button
              label={submitting ? "Sending…" : "Send feedback"}
              suffixIcon="send"
              loading={submitting}
              onClick={() => handleSubmit()}
            />
          </Row>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          <Column gap="24" fillWidth>
            <Column gap="12">
              <Text as="span" id={groupLabelId} variant="label-strong-s">
                How is your experience so far?
              </Text>
              <div
                role="radiogroup"
                aria-labelledby={groupLabelId}
                aria-required="true"
                aria-invalid={showError}
                onKeyDown={handleRadioKeys}
                style={{ display: "flex", flexWrap: "wrap", gap: "var(--static-space-8)" }}
              >
                {RATINGS.map((item, index) => {
                  const isSelected = item.value === rating;
                  const isTabStop = isSelected || (!rating && index === 0);
                  return (
                    <ToggleButton
                      key={item.value}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isTabStop ? 0 : -1}
                      variant="outline"
                      size="m"
                      radius="full"
                      prefixIcon={item.icon}
                      label={item.label}
                      selected={isSelected}
                      onClick={() => {
                        setRating(item.value);
                        setShowError(false);
                      }}
                    />
                  );
                })}
              </div>
              {showError && (
                <Row gap="8" vertical="center" onBackground="danger-medium" role="alert">
                  <Icon name="warning" size="xs" />
                  <Text variant="body-default-s">Pick the option that fits best before sending.</Text>
                </Row>
              )}
            </Column>

            <Textarea
              id={messageId}
              label={selected ? selected.prompt : "Tell us more (optional)"}
              placeholder="Share as much or as little as you like…"
              lines={4}
              resize="none"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, MAX_LENGTH))}
              description={`${message.length}/${MAX_LENGTH} characters`}
            />

            <Text variant="body-default-xs" onBackground="neutral-weak">
              Please don't include passwords or payment details.
            </Text>
          </Column>
        </form>
      </Dialog>
    </Column>
  );
}
```

I couldn't verify a few things against the installed package, so check them before shipping:

-   **Fixed positioning:** I wrote `position="fixed"` on a `Row`. The docs list `position` as `CSSProperties["position"]`, so it should type-check, but I haven't confirmed that `bottom`/`right` tokens apply with it.
-   **Toggle button ARIA:** I pass `role`, `aria-checked` and `tabIndex` to `ToggleButton`. Its documented props don't list them, so they may fail strict TypeScript if they aren't forwarded.
-   **Controlled textarea:** I use `value` and `onChange` on `Textarea`. The documented props don't list them either.
-   **Unused trigger ref:** `triggerRef` is attached to the `Row` but not used elsewhere. Dialog focus restoration is left to the component.
-   **Unused import:** I imported `IconButton` but never used it. Remove it to keep lint clean.

I haven't run `next build` or the validator (`npx once-ui-validate-ai-code`).
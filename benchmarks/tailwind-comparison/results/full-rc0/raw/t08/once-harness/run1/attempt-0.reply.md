```tsx
"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  Button,
  CelebrationFx,
  Column,
  Heading,
  Icon,
  ProgressBar,
  Row,
  StatusIndicator,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  icon: IconName;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    description: "Add your name, role and a short bio so teammates know who they are working with.",
    minutes: 2,
    icon: "person",
    actionLabel: "Edit profile",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    description: "Pick a workspace name and URL. You can change both later in settings.",
    minutes: 1,
    icon: "organization",
    actionLabel: "Open settings",
  },
  {
    id: "invite",
    title: "Invite your team",
    description: "Send invites by email. Collaborators can join as editors or viewers.",
    minutes: 3,
    icon: "mail",
    actionLabel: "Invite people",
  },
  {
    id: "project",
    title: "Create your first project",
    description: "Start from a blank board or use the Product Launch template with ready-made tasks.",
    minutes: 4,
    icon: "folder",
    actionLabel: "New project",
  },
  {
    id: "integration",
    title: "Connect an integration",
    description: "Link Slack or your calendar to get deadline reminders where you already work.",
    minutes: 3,
    icon: "link",
    actionLabel: "Browse integrations",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    description: "Choose which updates reach your inbox and which stay in the app.",
    minutes: 1,
    icon: "bell",
    actionLabel: "Review settings",
  },
];

type StepStatus = "done" | "current" | "upcoming";

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set(["profile"]));
  const [celebrationKey, setCelebrationKey] = useState(0);
  const listLabelId = useId();

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(() => STEPS.find((s) => !completed.has(s.id))?.id ?? null, [completed]);

  const remainingMinutes = useMemo(
    () => STEPS.filter((s) => !completed.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [completed],
  );

  const toggle = useCallback(
    (id: string) => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
          if (next.size === STEPS.length) {
            setCelebrationKey((k) => k + 1);
          }
        }
        return next;
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setCompleted(new Set());
  }, []);

  const statusOf = (id: string): StepStatus =>
    completed.has(id) ? "done" : id === currentId ? "current" : "upcoming";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      <Column maxWidth="m" gap="24">
        <Column gap="12">
          <Row gap="8" vertical="center" wrap>
            <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Getting started" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {allDone ? "All done" : `About ${remainingMinutes} min left`}
            </Text>
          </Row>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Welcome to Northwind, Priya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these six steps to get your workspace ready for your team. Your progress is saved as you go.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="heading-strong-m" id="progress-label">
              Your progress
            </Text>
            <Text variant="label-default-m" onBackground="neutral-weak" aria-hidden="true">
              {doneCount} of {total} steps
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete, ${percent} percent`}
            style={{ width: "100%" }}
          >
            <ProgressBar value={percent} showLabel={false} barBackground={allDone ? "success-strong" : "brand-strong"} />
          </div>
          <Text variant="body-default-s" onBackground="neutral-weak" aria-hidden="true">
            {percent}% complete
          </Text>
          <VisuallyHidden>
            <div role="status" aria-live="polite">
              {allDone
                ? "All steps complete. Your workspace is ready."
                : `${doneCount} of ${total} steps complete.`}
            </div>
          </VisuallyHidden>
        </Column>

        {allDone && (
          <Column
            key={celebrationKey}
            background="surface"
            border="success-alpha-medium"
            radius="l"
            padding="32"
            gap="16"
            horizontal="center"
            align="center"
            position="relative"
            overflow="hidden"
            s={{ padding: "24" }}
          >
            <CelebrationFx
              type="confetti"
              trigger="mount"
              intensity={60}
              position="absolute"
              top="0"
              left="0"
              fill
              pointerEvents="none"
            />
            <Column gap="16" horizontal="center" zIndex={1}>
              <Row center solid="success-strong" radius="full" width={4} height={4} aria-hidden="true">
                <Icon name="check" size="l" onSolid="success-strong" />
              </Row>
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                You&apos;re all set!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Your workspace is ready. Your team can start planning their first sprint right away.
              </Text>
              <Row gap="12" horizontal="center" wrap>
                <Button href="#" label="Go to dashboard" suffixIcon="arrowRight" />
                <Button variant="secondary" label="Start over" prefixIcon="refresh" onClick={reset} />
              </Row>
            </Column>
          </Column>
        )}

        <Column gap="12">
          <Text variant="heading-strong-s" id={listLabelId}>
            Setup steps
          </Text>
          <Column as="ol" gap="12" margin="0" padding="0" aria-labelledby={listLabelId} style={{ listStyle: "none" }}>
            {STEPS.map((step, index) => {
              const status = statusOf(step.id);
              const isDone = status === "done";
              const isCurrent = status === "current";
              return (
                <Column
                  as="li"
                  key={step.id}
                  background={isCurrent ? "surface" : "transparent"}
                  border={isCurrent ? "brand-alpha-medium" : true}
                  radius="l"
                  padding="16"
                  gap="12"
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <Row gap="16" vertical="start">
                    <Row
                      center
                      width={2.5}
                      height={2.5}
                      radius="full"
                      solid={isDone ? "success-strong" : undefined}
                      background={isDone ? undefined : "neutral-alpha-weak"}
                      border={isDone ? undefined : isCurrent ? "brand-alpha-strong" : true}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <Icon name="check" size="s" onSolid="success-strong" />
                      ) : (
                        <Text variant="label-strong-s" onBackground={isCurrent ? "brand-strong" : "neutral-weak"}>
                          {index + 1}
                        </Text>
                      )}
                    </Row>

                    <Column flex={1} gap="4" minWidth={0}>
                      <Row gap="8" vertical="center" wrap>
                        <Icon name={step.icon} size="s" onBackground="neutral-weak" />
                        <Text
                          as="h3"
                          variant="heading-strong-s"
                          onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                          style={isDone ? { textDecoration: "line-through" } : undefined}
                        >
                          {step.title}
                        </Text>
                        <Row gap="6" vertical="center">
                          <StatusIndicator
                            size="s"
                            color={isDone ? "green" : isCurrent ? "blue" : "gray"}
                            ariaLabel={isDone ? "Completed" : isCurrent ? "Up next" : "Not started"}
                          />
                          <Text variant="label-default-xs" onBackground="neutral-weak">
                            {isDone ? "Completed" : isCurrent ? "Up next" : "Not started"}
                          </Text>
                        </Row>
                      </Row>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {step.description}
                      </Text>
                      <Row gap="4" vertical="center" paddingTop="4">
                        <Icon name="time" size="xs" onBackground="neutral-weak" />
                        <Text variant="label-default-xs" onBackground="neutral-weak">
                          {step.minutes} min
                        </Text>
                      </Row>
                    </Column>
                  </Row>

                  <Row gap="8" wrap paddingLeft="48" s={{ paddingLeft: "0" }}>
                    {!isDone && (
                      <Button
                        size="s"
                        variant={isCurrent ? "primary" : "secondary"}
                        label={step.actionLabel}
                        href="#"
                      />
                    )}
                    <Button
                      size="s"
                      variant={isDone ? "secondary" : "tertiary"}
                      prefixIcon={isDone ? "refresh" : "check"}
                      label={isDone ? "Mark as not done" : "Mark as done"}
                      onClick={() => toggle(step.id)}
                      aria-label={`${isDone ? "Mark as not done" : "Mark as done"}: ${step.title}`}
                    />
                  </Row>
                </Column>
              );
            })}
          </Column>
        </Column>
      </Column>
    </Column>
  );
}
```
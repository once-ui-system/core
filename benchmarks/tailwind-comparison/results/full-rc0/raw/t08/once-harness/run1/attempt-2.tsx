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

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(() => new Set(["profile"]));
  const [celebrationKey, setCelebrationKey] = useState(0);
  const listLabelId = useId();
  const progressLabelId = useId();

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(() => STEPS.find((s) => !completed.has(s.id))?.id ?? null, [completed]);

  const remainingMinutes = useMemo(
    () => STEPS.filter((s) => !completed.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [completed],
  );

  const toggle = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const markDone = (step: Step) => {
    const willComplete = !completed.has(step.id) && completed.size + 1 === STEPS.length;
    toggle(step.id);
    if (willComplete) {
      setCelebrationKey((k) => k + 1);
    }
  };

  const reset = useCallback(() => {
    setCompleted(new Set());
  }, []);

  const statusOf = (id: string): StepStatus =>
    completed.has(id) ? "done" : id === currentId ? "current" : "upcoming";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40">
      <Column maxWidth="m" gap="24">
        <Column gap="12">
          <Row gap="8" vertical="center" wrap>
            <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Getting started" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              {allDone ? "All done" : `About ${remainingMinutes} min left`}
            </Text>
          </Row>
          <Heading as="h1" variant="display-strong-s">
            Welcome to Northwind, Priya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these six steps to get your workspace ready for your team. Mark a step as done once you have
            completed it.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="heading-strong-m">
              <span id={progressLabelId}>Your progress</span>
            </Text>
            <Text variant="label-default-m" onBackground="neutral-weak">
              {doneCount} of {total} steps
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby={progressLabelId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete, ${percent} percent`}
            style={{ width: "100%" }}
          >
            <ProgressBar value={percent} showLabel={false} />
          </div>
          <Text variant="body-default-s" onBackground="neutral-weak">
            {percent}% complete
          </Text>
          <div role="status" aria-live="polite" style={visuallyHidden}>
            {allDone ? "All steps complete. Your workspace is ready." : `${doneCount} of ${total} steps complete.`}
          </div>
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
            overflow="hidden"
          >
            <div
              aria-hidden="true"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none" }}
            >
              <CelebrationFx type="confetti" trigger="mount" intensity={60} fill />
            </div>
            <Column gap="16" horizontal="center" align="center">
              <div
                aria-hidden="true"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--success-solid-strong)",
                  color: "var(--success-on-solid-strong)",
                }}
              >
                <Icon name="check" size="l" />
              </div>
              <Heading as="h2" variant="display-strong-xs">
                You&apos;re all set!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Your workspace is ready. Your team can start planning their first sprint right away.
              </Text>
              <Row gap="12" horizontal="center" wrap>
                <Button label="Go to dashboard" suffixIcon="arrowRight" />
                <Button variant="secondary" label="Start over" prefixIcon="refresh" onClick={reset} />
              </Row>
            </Column>
          </Column>
        )}

        <Column gap="12">
          <Text variant="heading-strong-s">
            <span id={listLabelId}>Setup steps</span>
          </Text>
          <ol
            aria-labelledby={listLabelId}
            style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}
          >
            {STEPS.map((step, index) => {
              const status = statusOf(step.id);
              const isDone = status === "done";
              const isCurrent = status === "current";
              const statusText = isDone ? "Completed" : isCurrent ? "Up next" : "Not started";
              const toggleLabel = isDone ? "Mark as not done" : "Mark as done";
              return (
                <li key={step.id} aria-current={isCurrent ? "step" : undefined} style={{ display: "block" }}>
                  <Column
                    background={isCurrent ? "surface" : "transparent"}
                    border={isCurrent ? "brand-alpha-medium" : true}
                    radius="l"
                    padding="16"
                    gap="12"
                  >
                    <Row gap="16" vertical="start">
                      <div
                        aria-hidden="true"
                        style={{
                          flexShrink: 0,
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isDone ? "var(--success-solid-strong)" : "var(--neutral-alpha-weak)",
                          color: isDone ? "var(--success-on-solid-strong)" : "inherit",
                        }}
                      >
                        {isDone ? (
                          <Icon name="check" size="s" />
                        ) : (
                          <Text variant="label-strong-s" onBackground={isCurrent ? "brand-strong" : "neutral-weak"}>
                            {index + 1}
                          </Text>
                        )}
                      </div>

                      <Column flex={1} gap="4">
                        <Row gap="8" vertical="center" wrap>
                          <Icon name={step.icon} size="s" onBackground="neutral-weak" />
                          <h3 style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}>
                            <Text
                              variant="heading-strong-s"
                              onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                              style={isDone ? { textDecoration: "line-through" } : undefined}
                            >
                              {step.title}
                            </Text>
                          </h3>
                          <Row gap="8" vertical="center">
                            <StatusIndicator
                              size="s"
                              color={isDone ? "green" : isCurrent ? "blue" : "gray"}
                              ariaLabel={statusText}
                            />
                            <Text variant="label-default-xs" onBackground="neutral-weak">
                              {statusText}
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

                    <Row gap="8" wrap>
                      <Button
                        size="s"
                        variant={isDone ? "secondary" : isCurrent ? "primary" : "tertiary"}
                        prefixIcon={isDone ? "refresh" : "check"}
                        label={toggleLabel}
                        onClick={() => markDone(step)}
                        aria-label={`${toggleLabel}: ${step.title}`}
                      />
                    </Row>
                  </Column>
                </li>
              );
            })}
          </ol>
        </Column>
      </Column>
    </Column>
  );
}

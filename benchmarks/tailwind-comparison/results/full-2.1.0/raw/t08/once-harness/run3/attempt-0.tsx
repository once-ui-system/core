"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Button,
  CelebrationFx,
  Column,
  Feedback,
  Heading,
  Icon,
  ProgressBar,
  Row,
  Tag,
  Text,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: IconName;
  minutes: number;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    summary: "Add your name, role and a short bio.",
    detail:
      "Teammates see this on comments, assignments and mentions. A clear role helps Priya from design and Marcus from engineering know who to ask.",
    icon: "person",
    minutes: 2,
    actionLabel: "Edit profile",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    summary: "Pick a workspace name and a URL slug.",
    detail:
      "Your workspace lives at northwind.example/your-slug. You can rename it later, and old links will keep redirecting for 30 days.",
    icon: "organization",
    minutes: 1,
    actionLabel: "Open workspace settings",
  },
  {
    id: "invite",
    title: "Invite your team",
    summary: "Send invites to at least two teammates.",
    detail:
      "Invite by email or share a link restricted to your company domain. Invited members can join as editors or viewers.",
    icon: "mail",
    minutes: 3,
    actionLabel: "Invite teammates",
  },
  {
    id: "project",
    title: "Create your first project",
    summary: "Start from a template or a blank board.",
    detail:
      "Templates include Product launch, Sprint planning and Customer onboarding. Each comes with sample tasks you can delete in one click.",
    icon: "folder",
    minutes: 4,
    actionLabel: "Browse templates",
  },
  {
    id: "integrations",
    title: "Connect an integration",
    summary: "Link Slack, GitHub or your calendar.",
    detail:
      "Integrations post updates to the channels you choose and sync due dates to your calendar. You can disconnect any of them at any time.",
    icon: "link",
    minutes: 3,
    actionLabel: "View integrations",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    summary: "Choose what reaches your inbox and when.",
    detail:
      "Pick between instant alerts, a daily digest or mentions only. Quiet hours pause everything outside your working day.",
    icon: "bell",
    minutes: 1,
    actionLabel: "Open preferences",
  },
];

type Status = "done" | "current" | "todo";

function StatusMark({ status }: { status: Status }) {
  if (status === "done") {
    return (
      <Row
        center
        solid="success-strong"
        onSolid="success-strong"
        radius="full"
        width={32}
        height={32}
        flex={0}
        aria-hidden="true"
      >
        <Icon name="check" size="s" onBackground="success-strong" decorative />
      </Row>
    );
  }
  if (status === "current") {
    return (
      <Row
        center
        radius="full"
        width={32}
        height={32}
        border="brand-alpha-strong"
        borderWidth={2}
        background="brand-alpha-weak"
        aria-hidden="true"
      >
        <Row radius="full" width={12} height={12} solid="brand-strong" />
      </Row>
    );
  }
  return (
    <Row
      center
      radius="full"
      width={32}
      height={32}
      border="neutral-alpha-medium"
      borderWidth={2}
      borderStyle="dashed"
      aria-hidden="true"
    />
  );
}

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set<string>(["profile"]));
  const [expandedId, setExpandedId] = useState<string | null>("workspace");
  const [celebrationKey, setCelebrationKey] = useState(0);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const remainingMinutes = useMemo(
    () => STEPS.filter((s) => !completed.has(s.id)).reduce((sum, s) => sum + s.minutes, 0),
    [completed],
  );

  const toggleStep = useCallback(
    (id: string) => {
      const next = new Set(completed);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (next.size === STEPS.length) {
          setCelebrationKey((k) => k + 1);
          setExpandedId(null);
        } else {
          const following = STEPS.find((s) => !next.has(s.id));
          setExpandedId(following ? following.id : null);
        }
      }
      setCompleted(next);
    },
    [completed],
  );

  const reset = useCallback(() => {
    setCompleted(new Set<string>());
    setExpandedId(STEPS[0].id);
  }, []);

  const statusText = allDone
    ? "All 6 steps complete. You're ready to go."
    : `${doneCount} of ${total} steps complete. About ${remainingMinutes} minutes left.`;

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      {allDone && celebrationKey > 0 && (
        <Row
          key={celebrationKey}
          position="fixed"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          aria-hidden="true"
        >
          <CelebrationFx fill type="confetti" intensity={80} duration={4000} />
        </Row>
      )}

      <Column maxWidth="s" gap="32">
        <Column gap="12">
          <Row gap="8" vertical="center">
            <Tag scheme="brand" size="s" prefixIcon="sparkle" label="Getting started" />
          </Row>
          <Heading as="h1" variant="display-strong-s" wrap="balance">
            Welcome to Northwind, Amara
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these six steps to set up your workspace. It takes about 14 minutes, and you can
            leave and come back at any time.
          </Text>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16" s={{ padding: "16" }}>
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="heading-strong-m" id="progress-label">
              Your setup progress
            </Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {doneCount} / {total} complete
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent}% complete`}
            style={{ width: "100%" }}
          >
            <ProgressBar
              value={percent}
              showLabel={false}
              fillWidth
              barBackground={allDone ? "success-strong" : "brand-strong"}
            />
          </div>
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {allDone ? "Setup finished" : `About ${remainingMinutes} min remaining`}
            </Text>
            <Text variant="label-strong-s" onBackground={allDone ? "success-strong" : "brand-strong"}>
              {percent}%
            </Text>
          </Row>
          <span
            aria-live="polite"
            role="status"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0 0 0 0)",
              whiteSpace: "nowrap",
            }}
          >
            {statusText}
          </span>
        </Column>

        {allDone && (
          <Column
            background="success-alpha-weak"
            border="success-alpha-medium"
            radius="l"
            padding="24"
            gap="16"
            s={{ padding: "16" }}
          >
            <Row gap="16" vertical="start">
              <Row
                center
                solid="success-strong"
                radius="full"
                width={48}
                height={48}
                flex={0}
                aria-hidden="true"
              >
                <Icon name="gift" size="m" onBackground="success-strong" decorative />
              </Row>
              <Column gap="8" flex={1}>
                <Heading as="h2" variant="display-strong-xs">
                  You&apos;re all set!
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-medium">
                  Your workspace is ready. Your team can start planning, and your first project is
                  waiting for you.
                </Text>
              </Column>
            </Row>
            <Row gap="12" wrap>
              <Button href="#" label="Go to dashboard" suffixIcon="arrowRight" />
              <Button variant="secondary" label="Restart checklist" prefixIcon="refresh" onClick={reset} />
            </Row>
          </Column>
        )}

        <Column as="section" gap="16" aria-labelledby="steps-heading">
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Heading as="h2" variant="heading-strong-l" id="steps-heading">
              Checklist
            </Heading>
            {!allDone && doneCount > 0 && (
              <Button variant="tertiary" size="s" label="Reset" prefixIcon="refresh" onClick={reset} />
            )}
          </Row>

          <Column as="ol" gap="8" margin="0" padding="0" style={{ listStyle: "none" }}>
            {STEPS.map((step, index) => {
              const isDone = completed.has(step.id);
              const status: Status = isDone ? "done" : step.id === currentId ? "current" : "todo";
              const isOpen = expandedId === step.id;
              const panelId = `step-panel-${step.id}`;
              const statusLabel =
                status === "done" ? "Completed" : status === "current" ? "Up next" : "Not started";

              return (
                <li key={step.id} style={{ listStyle: "none" }}>
                  <Column
                    background="surface"
                    border={status === "current" ? "brand-alpha-medium" : true}
                    radius="l"
                    overflow="hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setExpandedId(isOpen ? null : step.id)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        width: "100%",
                        padding: "1rem",
                        cursor: "pointer",
                      }}
                    >
                      <StatusMark status={status} />
                      <Column flex={1} gap="4">
                        <Text
                          variant="label-strong-m"
                          onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                          style={isDone ? { textDecoration: "line-through" } : undefined}
                        >
                          <Text as="span" variant="label-default-s" onBackground="neutral-weak">
                            {index + 1}.{" "}
                          </Text>
                          {step.title}
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.summary}
                        </Text>
                      </Column>
                      <Row gap="12" vertical="center" flex={0}>
                        <Column s={{ hide: true }}>
                          <Tag
                            size="s"
                            scheme={status === "done" ? "success" : status === "current" ? "brand" : "neutral"}
                            label={statusLabel}
                          />
                        </Column>
                        <Icon name={isOpen ? "chevronUp" : "chevronDown"} size="s" onBackground="neutral-weak" />
                      </Row>
                      <span
                        style={{
                          position: "absolute",
                          width: 1,
                          height: 1,
                          overflow: "hidden",
                          clip: "rect(0 0 0 0)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {`Status: ${statusLabel}. About ${step.minutes} ${step.minutes === 1 ? "minute" : "minutes"}.`}
                      </span>
                    </button>

                    {isOpen && (
                      <Column
                        id={panelId}
                        role="region"
                        aria-label={`${step.title} details`}
                        gap="16"
                        paddingX="16"
                        paddingBottom="16"
                        paddingLeft="64"
                        s={{ paddingLeft: "16" }}
                      >
                        <Text variant="body-default-m" onBackground="neutral-medium">
                          {step.detail}
                        </Text>
                        <Row gap="12" vertical="center" wrap>
                          <Button
                            size="s"
                            variant={isDone ? "secondary" : "primary"}
                            prefixIcon={isDone ? "refresh" : "check"}
                            label={isDone ? "Mark as not done" : "Mark as done"}
                            onClick={() => toggleStep(step.id)}
                          />
                          <Button
                            size="s"
                            variant="tertiary"
                            prefixIcon={step.icon}
                            label={step.actionLabel}
                            href="#"
                          />
                          <Row gap="4" vertical="center">
                            <Icon name="time" size="xs" onBackground="neutral-weak" />
                            <Text variant="label-default-s" onBackground="neutral-weak">
                              ~{step.minutes} min
                            </Text>
                          </Row>
                        </Row>
                      </Column>
                    )}
                  </Column>
                </li>
              );
            })}
          </Column>
        </Column>

        {!allDone && (
          <Feedback
            variant="info"
            title="Tip"
            description="Open any step to read what it involves, then mark it done when you're finished. Your progress is tracked as you go."
          />
        )}
      </Column>
    </Column>
  );
}

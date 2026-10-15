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
    summary: "Add your name, role and a photo.",
    detail:
      "Teammates see this on comments, mentions and assigned tasks. It takes about a minute and you can change it any time from account settings.",
    icon: "person",
    minutes: 1,
    actionLabel: "Edit profile",
  },
  {
    id: "workspace",
    title: "Name your workspace",
    summary: "Pick a name and URL for Harbor Studio.",
    detail:
      "Your workspace URL is what teammates use to sign in, for example harbor-studio.example.com. Choose something short and recognisable.",
    icon: "organization",
    minutes: 2,
    actionLabel: "Open workspace settings",
  },
  {
    id: "invite",
    title: "Invite your team",
    summary: "Bring in at least two collaborators.",
    detail:
      "Paste email addresses or share an invite link. Invited members can join as editors or viewers, and you can adjust roles later.",
    icon: "mail",
    minutes: 3,
    actionLabel: "Send invites",
  },
  {
    id: "project",
    title: "Create your first project",
    summary: "Start from a template or a blank board.",
    detail:
      "Templates include a product launch plan, a sprint board and a content calendar, each with sample tasks you can delete in one click.",
    icon: "folder",
    minutes: 4,
    actionLabel: "Browse templates",
  },
  {
    id: "integrations",
    title: "Connect your tools",
    summary: "Link Slack, GitHub or Google Calendar.",
    detail:
      "Integrations post updates to your channels and sync due dates to your calendar. Each one can be disconnected whenever you like.",
    icon: "link",
    minutes: 2,
    actionLabel: "View integrations",
  },
  {
    id: "notifications",
    title: "Set notification preferences",
    summary: "Choose what reaches your inbox.",
    detail:
      "Pick between instant alerts, a daily digest or mentions only. Quiet hours keep late-night pings out of your evenings.",
    icon: "bell",
    minutes: 1,
    actionLabel: "Review preferences",
  },
];

type Status = "done" | "current" | "todo";

function StatusBadge({ status, index }: { status: Status; index: number }) {
  if (status === "done") {
    return (
      <Row
        center
        width={32}
        height={32}
        radius="full"
        solid="success-strong"
        onSolid="success-strong"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <Icon name="check" size="s" onBackground="neutral-strong" />
      </Row>
    );
  }
  return (
    <Row
      center
      width={32}
      height={32}
      radius="full"
      border={status === "current" ? "brand-strong" : true}
      borderWidth={2}
      background={status === "current" ? "brand-alpha-weak" : "transparent"}
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <Text
        variant="label-strong-s"
        onBackground={status === "current" ? "brand-strong" : "neutral-medium"}
      >
        {index + 1}
      </Text>
    </Row>
  );
}

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(STEPS[0].id);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const listId = useId();

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const minutesLeft = useMemo(
    () =>
      STEPS.filter((s) => !completed.has(s.id)).reduce(
        (sum, s) => sum + s.minutes,
        0,
      ),
    [completed],
  );

  const toggleStep = useCallback(
    (id: string) => {
      const next = new Set(completed);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Move focus of attention to the next unfinished step
        const following = STEPS.find((s) => !next.has(s.id));
        setOpenId(following ? following.id : null);
        if (next.size === STEPS.length) {
          setCelebrationKey((k) => k + 1);
        }
      }
      setCompleted(next);
    },
    [completed],
  );

  const reset = useCallback(() => {
    setCompleted(new Set());
    setOpenId(STEPS[0].id);
  }, []);

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      {allDone && celebrationKey > 0 && (
        <CelebrationFx
          key={celebrationKey}
          type="confetti"
          trigger="mount"
          intensity={80}
          duration={4000}
          position="fixed"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          zIndex={10}
          aria-hidden="true"
        />
      )}

      <Column maxWidth="s" fillWidth gap="32">
        <Column gap="12">
          <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Getting started" />
          <Heading as="h1" variant="display-strong-s">
            Welcome to Harbor Studio
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these six steps to get your team set up. It takes about{" "}
            {STEPS.reduce((s, x) => s + x.minutes, 0)} minutes in total.
          </Text>
        </Column>

        <Column
          background="surface"
          border
          radius="l"
          padding="24"
          gap="16"
          s={{ padding: "16" }}
        >
          {allDone ? (
            <Column gap="16" horizontal="center" align="center" paddingY="16" role="status">
              <Row
                center
                width={64}
                height={64}
                radius="full"
                background="success-alpha-weak"
                border="success-alpha-medium"
              >
                <Icon name="smiley" size="l" onBackground="success-strong" />
              </Row>
              <Heading as="h2" variant="display-strong-xs">
                You&apos;re all set!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak" style={{ maxWidth: "36ch" }}>
                Your workspace is ready. All {total} steps are complete, so
                you can start planning your first project with the team.
              </Text>
              <Row gap="12" wrap horizontal="center">
                <Button href="#" prefixIcon="arrowRight" label="Go to dashboard" />
                <Button variant="secondary" prefixIcon="refresh" onClick={reset} label="Start over" />
              </Row>
            </Column>
          ) : (
            <Column gap="12">
              <Row horizontal="between" vertical="end" gap="12" wrap>
                <Column gap="4">
                  <Heading as="h2" variant="heading-strong-l">
                    Your setup progress
                  </Heading>
                  <Text variant="body-default-s" onBackground="neutral-weak" aria-live="polite">
                    {doneCount} of {total} steps complete
                    {minutesLeft > 0 ? ` · about ${minutesLeft} min left` : ""}
                  </Text>
                </Column>
                <Text variant="display-strong-xs" onBackground="brand-strong" aria-hidden="true">
                  {percent}%
                </Text>
              </Row>
              <div
                role="progressbar"
                aria-label="Onboarding progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                aria-valuetext={`${doneCount} of ${total} steps complete`}
                style={{ width: "100%" }}
              >
                <ProgressBar value={percent} showLabel={false} fillWidth />
              </div>
            </Column>
          )}
        </Column>

        <Column as="section" gap="12" aria-labelledby={`${listId}-heading`}>
          <Heading as="h2" variant="heading-strong-m" id={`${listId}-heading`}>
            Checklist
          </Heading>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {STEPS.map((step, index) => {
              const isDone = completed.has(step.id);
              const status: Status = isDone ? "done" : step.id === currentId ? "current" : "todo";
              const isOpen = openId === step.id;
              const panelId = `${listId}-panel-${step.id}`;
              const statusText =
                status === "done" ? "Completed" : status === "current" ? "Up next" : "Not started";

              return (
                <li key={step.id}>
                  <Column
                    background="surface"
                    border={status === "current" ? "brand-alpha-strong" : true}
                    radius="l"
                    overflow="hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : step.id)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        width: "100%",
                        padding: "16px 20px",
                        cursor: "pointer",
                      }}
                    >
                      <StatusBadge status={status} index={index} />
                      <Column flex={1} gap="4" style={{ minWidth: 0 }}>
                        <Text
                          variant="label-strong-l"
                          onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                          style={isDone ? { textDecoration: "line-through" } : undefined}
                        >
                          {step.title}
                        </Text>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.summary}
                        </Text>
                      </Column>
                      <Row gap="8" vertical="center" style={{ flexShrink: 0 }}>
                        <Row hide s={{ hide: false }}>
                          <VisuallyHiddenText>{statusText}</VisuallyHiddenText>
                        </Row>
                        <Row hide s={{ hide: true }} m={{ hide: false }}>
                          <Tag
                            size="s"
                            scheme={
                              status === "done" ? "success" : status === "current" ? "brand" : "neutral"
                            }
                            label={statusText}
                          />
                        </Row>
                        <Icon name={isOpen ? "chevronUp" : "chevronDown"} size="s" onBackground="neutral-weak" />
                      </Row>
                    </button>

                    <div
                      id={panelId}
                      role="region"
                      aria-label={`${step.title} details`}
                      hidden={!isOpen}
                    >
                      {isOpen && (
                        <Column
                          gap="16"
                          paddingX="20"
                          paddingBottom="20"
                          s={{ paddingX: "16" }}
                          borderTop
                          paddingTop="16"
                        >
                          <Text variant="body-default-m" onBackground="neutral-medium">
                            {step.detail}
                          </Text>
                          <Row gap="12" vertical="center" wrap>
                            <Button
                              size="s"
                              variant={isDone ? "secondary" : "primary"}
                              prefixIcon={isDone ? "refresh" : "check"}
                              onClick={() => toggleStep(step.id)}
                              label={isDone ? "Mark as not done" : "Mark as complete"}
                            />
                            {!isDone && (
                              <Button
                                size="s"
                                variant="tertiary"
                                prefixIcon={step.icon}
                                href="#"
                                label={step.actionLabel}
                              />
                            )}
                            <Row gap="4" vertical="center" marginLeft="auto">
                              <Icon name="time" size="xs" onBackground="neutral-weak" />
                              <Text variant="label-default-s" onBackground="neutral-weak">
                                ~{step.minutes} min
                              </Text>
                            </Row>
                          </Row>
                        </Column>
                      )}
                    </div>
                  </Column>
                </li>
              );
            })}
          </ul>
        </Column>

        {!allDone && (
          <Text variant="body-default-s" onBackground="neutral-weak" align="center">
            Need a hand? Our support team replies within a few hours at
            help@harbor-studio.example.
          </Text>
        )}
      </Column>
    </Column>
  );
}

function VisuallyHiddenText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

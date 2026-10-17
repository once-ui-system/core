"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  CelebrationFx,
  Column,
  Heading,
  Icon,
  Line,
  ProgressBar,
  Row,
  Tag,
  Text,
  VisuallyHidden,
} from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: IconName;
  actionLabel: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your profile",
    summary: "Add your name, role and a team photo.",
    detail:
      "Teammates see this on comments and assignments. Add your role so reviewers know when to loop you in.",
    icon: "person",
    actionLabel: "Edit profile",
    minutes: 2,
  },
  {
    id: "workspace",
    title: "Create your first workspace",
    summary: "Give your team a home for projects and files.",
    detail:
      "Workspaces keep projects, files and permissions together. Start with one for your team and split later if you need to.",
    icon: "folder",
    actionLabel: "Create workspace",
    minutes: 3,
  },
  {
    id: "invite",
    title: "Invite two teammates",
    summary: "Work is faster with the people who review it.",
    detail:
      "Send invites by email. Teammates join with the Member role by default, and you can change roles at any time in Settings.",
    icon: "mail",
    actionLabel: "Send invites",
    minutes: 2,
  },
  {
    id: "integration",
    title: "Connect Slack",
    summary: "Get deploy and review updates in your channel.",
    detail:
      "Pick a channel for build results and review requests. You can mute individual projects later without disconnecting.",
    icon: "link",
    actionLabel: "Connect Slack",
    minutes: 4,
  },
  {
    id: "alerts",
    title: "Set up notifications",
    summary: "Choose what is worth interrupting you for.",
    detail:
      "We recommend mentions and review requests only. Everything else lands in your daily digest at 9:00 AM.",
    icon: "bell",
    actionLabel: "Review preferences",
    minutes: 1,
  },
];

type Status = "done" | "current" | "upcoming";

export default function Page() {
  const [completed, setCompleted] = useState<ReadonlySet<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(STEPS[0].id);
  const [celebrate, setCelebrate] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const wasCompleteRef = useRef(false);

  const total = STEPS.length;
  const doneCount = completed.size;
  const percent = Math.round((doneCount / total) * 100);
  const allDone = doneCount === total;

  const currentId = useMemo(
    () => STEPS.find((s) => !completed.has(s.id))?.id ?? null,
    [completed],
  );

  const remainingMinutes = useMemo(
    () =>
      STEPS.filter((s) => !completed.has(s.id)).reduce(
        (sum, s) => sum + s.minutes,
        0,
      ),
    [completed],
  );

  useEffect(() => {
    if (allDone && !wasCompleteRef.current) {
      setCelebrate(true);
      setAnnouncement("All steps complete. Your workspace is ready.");
    } else if (!allDone) {
      setCelebrate(false);
    }
    wasCompleteRef.current = allDone;
  }, [allDone]);

  const toggleStep = useCallback(
    (step: Step) => {
      const next = new Set(completed);
      const nowDone = !next.has(step.id);
      if (nowDone) {
        next.add(step.id);
      } else {
        next.delete(step.id);
      }
      setCompleted(next);

      const count = next.size;
      if (count < total) {
        setAnnouncement(
          `${step.title} ${nowDone ? "marked complete" : "marked incomplete"}. ${count} of ${total} steps done.`,
        );
      }

      if (nowDone) {
        const following = STEPS.find((s) => !next.has(s.id));
        setOpenId(following ? following.id : null);
      } else {
        setOpenId(step.id);
      }
    },
    [completed, total],
  );

  const reset = useCallback(() => {
    setCompleted(new Set());
    setOpenId(STEPS[0].id);
    setCelebrate(false);
    setAnnouncement("Checklist reset. 0 steps done.");
  }, []);

  const statusOf = (id: string): Status =>
    completed.has(id) ? "done" : id === currentId ? "current" : "upcoming";

  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="40" s={{ paddingY: "24" }}>
      {celebrate && (
        <CelebrationFx
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

      <Column maxWidth="m" fillWidth gap="32">
        <Column gap="12">
          <Row gap="8" vertical="center">
            <Tag scheme="brand" size="m" prefixIcon="sparkle" label="Getting started" />
            <Text variant="label-default-s" onBackground="neutral-weak">
              About {remainingMinutes} min left
            </Text>
          </Row>
          <Heading as="h1" variant="display-strong-s">
            Welcome to Northwind, Priya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Five quick steps to get your team up and running. Check them off as
            you go, in any order.
          </Text>
        </Column>

        <Column
          background="surface"
          border
          radius="l"
          padding="24"
          s={{ padding: "16" }}
          gap="16"
        >
          <Row horizontal="between" vertical="center" gap="16" wrap>
            <Heading as="h2" variant="heading-strong-l" id="progress-heading">
              Your progress
            </Heading>
            <Text variant="label-strong-m" onBackground={allDone ? "success-strong" : "brand-medium"}>
              {doneCount} of {total} complete
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="progress-heading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${doneCount} of ${total} steps complete`}
            style={{ width: "100%" }}
          >
            <ProgressBar
              value={percent}
              showLabel={false}
              barBackground={allDone ? "success-strong" : "brand-strong"}
              aria-hidden="true"
            />
          </div>
        </Column>

        {allDone ? (
          <Column
            background="surface"
            border="success-alpha-medium"
            radius="l"
            padding="40"
            s={{ padding: "24" }}
            gap="16"
            horizontal="center"
            align="center"
            role="status"
          >
            <Column
              center
              radius="full"
              background="success-alpha-weak"
              border="success-alpha-medium"
              width={80}
              height={80}
            >
              <Icon name="check" size="l" onBackground="success-strong" />
            </Column>
            <Heading as="h2" variant="display-strong-xs">
              You&apos;re all set!
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" style={{ maxWidth: "36ch" }}>
              Your profile, workspace, teammates and integrations are ready.
              Time to ship something great together.
            </Text>
            <Row gap="12" horizontal="center" wrap paddingTop="8">
              <Button label="Open your workspace" suffixIcon="arrowRight" href="#" />
              <Button label="Start over" variant="secondary" prefixIcon="refresh" onClick={reset} />
            </Row>
          </Column>
        ) : null}

        <Column as="section" aria-labelledby="steps-heading" gap="12">
          <VisuallyHidden>
            <Heading as="h2" id="steps-heading">
              Onboarding steps
            </Heading>
          </VisuallyHidden>
          <Column as="ol" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
            {STEPS.map((step, index) => {
              const status = statusOf(step.id);
              const isOpen = openId === step.id;
              const panelId = `panel-${step.id}`;
              const headerId = `header-${step.id}`;

              return (
                <Column
                  as="li"
                  key={step.id}
                  background="surface"
                  border={status === "current" ? "brand-alpha-strong" : true}
                  radius="l"
                  overflow="hidden"
                  style={{ opacity: status === "upcoming" ? 0.85 : 1 }}
                >
                  <Row fillWidth vertical="center" gap="16" padding="16" s={{ gap: "12", padding: "12" }}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={status === "done"}
                      aria-label={`Mark "${step.title}" as ${status === "done" ? "incomplete" : "complete"}`}
                      onClick={() => toggleStep(step)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        flexShrink: 0,
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        borderRadius: 9999,
                      }}
                      className="step-toggle"
                    >
                      <StatusBadge status={status} index={index + 1} />
                    </button>

                    <button
                      type="button"
                      id={headerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : step.id)}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        cursor: "pointer",
                        minHeight: 44,
                        borderRadius: 8,
                      }}
                      className="step-header"
                    >
                      <Column flex={1} gap="4" style={{ minWidth: 0 }}>
                        <Row gap="8" vertical="center" wrap>
                          <Text
                            variant="label-strong-l"
                            onBackground={status === "done" ? "neutral-weak" : "neutral-strong"}
                            style={{
                              textDecoration: status === "done" ? "line-through" : "none",
                            }}
                          >
                            {step.title}
                          </Text>
                          {status === "current" && (
                            <Tag scheme="brand" size="s" label="Up next" />
                          )}
                          {status === "done" && (
                            <Tag scheme="success" size="s" label="Done" />
                          )}
                        </Row>
                        <Text variant="body-default-s" onBackground="neutral-weak">
                          {step.summary}
                        </Text>
                      </Column>
                      <Icon
                        name={isOpen ? "chevronUp" : "chevronDown"}
                        size="s"
                        onBackground="neutral-weak"
                      />
                    </button>
                  </Row>

                  {isOpen && (
                    <Column
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      paddingX="16"
                      paddingBottom="16"
                      s={{ paddingX: "12", paddingBottom: "12" }}
                      gap="16"
                    >
                      <Line />
                      <Row gap="12" vertical="start">
                        <Icon name={step.icon} size="m" onBackground="brand-medium" />
                        <Text variant="body-default-m" onBackground="neutral-weak">
                          {step.detail}
                        </Text>
                      </Row>
                      <Row gap="12" vertical="center" wrap>
                        {status === "done" ? (
                          <Button
                            label="Mark as not done"
                            variant="tertiary"
                            size="s"
                            prefixIcon="return"
                            onClick={() => toggleStep(step)}
                          />
                        ) : (
                          <Button
                            label={step.actionLabel}
                            size="s"
                            suffixIcon="check"
                            onClick={() => toggleStep(step)}
                          />
                        )}
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
              );
            })}
          </Column>
        </Column>

        <div aria-live="polite" role="status" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
          {announcement}
        </div>

        {!allDone && doneCount > 0 && (
          <Row horizontal="center">
            <Button label="Reset checklist" variant="tertiary" size="s" prefixIcon="refresh" onClick={reset} />
          </Row>
        )}
      </Column>

      <style>{`
        .step-toggle:focus-visible,
        .step-header:focus-visible {
          outline: 2px solid var(--brand-solid-strong);
          outline-offset: 2px;
        }
      `}</style>
    </Column>
  );
}

function StatusBadge({ status, index }: { status: Status; index: number }) {
  if (status === "done") {
    return (
      <Column
        center
        radius="full"
        width={32}
        height={32}
        background="success-alpha-weak"
        border="success-alpha-strong"
        aria-hidden="true"
      >
        <Icon name="check" size="xs" onBackground="success-strong" />
      </Column>
    );
  }
  if (status === "current") {
    return (
      <Column
        center
        radius="full"
        width={32}
        height={32}
        background="brand-alpha-weak"
        border="brand-alpha-strong"
        aria-hidden="true"
      >
        <Text variant="label-strong-s" onBackground="brand-strong">
          {index}
        </Text>
      </Column>
    );
  }
  return (
    <Column
      center
      radius="full"
      width={32}
      height={32}
      border="neutral-alpha-medium"
      borderStyle="dashed"
      aria-hidden="true"
    >
      <Text variant="label-default-s" onBackground="neutral-weak">
        {index}
      </Text>
    </Column>
  );
}

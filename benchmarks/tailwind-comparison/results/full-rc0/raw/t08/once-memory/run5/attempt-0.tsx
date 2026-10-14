"use client";

import { useId, useMemo, useState } from "react";
import { Badge, Button, Column, Flex, Heading, Icon, Row, Text } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  actionLabel: string;
  estimate: string;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    summary: "Add your team name, logo initials and time zone.",
    detail:
      "Your profile helps teammates recognise the workspace in invites and notifications. Pick a time zone so scheduled reports arrive at a sensible hour.",
    actionLabel: "Edit profile",
    estimate: "2 min",
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    summary: "Send invitations to at least two collaborators.",
    detail:
      "Invite colleagues by email. They can join as editors or viewers, and you can change roles at any time from the members page.",
    actionLabel: "Send invites",
    estimate: "3 min",
  },
  {
    id: "source",
    title: "Connect a data source",
    summary: "Link your warehouse, CSV upload or analytics tool.",
    detail:
      "Connect PostgreSQL, BigQuery, or upload a CSV to see real numbers right away. Credentials are encrypted and read-only by default.",
    actionLabel: "Connect source",
    estimate: "5 min",
  },
  {
    id: "dashboard",
    title: "Build your first dashboard",
    summary: "Start from a template and pin three key metrics.",
    detail:
      "Templates for revenue, product usage and support load are ready to go. Pin the metrics you check every morning so they sit at the top.",
    actionLabel: "Open templates",
    estimate: "4 min",
  },
  {
    id: "alerts",
    title: "Set up a weekly digest",
    summary: "Get a Monday summary delivered to your inbox or Slack.",
    detail:
      "Choose the dashboards to include and the channel to deliver them to. You can pause the digest whenever you need a quiet week.",
    actionLabel: "Schedule digest",
    estimate: "1 min",
  },
];

const CONFETTI_COLORS = ["#f5b700", "#ef476f", "#06d6a0", "#118ab2", "#9b5de5", "#ff7f50"];

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 53) % 60) / 100,
  duration: 1.8 + ((i * 29) % 12) / 10,
  drift: ((i * 17) % 80) - 40,
  size: 6 + ((i * 7) % 6),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  round: i % 3 === 0,
}));

const STYLES = `
.ob-progress-track {
  height: 10px;
  width: 100%;
  border-radius: 999px;
  background: var(--neutral-alpha-medium);
  overflow: hidden;
}
.ob-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--brand-solid-strong, #3b82f6);
  transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
.ob-progress-fill[data-complete="true"] {
  background: var(--success-solid-strong, #16a34a);
}
.ob-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ob-item {
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px;
  background: var(--surface-background, transparent);
  transition: border-color 200ms ease, background 200ms ease;
}
.ob-item[data-done="true"] { border-color: var(--success-alpha-medium, rgba(22,163,74,0.35)); }
.ob-item[data-current="true"] { border-color: var(--brand-alpha-strong, rgba(59,130,246,0.6)); }
.ob-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px; }
.ob-check {
  flex: none;
  width: 32px;
  height: 32px;
  margin-top: 2px;
  border-radius: 999px;
  border: 2px solid var(--neutral-alpha-strong);
  background: transparent;
  color: var(--static-white, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 200ms ease, border-color 200ms ease, transform 150ms ease;
}
.ob-check:hover { transform: scale(1.06); }
.ob-check:focus-visible, .ob-expand:focus-visible {
  outline: 3px solid var(--brand-solid-strong, #3b82f6);
  outline-offset: 2px;
}
.ob-check[aria-checked="true"] {
  background: var(--success-solid-strong, #16a34a);
  border-color: var(--success-solid-strong, #16a34a);
}
.ob-check[data-current="true"][aria-checked="false"] { border-color: var(--brand-solid-strong, #3b82f6); }
.ob-expand {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: block;
  text-align: left;
  border-radius: 8px;
  width: 100%;
}
.ob-title-done { text-decoration: line-through; opacity: 0.65; }
.ob-detail { padding: 0 16px 16px 62px; }
.ob-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }

.ob-celebrate { position: relative; overflow: hidden; }
.ob-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ob-piece {
  position: absolute;
  top: -16px;
  opacity: 0;
  animation-name: ob-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}
@keyframes ob-fall {
  0% { opacity: 1; transform: translate3d(0, 0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate3d(var(--drift), 340px, 0) rotate(540deg); }
}
.ob-pop { animation: ob-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes ob-pop {
  0% { transform: scale(0.6); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .ob-progress-fill, .ob-item, .ob-check { transition: none; }
  .ob-piece { display: none; }
  .ob-pop { animation: none; }
}
@media (max-width: 480px) {
  .ob-detail { padding-left: 16px; }
}
.ob-sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
}
`;

export default function Page() {
  const [done, setDone] = useState<Record<string, boolean>>({ profile: true });
  const [openId, setOpenId] = useState<string | null>("invite");
  const baseId = useId();

  const completedCount = useMemo(() => STEPS.filter((s) => done[s.id]).length, [done]);
  const total = STEPS.length;
  const percent = Math.round((completedCount / total) * 100);
  const allDone = completedCount === total;
  const currentId = STEPS.find((s) => !done[s.id])?.id ?? null;

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  const complete = (id: string) => {
    setDone((prev) => ({ ...prev, [id]: true }));
    const idx = STEPS.findIndex((s) => s.id === id);
    const next = STEPS.slice(idx + 1).find((s) => !done[s.id]);
    setOpenId(next ? next.id : null);
  };
  const reset = () => {
    setDone({});
    setOpenId(STEPS[0].id);
  };

  const remainingMinutes = STEPS.filter((s) => !done[s.id]).reduce(
    (sum, s) => sum + parseInt(s.estimate, 10),
    0,
  );

  return (
    <Flex fillWidth horizontal="center" paddingX="16" paddingY="32" tabIndex={-1}>
      <style>{STYLES}</style>
      <Column as="main" fillWidth maxWidth={40} gap="24">
        <Column gap="8">
          <Row gap="12" vertical="center" wrap>
            <Badge
              textVariant="label-default-s"
              onBackground="brand-strong"
              background="brand-alpha-weak"
              arrow={false}
            >
              Getting started
            </Badge>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {allDone ? "All done" : `About ${remainingMinutes} min left`}
            </Text>
          </Row>
          <Heading as="h1" variant="display-strong-s">
            Welcome to Northwind Analytics
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-weak">
            Finish these five steps to get your workspace ready for the whole team.
          </Text>
        </Column>

        <Column
          gap="12"
          padding="20"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
          aria-labelledby={`${baseId}-progress-label`}
          as="section"
        >
          <Row horizontal="between" vertical="center" gap="12">
            <Text id={`${baseId}-progress-label`} variant="label-strong-m">
              Your progress
            </Text>
            <Text variant="label-strong-m" aria-hidden="true">
              {completedCount} of {total} · {percent}%
            </Text>
          </Row>
          <div
            className="ob-progress-track"
            role="progressbar"
            aria-labelledby={`${baseId}-progress-label`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${completedCount} of ${total} steps complete`}
          >
            <div className="ob-progress-fill" data-complete={allDone} style={{ width: `${percent}%` }} />
          </div>
          <div className="ob-sr" role="status" aria-live="polite">
            {completedCount} of {total} steps complete.
            {allDone ? " Setup finished. Congratulations!" : ""}
          </div>
        </Column>

        {allDone && (
          <Column
            as="section"
            aria-labelledby={`${baseId}-celebrate`}
            className="ob-celebrate"
            padding="24"
            radius="l"
            border="success-alpha-medium"
            background="success-alpha-weak"
            gap="12"
            horizontal="center"
            align="center"
          >
            <div className="ob-confetti" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="ob-piece"
                  style={
                    {
                      left: `${c.left}%`,
                      width: c.size,
                      height: c.size * (c.round ? 1 : 1.6),
                      background: c.color,
                      borderRadius: c.round ? "50%" : 2,
                      animationDelay: `${c.delay}s`,
                      animationDuration: `${c.duration}s`,
                      "--drift": `${c.drift}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <div className="ob-pop" aria-hidden="true" style={{ fontSize: 48, lineHeight: 1 }}>
              🎉
            </div>
            <Heading as="h2" id={`${baseId}-celebrate`} variant="heading-strong-xl">
              You&apos;re all set!
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              Your workspace is ready. Your team can now explore dashboards, and your first weekly digest
              arrives on Monday.
            </Text>
            <Row gap="8" wrap horizontal="center">
              <Button variant="primary" size="m" href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}>
                Go to dashboard
              </Button>
              <Button variant="secondary" size="m" onClick={reset}>
                Restart checklist
              </Button>
            </Row>
          </Column>
        )}

        <Column as="section" gap="12" aria-label="Onboarding steps">
          <ol className="ob-list">
            {STEPS.map((step, index) => {
              const isDone = !!done[step.id];
              const isCurrent = step.id === currentId;
              const isOpen = openId === step.id;
              const panelId = `${baseId}-panel-${step.id}`;
              const titleId = `${baseId}-title-${step.id}`;
              const statusText = isDone ? "Completed" : isCurrent ? "Up next" : "Not started";

              return (
                <li key={step.id} className="ob-item" data-done={isDone} data-current={isCurrent}>
                  <div className="ob-row">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-labelledby={titleId}
                      className="ob-check"
                      data-current={isCurrent}
                      onClick={() => toggle(step.id)}
                    >
                      {isDone ? (
                        <Icon name="check" size="s" onBackground="neutral-strong" />
                      ) : (
                        <Text variant="label-strong-s" onBackground="neutral-weak" aria-hidden="true">
                          {index + 1}
                        </Text>
                      )}
                    </button>

                    <Column flex={1} gap="4" minWidth={0}>
                      <button
                        type="button"
                        className="ob-expand"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenId(isOpen ? null : step.id)}
                      >
                        <Row horizontal="between" vertical="start" gap="12">
                          <Column gap="4" minWidth={0}>
                            <Text
                              id={titleId}
                              variant="heading-strong-s"
                              className={isDone ? "ob-title-done" : undefined}
                            >
                              {step.title}
                            </Text>
                            <Text variant="body-default-s" onBackground="neutral-weak">
                              {step.summary}
                            </Text>
                          </Column>
                          <Icon
                            name={isOpen ? "chevronUp" : "chevronDown"}
                            size="s"
                            onBackground="neutral-weak"
                            aria-hidden="true"
                          />
                        </Row>
                      </button>
                      <Row gap="8" vertical="center" wrap>
                        <Badge
                          arrow={false}
                          textVariant="label-default-xs"
                          background={isDone ? "success-alpha-weak" : isCurrent ? "brand-alpha-weak" : "neutral-alpha-weak"}
                          onBackground={isDone ? "success-strong" : isCurrent ? "brand-strong" : "neutral-medium"}
                        >
                          {statusText}
                        </Badge>
                        <Text variant="label-default-xs" onBackground="neutral-weak">
                          {step.estimate}
                        </Text>
                      </Row>
                    </Column>
                  </div>

                  {isOpen && (
                    <div id={panelId} className="ob-detail" role="region" aria-labelledby={titleId}>
                      <Text variant="body-default-m" onBackground="neutral-medium">
                        {step.detail}
                      </Text>
                      <div className="ob-actions">
                        {isDone ? (
                          <Button variant="tertiary" size="s" onClick={() => toggle(step.id)}>
                            Mark as not done
                          </Button>
                        ) : (
                          <Button variant="primary" size="s" onClick={() => complete(step.id)}>
                            {step.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Column>

        {!allDone && completedCount > 0 && (
          <Row horizontal="center">
            <Button variant="tertiary" size="s" onClick={reset}>
              Reset checklist
            </Button>
          </Row>
        )}
      </Column>
    </Flex>
  );
}

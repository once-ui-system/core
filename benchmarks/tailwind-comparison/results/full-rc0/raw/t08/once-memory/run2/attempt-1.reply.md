The only file in the app directory is the placeholder page, so the vendor package can't be inspected. To reduce the risk, I'll use only plain DOM elements plus a minimal set of Once UI components (`Flex`, `Column`, `Row`, `Heading`, `Text`, `Button`, `Icon`) with conservative props, and draw the check mark with inline SVG.

```tsx
"use client";

import { useState } from "react";
import { Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Step = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  actionLabel: string;
  minutes: number;
};

const STEPS: Step[] = [
  {
    id: "profile",
    title: "Complete your workspace profile",
    summary: "Name your workspace and add a logo so teammates recognise it.",
    detail:
      "Add your company name, choose a workspace URL and upload a square logo. This is what your teammates and customers will see in invitations and shared links.",
    actionLabel: "Mark profile as complete",
    minutes: 2,
  },
  {
    id: "invite",
    title: "Invite your first teammates",
    summary: "Projects move faster with at least two other people on board.",
    detail:
      "Send invitations by email or share an invite link. You can assign roles now (Admin, Editor, Viewer) and change them later from the Members page.",
    actionLabel: "Mark invitations as sent",
    minutes: 3,
  },
  {
    id: "integration",
    title: "Connect Slack or GitHub",
    summary: "Get build and review notifications right where your team talks.",
    detail:
      "Authorise one integration to stream deploy status, pull request reviews and incident alerts into a channel of your choice. You can add more integrations at any time.",
    actionLabel: "Mark integration as connected",
    minutes: 4,
  },
  {
    id: "project",
    title: "Create your first project",
    summary: "Start from a template or import an existing repository.",
    detail:
      "Pick the Web app, API service or Documentation template, or import a repository. We will generate a starter board with sensible default columns.",
    actionLabel: "Mark project as created",
    minutes: 5,
  },
  {
    id: "billing",
    title: "Review your plan and billing",
    summary: "Confirm your trial limits and add a payment method when ready.",
    detail:
      "Your 14-day trial includes up to 10 seats and 5 projects. Add a payment method before the trial ends to keep everything running without interruption.",
    actionLabel: "Mark billing as reviewed",
    minutes: 2,
  },
];

const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 41) % 100,
  delay: ((i * 7) % 10) / 10,
  duration: 2.2 + ((i * 3) % 7) / 5,
  hue: (i * 47) % 360,
  rotate: (i * 53) % 360,
  size: 6 + (i % 4) * 2,
}));

const STYLES = `
.ob-bar-fill { transition: width 500ms cubic-bezier(0.22, 1, 0.36, 1); }
.ob-step { transition: border-color 200ms ease, background-color 200ms ease; }
.ob-toggle {
  appearance: none;
  background: transparent;
  border: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
}
.ob-toggle:focus-visible { outline: 2px solid var(--brand-solid-strong); outline-offset: 2px; }
.ob-confetti {
  position: absolute;
  top: -12px;
  border-radius: 2px;
  opacity: 0;
  animation-name: ob-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
  pointer-events: none;
}
.ob-pop { animation: ob-pop 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.ob-panel { padding: 0 16px 16px 62px; }
@media (max-width: 480px) {
  .ob-panel { padding-left: 16px; }
  .ob-side { display: none !important; }
}
@keyframes ob-fall {
  0% { opacity: 1; transform: translateY(0) rotate(0deg); }
  100% { opacity: 0; transform: translateY(340px) rotate(540deg); }
}
@keyframes ob-pop {
  0% { opacity: 0; transform: scale(0.92) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .ob-bar-fill, .ob-step { transition: none; }
  .ob-confetti { display: none; }
  .ob-pop { animation: none; }
}
`;

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Chevron({ up }: { up: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ color: "var(--neutral-on-background-weak)" }}
    >
      <polyline points={up ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
    </svg>
  );
}

export default function Page() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(STEPS[0].id);
  const [announcement, setAnnouncement] = useState("");

  const total = STEPS.length;
  const completedCount = STEPS.filter((s) => done[s.id]).length;
  const percent = Math.round((completedCount / total) * 100);
  const allDone = completedCount === total;
  const currentStep = STEPS.find((s) => !done[s.id]);
  const currentId = currentStep ? currentStep.id : null;
  const remainingMinutes = STEPS.filter((s) => !done[s.id]).reduce((n, s) => n + s.minutes, 0);

  function complete(id: string) {
    const next: Record<string, boolean> = { ...done, [id]: true };
    const count = STEPS.filter((s) => next[s.id]).length;
    const upcoming = STEPS.find((s) => !next[s.id]);
    setDone(next);
    setOpenId(upcoming ? upcoming.id : null);
    setAnnouncement(
      count === STEPS.length
        ? "All steps complete. Your workspace is ready."
        : `Step completed. ${count} of ${STEPS.length} done.`,
    );
  }

  function undo(id: string) {
    setDone({ ...done, [id]: false });
    setOpenId(id);
    setAnnouncement("Step marked as not done.");
  }

  function reset() {
    setDone({});
    setOpenId(STEPS[0].id);
    setAnnouncement("Checklist reset.");
  }

  return (
    <Flex fillWidth horizontal="center" paddingX="m" paddingY="xl">
      <style>{STYLES}</style>
      <Column as="main" fillWidth maxWidth={40} gap="24">
        <Column as="header" gap="12">
          <Text variant="label-default-s" onBackground="brand-weak">
            Getting started
          </Text>
          <Heading as="h1" variant="display-strong-xs">
            Set up your Northwind workspace
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Five quick steps to get your team up and running. Your progress is saved as you go.
          </Text>
        </Column>

        <section
          aria-label="Setup progress"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: 20,
            borderRadius: 16,
            border: "1px solid var(--neutral-alpha-medium)",
            background: "var(--surface-background)",
          }}
        >
          <Row horizontal="between" vertical="center" gap="8" wrap>
            <Text id="ob-progress-label" variant="label-strong-m">
              {completedCount} of {total} steps complete
            </Text>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {allDone ? "Finished" : `About ${remainingMinutes} min left`}
            </Text>
          </Row>
          <div
            role="progressbar"
            aria-labelledby="ob-progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={`${percent} percent complete`}
            style={{
              width: "100%",
              height: 10,
              borderRadius: 999,
              overflow: "hidden",
              background: "var(--neutral-alpha-medium)",
            }}
          >
            <div
              className="ob-bar-fill"
              style={{
                width: `${percent}%`,
                height: "100%",
                borderRadius: 999,
                background: allDone ? "var(--success-solid-strong)" : "var(--brand-solid-strong)",
              }}
            />
          </div>
          <Text variant="body-default-xs" onBackground="neutral-weak">
            {percent}% complete
          </Text>
        </section>

        {allDone ? (
          <div className="ob-pop" style={{ position: "relative", overflow: "hidden", borderRadius: 16 }}>
            <div
              role="status"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 16,
                padding: 32,
                borderRadius: 16,
                border: "1px solid var(--success-alpha-medium)",
                background: "var(--success-alpha-weak)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--success-solid-strong)",
                  color: "#fff",
                }}
              >
                <CheckIcon size={28} />
              </div>
              <Heading as="h2" variant="heading-strong-l">
                You&apos;re all set. Nice work!
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Your workspace is ready for your team. Head to your dashboard to start your first sprint.
              </Text>
              <Row gap="8" wrap horizontal="center">
                <Button variant="primary" size="m" onClick={reset}>
                  Restart checklist
                </Button>
              </Row>
            </div>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {CONFETTI.map((c, i) => (
                <span
                  key={i}
                  className="ob-confetti"
                  style={{
                    left: `${c.left}%`,
                    width: c.size,
                    height: c.size * 1.6,
                    background: `hsl(${c.hue} 80% 55%)`,
                    animationDelay: `${c.delay}s`,
                    animationDuration: `${c.duration}s`,
                    rotate: `${c.rotate}deg`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}

        <section aria-labelledby="ob-steps-heading" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Heading as="h2" id="ob-steps-heading" variant="heading-strong-s">
            Your checklist
          </Heading>
          <ol
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {STEPS.map((step, index) => {
              const isDone = !!done[step.id];
              const isCurrent = step.id === currentId;
              const isOpen = openId === step.id;
              const panelId = `ob-panel-${step.id}`;
              const statusText = isDone ? "Completed" : isCurrent ? "Up next" : "Not started";
              const accent = isDone
                ? "var(--success-solid-strong)"
                : isCurrent
                  ? "var(--brand-solid-strong)"
                  : "var(--neutral-alpha-strong)";

              return (
                <li
                  key={step.id}
                  className="ob-step"
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${isCurrent ? "var(--brand-solid-strong)" : "var(--neutral-alpha-medium)"}`,
                    background: isDone ? "var(--neutral-alpha-weak)" : "var(--surface-background)",
                  }}
                >
                  <button
                    type="button"
                    className="ob-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : step.id)}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 600,
                        border: `2px solid ${accent}`,
                        background: isDone ? "var(--success-solid-strong)" : "transparent",
                        color: isDone ? "#fff" : "var(--neutral-on-background-strong)",
                      }}
                    >
                      {isDone ? <CheckIcon size={16} /> : index + 1}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                      <Text
                        variant="label-strong-m"
                        onBackground={isDone ? "neutral-weak" : "neutral-strong"}
                        style={{ textDecoration: isDone ? "line-through" : "none" }}
                      >
                        {step.title}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {step.summary}
                      </Text>
                    </span>
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <span className="ob-side">
                        <Text
                          variant="label-default-xs"
                          onBackground={isDone ? "success-strong" : isCurrent ? "brand-strong" : "neutral-weak"}
                        >
                          {statusText}
                        </Text>
                      </span>
                      <Chevron up={isOpen} />
                    </span>
                  </button>

                  {isOpen ? (
                    <div id={panelId} role="region" aria-label={`${step.title} details`} className="ob-panel">
                      <Column gap="12">
                        <Text variant="body-default-s" onBackground="neutral-medium">
                          {step.detail}
                        </Text>
                        <Row gap="12" vertical="center" wrap>
                          {isDone ? (
                            <Button variant="tertiary" size="s" onClick={() => undo(step.id)}>
                              Undo
                            </Button>
                          ) : (
                            <Button variant="primary" size="s" onClick={() => complete(step.id)}>
                              {step.actionLabel}
                            </Button>
                          )}
                          <Text variant="body-default-xs" onBackground="neutral-weak">
                            About {step.minutes} min
                          </Text>
                        </Row>
                      </Column>
                    </div>
                  ) : null}
                  <span style={srOnly}>
                    {statusText}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {!allDone && completedCount > 0 ? (
          <Row horizontal="end">
            <Button variant="tertiary" size="s" onClick={reset}>
              Reset checklist
            </Button>
          </Row>
        ) : null}

        <div aria-live="polite" aria-atomic="true" style={srOnly}>
          {announcement}
        </div>
      </Column>
    </Flex>
  );
}
```
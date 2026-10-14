"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Avatar, Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Stat = { label: string; value: string };

type MenuItem = {
  id: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  danger?: boolean;
};

const USER = {
  name: "Maya Okonkwo",
  handle: "@mayaokonkwo",
  initials: "MO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm interfaces for complicated tools. Currently shipping the Atlas design system.",
  plan: "Pro",
};

const STATS: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "312" },
];

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

const MENU: MenuItem[] = [
  {
    id: "profile",
    label: "View profile",
    hint: "G P",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Account settings",
    hint: "G S",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
  {
    id: "billing",
    label: "Billing & plan",
    icon: (
      <svg {...svgProps}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "team",
    label: "Invite teammates",
    icon: (
      <svg {...svgProps}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2 20c0-3.5 3.2-5.5 7-5.5s7 2 7 5.5" />
        <path d="M19 8v6M16 11h6" />
      </svg>
    ),
  },
  {
    id: "signout",
    label: "Sign out",
    danger: true,
    icon: (
      <svg {...svgProps}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </svg>
    ),
  },
];

const css = `
.pp-root { position: relative; display: inline-block; }
.pp-trigger {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px; border-radius: 999px; cursor: pointer;
  background: var(--neutral-alpha-weak);
  border: 1px solid var(--neutral-alpha-medium);
  color: inherit; transition: box-shadow .15s ease, transform .15s ease;
}
.pp-trigger:hover { box-shadow: 0 0 0 4px var(--neutral-alpha-weak); }
.pp-trigger:focus-visible, .pp-item:focus-visible, .pp-follow:focus-visible {
  outline: 2px solid var(--brand-solid-strong, #6366f1); outline-offset: 2px;
}
.pp-trigger[aria-expanded="true"] { box-shadow: 0 0 0 4px var(--neutral-alpha-medium); }
.pp-panel {
  position: absolute; top: calc(100% + 10px); right: 0; z-index: 50;
  width: min(340px, calc(100vw - 32px));
  background: var(--page-background, #fff);
  border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px; padding: 16px;
  box-shadow: 0 20px 50px -12px rgba(0,0,0,.35);
  transform-origin: top right;
  animation: pp-in .14s ease-out;
}
@keyframes pp-in { from { opacity: 0; transform: translateY(-6px) scale(.97); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .pp-panel { animation: none; }
  .pp-trigger { transition: none; }
}
.pp-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  margin: 14px 0; padding: 10px 0;
  border-top: 1px solid var(--neutral-alpha-weak);
  border-bottom: 1px solid var(--neutral-alpha-weak);
  text-align: center;
}
.pp-menu { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.pp-item {
  display: flex; align-items: center; gap: 12px; width: 100%;
  padding: 10px 10px; border: 0; border-radius: 10px; cursor: pointer;
  background: transparent; color: var(--neutral-on-background-strong, inherit);
  font: inherit; font-size: 14px; text-align: left; min-height: 40px;
}
.pp-item:hover, .pp-item:focus-visible { background: var(--neutral-alpha-weak); }
.pp-item[data-danger="true"] { color: var(--danger-on-background-strong, #dc2626); }
.pp-item .pp-hint { margin-left: auto; font-size: 12px; opacity: .55; font-family: var(--font-code); }
.pp-follow {
  flex: 1; min-height: 40px; border-radius: 10px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 600;
  border: 1px solid var(--neutral-alpha-medium); background: var(--neutral-alpha-weak); color: inherit;
}
.pp-follow[aria-pressed="true"] { background: transparent; }
.pp-follow:hover { background: var(--neutral-alpha-medium); }
.pp-plan {
  display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
  background: var(--brand-alpha-weak, rgba(99,102,241,.15)); color: var(--brand-on-background-strong, inherit);
}
.pp-status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

function ProfilePopover({ onAction }: { onAction: (message: string) => void }) {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clearTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const focusables = (): HTMLElement[] =>
    panelRef.current
      ? Array.from(panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"))
      : [];

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusables()[0]?.focus());
    }
  };

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = focusables();
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(idx + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(idx - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      // Keep focus inside the dialog while it is open.
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const handleItem = (item: MenuItem) => {
    onAction(item.id === "signout" ? "You have been signed out (demo)." : `Opening “${item.label}”…`);
    close(true);
  };

  return (
    <div className="pp-root" ref={rootRef} onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <button
        ref={triggerRef}
        type="button"
        className="pp-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={`${USER.name}, open profile menu`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <Avatar value={USER.initials} size="m" />
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          className="pp-panel"
          role="dialog"
          aria-label="Profile menu"
          onKeyDown={onPanelKey}
        >
          <Row gap="12" vertical="center">
            <Avatar value={USER.initials} size="l" />
            <Column gap="4" style={{ minWidth: 0 }}>
              <Row gap="8" vertical="center" wrap>
                <Heading as="h2" variant="heading-strong-s">
                  {USER.name}
                </Heading>
                <span className="pp-plan">{USER.plan}</span>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {USER.handle} · {USER.role}
              </Text>
            </Column>
          </Row>

          <Text as="p" variant="body-default-s" onBackground="neutral-medium" style={{ marginTop: 12 }}>
            {USER.bio}
          </Text>
          <Text as="p" variant="label-default-xs" onBackground="neutral-weak" style={{ marginTop: 6 }}>
            {USER.location}
          </Text>

          <dl className="pp-stats" style={{ margin: "14px 0" }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <dd style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{s.value}</dd>
                <dt style={{ fontSize: 12, opacity: 0.65 }}>{s.label}</dt>
              </div>
            ))}
          </dl>

          <Row gap="8" style={{ marginBottom: 10 }}>
            <button
              type="button"
              className="pp-follow"
              aria-pressed={following}
              onClick={() => {
                setFollowing((f) => !f);
                onAction(following ? `Unfollowed ${USER.name}.` : `You are now following ${USER.name}.`);
              }}
            >
              {following ? "Following" : "Follow"}
            </button>
            <button
              type="button"
              className="pp-follow"
              onClick={() => {
                onAction(`Message draft to ${USER.name} started.`);
                close(true);
              }}
            >
              Message
            </button>
          </Row>

          <ul className="pp-menu" role="list">
            {MENU.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="pp-item"
                  data-danger={item.danger ? "true" : "false"}
                  onClick={() => handleItem(item)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.hint && <span className="pp-hint">{item.hint}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const [message, setMessage] = useState("");

  return (
    <Column fillWidth minHeight="100vh">
      <style>{css}</style>

      <Row
        as="header"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="16"
        paddingY="12"
        gap="16"
        style={{ borderBottom: "1px solid var(--neutral-alpha-weak)" }}
      >
        <Text variant="heading-strong-m" as="span">
          Atlas Studio
        </Text>
        <Row gap="16" vertical="center">
          <Text variant="body-default-s" onBackground="neutral-weak" className="hide-on-small">
            Workspace: Northwind Design
          </Text>
          <ProfilePopover onAction={setMessage} />
        </Row>
      </Row>

      <Flex as="main" fillWidth horizontal="center" paddingX="16" paddingY="48">
        <Column maxWidth={36} fillWidth gap="16">
          <Heading as="h1" variant="display-strong-s">
            Good morning, Maya
          </Heading>
          <Text variant="body-default-l" onBackground="neutral-medium">
            Select your avatar in the top-right corner to open your profile card. On desktop, hovering also reveals
            it; on touch devices, tap. Use the arrow keys to move through actions and Escape to close.
          </Text>
          <Row gap="12" wrap>
            <Button variant="secondary" size="m" onClick={() => setMessage("Opening the latest design review…")}>
              Review queue
            </Button>
            <Button variant="tertiary" size="m" onClick={() => setMessage("Syncing library components…")}>
              Sync library
            </Button>
          </Row>
          <div className="pp-status" role="status" aria-live="polite">
            {message}
          </div>
          {message && (
            <Text variant="label-default-s" onBackground="neutral-weak" aria-hidden="true">
              {message}
            </Text>
          )}
        </Column>
      </Flex>
    </Column>
  );
}

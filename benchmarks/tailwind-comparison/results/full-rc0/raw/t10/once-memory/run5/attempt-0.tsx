"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Stat = { label: string; value: string };
type MenuAction = { id: string; label: string; hint?: string; danger?: boolean; glyph: string };

const USER = {
  name: "Maya Okonkwo",
  handle: "@mayaokonkwo",
  initials: "MO",
  role: "Staff Product Designer",
  location: "Lisbon, Portugal",
  bio: "Designing calm interfaces for complex tools. Currently shaping the Atlas design system.",
  status: "Available for reviews",
};

const STATS: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "389" },
];

const ACTIONS: MenuAction[] = [
  { id: "profile", label: "View profile", hint: "G P", glyph: "◉" },
  { id: "settings", label: "Account settings", hint: "G S", glyph: "⚙" },
  { id: "billing", label: "Billing & plans", glyph: "▤" },
  { id: "help", label: "Help center", glyph: "?" },
  { id: "signout", label: "Sign out", danger: true, glyph: "⏻" },
];

const CSS = `
.pp-root { position: relative; display: inline-flex; }
.pp-trigger {
  all: unset; box-sizing: border-box; cursor: pointer; border-radius: 9999px;
  display: inline-flex; align-items: center; gap: 10px; padding: 4px 12px 4px 4px;
  border: 1px solid var(--neutral-alpha-medium); background: var(--surface-background);
  color: var(--neutral-on-background-strong); transition: background .15s, border-color .15s;
}
.pp-trigger:hover { background: var(--neutral-alpha-weak); }
.pp-trigger:focus-visible, .pp-item:focus-visible, .pp-follow:focus-visible, .pp-close:focus-visible {
  outline: 2px solid var(--brand-solid-strong); outline-offset: 2px;
}
.pp-avatar {
  width: 36px; height: 36px; border-radius: 9999px; display: inline-flex; align-items: center;
  justify-content: center; font-weight: 600; font-size: 14px; letter-spacing: .02em; flex-shrink: 0;
  background: linear-gradient(135deg, var(--brand-solid-strong), var(--accent-solid-strong));
  color: #fff; position: relative;
}
.pp-avatar.lg { width: 56px; height: 56px; font-size: 20px; }
.pp-dot {
  position: absolute; right: 0; bottom: 0; width: 10px; height: 10px; border-radius: 9999px;
  background: var(--success-solid-strong); border: 2px solid var(--surface-background);
}
.pp-avatar.lg .pp-dot { width: 14px; height: 14px; }
.pp-name-short { font-size: 14px; font-weight: 500; }
.pp-caret { font-size: 10px; opacity: .7; transition: transform .15s; }
.pp-caret.open { transform: rotate(180deg); }
.pp-panel {
  position: absolute; top: calc(100% + 10px); right: 0; z-index: 50;
  width: min(360px, calc(100vw - 32px)); box-sizing: border-box;
  background: var(--surface-background); border: 1px solid var(--neutral-alpha-medium);
  border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,.25); overflow: hidden;
  animation: pp-in .14s ease-out;
}
@keyframes pp-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .pp-panel { animation: none; } .pp-caret { transition: none; } }
.pp-stats { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--neutral-alpha-weak); border-bottom: 1px solid var(--neutral-alpha-weak); }
.pp-stat { padding: 12px 8px; text-align: center; }
.pp-stat + .pp-stat { border-left: 1px solid var(--neutral-alpha-weak); }
.pp-follow {
  all: unset; box-sizing: border-box; cursor: pointer; text-align: center; padding: 8px 14px; border-radius: 10px;
  font-size: 14px; font-weight: 500; flex: 1; border: 1px solid var(--neutral-alpha-medium);
  color: var(--neutral-on-background-strong); background: transparent;
}
.pp-follow:hover { background: var(--neutral-alpha-weak); }
.pp-follow.primary { background: var(--brand-solid-strong); border-color: transparent; color: var(--brand-on-solid-strong); }
.pp-follow.primary:hover { filter: brightness(1.08); background: var(--brand-solid-strong); }
.pp-item {
  all: unset; box-sizing: border-box; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px; font-size: 14px; color: var(--neutral-on-background-strong);
}
.pp-item:hover, .pp-item:focus-visible { background: var(--neutral-alpha-weak); }
.pp-item.danger { color: var(--danger-on-background-strong); }
.pp-glyph { width: 20px; text-align: center; opacity: .75; flex-shrink: 0; }
.pp-hint { margin-left: auto; font-size: 12px; opacity: .55; font-family: var(--font-code); }
.pp-close {
  all: unset; cursor: pointer; position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center; opacity: .7;
}
.pp-close:hover { background: var(--neutral-alpha-weak); opacity: 1; }
.pp-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

export default function Page() {
  const [open, setOpen] = useState(false);
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const titleId = useId();

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
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onHoverEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    setOpen(true);
  };
  const onHoverLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  const getItems = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>("[data-menu-item]") ?? []);

  const onTriggerKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => getItems()[0]?.focus());
    }
  };

  const onPanelKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const items = getItems();
    if (items.length === 0) return;
    const idx = items.findIndex((el) => el === document.activeElement);
    let next = -1;
    if (e.key === "ArrowDown") next = idx < 0 ? 0 : (idx + 1) % items.length;
    else if (e.key === "ArrowUp") next = idx <= 0 ? items.length - 1 : idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next]?.focus();
    }
  };

  const onAction = (a: MenuAction) => {
    setMessage(a.id === "signout" ? "You have been signed out (demo)." : `${a.label} selected.`);
    close(true);
  };

  const toggleFollow = () => {
    const next = !following;
    setFollowing(next);
    setMessage(next ? `You are now following ${USER.name}.` : `You unfollowed ${USER.name}.`);
  };

  return (
    <Flex fillWidth horizontal="center" paddingX="m" paddingY="xl" minHeight="100vh">
      <style>{CSS}</style>
      <Column fillWidth maxWidth={64} gap="32">
        <Row fillWidth horizontal="between" vertical="center" gap="16" wrap>
          <Column gap="4">
            <Heading as="h1" variant="heading-strong-l">
              Atlas Studio
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Workspace overview
            </Text>
          </Column>

          <div
            className="pp-root"
            ref={rootRef}
            onPointerEnter={onHoverEnter}
            onPointerLeave={onHoverLeave}
          >
            <button
              ref={triggerRef}
              type="button"
              className="pp-trigger"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={`Account menu for ${USER.name}`}
              onClick={() => {
                clearTimer();
                setOpen((o) => !o);
              }}
              onKeyDown={onTriggerKey}
            >
              <span className="pp-avatar" aria-hidden="true">
                {USER.initials}
                <span className="pp-dot" />
              </span>
              <span className="pp-name-short" aria-hidden="true">
                Maya
              </span>
              <span className={`pp-caret${open ? " open" : ""}`} aria-hidden="true">
                ▼
              </span>
            </button>

            {open && (
              <div
                ref={panelRef}
                id={panelId}
                role="dialog"
                aria-labelledby={titleId}
                className="pp-panel"
                onKeyDown={onPanelKey}
              >
                <button
                  type="button"
                  className="pp-close"
                  aria-label="Close profile menu"
                  onClick={() => close(true)}
                >
                  ✕
                </button>

                <Column padding="16" gap="12">
                  <Row gap="12" vertical="center">
                    <span className="pp-avatar lg" aria-hidden="true">
                      {USER.initials}
                      <span className="pp-dot" />
                    </span>
                    <Column gap="2" style={{ minWidth: 0 }}>
                      <Heading as="h2" id={titleId} variant="heading-strong-m">
                        {USER.name}
                      </Heading>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {USER.handle} · {USER.role}
                      </Text>
                    </Column>
                  </Row>
                  <Text variant="body-default-s" onBackground="neutral-medium">
                    {USER.bio}
                  </Text>
                  <Row gap="8" vertical="center">
                    <Text variant="body-default-xs" onBackground="neutral-weak">
                      📍 {USER.location}
                    </Text>
                    <Text variant="body-default-xs" onBackground="success-medium">
                      ● {USER.status}
                    </Text>
                  </Row>
                </Column>

                <div className="pp-stats" role="list" aria-label="Profile statistics">
                  {STATS.map((s) => (
                    <div className="pp-stat" role="listitem" key={s.label}>
                      <Text as="div" variant="heading-strong-s">
                        {s.value}
                      </Text>
                      <Text as="div" variant="body-default-xs" onBackground="neutral-weak">
                        {s.label}
                      </Text>
                    </div>
                  ))}
                </div>

                <Row padding="12" gap="8">
                  <button
                    type="button"
                    className={`pp-follow${following ? "" : " primary"}`}
                    aria-pressed={following}
                    onClick={toggleFollow}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    className="pp-follow"
                    onClick={() => setMessage(`Message composer opened for ${USER.name}.`)}
                  >
                    Message
                  </button>
                </Row>

                <div role="menu" aria-label="Account actions" style={{ padding: "0 8px 8px" }}>
                  {ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      role="menuitem"
                      data-menu-item
                      className={`pp-item${a.danger ? " danger" : ""}`}
                      onClick={() => onAction(a)}
                    >
                      <span className="pp-glyph" aria-hidden="true">
                        {a.glyph}
                      </span>
                      <span>{a.label}</span>
                      {a.hint && (
                        <span className="pp-hint" aria-hidden="true">
                          {a.hint}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Row>

        <Column
          fillWidth
          padding="24"
          gap="12"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <Heading as="h2" variant="heading-strong-m">
            Welcome back, Maya
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Hover over, tap, or focus the avatar in the top corner to open your profile card. Use the arrow
            keys to move through the actions and Escape to close it.
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            3 design reviews are waiting for you today, and the Atlas v2.4 release is scheduled for Thursday.
          </Text>
        </Column>

        <div className="pp-sr" role="status" aria-live="polite">
          {message}
        </div>
        {message && (
          <Text variant="body-default-s" onBackground="neutral-weak" aria-hidden="true">
            {message}
          </Text>
        )}
      </Column>
    </Flex>
  );
}

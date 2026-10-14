```tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Button, Column, Flex, Heading, Row, Text } from "@once-ui-system/core";

type Stat = { label: string; value: string };
type MenuItem = { id: string; label: string; hint?: string; danger?: boolean };

const USER = {
  name: "Maya Okonkwo",
  handle: "@mayaok",
  role: "Staff Product Designer",
  bio: "Designing calm, fast tools for distributed teams. Currently shipping the Atlas design system.",
  initials: "MO",
};

const STATS: Stat[] = [
  { label: "Projects", value: "48" },
  { label: "Followers", value: "12.4k" },
  { label: "Following", value: "312" },
];

const MENU: MenuItem[] = [
  { id: "profile", label: "View profile", hint: "G P" },
  { id: "settings", label: "Account settings", hint: "G S" },
  { id: "billing", label: "Billing & plans" },
  { id: "signout", label: "Sign out", danger: true },
];

function InitialsBadge({ size }: { size: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: 0.5,
        color: "#fff",
        background: "linear-gradient(135deg, #6d5efc 0%, #e0567a 100%)",
        flexShrink: 0,
      }}
    >
      {USER.initials}
    </span>
  );
}

export default function Page() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [following, setFollowing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const clearTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // Outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Move focus into the panel when opened
  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]");
    first?.focus();
  }, [open]);

  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (!nodes || nodes.length === 0) return;
      const list = Array.from(nodes);
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? [],
      );
      if (items.length === 0) return;
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (idx === -1) return;
      e.preventDefault();
      const next =
        e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
      items[next].focus();
    }
  };

  const onMenuAction = (item: MenuItem) => {
    setStatus(item.id === "signout" ? "You have been signed out (demo)." : `${item.label} selected.`);
    close(true);
  };

  return (
    <Column fillWidth minHeight="100vh" horizontal="center">
      <style>{`
        .pp-trigger { all: unset; box-sizing: border-box; cursor: pointer; border-radius: 999px; padding: 3px; display: inline-flex; align-items: center; gap: 8px; transition: background .15s ease; }
        .pp-trigger:hover { background: var(--neutral-alpha-weak); }
        .pp-trigger:focus-visible, .pp-item:focus-visible, .pp-follow:focus-visible { outline: 2px solid var(--brand-solid-strong, #6d5efc); outline-offset: 2px; }
        .pp-panel { position: absolute; top: calc(100% + 10px); right: 0; width: min(340px, calc(100vw - 32px)); z-index: 50; background: var(--page-background, #fff); border: 1px solid var(--neutral-alpha-medium); border-radius: 16px; box-shadow: 0 18px 48px rgba(0,0,0,.22); overflow: hidden; animation: pp-in .14s ease-out; }
        @keyframes pp-in { from { opacity: 0; transform: translateY(-6px) scale(.98); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .pp-panel { animation: none; } .pp-trigger { transition: none; } }
        .pp-item { all: unset; box-sizing: border-box; display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; color: var(--neutral-on-background-strong); }
        .pp-item:hover, .pp-item:focus-visible { background: var(--neutral-alpha-weak); }
        .pp-item[data-danger="true"] { color: var(--danger-on-background-strong, #d6336c); }
        .pp-follow { all: unset; box-sizing: border-box; cursor: pointer; padding: 8px 14px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; flex: 1; border: 1px solid var(--neutral-alpha-strong); color: var(--neutral-on-background-strong); }
        .pp-follow[aria-pressed="false"] { background: var(--neutral-solid-strong, #111); color: var(--neutral-on-solid-strong, #fff); border-color: transparent; }
        .pp-follow:hover { opacity: .9; }
      `}</style>

      <Row
        as="header"
        fillWidth
        horizontal="between"
        vertical="center"
        paddingX="16"
        paddingY="12"
        borderBottom="neutral-alpha-weak"
        style={{ maxWidth: 1100 }}
      >
        <Heading as="h1" variant="heading-strong-m">
          Atlas Studio
        </Heading>

        <div
          style={{ position: "relative" }}
          onMouseEnter={() => {
            clearTimer();
            hoverTimer.current = setTimeout(() => setOpen(true), 250);
          }}
          onMouseLeave={() => {
            clearTimer();
            hoverTimer.current = setTimeout(() => setOpen(false), 200);
          }}
        >
          <button
            ref={triggerRef}
            type="button"
            className="pp-trigger"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? panelId : undefined}
            aria-label={`Account menu for ${USER.name}`}
            onClick={() => {
              clearTimer();
              setOpen((o) => !o);
            }}
          >
            <InitialsBadge size={40} />
          </button>

          {open && (
            <div
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-label={`${USER.name} profile`}
              className="pp-panel"
              onKeyDown={onPanelKeyDown}
            >
              <Column padding="16" gap="12">
                <Row gap="12" vertical="center">
                  <InitialsBadge size={56} />
                  <Column gap="2" style={{ minWidth: 0 }}>
                    <Text variant="heading-strong-s" onBackground="neutral-strong">
                      {USER.name}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {USER.handle} · {USER.role}
                    </Text>
                  </Column>
                </Row>

                <Text variant="body-default-s" onBackground="neutral-medium">
                  {USER.bio}
                </Text>

                <div style={{ display: "flex", gap: 8, margin: 0 }}>
                  {STATS.map((s) => (
                    <div
                      key={s.label}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column-reverse",
                        alignItems: "center",
                        padding: "8px 4px",
                        borderRadius: 10,
                        background: "var(--neutral-alpha-weak)",
                      }}
                    >
                      <span style={{ fontSize: 12, opacity: 0.7 }}>{s.label}</span>
                      <strong style={{ fontSize: 18 }}>{s.value}</strong>
                    </div>
                  ))}
                </div>

                <Row gap="8">
                  <button
                    type="button"
                    className="pp-follow"
                    data-autofocus
                    aria-pressed={following}
                    onClick={() => {
                      setFollowing((f) => !f);
                      setStatus(following ? `Unfollowed ${USER.name}.` : `Following ${USER.name}.`);
                    }}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                </Row>
              </Column>

              <div role="separator" style={{ height: 1, background: "var(--neutral-alpha-weak)" }} />

              <div role="menu" aria-label="Account actions" style={{ padding: 8 }}>
                {MENU.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    className="pp-item"
                    data-danger={item.danger ? "true" : "false"}
                    onClick={() => onMenuAction(item)}
                  >
                    <span>{item.label}</span>
                    {item.hint && (
                      <span style={{ fontSize: 12, opacity: 0.55, fontFamily: "var(--font-code)" }}>
                        {item.hint}
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
        as="main"
        fillWidth
        paddingX="16"
        paddingY="48"
        gap="16"
        horizontal="center"
        style={{ maxWidth: 720 }}
      >
        <Heading as="h2" variant="display-strong-xs" align="center">
          Welcome back, Maya
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" align="center">
          Hover or click the avatar in the top-right corner to open your profile card. Use the arrow
          keys to move through actions and Escape to close.
        </Text>
        <Flex gap="12" wrap horizontal="center">
          <Button
            variant="secondary"
            size="m"
            onClick={() => {
              setOpen(true);
            }}
          >
            Open profile card
          </Button>
        </Flex>
        <div role="status" aria-live="polite" style={{ minHeight: 24, fontSize: 14, opacity: 0.8 }}>
          {status}
        </div>
      </Column>
    </Column>
  );
}
```
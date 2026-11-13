"use client";

import { Column, Dialog, Icon, Kbd, Row, Text, useTheme } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { nav, recentProjects } from "@/lib/data";
import { useLumen } from "./LumenProvider";

type Command = {
  id: string;
  group: "Pages" | "Actions" | "Recent";
  label: string;
  hint?: string;
  keywords: string;
  icon: IconName;
  run: () => void;
};

const GROUPS: Command["group"][] = ["Pages", "Actions", "Recent"];

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, openInvite, openCreate } = useLumen();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (id: string) => `${baseId}-opt-${id}`;

  const close = () => {
    setPaletteOpen(false);
    setQuery("");
    setActive(0);
  };

  const commands = useMemo<Command[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
    };
    return [
      ...nav.map<Command>((item) => ({
        id: `page-${item.href}`,
        group: "Pages",
        label: item.label,
        hint: item.href,
        keywords: `${item.label} page go to`,
        icon: item.icon,
        run: go(item.href),
      })),
      {
        id: "action-create-project",
        group: "Actions",
        label: "Create project",
        keywords: "create new project add",
        icon: "plus",
        run: () => openCreate(),
      },
      {
        id: "action-invite-member",
        group: "Actions",
        label: "Invite member",
        keywords: "invite member add teammate email people",
        icon: "mail",
        run: () => openInvite(),
      },
      {
        id: "action-toggle-theme",
        group: "Actions",
        label: "Toggle theme",
        hint: resolvedTheme === "dark" ? "Switch to light" : "Switch to dark",
        keywords: "toggle theme dark light mode appearance",
        icon: resolvedTheme === "dark" ? "light" : "dark",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
      ...recentProjects.map<Command>((p) => ({
        id: `recent-${p.key}`,
        group: "Recent",
        label: p.name,
        hint: p.key,
        keywords: `${p.name} ${p.key} project recent`,
        icon: "folder",
        run: go(`/projects?open=${p.key}`),
      })),
    ];
  }, [router, openCreate, openInvite, resolvedTheme, setTheme]);

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return commands;
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.keywords} ${c.hint ?? ""}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [commands, query]);

  // Flat, display-ordered list so arrow keys cross group boundaries.
  const ordered = useMemo(
    () => GROUPS.flatMap((g) => filtered.filter((c) => c.group === g)),
    [filtered],
  );

  const safeActive = ordered.length === 0 ? -1 : Math.min(active, ordered.length - 1);
  const activeCommand = safeActive >= 0 ? ordered[safeActive] : undefined;

  // Focus the field when the palette opens.
  useEffect(() => {
    if (!paletteOpen) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [paletteOpen]);

  // Keep the highlighted row in view.
  const activeId = activeCommand?.id;
  useEffect(() => {
    if (!activeId) return;
    document
      .getElementById(`${baseId}-opt-${activeId}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeId, baseId]);

  const run = (command: Command) => {
    close();
    // Let the palette dialog release focus before a follow-up dialog opens.
    setTimeout(() => command.run(), 0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (ordered.length) setActive((safeActive + 1) % ordered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (ordered.length) setActive((safeActive - 1 + ordered.length) % ordered.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(Math.max(ordered.length - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeCommand) run(activeCommand);
    }
  };

  const resultsLabel =
    ordered.length === 0
      ? "No results"
      : `${ordered.length} result${ordered.length === 1 ? "" : "s"}`;

  return (
    <Dialog
      open={paletteOpen}
      onClose={close}
      title="Command palette"
      description="Search pages, actions and recent projects"
      flush
      hideClose
    >
      <Column fillWidth>
        <Row
          fillWidth
          vertical="center"
          gap="12"
          paddingX="16"
          paddingY="12"
          borderBottom
        >
          <Icon name="search" size="s" onBackground="neutral-weak" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label="Search commands"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeCommand ? optionId(activeCommand.id) : undefined}
            placeholder="Search pages, actions and projects…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "inherit",
              font: "inherit",
              fontSize: "1rem",
              padding: "0.25rem 0",
            }}
          />
          <Kbd>Esc</Kbd>
        </Row>

        <div
          id={listId}
          role="listbox"
          aria-label="Results"
          style={{ maxHeight: "min(24rem, 55dvh)", overflowY: "auto", padding: "0.5rem" }}
        >
          {ordered.length === 0 ? (
            <Column fillWidth center paddingY="32" gap="8">
              <Icon name="search" size="m" onBackground="neutral-weak" />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {`No results for “${query.trim()}”`}
              </Text>
            </Column>
          ) : (
            GROUPS.map((group) => {
              const items = ordered.filter((c) => c.group === group);
              if (items.length === 0) return null;
              const headingId = `${baseId}-group-${group}`;
              return (
                <div key={group} role="group" aria-labelledby={headingId}>
                  <Text
                    id={headingId}
                    as="div"
                    variant="label-default-xs"
                    onBackground="neutral-weak"
                    paddingX="12"
                    paddingTop="8"
                    paddingBottom="4"
                  >
                    {group}
                  </Text>
                  {items.map((command) => {
                    const selected = activeCommand?.id === command.id;
                    return (
                      <div
                        key={command.id}
                        id={optionId(command.id)}
                        role="option"
                        aria-selected={selected}
                        tabIndex={-1}
                        onMouseMove={() => {
                          const index = ordered.findIndex((c) => c.id === command.id);
                          if (index !== safeActive) setActive(index);
                        }}
                        onClick={() => run(command)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.625rem 0.75rem",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          background: selected ? "var(--neutral-alpha-weak)" : "transparent",
                          outline: selected ? "1px solid var(--neutral-alpha-medium)" : "none",
                        }}
                      >
                        <Icon name={command.icon} size="s" onBackground="neutral-medium" />
                        <Text variant="label-default-m" style={{ flex: 1, minWidth: 0 }}>
                          {command.label}
                        </Text>
                        {command.hint && (
                          <Text variant="body-default-xs" onBackground="neutral-weak">
                            {command.hint}
                          </Text>
                        )}
                        {selected && <Icon name="enter" size="xs" onBackground="neutral-weak" />}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <Row
          fillWidth
          vertical="center"
          gap="12"
          paddingX="16"
          paddingY="8"
          borderTop
          s={{ hide: true }}
        >
          <Row gap="4" vertical="center">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              navigate
            </Text>
          </Row>
          <Row gap="4" vertical="center">
            <Kbd>Enter</Kbd>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              select
            </Text>
          </Row>
        </Row>

        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {resultsLabel}
        </div>
      </Column>
    </Dialog>
  );
}

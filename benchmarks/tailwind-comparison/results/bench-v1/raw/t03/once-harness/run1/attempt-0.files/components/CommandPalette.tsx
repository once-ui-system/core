"use client";

import { Column, Dialog, Icon, Input, Kbd, Row, Text, useHotkeys, useTheme } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { navLinks, recentProjects } from "@/lib/data";
import { usePalette } from "./PaletteProvider";

type Command = {
  id: string;
  group: "Pages" | "Actions" | "Recent";
  label: string;
  hint?: string;
  icon: IconName;
  keywords: string;
  run: () => void;
};

const GROUPS: Command["group"][] = ["Pages", "Actions", "Recent"];

export function CommandPalette() {
  const { paletteOpen, closePalette, togglePalette, openInvite } = usePalette();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Ctrl+K on Windows/Linux, Cmd+K on a Mac. Fires even while typing in a field.
  useHotkeys("mod+k", () => togglePalette(), { allowWhileTyping: true, preventDefault: true });

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = navLinks.map((link) => ({
      id: `page-${link.href === "/" ? "dashboard" : link.href.slice(1)}`,
      group: "Pages",
      label: link.label,
      hint: link.description,
      icon: link.icon,
      keywords: `${link.label} ${link.href} page go to`,
      run: () => router.push(link.href),
    }));
    const actions: Command[] = [
      {
        id: "action-create-project",
        group: "Actions",
        label: "Create project",
        hint: "Start a new project",
        icon: "plus",
        keywords: "create new project add",
        run: () => router.push("/projects"),
      },
      {
        id: "action-invite-member",
        group: "Actions",
        label: "Invite member",
        hint: "Send an invitation by email",
        icon: "mail",
        keywords: "invite member add person teammate email",
        run: () => openInvite(),
      },
      {
        id: "action-toggle-theme",
        group: "Actions",
        label: "Toggle theme",
        hint: resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        icon: resolvedTheme === "dark" ? "light" : "dark",
        keywords: "toggle theme dark light mode appearance",
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
    const recent: Command[] = recentProjects.map((project) => ({
      id: `recent-${project.key}`,
      group: "Recent",
      label: project.name,
      hint: `${project.key} · ${project.issues} open issues`,
      icon: "folder",
      keywords: `${project.name} ${project.key} project recent`,
      run: () => router.push("/projects"),
    }));
    return [...pages, ...actions, ...recent];
  }, [router, openInvite, resolvedTheme, setTheme]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    const terms = needle.split(/\s+/);
    return commands.filter((cmd) => {
      const haystack = `${cmd.label} ${cmd.keywords}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [commands, query]);

  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({ group, items: results.filter((cmd) => cmd.group === group) })).filter(
        (entry) => entry.items.length > 0,
      ),
    [results],
  );
  const flat = useMemo(() => grouped.flatMap((entry) => entry.items), [grouped]);

  // Reset when the palette closes so it opens fresh.
  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setActive(0);
    }
  }, [paletteOpen]);

  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    if (!paletteOpen) return;
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, paletteOpen, flat]);

  const run = (cmd: Command) => {
    closePalette();
    cmd.run();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (flat.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + flat.length) % flat.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(flat.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const cmd = flat[activeIndex];
      if (cmd) run(cmd);
    }
  };

  const activeId = flat[activeIndex] ? `${listId}-${flat[activeIndex].id}` : undefined;

  return (
    <Dialog
      open={paletteOpen}
      onClose={closePalette}
      title="Command palette"
      description="Search pages, actions and recent projects"
      flush
    >
      <Column fillWidth onKeyDown={onKeyDown}>
        <Column paddingX="12" paddingTop="12" paddingBottom="8">
          <Input
            id={`${listId}-search`}
            label="Search commands"
            placeholder="Search pages, actions and projects"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            autoComplete="off"
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
          />
        </Column>

        <Column
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Results"
          paddingX="8"
          paddingBottom="8"
          gap="8"
          maxHeight="24rem"
          overflowY="auto"
        >
          {flat.length === 0 ? (
            <Column center padding="32" gap="8">
              <Icon name="search" onBackground="neutral-weak" />
              <Text onBackground="neutral-weak" align="center" role="status">
                No results for “{query}”
              </Text>
            </Column>
          ) : (
            grouped.map(({ group, items }) => (
              <Column key={group} role="group" aria-labelledby={`${listId}-g-${group}`}>
                <Row paddingX="12" paddingY="4">
                  <Text
                    id={`${listId}-g-${group}`}
                    textVariant="label-default-xs"
                    onBackground="neutral-weak"
                  >
                    {group}
                  </Text>
                </Row>
                {items.map((cmd) => {
                  const selected = flat[activeIndex]?.id === cmd.id;
                  return (
                    <Row
                      key={cmd.id}
                      id={`${listId}-${cmd.id}`}
                      role="option"
                      aria-selected={selected}
                      data-active={selected}
                      vertical="center"
                      gap="12"
                      paddingX="12"
                      paddingY="8"
                      radius="m"
                      cursor="interactive"
                      background={selected ? "neutral-alpha-weak" : "transparent"}
                      onClick={() => run(cmd)}
                      onMouseMove={() => {
                        const index = flat.findIndex((c) => c.id === cmd.id);
                        if (index !== activeIndex) setActive(index);
                      }}
                    >
                      <Icon name={cmd.icon} size="s" onBackground="neutral-weak" />
                      <Column flex={1} gap="2">
                        <Text textVariant="label-strong-s">{cmd.label}</Text>
                        {cmd.hint ? (
                          <Text textVariant="body-default-xs" onBackground="neutral-weak">
                            {cmd.hint}
                          </Text>
                        ) : null}
                      </Column>
                      {selected ? <Icon name="enter" size="xs" onBackground="neutral-weak" /> : null}
                    </Row>
                  );
                })}
              </Column>
            ))
          )}
        </Column>

        <Row borderTop paddingX="16" paddingY="8" gap="16" vertical="center" s={{ hide: true }}>
          <Kbd keys={["up", "down"]} label="Navigate" />
          <Kbd keys="enter" label="Run" />
          <Kbd keys="escape" label="Close" />
        </Row>
      </Column>
    </Dialog>
  );
}

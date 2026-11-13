"use client";

import { Column, Dialog, Icon, Input, Row, Text, VisuallyHidden, useHotkeys, useTheme } from "@once-ui-system/core";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { navLinks, recentProjects } from "@/lib/data";
import { usePalette } from "./PaletteProvider";

type CommandIcon = "home" | "folder" | "people" | "plus" | "mail" | "light" | "dark";

type Command = {
  id: string;
  group: "Pages" | "Actions" | "Recent";
  label: string;
  hint: string;
  icon: CommandIcon;
  keywords: string;
  run: () => void;
};

const GROUPS: Command["group"][] = ["Pages", "Actions", "Recent"];

export function CommandPalette() {
  const { paletteOpen, closePalette, togglePalette, openInvite } = usePalette();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const baseId = useId();
  const listId = `${baseId}-list`;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  // Ctrl+K on Windows/Linux, Cmd+K on a Mac, also while typing in a field.
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
    const dark = resolvedTheme === "dark";
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
        hint: dark ? "Switch to light mode" : "Switch to dark mode",
        icon: dark ? "light" : "dark",
        keywords: "toggle theme dark light mode appearance",
        run: () => setTheme(dark ? "light" : "dark"),
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

  const grouped = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = commands.filter((cmd) => {
      const haystack = `${cmd.label} ${cmd.keywords}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    return GROUPS.map((group) => ({
      group,
      items: matches.filter((cmd) => cmd.group === group),
    })).filter((entry) => entry.items.length > 0);
  }, [commands, query]);

  const flat = useMemo(() => grouped.flatMap((entry) => entry.items), [grouped]);
  const activeIndex = Math.min(active, Math.max(flat.length - 1, 0));
  const activeCommand = flat[activeIndex];
  const activeCommandId = activeCommand?.id;
  const optionId = (id: string) => `${baseId}-opt-${id}`;

  // Start fresh each time the palette opens.
  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setActive(0);
    }
  }, [paletteOpen]);

  // Keep the highlighted row in view while arrowing through the list.
  useEffect(() => {
    if (!paletteOpen || !activeCommandId) return;
    document.getElementById(`${baseId}-opt-${activeCommandId}`)?.scrollIntoView({ block: "nearest" });
  }, [paletteOpen, activeCommandId, baseId]);

  const run = (cmd: Command) => {
    closePalette();
    cmd.run();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (flat.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % flat.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + flat.length) % flat.length);
    } else if (event.key === "Enter" && activeCommand) {
      event.preventDefault();
      run(activeCommand);
    }
  };

  return (
    <Dialog
      open={paletteOpen}
      onClose={closePalette}
      title="Command palette"
      description="Search pages, actions and recent projects"
      flush
    >
      <div onKeyDown={onKeyDown} style={{ width: "100%" }}>
        <Column fillWidth paddingX="12" paddingTop="12" paddingBottom="8">
          <Input
            id={`${baseId}-search`}
            label="Search"
            placeholder="Search pages, actions and projects"
            value={query}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
          />
        </Column>

        <VisuallyHidden>
          <span role="status" aria-live="polite">
            {flat.length === 0
              ? "No results"
              : `${flat.length} results. ${activeCommand ? `${activeCommand.label}, ${activeCommand.group}, highlighted.` : ""}`}
          </span>
        </VisuallyHidden>

        <div
          id={listId}
          role="listbox"
          aria-label="Results"
          style={{ maxHeight: "22rem", overflowY: "auto", padding: "0 0.5rem 0.5rem" }}
        >
          {flat.length === 0 ? (
            <Column center padding="32" gap="8">
              <Icon name="search" onBackground="neutral-weak" />
              <Text onBackground="neutral-weak" align="center">
                No results for “{query}”
              </Text>
            </Column>
          ) : (
            grouped.map(({ group, items }) => (
              <div key={group} role="group" aria-labelledby={`${baseId}-g-${group}`}>
                <Row paddingX="12" paddingTop="8" paddingBottom="4">
                  <Text id={`${baseId}-g-${group}`} textVariant="label-default-xs" onBackground="neutral-weak">
                    {group}
                  </Text>
                </Row>
                {items.map((cmd) => {
                  const selected = activeCommandId === cmd.id;
                  return (
                    <div
                      key={cmd.id}
                      id={optionId(cmd.id)}
                      role="option"
                      aria-selected={selected}
                      onClick={() => run(cmd)}
                      onMouseMove={() => {
                        const index = flat.findIndex((c) => c.id === cmd.id);
                        if (index !== activeIndex) setActive(index);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        background: selected ? "var(--neutral-alpha-weak)" : "transparent",
                      }}
                    >
                      <Icon name={cmd.icon} size="s" onBackground="neutral-weak" />
                      <Column flex={1} gap="2">
                        <Text textVariant="label-strong-s">{cmd.label}</Text>
                        <Text textVariant="body-default-xs" onBackground="neutral-weak">
                          {cmd.hint}
                        </Text>
                      </Column>
                      {selected ? <Icon name="enter" size="xs" onBackground="neutral-weak" /> : null}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <Row borderTop paddingX="16" paddingY="8" gap="16" s={{ hide: true }}>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            ↑ ↓ to navigate
          </Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Enter to run
          </Text>
          <Text textVariant="body-default-xs" onBackground="neutral-weak">
            Esc to close
          </Text>
        </Row>
      </div>
    </Dialog>
  );
}

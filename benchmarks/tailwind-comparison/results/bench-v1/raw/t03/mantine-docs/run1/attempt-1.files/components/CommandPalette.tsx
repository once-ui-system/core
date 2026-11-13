"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Group, Highlight, Kbd, Text } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import {
  IconFolder,
  IconFolderPlus,
  IconFolders,
  IconLayoutDashboard,
  IconMoon,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";
import { useFrameActions } from "./frame-actions";
import { recentProjects, type Project } from "../lib/data";

interface CommandPaletteProps {
  onOpenChange?: (opened: boolean) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
  badge?: string;
  run: () => void;
}

interface PaletteGroup {
  group: string;
  items: PaletteItem[];
}

function matches(item: PaletteItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.label, item.description, ...item.keywords].join(" ").toLowerCase();
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function CommandPalette({ onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { openInvite, openCreateProject, toggleTheme } = useFrameActions();
  const [query, setQuery] = useState("");

  const groups = useMemo<PaletteGroup[]>(
    () => [
      {
        group: "Pages",
        items: [
          {
            id: "page-dashboard",
            label: "Dashboard",
            description: "Overview of activity across your projects",
            keywords: ["home", "overview", "stats"],
            icon: <IconLayoutDashboard size={22} aria-hidden />,
            run: () => router.push("/"),
          },
          {
            id: "page-projects",
            label: "Projects",
            description: "Browse every project and its open issues",
            keywords: ["issues", "boards"],
            icon: <IconFolders size={22} aria-hidden />,
            run: () => router.push("/projects"),
          },
          {
            id: "page-members",
            label: "Members",
            description: "People and roles on your team",
            keywords: ["team", "people", "users"],
            icon: <IconUsers size={22} aria-hidden />,
            run: () => router.push("/members"),
          },
        ],
      },
      {
        group: "Actions",
        items: [
          {
            id: "action-create-project",
            label: "Create project",
            description: "Start a new project for your team",
            keywords: ["new", "add"],
            icon: <IconFolderPlus size={22} aria-hidden />,
            run: openCreateProject,
          },
          {
            id: "action-invite-member",
            label: "Invite member",
            description: "Send an email invitation to a teammate",
            keywords: ["add", "email", "teammate"],
            icon: <IconUserPlus size={22} aria-hidden />,
            run: openInvite,
          },
          {
            id: "action-toggle-theme",
            label: "Toggle theme",
            description: "Switch between light and dark mode",
            keywords: ["dark", "light", "appearance", "color"],
            icon: <IconMoon size={22} aria-hidden />,
            run: toggleTheme,
          },
        ],
      },
      {
        group: "Recent",
        items: recentProjects.map(
          (project: Project): PaletteItem => ({
            id: `recent-${project.key}`,
            label: project.name,
            description: `${project.key} · ${project.issues} open issues`,
            keywords: [project.key, "project"],
            icon: <IconFolder size={22} aria-hidden />,
            badge: project.key,
            run: () => router.push("/projects"),
          })
        ),
      },
    ],
    [router, openInvite, openCreateProject, toggleTheme]
  );

  const filtered = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: g.items.filter((item) => matches(item, query)) }))
        .filter((g) => g.items.length > 0),
    [groups, query]
  );

  return (
    <Spotlight.Root
      query={query}
      onQueryChange={setQuery}
      shortcut="mod + K"
      clearQueryOnClose
      onSpotlightOpen={() => onOpenChange?.(true)}
      onSpotlightClose={() => onOpenChange?.(false)}
      scrollable
      maxHeight={420}
      size="lg"
    >
      <Spotlight.Search
        placeholder="Search pages, actions and projects…"
        aria-label="Search commands"
        leftSection={<IconSearch size={20} aria-hidden />}
      />
      <Spotlight.ActionsList>
        {filtered.length > 0 ? (
          filtered.map((g) => (
            <Spotlight.ActionsGroup key={g.group} label={g.group}>
              {g.items.map((item) => (
                <Spotlight.Action key={item.id} onClick={item.run}>
                  <Group wrap="nowrap" w="100%" gap="sm">
                    {item.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Highlight highlight={query.trim()} fw={500} size="sm">
                        {item.label}
                      </Highlight>
                      <Text size="xs" c="dimmed" truncate>
                        {item.description}
                      </Text>
                    </div>
                    {item.badge ? (
                      <Badge variant="light" color="indigo">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Group>
                </Spotlight.Action>
              ))}
            </Spotlight.ActionsGroup>
          ))
        ) : (
          <Spotlight.Empty>No pages, actions or projects match your search.</Spotlight.Empty>
        )}
      </Spotlight.ActionsList>
      <Spotlight.Footer>
        <Group gap="md" justify="center" visibleFrom="sm">
          <Group gap={4}>
            <Kbd size="xs">↑</Kbd>
            <Kbd size="xs">↓</Kbd>
            <Text size="xs" c="dimmed">
              navigate
            </Text>
          </Group>
          <Group gap={4}>
            <Kbd size="xs">Enter</Kbd>
            <Text size="xs" c="dimmed">
              select
            </Text>
          </Group>
          <Group gap={4}>
            <Kbd size="xs">Esc</Kbd>
            <Text size="xs" c="dimmed">
              close
            </Text>
          </Group>
        </Group>
      </Spotlight.Footer>
    </Spotlight.Root>
  );
}

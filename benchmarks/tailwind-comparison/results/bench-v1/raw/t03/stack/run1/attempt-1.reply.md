The errors say that only `ProjectsView.tsx` and the route files were written. The other files were missing, which suggests my earlier blocks were mis-pathed: I wrote `src/...` but the instruction format shows paths like `app/settings/page.tsx` relative to `src/`. I'll emit every file with the `src/`-relative prefix dropped (`app/…`, `components/…`, `lib/…`), as the example in the task shows.

I also fixed `ProjectsView` (in the old, plain-path form it read the data module that wasn't found) and kept everything else unchanged.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description:
    "Lumen, a product-analytics and issue-tracking app for small software teams",
};

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
};

export type ProjectStatus = "Active" | "Paused" | "Archived";

export type Project = {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
};

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Invited" | "Suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string | null;
};

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
];

/** The three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "Not yet";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

export const nav = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/projects", label: "Projects", icon: "folder" },
  { href: "/members", label: "Members", icon: "people" },
] as const;
```

```tsx components/lumen/LumenProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type LumenContextValue = {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;
  createOpen: boolean;
  openCreate: () => void;
  closeCreate: () => void;
};

const LumenContext = createContext<LumenContextValue | undefined>(undefined);

export function LumenProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const openInvite = useCallback(() => setInviteOpen(true), []);
  const closeInvite = useCallback(() => setInviteOpen(false), []);
  const openCreate = useCallback(() => setCreateOpen(true), []);
  const closeCreate = useCallback(() => setCreateOpen(false), []);

  const value = useMemo<LumenContextValue>(
    () => ({
      paletteOpen,
      openPalette,
      closePalette,
      setPaletteOpen,
      inviteOpen,
      openInvite,
      closeInvite,
      createOpen,
      openCreate,
      closeCreate,
    }),
    [
      paletteOpen,
      openPalette,
      closePalette,
      inviteOpen,
      openInvite,
      closeInvite,
      createOpen,
      openCreate,
      closeCreate,
    ],
  );

  return <LumenContext.Provider value={value}>{children}</LumenContext.Provider>;
}

export function useLumen(): LumenContextValue {
  const ctx = useContext(LumenContext);
  if (!ctx) throw new Error("useLumen must be used within a LumenProvider");
  return ctx;
}
```

```tsx components/lumen/CommandPalette.tsx
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
```

```tsx components/lumen/InviteDialog.tsx
"use client";

import { Button, Column, Dialog, Input, Row, Text, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { useLumen } from "./LumenProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog() {
  const { inviteOpen, closeInvite } = useLumen();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeInvite();
    setEmail("");
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like name@company.com.");
      return;
    }
    addToast({ variant: "success", message: `Invitation sent to ${value}` });
    close();
  };

  return (
    <Dialog
      open={inviteOpen}
      onClose={close}
      title="Invite a member"
      description="They will get an email with a link to join Acme Labs on Lumen."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16" paddingTop="8">
          <Input
            id="invite-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            error={error !== null}
            errorMessage={error ?? undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
          />
          <Text variant="body-default-xs" onBackground="neutral-weak">
            New members join as Member. You can change their role later.
          </Text>
          <Row gap="8" horizontal="end">
            <Button type="button" variant="tertiary" label="Cancel" onClick={close} />
            <Button type="submit" label="Send invite" prefixIcon="mail" />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
```

```tsx components/lumen/CreateProjectDialog.tsx
"use client";

import { Button, Column, Dialog, Input, Row, useToast } from "@once-ui-system/core";
import { useState } from "react";
import { useLumen } from "./LumenProvider";

export function CreateProjectDialog() {
  const { createOpen, closeCreate } = useLumen();
  const { addToast } = useToast();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    closeCreate();
    setName("");
    setError(null);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) {
      setError("Give the project a name of at least two characters.");
      return;
    }
    addToast({ variant: "success", message: `Project “${value}” created` });
    close();
  };

  return (
    <Dialog
      open={createOpen}
      onClose={close}
      title="Create a project"
      description="Projects group issues and analytics for one product."
    >
      <form onSubmit={submit} noValidate>
        <Column gap="16" paddingTop="8">
          <Input
            id="project-name"
            label="Project name"
            value={name}
            error={error !== null}
            errorMessage={error ?? undefined}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
          />
          <Row gap="8" horizontal="end">
            <Button type="button" variant="tertiary" label="Cancel" onClick={close} />
            <Button type="submit" label="Create project" prefixIcon="plus" />
          </Row>
        </Column>
      </form>
    </Dialog>
  );
}
```

```tsx components/lumen/LumenShell.tsx
"use client";

import {
  Avatar,
  Button,
  Column,
  Drawer,
  IconButton,
  Kbd,
  Nav,
  NavItem,
  Row,
  Text,
  selectNavHref,
  useHotkeys,
  VisuallyHidden,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, product, user } from "@/lib/data";
import { CommandPalette } from "./CommandPalette";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { InviteDialog } from "./InviteDialog";
import { LumenProvider, useLumen } from "./LumenProvider";

function SideNav({ pathname }: { pathname: string }) {
  const current = selectNavHref(
    pathname,
    nav.map((item) => item.href),
  );
  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {nav.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          selected={item.href === current}
        />
      ))}
    </Nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { openPalette, paletteOpen, setPaletteOpen } = useLumen();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent));
  }, []);

  // "mod" is Cmd on a Mac and Ctrl elsewhere. allowWhileTyping so it also
  // works (and toggles closed) from inside a field.
  useHotkeys("mod+k", () => setPaletteOpen(!paletteOpen), {
    allowWhileTyping: true,
    preventDefault: true,
  });

  const shortcut = isMac ? "⌘K" : "Ctrl K";

  return (
    <Column fill flex={1}>
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>

      <Row as="header" height="56" fillWidth vertical="center" paddingX="16" gap="12">
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="menu"
            variant="tertiary"
            tooltip="Menu"
            ariaLabel="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row gap="8" vertical="center" minWidth={10} s={{ minWidth: 0 }}>
          <Text variant="heading-strong-m">{product.name}</Text>
        </Row>
        <Row flex={1} horizontal="center">
          <Button
            variant="secondary"
            size="s"
            prefixIcon="search"
            onClick={openPalette}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            data-border="rounded"
          >
            <Row gap="12" vertical="center">
              <Text variant="label-default-s">Search</Text>
              <Row s={{ hide: true }}>
                <Kbd>{shortcut}</Kbd>
              </Row>
            </Row>
          </Button>
        </Row>
        <Row gap="8" vertical="center">
          <Column s={{ hide: true }} horizontal="end">
            <Text variant="label-strong-s">{user.name}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {user.role}
            </Text>
          </Column>
          <Avatar size="s" value="MO" />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth={16} fitHeight position="sticky" top="56">
          <SideNav pathname={pathname} />
        </Column>
        <Row fill horizontal="center" topRadius="l" overflow="hidden">
          <Row
            as="main"
            id="main"
            height="below-header"
            overflowY="auto"
            topRadius="l"
            horizontal="center"
            fillWidth
            background="surface"
            border
          >
            <Column
              maxWidth="l"
              fillWidth
              paddingX="24"
              paddingY="32"
              gap="32"
              fitHeight
              s={{ paddingX: "16" }}
            >
              {children}
            </Column>
          </Row>
        </Row>
      </Row>

      <Drawer
        open={menuOpen}
        onClose={() => setMenuPath(null)}
        side="left"
        size="s"
        title="Menu"
        flush
      >
        <Column paddingTop="64" paddingBottom="16">
          <SideNav pathname={pathname} />
        </Column>
      </Drawer>

      <CommandPalette />
      <InviteDialog />
      <CreateProjectDialog />
    </Column>
  );
}

export function LumenShell({ children }: { children: React.ReactNode }) {
  return (
    <LumenProvider>
      <Frame>{children}</Frame>
    </LumenProvider>
  );
}
```

```tsx components/lumen/PageHeader.tsx
import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <Row fillWidth gap="16" vertical="center" horizontal="between" wrap>
      <Column gap="4" flex={1} minWidth={16}>
        <Heading as="h1" variant="display-strong-xs">
          {title}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {description}
        </Text>
      </Column>
      {actions}
    </Row>
  );
}
```

```tsx components/lumen/DashboardView.tsx
"use client";

import { Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import type { IconName } from "@once-ui-system/core";
import { formatDate, members, projects, recentProjects } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

export function DashboardView() {
  const { openCreate, openInvite, openPalette } = useLumen();

  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats: { label: string; value: number; note: string; icon: IconName }[] = [
    { label: "Open issues", value: openIssues, note: "Across all projects", icon: "checkbox" },
    { label: "Active projects", value: activeProjects, note: `${projects.length} in total`, icon: "folder" },
    { label: "Active members", value: activeMembers, note: `${members.length} seats used`, icon: "people" },
    { label: "Pending invites", value: pendingInvites, note: "Waiting to accept", icon: "mail" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quick look at how your team is doing this week."
        actions={
          <Row gap="8" wrap>
            <Button variant="secondary" size="s" prefixIcon="mail" label="Invite member" onClick={openInvite} />
            <Button size="s" prefixIcon="plus" label="Create project" onClick={openCreate} />
          </Row>
        }
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" fillWidth>
        {stats.map((stat) => (
          <Column key={stat.label} background="page" border radius="l" padding="20" gap="12">
            <Row gap="8" vertical="center">
              <Icon name={stat.icon} size="s" onBackground="neutral-weak" />
              <Text variant="label-default-s" onBackground="neutral-weak">
                {stat.label}
              </Text>
            </Row>
            <Text variant="display-strong-s">{stat.value}</Text>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {stat.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="16" fillWidth>
        <Heading as="h2" variant="heading-strong-l">
          Recently updated
        </Heading>
        <Column background="page" border radius="l" fillWidth>
          {recentProjects.map((p, index) => (
            <Row
              key={p.key}
              fillWidth
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              borderTop={index > 0}
            >
              <Column gap="2" flex={1} minWidth={8}>
                <Text variant="label-strong-m">{p.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {p.key} · updated {formatDate(p.updated)}
                </Text>
              </Column>
              <Tag scheme={statusScheme[p.status]} label={p.status} />
            </Row>
          ))}
        </Column>
        <Row gap="8" vertical="center" wrap>
          <Text variant="body-default-s" onBackground="neutral-weak">
            Jump anywhere with the command palette.
          </Text>
          <Button variant="tertiary" size="s" label="Open palette" onClick={openPalette} />
        </Row>
      </Column>
    </>
  );
}
```

```tsx components/lumen/ProjectsView.tsx
"use client";

import { Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import { useSearchParams } from "next/navigation";
import { formatDate, projects } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme = { Active: "success", Paused: "warning", Archived: "neutral" } as const;

export function ProjectsView() {
  const { openCreate } = useLumen();
  const params = useSearchParams();
  const openKey = params.get("open");
  const opened = projects.find((p) => p.key === openKey);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every product your team tracks in Lumen."
        actions={<Button size="s" prefixIcon="plus" label="Create project" onClick={openCreate} />}
      />

      {opened && (
        <Text role="status" variant="body-default-s" onBackground="brand-medium">
          Opened {opened.name} ({opened.key})
        </Text>
      )}

      <Column
        as="ul"
        fillWidth
        gap="12"
        margin="0"
        padding="0"
        style={{ listStyle: "none" }}
        aria-label="Projects"
      >
        {projects.map((p) => {
          const isOpened = p.key === openKey;
          return (
            <Row
              as="li"
              key={p.key}
              background="page"
              border={isOpened ? "brand-alpha-strong" : true}
              borderWidth={isOpened ? 2 : 1}
              radius="l"
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              aria-current={isOpened ? "true" : undefined}
            >
              <Row gap="16" vertical="center" flex={1} minWidth={12}>
                <Row
                  center
                  width="40"
                  height="40"
                  radius="m"
                  background="neutral-alpha-weak"
                  aria-hidden="true"
                >
                  <Text variant="label-strong-xs">{p.key}</Text>
                </Row>
                <Column gap="2">
                  <Text variant="label-strong-m">{p.name}</Text>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    Updated {formatDate(p.updated)}
                  </Text>
                </Column>
              </Row>
              <Row gap="16" vertical="center">
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {p.issues} {p.issues === 1 ? "issue" : "issues"}
                </Text>
                <Tag scheme={statusScheme[p.status]} label={p.status} />
              </Row>
            </Row>
          );
        })}
      </Column>
    </>
  );
}
```

```tsx components/lumen/MembersView.tsx
"use client";

import { Avatar, Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, members } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { useLumen } from "./LumenProvider";

const statusScheme = { Active: "success", Invited: "info", Suspended: "danger" } as const;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function MembersView() {
  const { openInvite } = useLumen();

  return (
    <>
      <PageHeader
        title="Members"
        description="People with access to your Lumen workspace."
        actions={<Button size="s" prefixIcon="mail" label="Invite member" onClick={openInvite} />}
      />

      <Column
        as="ul"
        fillWidth
        gap="12"
        margin="0"
        padding="0"
        style={{ listStyle: "none" }}
        aria-label="Members"
      >
        {members.map((m) => (
          <Row
            as="li"
            key={m.id}
            background="page"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            horizontal="between"
            wrap
          >
            <Row gap="12" vertical="center" flex={1} minWidth={12}>
              <Avatar size="m" value={initials(m.name)} />
              <Column gap="2" minWidth={0}>
                <Text variant="label-strong-m">{m.name}</Text>
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {m.email}
                </Text>
              </Column>
            </Row>
            <Row gap="12" vertical="center" wrap>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {m.role}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {m.joined ? `Joined ${formatDate(m.joined)}` : "Not joined yet"}
              </Text>
              <Tag scheme={statusScheme[m.status]} label={m.status} />
            </Row>
          </Row>
        ))}
      </Column>
    </>
  );
}
```

```tsx app/page.tsx
import { LumenShell } from "@/components/lumen/LumenShell";
import { DashboardView } from "@/components/lumen/DashboardView";

export default function Page() {
  return (
    <LumenShell>
      <DashboardView />
    </LumenShell>
  );
}
```

```tsx app/(lumen)/layout.tsx
import { LumenShell } from "@/components/lumen/LumenShell";

export default function LumenLayout({ children }: { children: React.ReactNode }) {
  return <LumenShell>{children}</LumenShell>;
}
```

```tsx app/(lumen)/projects/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { ProjectsView } from "@/components/lumen/ProjectsView";

export const metadata: Metadata = {
  title: "Projects · Lumen",
  description: "Every product your team tracks in Lumen.",
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={null}>
      <ProjectsView />
    </Suspense>
  );
}
```

```tsx app/(lumen)/members/page.tsx
import type { Metadata } from "next";
import { MembersView } from "@/components/lumen/MembersView";

export const metadata: Metadata = {
  title: "Members · Lumen",
  description: "People with access to your Lumen workspace.",
};

export default function MembersPage() {
  return <MembersView />;
}
```
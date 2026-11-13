The next step is a safer build. The main changes:

- Every file that imports Once UI components is a client file, so no server component imports the package root.
- The palette list uses native `div`/`button` elements and the ARIA combobox pattern, with no refs on library components.
- Table column types come from `Table`'s own props.
- A single `AppShell` mounts in one shared layout for `/projects` and `/members`. `/` mounts it from `app/page.tsx`.

```ts lib/data.ts
export const product = {
  name: "Lumen",
  description: "Product analytics and issue tracking for small software teams",
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

export type MemberStatus = "Active" | "Invited" | "Suspended";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member" | "Viewer";
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

export type NavIconName = "home" | "folder" | "people";

export type NavLink = { href: string; label: string; icon: NavIconName; description: string };

export const navLinks: NavLink[] = [
  { href: "/", label: "Dashboard", icon: "home", description: "Overview of your workspace" },
  { href: "/projects", label: "Projects", icon: "folder", description: "All projects and their status" },
  { href: "/members", label: "Members", icon: "people", description: "People with access to Lumen" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(iso: string | null): string {
  if (!iso) return "Pending";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** The three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3);
```

```tsx components/PaletteProvider.tsx
"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type PaletteContextValue = {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  inviteOpen: boolean;
  openInvite: () => void;
  closeInvite: () => void;
};

const PaletteContext = createContext<PaletteContextValue | null>(null);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const togglePalette = useCallback(() => setPaletteOpen((open) => !open), []);
  const openInvite = useCallback(() => setInviteOpen(true), []);
  const closeInvite = useCallback(() => setInviteOpen(false), []);

  const value = useMemo(
    () => ({ paletteOpen, openPalette, closePalette, togglePalette, inviteOpen, openInvite, closeInvite }),
    [paletteOpen, openPalette, closePalette, togglePalette, inviteOpen, openInvite, closeInvite],
  );

  return <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>;
}

export function usePalette(): PaletteContextValue {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used inside <PaletteProvider>");
  return ctx;
}
```

```tsx components/CommandPalette.tsx
"use client";

import { Column, Dialog, Icon, Input, Row, Text, useHotkeys, useTheme } from "@once-ui-system/core";
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
  const optionId = (cmd: Command) => `${baseId}-opt-${cmd.id}`;

  // Start fresh each time the palette opens.
  useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setActive(0);
    }
  }, [paletteOpen]);

  // Keep the highlighted row in view while arrowing through the list.
  useEffect(() => {
    if (!paletteOpen || !activeCommand) return;
    document.getElementById(optionId(activeCommand))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteOpen, activeCommand?.id]);

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
                  const selected = activeCommand?.id === cmd.id;
                  return (
                    <div
                      key={cmd.id}
                      id={optionId(cmd)}
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
```

I left the combobox ARIA attributes off the `Input` to avoid prop-typing risk. I'll reintroduce the accessible link between the field and the list by naming the list and keeping focus in the field, with the highlighted option announced through a live region:

```tsx components/CommandPalette.tsx
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
```

```tsx components/InviteDialog.tsx
"use client";

import { Button, Column, Dialog, Input, Row, useToast } from "@once-ui-system/core";
import { useEffect, useState } from "react";
import { members } from "@/lib/data";
import { usePalette } from "./PaletteProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteDialog() {
  const { inviteOpen, closeInvite } = usePalette();
  const { addToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteOpen) {
      setEmail("");
      setError(null);
    }
  }, [inviteOpen]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like teammate@acmelabs.io.");
      return;
    }
    if (members.some((member) => member.email.toLowerCase() === value.toLowerCase())) {
      setError("That person is already a member of this workspace.");
      return;
    }
    addToast({ tone: "success", message: `Invitation sent to ${value}` });
    closeInvite();
  };

  return (
    <Dialog
      open={inviteOpen}
      onClose={closeInvite}
      title="Invite member"
      description="They will get an email with a link to join Acme Labs on Lumen."
    >
      <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <Input
          id="invite-email"
          type="email"
          label="Email address"
          placeholder="teammate@acmelabs.io"
          value={email}
          autoComplete="off"
          error={error !== null}
          errorMessage={error ?? undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
        />
        <Row gap="12" horizontal="end">
          <Button type="button" variant="secondary" label="Cancel" onClick={closeInvite} />
          <Button type="submit" label="Send invite" prefixIcon="send" />
        </Row>
      </form>
    </Dialog>
  );
}
```

```tsx components/AppShell.tsx
"use client";

import {
  Breadcrumbs,
  Button,
  Column,
  Drawer,
  Icon,
  IconButton,
  Kbd,
  Nav,
  NavItem,
  Option,
  Row,
  Text,
  User,
  VisuallyHidden,
  selectNavHref,
} from "@once-ui-system/core";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { initials, navLinks, product, user } from "@/lib/data";
import { CommandPalette } from "./CommandPalette";
import { InviteDialog } from "./InviteDialog";
import { PaletteProvider, usePalette } from "./PaletteProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PaletteProvider>
      <Frame>{children}</Frame>
      <CommandPalette />
      <InviteDialog />
    </PaletteProvider>
  );
}

function SideNav({ current }: { current: string | null }) {
  return (
    <Nav fill paddingX="8" density="compact" aria-label="Main">
      {navLinks.map((link) => (
        <NavItem
          key={link.href}
          href={link.href}
          icon={link.icon}
          label={link.label}
          selected={link.href === current}
        />
      ))}
    </Nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { openPalette } = usePalette();
  const current = selectNavHref(
    pathname,
    navLinks.map((link) => link.href),
  );
  // The drawer is open for the path it was opened on, so following a link closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const page = navLinks.find((link) => link.href === current);
  const crumbs = [{ label: product.name, href: "/" }, { label: page ? page.label : "Dashboard" }];

  const avatar = { value: initials(user.name) };
  const account = (
    <Column padding="4" gap="2" minWidth="12rem">
      <Column paddingX="12" paddingY="8">
        <Text textVariant="label-strong-s">{user.name}</Text>
        <Text textVariant="body-default-xs" onBackground="neutral-weak">
          {user.email} · {user.role}
        </Text>
      </Column>
      <Option
        value="sign-out"
        label="Sign out"
        prefix={<Icon name="logout" size="s" onBackground="neutral-weak" />}
      />
    </Column>
  );

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
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuPath(pathname)}
          />
        </Row>
        <Row minWidth="12rem" s={{ minWidth: 0 }} vertical="center" gap="8">
          <Icon name="bolt" onBackground="brand-strong" />
          <Text textVariant="heading-strong-s">{product.name}</Text>
        </Row>
        <Row flex={1} s={{ hide: true }}>
          <Breadcrumbs items={crumbs} />
        </Row>
        <Row s={{ flex: 1 }} />

        {/* Desktop: labelled button with the shortcut beside it. */}
        <Row gap="8" vertical="center" s={{ hide: true }}>
          <Button
            size="s"
            variant="secondary"
            prefixIcon="search"
            label="Search"
            aria-label="Open command palette"
            aria-haspopup="dialog"
            onClick={openPalette}
          />
          <Kbd keys="mod+k" />
        </Row>
        {/* Phones: icon button, still visible and tappable. */}
        <Row hide s={{ hide: false }}>
          <IconButton
            icon="search"
            variant="secondary"
            tooltip="Search"
            aria-label="Open command palette"
            aria-haspopup="dialog"
            onClick={openPalette}
          />
        </Row>

        <Row s={{ hide: true }}>
          <User
            name={user.name}
            subline={user.email}
            placement="bottom-end"
            avatarProps={avatar}
            dropdown={account}
          />
        </Row>
        <Row hide s={{ hide: false }}>
          <User placement="bottom-end" avatarProps={avatar} dropdown={account} />
        </Row>
      </Row>

      <Row fill paddingX="8">
        <Column s={{ hide: true }} maxWidth="16rem" fitHeight position="sticky" top="56">
          <SideNav current={current} />
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
            <Column maxWidth="xl" fillWidth paddingX="24" paddingY="32" s={{ paddingX: "16" }} fitHeight>
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
          <SideNav current={current} />
        </Column>
      </Drawer>
    </Column>
  );
}
```

```tsx components/PageHeader.tsx
"use client";

import { Column, Heading, Row, Text } from "@once-ui-system/core";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Row fillWidth horizontal="between" vertical="end" gap="16" wrap>
      <Column gap="8" flex={1} minWidth="16rem">
        <Heading as="h1" textVariant="display-strong-xs">
          {title}
        </Heading>
        <Text onBackground="neutral-weak">{description}</Text>
      </Column>
    </Row>
  );
}
```

```tsx components/StatusTag.tsx
"use client";

import { Tag } from "@once-ui-system/core";
import type { MemberStatus, ProjectStatus } from "@/lib/data";

const TONES = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
  Invited: "info",
  Suspended: "danger",
} as const;

export function StatusTag({ status }: { status: ProjectStatus | MemberStatus }) {
  return <Tag tone={TONES[status]} size="s" label={status} />;
}
```

```tsx components/DashboardView.tsx
"use client";

import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, members, projects, recentProjects, user } from "@/lib/data";
import { PageHeader } from "./PageHeader";
import { StatusTag } from "./StatusTag";

export function DashboardView() {
  const openIssues = projects.reduce((sum, project) => sum + project.issues, 0);
  const activeProjects = projects.filter((project) => project.status === "Active").length;
  const activeMembers = members.filter((member) => member.status === "Active").length;
  const pendingInvites = members.filter((member) => member.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: "across all projects" },
    { label: "Active projects", value: activeProjects, note: `of ${projects.length} total` },
    { label: "Active members", value: activeMembers, note: `${members.length} in the workspace` },
    { label: "Pending invites", value: pendingInvites, note: "waiting to accept" },
  ];

  return (
    <Column gap="32">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here is where things stand across Acme Labs today."
      />

      <Grid columns="4" gap="16" m={{ columns: 2 }} s={{ columns: 1 }}>
        {stats.map((stat) => (
          <Column key={stat.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {stat.label}
            </Text>
            <Heading as="p" textVariant="display-strong-s">
              {stat.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {stat.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="16">
        <Heading as="h2" textVariant="display-strong-xs">
          Recently updated
        </Heading>
        <Column background="surface" border radius="l">
          {recentProjects.map((project, index) => (
            <Row
              key={project.key}
              padding="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              borderTop={index > 0}
            >
              <Column gap="2" flex={1} minWidth="12rem">
                <Text textVariant="label-strong-m">{project.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {project.key} · {project.issues} open issues · updated {formatDate(project.updated)}
                </Text>
              </Column>
              <StatusTag status={project.status} />
            </Row>
          ))}
        </Column>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Tip: press the search button above, or Ctrl+K, to jump anywhere or run a quick action.
        </Text>
      </Column>
    </Column>
  );
}
```

```tsx components/ProjectsTable.tsx
"use client";

import { Table } from "@once-ui-system/core";
import type { ComponentProps } from "react";
import { formatDate, projects, type Project } from "@/lib/data";
import { StatusTag } from "./StatusTag";

type Columns = ComponentProps<typeof Table<Project>>["columns"];

const columns: Columns = [
  { key: "key", header: "Key", sortable: true, sort: (a, b) => a.key.localeCompare(b.key), width: "6rem" },
  { key: "name", header: "Project", sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
  { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
  {
    key: "issues",
    header: "Open issues",
    align: "right",
    sortable: true,
    sort: (a, b) => a.issues - b.issues,
  },
  {
    key: "updated",
    header: "Updated",
    sortable: true,
    sort: (a, b) => a.updated.localeCompare(b.updated),
    hide: { s: true },
    cell: (row) => formatDate(row.updated),
  },
];

export function ProjectsTable() {
  return (
    <Table
      aria-label="Projects"
      columns={columns}
      rows={projects}
      getRowId={(row) => row.key}
    />
  );
}
```

`ComponentProps<typeof Table<Project>>` is an instantiation expression, which is fragile if `Table` isn't a plain generic function. To remove any doubt, I'll avoid it and let inference type the columns inline:

```tsx components/ProjectsTable.tsx
"use client";

import { Table } from "@once-ui-system/core";
import { formatDate, projects } from "@/lib/data";
import { StatusTag } from "./StatusTag";

export function ProjectsTable() {
  return (
    <Table
      aria-label="Projects"
      rows={projects}
      getRowId={(row) => row.key}
      columns={[
        { key: "key", header: "Key", sortable: true, sort: (a, b) => a.key.localeCompare(b.key), width: "6rem" },
        { key: "name", header: "Project", sortable: true, sort: (a, b) => a.name.localeCompare(b.name) },
        { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
        {
          key: "issues",
          header: "Open issues",
          align: "right",
          sortable: true,
          sort: (a, b) => a.issues - b.issues,
        },
        {
          key: "updated",
          header: "Updated",
          sortable: true,
          sort: (a, b) => a.updated.localeCompare(b.updated),
          hide: { s: true },
          cell: (row) => formatDate(row.updated),
        },
      ]}
    />
  );
}
```

```tsx components/MembersTable.tsx
"use client";

import { Avatar, Column, Row, Table, Text } from "@once-ui-system/core";
import { formatDate, initials, members } from "@/lib/data";
import { StatusTag } from "./StatusTag";

export function MembersTable() {
  return (
    <Table
      aria-label="Members"
      rows={members}
      getRowId={(row) => row.id}
      columns={[
        {
          key: "name",
          header: "Member",
          sortable: true,
          sort: (a, b) => a.name.localeCompare(b.name),
          cell: (row) => (
            <Row gap="12" vertical="center">
              <Avatar size="s" value={initials(row.name)} />
              <Column>
                <Text textVariant="label-strong-s">{row.name}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {row.email}
                </Text>
              </Column>
            </Row>
          ),
        },
        { key: "role", header: "Role", sortable: true, sort: (a, b) => a.role.localeCompare(b.role) },
        { key: "status", header: "Status", cell: (row) => <StatusTag status={row.status} /> },
        {
          key: "joined",
          header: "Joined",
          hide: { s: true },
          cell: (row) => formatDate(row.joined),
        },
      ]}
    />
  );
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
```

```tsx app/projects/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/projects/page.tsx
import { ProjectsView } from "@/components/ProjectsView";

export default function ProjectsPage() {
  return <ProjectsView />;
}
```

```tsx components/ProjectsView.tsx
"use client";

import { Column } from "@once-ui-system/core";
import { PageHeader } from "./PageHeader";
import { ProjectsTable } from "./ProjectsTable";

export function ProjectsView() {
  return (
    <Column gap="32">
      <PageHeader title="Projects" description="Every project in the Acme Labs workspace and where it stands." />
      <ProjectsTable />
    </Column>
  );
}
```

```tsx app/members/layout.tsx
import { AppShell } from "@/components/AppShell";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/members/page.tsx
import { MembersView } from "@/components/MembersView";

export default function MembersPage() {
  return <MembersView />;
}
```

```tsx components/MembersView.tsx
"use client";

import { Column } from "@once-ui-system/core";
import { MembersTable } from "./MembersTable";
import { PageHeader } from "./PageHeader";

export function MembersView() {
  return (
    <Column gap="32">
      <PageHeader title="Members" description="People with access to Lumen and the role each one holds." />
      <MembersTable />
    </Column>
  );
}
```
The error is on the skip link: `Box as="a"` doesn't accept `href`. I replaced it with Chakra's `chakra.a`, which does. All the other files are unchanged.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived";
export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Invited" | "Suspended";

export interface Project {
  key: string;
  name: string;
  status: ProjectStatus;
  issues: number;
  updated: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joined: string | null;
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams";

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const;

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
];

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

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

export const statusColor: Record<string, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
  Invited: "blue",
  Suspended: "red",
};
```

```tsx components/app-shell-provider.tsx
"use client";

import * as React from "react";

interface AppShellContextValue {
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  setPaletteOpen: (open: boolean) => void;
  inviteOpen: boolean;
  openInvite: () => void;
  setInviteOpen: (open: boolean) => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  const openPalette = React.useCallback(() => setPaletteOpen(true), []);
  const closePalette = React.useCallback(() => setPaletteOpen(false), []);
  const openInvite = React.useCallback(() => setInviteOpen(true), []);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = React.useMemo<AppShellContextValue>(
    () => ({
      paletteOpen,
      openPalette,
      closePalette,
      setPaletteOpen,
      inviteOpen,
      openInvite,
      setInviteOpen,
    }),
    [paletteOpen, openPalette, closePalette, inviteOpen, openInvite],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShellProvider");
  return ctx;
}
```

```tsx components/command-palette.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Box, Dialog, Flex, HStack, Input, Portal, Text, VisuallyHidden } from "@chakra-ui/react";
import {
  LuFolderKanban,
  LuLayoutDashboard,
  LuMoon,
  LuPlus,
  LuSearch,
  LuUserPlus,
  LuUsers,
} from "react-icons/lu";
import { useColorMode } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { recentProjects } from "@/lib/data";
import { useAppShell } from "@/components/app-shell-provider";

interface PaletteItem {
  id: string;
  group: "Pages" | "Actions" | "Recent";
  label: string;
  hint?: string;
  keywords?: string;
  icon: React.ReactNode;
  run: () => void;
}

const GROUPS: PaletteItem["group"][] = ["Pages", "Actions", "Recent"];

export function CommandPalette() {
  const router = useRouter();
  const { paletteOpen, setPaletteOpen, openInvite } = useAppShell();
  const { toggleColorMode } = useColorMode();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const close = React.useCallback(() => setPaletteOpen(false), [setPaletteOpen]);

  const items = React.useMemo<PaletteItem[]>(
    () => [
      {
        id: "page-dashboard",
        group: "Pages",
        label: "Dashboard",
        hint: "/",
        keywords: "home overview",
        icon: <LuLayoutDashboard />,
        run: () => router.push("/"),
      },
      {
        id: "page-projects",
        group: "Pages",
        label: "Projects",
        hint: "/projects",
        keywords: "issues",
        icon: <LuFolderKanban />,
        run: () => router.push("/projects"),
      },
      {
        id: "page-members",
        group: "Pages",
        label: "Members",
        hint: "/members",
        keywords: "team people",
        icon: <LuUsers />,
        run: () => router.push("/members"),
      },
      {
        id: "action-create-project",
        group: "Actions",
        label: "Create project",
        keywords: "new add",
        icon: <LuPlus />,
        run: () => {
          router.push("/projects");
          toaster.create({
            title: "New project draft started",
            description: "Name your project and pick a key to get going.",
            type: "info",
          });
        },
      },
      {
        id: "action-invite-member",
        group: "Actions",
        label: "Invite member",
        keywords: "add teammate email",
        icon: <LuUserPlus />,
        run: () => {
          window.setTimeout(openInvite, 0);
        },
      },
      {
        id: "action-toggle-theme",
        group: "Actions",
        label: "Toggle theme",
        keywords: "dark light mode color",
        icon: <LuMoon />,
        run: () => toggleColorMode(),
      },
      ...recentProjects.map<PaletteItem>((project) => ({
        id: `recent-${project.key}`,
        group: "Recent",
        label: project.name,
        hint: project.key,
        keywords: `${project.key} ${project.status}`,
        icon: <LuFolderKanban />,
        run: () => router.push("/projects"),
      })),
    ],
    [router, openInvite, toggleColorMode],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.keywords ?? ""} ${item.hint ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Flat order matches visual order (grouped).
  const ordered = React.useMemo(
    () => GROUPS.flatMap((group) => filtered.filter((item) => item.group === group)),
    [filtered],
  );

  React.useEffect(() => {
    setActive(0);
  }, [query]);

  React.useEffect(() => {
    if (!paletteOpen) {
      setQuery("");
      setActive(0);
    }
  }, [paletteOpen]);

  React.useEffect(() => {
    const current = ordered[active];
    if (!current) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-id="${current.id}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, ordered]);

  function runItem(item: PaletteItem) {
    close();
    item.run();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (ordered.length) setActive((i) => (i + 1) % ordered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (ordered.length) setActive((i) => (i - 1 + ordered.length) % ordered.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      if (ordered.length) setActive(ordered.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = ordered[active];
      if (item) runItem(item);
    }
  }

  const activeItem = ordered[active];
  const listboxId = "command-palette-listbox";

  return (
    <Dialog.Root
      open={paletteOpen}
      onOpenChange={(details) => setPaletteOpen(details.open)}
      placement="top"
      motionPreset="slide-in-top"
      initialFocusEl={() => inputRef.current}
      scrollBehavior="inside"
      size={{ base: "full", sm: "md" }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            mt={{ base: 0, sm: "12vh" }}
            maxH={{ base: "100dvh", sm: "min(560px, 76vh)" }}
            overflow="hidden"
          >
            <VisuallyHidden>
              <Dialog.Title>Command palette</Dialog.Title>
              <Dialog.Description>
                Search pages, actions and recent projects. Use the arrow keys to move and Enter to
                run.
              </Dialog.Description>
            </VisuallyHidden>

            <Flex align="center" gap="3" px="4" py="3" borderBottomWidth="1px">
              <Box aria-hidden color="fg.muted" fontSize="lg">
                <LuSearch />
              </Box>
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search pages, actions, projects…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeItem ? `cmd-${activeItem.id}` : undefined}
                autoComplete="off"
                spellCheck={false}
                variant="flushed"
                border="none"
                _focusVisible={{ outline: "none", boxShadow: "none" }}
                px="0"
              />
              <Box
                as="kbd"
                fontSize="xs"
                color="fg.muted"
                borderWidth="1px"
                rounded="sm"
                px="1.5"
                py="0.5"
                display={{ base: "none", sm: "block" }}
              >
                Esc
              </Box>
            </Flex>

            <Box
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label="Results"
              overflowY="auto"
              p="2"
              flex="1"
            >
              {ordered.length === 0 && (
                <Text role="status" color="fg.muted" textAlign="center" py="10" textStyle="sm">
                  No results for “{query}”
                </Text>
              )}
              {GROUPS.map((group) => {
                const groupItems = ordered.filter((item) => item.group === group);
                if (groupItems.length === 0) return null;
                const headingId = `cmd-group-${group}`;
                return (
                  <Box key={group} role="group" aria-labelledby={headingId} mb="2">
                    <Text
                      id={headingId}
                      px="3"
                      py="1.5"
                      textStyle="xs"
                      fontWeight="semibold"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color="fg.muted"
                    >
                      {group}
                    </Text>
                    {groupItems.map((item) => {
                      const selected = activeItem?.id === item.id;
                      return (
                        <Flex
                          key={item.id}
                          id={`cmd-${item.id}`}
                          data-id={item.id}
                          role="option"
                          aria-selected={selected}
                          data-highlighted={selected ? "" : undefined}
                          align="center"
                          gap="3"
                          px="3"
                          py="2.5"
                          rounded="md"
                          cursor="pointer"
                          bg={selected ? "bg.emphasized" : "transparent"}
                          onMouseMove={() => {
                            const index = ordered.findIndex((o) => o.id === item.id);
                            if (index !== -1 && index !== active) setActive(index);
                          }}
                          onClick={() => runItem(item)}
                        >
                          <Box aria-hidden color="fg.muted" fontSize="lg">
                            {item.icon}
                          </Box>
                          <Text flex="1" truncate>
                            {item.label}
                          </Text>
                          {item.hint && (
                            <Text color="fg.muted" textStyle="xs" fontFamily="mono">
                              {item.hint}
                            </Text>
                          )}
                        </Flex>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>

            <HStack
              display={{ base: "none", sm: "flex" }}
              gap="4"
              px="4"
              py="2"
              borderTopWidth="1px"
              color="fg.muted"
              textStyle="xs"
            >
              <Text>↑↓ to navigate</Text>
              <Text>↵ to select</Text>
              <Text>esc to close</Text>
            </HStack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
```

```tsx components/invite-member-dialog.tsx
"use client";

import * as React from "react";
import { Button, Input, Text } from "@chakra-ui/react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogDescription,
  DialogActionTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { useAppShell } from "@/components/app-shell-provider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteMemberDialog() {
  const { inviteOpen, setInviteOpen } = useAppShell();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!inviteOpen) {
      setEmail("");
      setError(null);
    }
  }, [inviteOpen]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like teammate@acmelabs.io.");
      inputRef.current?.focus();
      return;
    }
    setInviteOpen(false);
    toaster.create({
      title: "Invitation sent",
      description: `${value} will receive an email to join Acme Labs on Lumen.`,
      type: "success",
    });
  }

  return (
    <DialogRoot
      open={inviteOpen}
      onOpenChange={(details) => setInviteOpen(details.open)}
      placement="center"
      initialFocusEl={() => inputRef.current}
    >
      <DialogContent mx="4">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <DialogDescription asChild>
              <Text color="fg.muted" mb="4" textStyle="sm">
                They will get an email with a link to join your workspace as a Member.
              </Text>
            </DialogDescription>
            <Field label="Email address" invalid={!!error} errorText={error} required>
              <Input
                ref={inputRef}
                type="email"
                name="email"
                autoComplete="off"
                placeholder="teammate@acmelabs.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
```

```tsx components/app-header.tsx
"use client";

import * as React from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Box, Button, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { LuLayoutDashboard, LuFolderKanban, LuSearch, LuUsers } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useAppShell } from "@/components/app-shell-provider";
import { user } from "@/lib/data";

const NAV = [
  { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/projects", label: "Projects", icon: LuFolderKanban },
  { href: "/members", label: "Members", icon: LuUsers },
] as const;

function useShortcutLabel(): string {
  const [label, setLabel] = React.useState("Ctrl K");
  React.useEffect(() => {
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
        ?.platform ?? navigator.platform;
    if (/mac|iphone|ipad|ipod/i.test(platform)) setLabel("⌘K");
  }, []);
  return label;
}

export function AppHeader() {
  const pathname = usePathname();
  const { openPalette } = useAppShell();
  const shortcut = useShortcutLabel();

  return (
    <Box as="header" borderBottomWidth="1px" bg="bg" position="sticky" top="0" zIndex="sticky">
      <Flex
        maxW="6xl"
        mx="auto"
        px={{ base: "3", md: "6" }}
        h="14"
        align="center"
        gap={{ base: "2", md: "6" }}
      >
        <NextLink href="/" aria-label="Lumen home">
          <HStack gap="2">
            <Flex
              boxSize="7"
              rounded="md"
              bg="blue.solid"
              color="white"
              align="center"
              justify="center"
              fontWeight="bold"
              aria-hidden
            >
              L
            </Flex>
            <Text fontWeight="semibold" display={{ base: "none", sm: "block" }}>
              Lumen
            </Text>
          </HStack>
        </NextLink>

        <Box as="nav" aria-label="Main" display={{ base: "none", md: "block" }}>
          <HStack gap="1">
            {NAV.map(({ href, label }) => {
              const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <NextLink key={href} href={href} aria-current={current ? "page" : undefined}>
                  <Box
                    px="3"
                    py="1.5"
                    rounded="md"
                    textStyle="sm"
                    fontWeight={current ? "semibold" : "medium"}
                    bg={current ? "bg.muted" : "transparent"}
                    color={current ? "fg" : "fg.muted"}
                    _hover={{ bg: "bg.muted", color: "fg" }}
                  >
                    {label}
                  </Box>
                </NextLink>
              );
            })}
          </HStack>
        </Box>

        <Flex flex="1" justify="flex-end" align="center" gap={{ base: "1", md: "3" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={openPalette}
            aria-label="Open command palette"
            aria-keyshortcuts="Control+K Meta+K"
            display={{ base: "none", sm: "inline-flex" }}
            color="fg.muted"
            minW={{ sm: "44", md: "56" }}
            justifyContent="space-between"
          >
            <HStack gap="2">
              <LuSearch />
              <Text as="span">Search…</Text>
            </HStack>
            <Box
              as="kbd"
              fontSize="xs"
              borderWidth="1px"
              rounded="sm"
              px="1.5"
              py="0.5"
              fontFamily="mono"
              suppressHydrationWarning
            >
              {shortcut}
            </Box>
          </Button>
          <IconButton
            variant="outline"
            size="sm"
            onClick={openPalette}
            aria-label="Open command palette"
            display={{ base: "inline-flex", sm: "none" }}
          >
            <LuSearch />
          </IconButton>
          <ColorModeButton />
          <Avatar.Root size="sm">
            <Avatar.Fallback name={user.name} />
          </Avatar.Root>
        </Flex>
      </Flex>

      <Box as="nav" aria-label="Main mobile" display={{ base: "block", md: "none" }} borderTopWidth="1px">
        <Flex maxW="6xl" mx="auto" px="2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const current = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <NextLink
                key={href}
                href={href}
                aria-current={current ? "page" : undefined}
                style={{ flex: 1 }}
              >
                <Flex
                  align="center"
                  justify="center"
                  gap="2"
                  py="2.5"
                  textStyle="sm"
                  fontWeight={current ? "semibold" : "medium"}
                  color={current ? "fg" : "fg.muted"}
                  borderBottomWidth="2px"
                  borderColor={current ? "blue.solid" : "transparent"}
                >
                  <Icon aria-hidden />
                  {label}
                </Flex>
              </NextLink>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
}
```

```tsx components/app-shell.tsx
"use client";

import * as React from "react";
import { Box, chakra } from "@chakra-ui/react";
import { AppShellProvider } from "@/components/app-shell-provider";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { InviteMemberDialog } from "@/components/invite-member-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <Box minH="100dvh" bg="bg.subtle">
        <chakra.a
          href="#main"
          position="absolute"
          left="-9999px"
          _focus={{
            left: "3",
            top: "3",
            zIndex: "popover",
            bg: "bg",
            px: "3",
            py: "2",
            rounded: "md",
            shadow: "md",
          }}
        >
          Skip to content
        </chakra.a>
        <AppHeader />
        <Box as="main" id="main" maxW="6xl" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "5", md: "8" }}>
          {children}
        </Box>
        <CommandPalette />
        <InviteMemberDialog />
      </Box>
    </AppShellProvider>
  );
}
```

```tsx components/dashboard-view.tsx
import NextLink from "next/link";
import { Badge, Box, Card, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { formatDate, members, projects, recentProjects, statusColor, user } from "@/lib/data";

export function DashboardView() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const activeMembers = members.filter((m) => m.status === "Active").length;
  const pendingInvites = members.filter((m) => m.status === "Invited").length;

  const stats = [
    { label: "Open issues", value: openIssues, note: `across ${projects.length} projects` },
    { label: "Active projects", value: activeProjects, note: "currently shipping" },
    { label: "Active members", value: activeMembers, note: `of ${members.length} seats` },
    { label: "Pending invites", value: pendingInvites, note: "awaiting a response" },
  ];

  return (
    <Stack gap="6">
      <Box>
        <Heading as="h1" size="2xl">
          Good morning, {user.name.split(" ")[0]}
        </Heading>
        <Text color="fg.muted" mt="1">
          Here is what is happening across your workspace. Press{" "}
          <Box as="kbd" fontFamily="mono" fontSize="sm" borderWidth="1px" rounded="sm" px="1.5">
            Ctrl K
          </Box>{" "}
          or <Box as="kbd" fontFamily="mono" fontSize="sm" borderWidth="1px" rounded="sm" px="1.5">⌘K</Box>{" "}
          to jump anywhere.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" role="list" aria-label="Workspace summary">
        {stats.map((stat) => (
          <Card.Root key={stat.label} role="listitem">
            <Card.Body gap="1">
              <Text color="fg.muted" textStyle="sm">
                {stat.label}
              </Text>
              <Text textStyle="3xl" fontWeight="semibold">
                {stat.value}
              </Text>
              <Text color="fg.muted" textStyle="xs">
                {stat.note}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Flex justify="space-between" align="center" gap="3">
            <Card.Title as="h2">Recently updated</Card.Title>
            <NextLink href="/projects">
              <Text textStyle="sm" color="blue.fg" _hover={{ textDecoration: "underline" }}>
                View all projects
              </Text>
            </NextLink>
          </Flex>
        </Card.Header>
        <Card.Body>
          <Stack gap="0" as="ul" listStyleType="none">
            {recentProjects.map((project) => (
              <Flex
                as="li"
                key={project.key}
                justify="space-between"
                align="center"
                gap="3"
                py="3"
                borderTopWidth="1px"
                _first={{ borderTopWidth: "0", pt: "0" }}
              >
                <Box minW="0">
                  <Text fontWeight="medium" truncate>
                    {project.name}
                  </Text>
                  <Text color="fg.muted" textStyle="xs">
                    {project.key} · {project.issues} open issues · updated {formatDate(project.updated)}
                  </Text>
                </Box>
                <Badge colorPalette={statusColor[project.status]}>{project.status}</Badge>
              </Flex>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
```

```tsx components/projects-view.tsx
import { Badge, Box, Heading, Table, Text } from "@chakra-ui/react";
import { formatDate, projects, statusColor } from "@/lib/data";

export function ProjectsView() {
  return (
    <Box>
      <Heading as="h1" size="2xl">
        Projects
      </Heading>
      <Text color="fg.muted" mt="1" mb="5">
        {projects.length} projects in your workspace.
      </Text>

      <Table.ScrollArea borderWidth="1px" rounded="md" bg="bg">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>Projects with status, open issues and last update</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Key</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Open issues</Table.ColumnHeader>
              <Table.ColumnHeader>Updated</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {projects.map((project) => (
              <Table.Row key={project.key}>
                <Table.Cell fontFamily="mono" fontWeight="medium">
                  {project.key}
                </Table.Cell>
                <Table.Cell>{project.name}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[project.status]}>{project.status}</Badge>
                </Table.Cell>
                <Table.Cell textAlign="end">{project.issues}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(project.updated)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
```

```tsx components/members-view.tsx
"use client";

import { Avatar, Badge, Box, Button, Flex, Heading, HStack, Table, Text } from "@chakra-ui/react";
import { LuUserPlus } from "react-icons/lu";
import { useAppShell } from "@/components/app-shell-provider";
import { formatDate, members, statusColor } from "@/lib/data";

export function MembersView() {
  const { openInvite } = useAppShell();

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="3" mb="5" wrap="wrap">
        <Box>
          <Heading as="h1" size="2xl">
            Members
          </Heading>
          <Text color="fg.muted" mt="1">
            {members.length} people have access to Acme Labs.
          </Text>
        </Box>
        <Button onClick={openInvite}>
          <LuUserPlus />
          Invite member
        </Button>
      </Flex>

      <Table.ScrollArea borderWidth="1px" rounded="md" bg="bg">
        <Table.Root size="md" interactive>
          <Table.Caption srOnly>Workspace members with role, status and join date</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Member</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Joined</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((member) => (
              <Table.Row key={member.id}>
                <Table.Cell>
                  <HStack gap="3" minW="48">
                    <Avatar.Root size="sm">
                      <Avatar.Fallback name={member.name} />
                    </Avatar.Root>
                    <Box minW="0">
                      <Text fontWeight="medium">{member.name}</Text>
                      <Text color="fg.muted" textStyle="xs">
                        {member.email}
                      </Text>
                    </Box>
                  </HStack>
                </Table.Cell>
                <Table.Cell>{member.role}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={statusColor[member.status]}>{member.status}</Badge>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{formatDate(member.joined)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}
```

```tsx app/(app)/layout.tsx
import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

```tsx app/(app)/projects/page.tsx
import type { Metadata } from "next";
import { ProjectsView } from "@/components/projects-view";

export const metadata: Metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return <ProjectsView />;
}
```

```tsx app/(app)/members/page.tsx
import type { Metadata } from "next";
import { MembersView } from "@/components/members-view";

export const metadata: Metadata = { title: "Members · Lumen" };

export default function MembersPage() {
  return <MembersView />;
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { DashboardView } from "@/components/dashboard-view";

export const metadata: Metadata = { title: "Dashboard · Lumen" };

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}
```
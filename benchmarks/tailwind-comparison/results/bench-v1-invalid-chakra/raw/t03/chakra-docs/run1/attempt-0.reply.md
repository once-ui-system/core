Only the root layout and page exist. I'll put the palette state in a client `AppShell` and use it from all three routes.

```ts lib/data.ts
export type ProjectStatus = "Active" | "Paused" | "Archived"
export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer"
export type MemberStatus = "Active" | "Invited" | "Suspended"

export interface Project {
  key: string
  name: string
  status: ProjectStatus
  issues: number
  updated: string
}

export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
  joined: string | null
}

export const product =
  "Lumen, a product-analytics and issue-tracking app for small software teams"

export const user = {
  name: "Maya Okafor",
  email: "maya@acmelabs.io",
  role: "Owner",
} as const

export const projects: Project[] = [
  { key: "WEB", name: "Marketing site", status: "Active", issues: 12, updated: "2026-10-12" },
  { key: "APP", name: "Customer app", status: "Active", issues: 31, updated: "2026-10-14" },
  { key: "API", name: "Public API", status: "Active", issues: 9, updated: "2026-10-09" },
  { key: "MOB", name: "Mobile beta", status: "Paused", issues: 4, updated: "2026-09-28" },
  { key: "OPS", name: "Internal tools", status: "Archived", issues: 0, updated: "2026-08-30" },
]

export const members: Member[] = [
  { id: "m-01", name: "Maya Okafor", email: "maya@acmelabs.io", role: "Owner", status: "Active", joined: "2024-03-02" },
  { id: "m-02", name: "Daniel Reyes", email: "daniel@acmelabs.io", role: "Admin", status: "Active", joined: "2024-05-19" },
  { id: "m-03", name: "Priya Natarajan", email: "priya@acmelabs.io", role: "Member", status: "Active", joined: "2024-11-07" },
  { id: "m-04", name: "Tomás Lindqvist", email: "tomas@acmelabs.io", role: "Member", status: "Active", joined: "2025-02-14" },
  { id: "m-05", name: "Hana Sato", email: "hana@acmelabs.io", role: "Member", status: "Invited", joined: null },
  { id: "m-06", name: "Grace Mensah", email: "grace@acmelabs.io", role: "Viewer", status: "Active", joined: "2025-06-30" },
  { id: "m-07", name: "Leo Brandt", email: "leo@acmelabs.io", role: "Member", status: "Suspended", joined: "2025-01-21" },
  { id: "m-08", name: "Ines Duarte", email: "ines@acmelabs.io", role: "Viewer", status: "Invited", joined: null },
]

/** Three most recently updated projects, newest first. */
export const recentProjects: Project[] = [...projects]
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, 3)

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`))
}
```

```tsx components/command-palette.tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Flex,
  HStack,
  Input,
  Kbd,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react"
import {
  LuFolderKanban,
  LuLayoutDashboard,
  LuMoon,
  LuPlus,
  LuSearch,
  LuUserPlus,
  LuUsers,
} from "react-icons/lu"
import type { IconType } from "react-icons"
import {
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { useColorMode } from "@/components/ui/color-mode"
import { toaster } from "@/components/ui/toaster"
import { recentProjects } from "@/lib/data"

type GroupName = "Pages" | "Actions" | "Recent"

interface Command {
  id: string
  group: GroupName
  label: string
  hint?: string
  keywords: string
  icon: IconType
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInviteMember: () => void
}

const GROUPS: GroupName[] = ["Pages", "Actions", "Recent"]

export function CommandPalette({
  open,
  onOpenChange,
  onInviteMember,
}: CommandPaletteProps) {
  const router = useRouter()
  const { toggleColorMode } = useColorMode()
  const [query, setQuery] = React.useState("")
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const commands = React.useMemo<Command[]>(() => {
    const go = (href: string) => () => router.push(href)
    return [
      { id: "page-dashboard", group: "Pages", label: "Dashboard", hint: "/", keywords: "home overview", icon: LuLayoutDashboard, run: go("/") },
      { id: "page-projects", group: "Pages", label: "Projects", hint: "/projects", keywords: "issues boards", icon: LuFolderKanban, run: go("/projects") },
      { id: "page-members", group: "Pages", label: "Members", hint: "/members", keywords: "team people users", icon: LuUsers, run: go("/members") },
      {
        id: "action-create-project",
        group: "Actions",
        label: "Create project",
        keywords: "new add",
        icon: LuPlus,
        run: () => {
          router.push("/projects")
          toaster.create({
            title: "New project",
            description: "Project creation is coming soon to Lumen.",
            type: "info",
          })
        },
      },
      {
        id: "action-invite-member",
        group: "Actions",
        label: "Invite member",
        keywords: "add team email people",
        icon: LuUserPlus,
        run: onInviteMember,
      },
      {
        id: "action-toggle-theme",
        group: "Actions",
        label: "Toggle theme",
        keywords: "dark light mode color appearance",
        icon: LuMoon,
        run: toggleColorMode,
      },
      ...recentProjects.map<Command>((p) => ({
        id: `recent-${p.key}`,
        group: "Recent",
        label: p.name,
        hint: p.key,
        keywords: `${p.key} ${p.status} project`,
        icon: LuFolderKanban,
        run: go("/projects"),
      })),
    ]
  }, [router, toggleColorMode, onInviteMember])

  const filtered = React.useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return commands
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.keywords} ${c.hint ?? ""}`.toLowerCase()
      return terms.every((t) => haystack.includes(t))
    })
  }, [commands, query])

  const grouped = React.useMemo(
    () =>
      GROUPS.map((name) => ({
        name,
        items: filtered.filter((c) => c.group === name),
      })).filter((g) => g.items.length > 0),
    [filtered],
  )

  // Flat order matches the rendered order for arrow navigation.
  const flat = React.useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  const activeIndex = flat.findIndex((c) => c.id === activeId)
  const effectiveActive = activeIndex >= 0 ? flat[activeIndex] : flat[0]

  // Reset state each time the palette closes.
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setActiveId(null)
    }
  }, [open])

  // Keep the highlighted option scrolled into view.
  React.useEffect(() => {
    if (!open || !effectiveActive) return
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-command-id="${effectiveActive.id}"]`,
    )
    el?.scrollIntoView({ block: "nearest" })
  }, [open, effectiveActive])

  const runCommand = (command: Command) => {
    onOpenChange(false)
    // Let the palette dialog finish closing before running (e.g. opening another dialog).
    window.setTimeout(command.run, 50)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (flat.length === 0) {
      if (e.key === "Enter") e.preventDefault()
      return
    }
    const current = effectiveActive ? flat.indexOf(effectiveActive) : 0
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveId(flat[(current + 1) % flat.length].id)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveId(flat[(current - 1 + flat.length) % flat.length].id)
    } else if (e.key === "Home") {
      e.preventDefault()
      setActiveId(flat[0].id)
    } else if (e.key === "End") {
      e.preventDefault()
      setActiveId(flat[flat.length - 1].id)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (effectiveActive) runCommand(effectiveActive)
    }
  }

  const listboxId = "command-palette-listbox"

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="top"
      initialFocusEl={() => inputRef.current}
      size={{ base: "full", md: "md" }}
      motionPreset="slide-in-top"
      scrollBehavior="inside"
    >
      <DialogBackdrop />
      <DialogContent
        mt={{ base: 0, md: "12vh" }}
        borderRadius={{ base: 0, md: "xl" }}
        overflow="hidden"
        aria-label="Command palette"
      >
        <VisuallyHidden>
          <DialogTitle>Command palette</DialogTitle>
          <DialogDescription>
            Search pages, actions and recent projects. Use the arrow keys to
            move and Enter to run.
          </DialogDescription>
        </VisuallyHidden>

        <Flex
          align="center"
          gap="3"
          px="4"
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Box as="span" color="fg.muted" aria-hidden="true" display="flex">
            <LuSearch />
          </Box>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveId(null)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, actions, projects…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              effectiveActive ? `cmd-${effectiveActive.id}` : undefined
            }
            autoComplete="off"
            spellCheck={false}
            variant="subtle"
            border="0"
            bg="transparent"
            px="0"
            h="14"
            _focus={{ boxShadow: "none", outline: "none" }}
            _focusVisible={{ boxShadow: "none", outline: "none" }}
          />
          <Kbd display={{ base: "none", sm: "inline-flex" }}>Esc</Kbd>
        </Flex>

        <Box
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Results"
          maxH={{ base: "none", md: "min(60vh, 420px)" }}
          overflowY="auto"
          p="2"
          flex="1"
        >
          {grouped.map((group) => (
            <Box
              key={group.name}
              role="group"
              aria-labelledby={`cmd-group-${group.name}`}
              mb="1"
            >
              <Text
                id={`cmd-group-${group.name}`}
                px="3"
                pt="2"
                pb="1"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="wide"
                textTransform="uppercase"
                color="fg.muted"
              >
                {group.name}
              </Text>
              {group.items.map((command) => {
                const selected = command.id === effectiveActive?.id
                const Icon = command.icon
                return (
                  <Flex
                    key={command.id}
                    id={`cmd-${command.id}`}
                    data-command-id={command.id}
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
                    _hover={{ bg: "bg.muted" }}
                    onMouseMove={() => {
                      if (!selected) setActiveId(command.id)
                    }}
                    onClick={() => runCommand(command)}
                  >
                    <Box as="span" color="fg.muted" aria-hidden="true" display="flex">
                      <Icon />
                    </Box>
                    <Text flex="1" fontSize="sm" truncate>
                      {command.label}
                    </Text>
                    {command.hint ? (
                      <Text fontSize="xs" color="fg.muted">
                        {command.hint}
                      </Text>
                    ) : null}
                  </Flex>
                )
              })}
            </Box>
          ))}

          {flat.length === 0 ? (
            <Text
              role="status"
              px="3"
              py="8"
              textAlign="center"
              fontSize="sm"
              color="fg.muted"
            >
              No results for “{query}”.
            </Text>
          ) : (
            <VisuallyHidden role="status" aria-live="polite">
              {flat.length} {flat.length === 1 ? "result" : "results"} available
            </VisuallyHidden>
          )}
        </Box>

        <HStack
          px="4"
          py="2"
          gap="4"
          borderTopWidth="1px"
          borderColor="border"
          fontSize="xs"
          color="fg.muted"
          display={{ base: "none", md: "flex" }}
        >
          <HStack gap="1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <Text>to navigate</Text>
          </HStack>
          <HStack gap="1">
            <Kbd>↵</Kbd>
            <Text>to select</Text>
          </HStack>
        </HStack>
      </DialogContent>
    </DialogRoot>
  )
}
```

```tsx components/invite-dialog.tsx
"use client"

import * as React from "react"
import { Button, Input, Stack } from "@chakra-ui/react"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) {
      setEmail("")
      setError(null)
    }
  }, [open])

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_PATTERN.test(value)) {
      setError("Enter a valid email address, like name@company.com.")
      inputRef.current?.focus()
      return
    }
    onOpenChange(false)
    toaster.create({
      title: "Invitation sent",
      description: `${value} will receive an email to join Lumen.`,
      type: "success",
    })
  }

  return (
    <DialogRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement="center"
      initialFocusEl={() => inputRef.current}
    >
      <DialogContent mx="4">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <DialogDescription>
                Send an email invitation to join your Lumen workspace as a
                Member.
              </DialogDescription>
              <Field
                label="Email address"
                required
                invalid={error !== null}
                errorText={error}
              >
                <Input
                  ref={inputRef}
                  type="email"
                  name="email"
                  autoComplete="off"
                  placeholder="teammate@acmelabs.io"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter gap="2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Send invite</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </form>
      </DialogContent>
    </DialogRoot>
  )
}
```

```tsx components/app-shell.tsx
"use client"

import * as React from "react"
import NextLink from "next/link"
import { usePathname } from "next/navigation"
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Kbd,
  Text,
} from "@chakra-ui/react"
import {
  LuFolderKanban,
  LuLayoutDashboard,
  LuSearch,
  LuUsers,
} from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { Avatar } from "@/components/ui/avatar"
import { CommandPalette } from "@/components/command-palette"
import { InviteDialog } from "@/components/invite-dialog"
import { user } from "@/lib/data"

const NAV = [
  { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/projects", label: "Projects", icon: LuFolderKanban },
  { href: "/members", label: "Members", icon: LuUsers },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent))
  }, [])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const openInvite = React.useCallback(() => setInviteOpen(true), [])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const shortcut = isMac ? "⌘K" : "Ctrl K"

  return (
    <Flex direction="column" minH="100vh" bg="bg.subtle">
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Container maxW="6xl" px={{ base: "4", md: "6" }}>
          <Flex h="14" align="center" gap={{ base: "2", md: "6" }}>
            <NextLink href="/" aria-label="Lumen home">
              <HStack gap="2">
                <Box
                  boxSize="7"
                  rounded="md"
                  bg="blue.solid"
                  color="blue.contrast"
                  display="grid"
                  placeItems="center"
                  fontWeight="bold"
                  fontSize="sm"
                  aria-hidden="true"
                >
                  L
                </Box>
                <Text fontWeight="semibold" fontSize="lg" display={{ base: "none", sm: "block" }}>
                  Lumen
                </Text>
              </HStack>
            </NextLink>

            <Box
              as="nav"
              aria-label="Main"
              display={{ base: "none", md: "block" }}
            >
              <HStack gap="1" as="ul" listStyleType="none">
                {NAV.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <NextLink
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                      >
                        <Flex
                          align="center"
                          gap="2"
                          px="3"
                          py="1.5"
                          rounded="md"
                          fontSize="sm"
                          fontWeight="medium"
                          color={active ? "fg" : "fg.muted"}
                          bg={active ? "bg.muted" : "transparent"}
                          _hover={{ bg: "bg.muted", color: "fg" }}
                        >
                          <item.icon aria-hidden="true" />
                          {item.label}
                        </Flex>
                      </NextLink>
                    </li>
                  )
                })}
              </HStack>
            </Box>

            <Flex flex="1" justify="flex-end" align="center" gap="2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
                aria-haspopup="dialog"
                display={{ base: "none", sm: "inline-flex" }}
                color="fg.muted"
                minW={{ sm: "44", md: "56" }}
                justifyContent="space-between"
              >
                <HStack gap="2">
                  <LuSearch aria-hidden="true" />
                  <span>Search…</span>
                </HStack>
                <Kbd suppressHydrationWarning>{shortcut}</Kbd>
              </Button>
              <IconButton
                variant="outline"
                size="sm"
                onClick={() => setPaletteOpen(true)}
                aria-label="Open command palette"
                aria-haspopup="dialog"
                display={{ base: "inline-flex", sm: "none" }}
              >
                <LuSearch />
              </IconButton>
              <ColorModeButton />
              <Avatar name={user.name} size="sm" />
            </Flex>
          </Flex>
        </Container>

        <Box
          as="nav"
          aria-label="Main mobile"
          display={{ base: "block", md: "none" }}
          borderTopWidth="1px"
          borderColor="border"
        >
          <Container maxW="6xl" px={{ base: "2", md: "6" }}>
            <HStack as="ul" listStyleType="none" gap="1" py="1.5" overflowX="auto">
              {NAV.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.href}>
                    <NextLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <Flex
                        align="center"
                        gap="2"
                        px="3"
                        py="1.5"
                        rounded="md"
                        fontSize="sm"
                        fontWeight="medium"
                        color={active ? "fg" : "fg.muted"}
                        bg={active ? "bg.muted" : "transparent"}
                      >
                        <item.icon aria-hidden="true" />
                        {item.label}
                      </Flex>
                    </NextLink>
                  </li>
                )
              })}
            </HStack>
          </Container>
        </Box>
      </Box>

      <Box as="main" flex="1" id="main">
        <Container maxW="6xl" px={{ base: "4", md: "6" }} py={{ base: "6", md: "8" }}>
          {children}
        </Container>
      </Box>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onInviteMember={openInvite}
      />
      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </Flex>
  )
}
```

```tsx components/page-header.tsx
import { Box, Heading, Text } from "@chakra-ui/react"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Box mb={{ base: "5", md: "6" }}>
      <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
        {title}
      </Heading>
      <Text color="fg.muted" mt="1">
        {description}
      </Text>
    </Box>
  )
}
```

```tsx components/status-badge.tsx
import { Badge } from "@chakra-ui/react"

const PALETTE: Record<string, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
  Invited: "blue",
  Suspended: "red",
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge colorPalette={PALETTE[status] ?? "gray"}>{status}</Badge>
}
```

```tsx components/dashboard.tsx
import {
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import {
  formatDate,
  members,
  projects,
  recentProjects,
  user,
} from "@/lib/data"

export function Dashboard() {
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0)
  const activeProjects = projects.filter((p) => p.status === "Active").length
  const activeMembers = members.filter((m) => m.status === "Active").length
  const pendingInvites = members.filter((m) => m.status === "Invited").length

  const stats = [
    { label: "Open issues", value: openIssues, help: `across ${projects.length} projects` },
    { label: "Active projects", value: activeProjects, help: "currently in progress" },
    { label: "Active members", value: activeMembers, help: `of ${members.length} people` },
    { label: "Pending invites", value: pendingInvites, help: "awaiting a reply" },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening across your Lumen workspace. Press Ctrl+K (⌘K on Mac) to jump anywhere."
      />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4" mb="8">
        {stats.map((s) => (
          <Card.Root key={s.label} size="sm">
            <Card.Body>
              <Text fontSize="sm" color="fg.muted">
                {s.label}
              </Text>
              <Text fontSize="3xl" fontWeight="semibold" lineHeight="1.2">
                {s.value}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {s.help}
              </Text>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>

      <Card.Root>
        <Card.Header>
          <Heading as="h2" size="md">
            Recently updated projects
          </Heading>
        </Card.Header>
        <Card.Body pt="0">
          <Stack as="ul" listStyleType="none" gap="0" divideY="1px">
            {recentProjects.map((p) => (
              <Box as="li" key={p.key} py="3">
                <HStack justify="space-between" gap="3" wrap="wrap">
                  <HStack gap="3" minW="0">
                    <Badge variant="outline" fontFamily="mono">
                      {p.key}
                    </Badge>
                    <NextLink href="/projects">
                      <Text fontWeight="medium" truncate>
                        {p.name}
                      </Text>
                    </NextLink>
                  </HStack>
                  <HStack gap="3">
                    <Text fontSize="sm" color="fg.muted">
                      {p.issues} open {p.issues === 1 ? "issue" : "issues"}
                    </Text>
                    <StatusBadge status={p.status} />
                    <Text fontSize="sm" color="fg.muted">
                      {formatDate(p.updated)}
                    </Text>
                  </HStack>
                </HStack>
              </Box>
            ))}
          </Stack>
        </Card.Body>
      </Card.Root>
    </>
  )
}
```

```tsx components/projects-table.tsx
import { Badge, Table } from "@chakra-ui/react"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, projects } from "@/lib/data"

export function ProjectsTable() {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="lg" bg="bg">
      <Table.Root size="md" interactive>
        <Table.Caption srOnly>Projects in the Lumen workspace</Table.Caption>
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
          {projects.map((p) => (
            <Table.Row key={p.key}>
              <Table.Cell>
                <Badge variant="outline" fontFamily="mono">
                  {p.key}
                </Badge>
              </Table.Cell>
              <Table.Cell fontWeight="medium">{p.name}</Table.Cell>
              <Table.Cell>
                <StatusBadge status={p.status} />
              </Table.Cell>
              <Table.Cell textAlign="end">{p.issues}</Table.Cell>
              <Table.Cell whiteSpace="nowrap">{formatDate(p.updated)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
```

```tsx components/members-table.tsx
import { HStack, Table, Text } from "@chakra-ui/react"
import { Avatar } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, members } from "@/lib/data"

export function MembersTable() {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="lg" bg="bg">
      <Table.Root size="md" interactive>
        <Table.Caption srOnly>Members of the Lumen workspace</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Member</Table.ColumnHeader>
            <Table.ColumnHeader>Role</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
            <Table.ColumnHeader>Joined</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {members.map((m) => (
            <Table.Row key={m.id}>
              <Table.Cell>
                <HStack gap="3">
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <Text fontWeight="medium" whiteSpace="nowrap">
                      {m.name}
                    </Text>
                    <Text fontSize="sm" color="fg.muted">
                      {m.email}
                    </Text>
                  </div>
                </HStack>
              </Table.Cell>
              <Table.Cell>{m.role}</Table.Cell>
              <Table.Cell>
                <StatusBadge status={m.status} />
              </Table.Cell>
              <Table.Cell whiteSpace="nowrap">{formatDate(m.joined)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
```

```tsx app/page.tsx
import { AppShell } from "@/components/app-shell"
import { Dashboard } from "@/components/dashboard"

export default function Page() {
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  )
}
```

```tsx app/projects/page.tsx
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { ProjectsTable } from "@/components/projects-table"

export const metadata = { title: "Projects · Lumen" }

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Projects"
        description="Every project your team is tracking, with open issue counts and when it last changed."
      />
      <ProjectsTable />
    </AppShell>
  )
}
```

```tsx app/members/page.tsx
import { AppShell } from "@/components/app-shell"
import { MembersTable } from "@/components/members-table"
import { PageHeader } from "@/components/page-header"

export const metadata = { title: "Members · Lumen" }

export default function MembersPage() {
  return (
    <AppShell>
      <PageHeader
        title="Members"
        description="People in the Acme Labs workspace, their roles and whether they've accepted their invitation."
      />
      <MembersTable />
    </AppShell>
  )
}
```
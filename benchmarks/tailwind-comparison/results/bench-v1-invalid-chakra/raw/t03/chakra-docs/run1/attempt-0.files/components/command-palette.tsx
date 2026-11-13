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

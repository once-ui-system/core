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

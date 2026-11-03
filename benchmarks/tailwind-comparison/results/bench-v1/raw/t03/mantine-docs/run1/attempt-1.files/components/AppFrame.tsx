"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Group,
  Kbd,
  NavLink,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useOs } from "@mantine/hooks";
import { spotlight } from "@mantine/spotlight";
import {
  IconFolders,
  IconLayoutDashboard,
  IconMoon,
  IconSearch,
  IconSparkles,
  IconSun,
  IconUsers,
} from "@tabler/icons-react";
import { CommandPalette } from "./CommandPalette";
import { InviteMemberModal } from "./InviteMemberModal";
import { CreateProjectModal } from "./CreateProjectModal";
import { FrameActionsContext, type FrameActions } from "./frame-actions";
import { user } from "../lib/data";

const navItems = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/projects", label: "Projects", icon: IconFolders },
  { href: "/members", label: "Members", icon: IconUsers },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  const [inviteOpened, invite] = useDisclosure(false);
  const [createOpened, create] = useDisclosure(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const os = useOs({ getValueInEffect: true });
  const modKey = os === "macos" || os === "ios" ? "⌘" : "Ctrl";

  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light", { getInitialValueInEffect: true });

  const toggleTheme = useCallback(() => {
    setColorScheme(computed === "dark" ? "light" : "dark");
  }, [computed, setColorScheme]);

  const { open: openInvite, close: closeInvite } = invite;
  const { open: openCreate, close: closeCreate } = create;

  const actions = useMemo<FrameActions>(
    () => ({ openInvite, openCreateProject: openCreate, toggleTheme }),
    [openInvite, openCreate, toggleTheme]
  );

  return (
    <FrameActionsContext.Provider value={actions}>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !navOpened } }}
        padding={{ base: "sm", sm: "md", lg: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between" wrap="nowrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <Burger
                opened={navOpened}
                onClick={toggleNav}
                hiddenFrom="sm"
                size="sm"
                aria-label="Toggle navigation"
              />
              <Group
                gap={6}
                wrap="nowrap"
                component={Link}
                href="/"
                aria-label="Lumen home"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <IconSparkles size={22} aria-hidden color="var(--mantine-color-indigo-6)" />
                <Text fw={700} size="lg">
                  Lumen
                </Text>
              </Group>
            </Group>

            <Group gap="xs" wrap="nowrap">
              <Button
                variant="default"
                onClick={spotlight.open}
                leftSection={<IconSearch size={16} aria-hidden />}
                rightSection={
                  <Group gap={4} wrap="nowrap" visibleFrom="sm" aria-hidden>
                    <Kbd size="xs">{modKey}</Kbd>
                    <Kbd size="xs">K</Kbd>
                  </Group>
                }
                aria-label={`Open command palette, shortcut ${modKey} K`}
                aria-keyshortcuts="Control+K Meta+K"
                aria-haspopup="dialog"
                aria-expanded={paletteOpen}
              >
                <Text span size="sm" c="dimmed">
                  Search
                </Text>
              </Button>

              <ActionIcon
                variant="default"
                size="lg"
                onClick={toggleTheme}
                aria-label="Toggle color theme"
              >
                <Box component="span" lightHidden style={{ display: "inline-flex" }}>
                  <IconSun size={18} aria-hidden />
                </Box>
                <Box component="span" darkHidden style={{ display: "inline-flex" }}>
                  <IconMoon size={18} aria-hidden />
                </Box>
              </ActionIcon>

              <Avatar color="indigo" radius="xl" size="md" visibleFrom="xs" aria-label={user.name}>
                MO
              </Avatar>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <nav aria-label="Main">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  component={Link}
                  href={item.href}
                  label={item.label}
                  active={active}
                  aria-current={active ? "page" : undefined}
                  leftSection={<item.icon size={18} aria-hidden />}
                  onClick={closeNav}
                  variant="light"
                  style={{ borderRadius: "var(--mantine-radius-sm)" }}
                />
              );
            })}
          </nav>
          <Text size="xs" c="dimmed" mt="auto">
            Signed in as {user.email}
          </Text>
        </AppShell.Navbar>

        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>

      <CommandPalette onOpenChange={setPaletteOpen} />
      <InviteMemberModal opened={inviteOpened} onClose={closeInvite} />
      <CreateProjectModal opened={createOpened} onClose={closeCreate} />
    </FrameActionsContext.Provider>
  );
}

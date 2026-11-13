"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  AppShell,
  Avatar,
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Drawer,
  Group,
  Menu,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { initials, user } from "@/lib/data";
import { trailFor } from "@/lib/nav";
import { NavItems } from "./NavItems";

function Brand() {
  return (
    <Anchor component={Link} href="/" aria-label="Lumen home" underline="never" c="inherit">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={44} radius="md" variant="gradient" gradient={{ from: "brand.5", to: "brand.7", deg: 135 }}>
          <IconSparkles size={24} stroke={1.75} aria-hidden />
        </ThemeIcon>
        <Text ff="heading" fw={800} fz={24} lh={1}>
          Lumen
        </Text>
      </Group>
    </Anchor>
  );
}

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const trail = trailFor(pathname);
  const [collapsed, { toggle: toggleCollapsed }] = useDisclosure(false);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <AppShell
        header={{ height: 76 }}
        navbar={{ width: collapsed ? 104 : 296, breakpoint: "sm", collapsed: { mobile: true } }}
        padding={{ base: "md", sm: "xl" }}
      >
        <AppShell.Header>
          <Group h="100%" px={{ base: "md", sm: "xl" }} justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="nowrap" miw={0}>
              <Burger
                opened={drawerOpened}
                onClick={drawerOpened ? closeDrawer : openDrawer}
                hiddenFrom="sm"
                size="md"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpened}
              />
              <Box visibleFrom="sm">
                <Brand />
              </Box>
              {trail && (
                <Box component="nav" aria-label="Breadcrumb" miw={0} ml={{ sm: "xl" }}>
                  <Breadcrumbs
                    separator={<IconChevronRight size={14} aria-hidden />}
                    separatorMargin="xs"
                  >
                    <Text size="sm" c="dimmed">
                      {trail.group}
                    </Text>
                    <Text size="sm" fw={700} aria-current="page">
                      {trail.page}
                    </Text>
                  </Breadcrumbs>
                </Box>
              )}
            </Group>

            <Menu position="bottom-end" width={260} withArrow>
              <Menu.Target>
                <UnstyledButton aria-label={`Account menu for ${user.name}`} p={4}>
                  <Avatar color="brand" radius="xl" size={44}>
                    {initials(user.name)}
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>
                  {user.name} ({user.role})
                </Menu.Label>
                <Menu.Label>{user.email}</Menu.Label>
                <Menu.Item
                  component={Link}
                  href="/settings"
                  leftSection={<IconSettings size={18} aria-hidden />}
                  py="sm"
                >
                  Settings
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <AppShell.Section grow>
            <NavItems collapsed={collapsed} />
          </AppShell.Section>
          <AppShell.Section>
            {collapsed ? (
              <Group justify="center">
                <Tooltip label="Expand sidebar" position="right" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="sand.8"
                    size={48}
                    onClick={toggleCollapsed}
                    aria-label="Expand sidebar"
                    aria-expanded={false}
                  >
                    <IconLayoutSidebarLeftExpand size={22} stroke={1.75} aria-hidden />
                  </ActionIcon>
                </Tooltip>
              </Group>
            ) : (
              <Button
                variant="subtle"
                color="sand.8"
                size="md"
                fullWidth
                justify="flex-start"
                leftSection={<IconLayoutSidebarLeftCollapse size={20} stroke={1.75} aria-hidden />}
                onClick={toggleCollapsed}
                aria-expanded
              >
                Collapse sidebar
              </Button>
            )}
          </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main id="main-content">
          <Box maw={1200} mx="auto">
            {children}
          </Box>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="xs"
        padding="md"
        title={<Brand />}
        closeButtonProps={{ "aria-label": "Close navigation menu", size: "xl" }}
      >
        <NavItems onNavigate={closeDrawer} />
      </Drawer>
    </>
  );
}

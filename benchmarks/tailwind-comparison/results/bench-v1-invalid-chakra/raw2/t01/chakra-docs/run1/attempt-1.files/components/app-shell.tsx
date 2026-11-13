"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  LuChartBar,
  LuChevronsLeft,
  LuChevronsRight,
  LuFileText,
  LuFolderKanban,
  LuMenu,
  LuSettings,
  LuSparkles,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { Avatar } from "@/components/ui/avatar";
import {
  BreadcrumbCurrentLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tooltip } from "@/components/ui/tooltip";
import {
  breadcrumbs,
  navGroups,
  product,
  user,
  type NavIconName,
} from "@/lib/data";

const icons: Record<NavIconName, IconType> = {
  overview: LuChartBar,
  reports: LuFileText,
  projects: LuFolderKanban,
  settings: LuSettings,
};

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack gap="2" px="2" h="14" flexShrink={0}>
      <Flex
        boxSize="8"
        rounded="md"
        bg="blue.solid"
        color="blue.contrast"
        align="center"
        justify="center"
        flexShrink={0}
        aria-hidden
      >
        <LuSparkles />
      </Flex>
      {!collapsed && (
        <Text fontWeight="semibold" fontSize="lg">
          {product.name}
        </Text>
      )}
    </HStack>
  );
}

function NavList({
  collapsed,
  idPrefix,
  onNavigate,
}: {
  collapsed: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Stack as="nav" aria-label={`Main ${idPrefix}`} gap="5" flex="1" overflowY="auto">
      {navGroups.map((group) => {
        const headingId = `${idPrefix}-nav-group-${group.label.toLowerCase()}`;
        return (
          <Box key={group.label} role="group" aria-labelledby={headingId}>
            {collapsed ? (
              <Span id={headingId} srOnly>
                {group.label}
              </Span>
            ) : (
              <Text
                id={headingId}
                px="3"
                mb="1"
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                color="fg.muted"
              >
                {group.label}
              </Text>
            )}
            <Stack as="ul" listStyleType="none" gap="1" m="0" p="0">
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = item.href === pathname;

                const content = (
                  <>
                    <Icon aria-hidden size={18} style={{ flexShrink: 0 }} />
                    {collapsed ? (
                      <Span srOnly>{item.label}</Span>
                    ) : (
                      <Span flex="1">{item.label}</Span>
                    )}
                    {!item.href && !collapsed && (
                      <Badge size="xs" variant="subtle">
                        Soon
                      </Badge>
                    )}
                  </>
                );

                const element = item.href ? (
                  <Link
                    asChild
                    display="flex"
                    alignItems="center"
                    gap="3"
                    px="3"
                    py="2"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    justifyContent={collapsed ? "center" : "flex-start"}
                    textDecoration="none"
                    bg={active ? "bg.emphasized" : undefined}
                    color={active ? "fg" : "fg.muted"}
                    _hover={{ bg: "bg.muted", color: "fg" }}
                  >
                    <NextLink
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                    >
                      {content}
                    </NextLink>
                  </Link>
                ) : (
                  <Flex
                    as="span"
                    aria-disabled="true"
                    alignItems="center"
                    gap="3"
                    px="3"
                    py="2"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    justifyContent={collapsed ? "center" : "flex-start"}
                    color="fg.subtle"
                    cursor="not-allowed"
                  >
                    {content}
                  </Flex>
                );

                return (
                  <li key={item.label}>
                    <Tooltip
                      content={item.label}
                      positioning={{ placement: "right" }}
                      disabled={!collapsed}
                    >
                      {element}
                    </Tooltip>
                  </li>
                );
              })}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}

function UserCard({ collapsed }: { collapsed: boolean }) {
  return (
    <HStack
      gap="3"
      px="2"
      py="3"
      borderTopWidth="1px"
      justify={collapsed ? "center" : "flex-start"}
    >
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const crumbs = breadcrumbs[pathname] ?? [{ label: "Lumen" }];

  return (
    <Flex minH="100dvh" bg="bg">
      <Link
        href="#main"
        position="absolute"
        left="2"
        top="2"
        zIndex="popover"
        px="3"
        py="2"
        rounded="md"
        bg="bg"
        borderWidth="1px"
        transform="translateY(-200%)"
        _focus={{ transform: "none" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? "16" : "64"}
        px="2"
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s ease"
      >
        <Brand collapsed={collapsed} />
        <NavList collapsed={collapsed} idPrefix="desktop" />
        <Box pb="2">
          <Tooltip
            content="Expand sidebar"
            positioning={{ placement: "right" }}
            disabled={!collapsed}
          >
            <IconButton
              variant="ghost"
              size="sm"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
              w={collapsed ? "full" : "auto"}
            >
              {collapsed ? <LuChevronsRight /> : <LuChevronsLeft />}
            </IconButton>
          </Tooltip>
        </Box>
        <UserCard collapsed={collapsed} />
      </Flex>

      {/* Mobile drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={drawerOpen}
        onOpenChange={(e) => setDrawerOpen(e.open)}
      >
        <DrawerContent>
          <DrawerCloseTrigger />
          <DrawerHeader>
            <DrawerTitle>
              <Span srOnly>{product.name} navigation</Span>
              <Brand collapsed={false} />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody display="flex" flexDirection="column" px="3">
            <NavList
              collapsed={false}
              idPrefix="mobile"
              onNavigate={() => setDrawerOpen(false)}
            />
            <UserCard collapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          h="14"
          px={{ base: "3", md: "6" }}
          align="center"
          gap="3"
          borderBottomWidth="1px"
          position="sticky"
          top="0"
          bg="bg"
          zIndex="sticky"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <Box flex="1" minW="0">
            <BreadcrumbRoot size="sm">
              {crumbs.map((c, i) =>
                i === crumbs.length - 1 ? (
                  <BreadcrumbCurrentLink key={c.label}>
                    {c.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <Span key={c.label} color="fg.muted">
                    {c.label}
                  </Span>
                ),
              )}
            </BreadcrumbRoot>
          </Box>

          <ColorModeButton />
        </Flex>

        <Box
          as="main"
          id="main"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
          maxW="6xl"
          w="full"
          mx="auto"
          outline="none"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}

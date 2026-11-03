"use client";

import { Fragment, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Box,
  Breadcrumb,
  Flex,
  HStack,
  IconButton,
  SkipNavContent,
  SkipNavLink,
  Span,
  Text,
} from "@chakra-ui/react";
import { LuMenu, LuPanelLeftClose, LuPanelLeftOpen, LuSparkles } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { NavList } from "@/components/nav-list";
import { useMounted } from "@/components/use-mounted";
import { breadcrumbs, product, user } from "@/lib/data";

const EXPANDED_WIDTH = "260px";
const COLLAPSED_WIDTH = "72px";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NextLink href="/" aria-label={`${product.name} home`}>
      <HStack gap="2" minH="8">
        <Flex
          boxSize="8"
          flexShrink={0}
          align="center"
          justify="center"
          rounded="lg"
          bg="blue.solid"
          color="blue.contrast"
        >
          <LuSparkles aria-hidden="true" />
        </Flex>
        {!compact && (
          <Span fontWeight="semibold" fontSize="lg" letterSpacing="tight">
            {product.name}
          </Span>
        )}
      </HStack>
    </NextLink>
  );
}

function UserCard({ compact = false }: { compact?: boolean }) {
  return (
    <HStack gap="3" justify={compact ? "center" : "flex-start"}>
      <Avatar.Root size="sm">
        <Avatar.Fallback name={user.name} />
      </Avatar.Root>
      {compact ? (
        <Span srOnly>
          {user.name}, {user.role}
        </Span>
      ) : (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.role} · {user.email}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mounted = useMounted();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const crumbs = breadcrumbs[pathname] ?? [{ label: "Lumen" }];
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <Flex minH="100dvh" bg="bg.subtle">
      <SkipNavLink>Skip to content</SkipNavLink>

      {/* Desktop sidebar */}
      <Flex
        as="aside"
        aria-label="Sidebar"
        hideBelow="md"
        direction="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink={0}
        w={collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}
        transition="width 0.2s ease"
        bg="bg"
        borderEndWidth="1px"
        borderColor="border"
      >
        <Flex
          px={collapsed ? "0" : "5"}
          h="14"
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          borderBottomWidth="1px"
          borderColor="border"
        >
          <Brand compact={collapsed} />
        </Flex>

        <Box flex="1" overflowY="auto" overflowX="hidden" px="3" py="4">
          <NavList collapsed={collapsed} idPrefix="sidebar" />
        </Box>

        <Box borderTopWidth="1px" borderColor="border" p="3">
          <UserCard compact={collapsed} />
        </Box>
      </Flex>

      {/* Mobile drawer: mounted only on the client so SSR and hydration markup match */}
      {mounted && (
        <DrawerRoot
          open={drawerOpen}
          onOpenChange={(e) => setDrawerOpen(e.open)}
          placement="start"
          size="xs"
        >
          <DrawerContent>
            <DrawerCloseTrigger />
            <DrawerHeader>
              <DrawerTitle>{product.name}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <NavList idPrefix="drawer" onNavigate={() => setDrawerOpen(false)} />
            </DrawerBody>
            <Box borderTopWidth="1px" borderColor="border" p="4">
              <UserCard />
            </Box>
          </DrawerContent>
        </DrawerRoot>
      )}

      {/* Main column */}
      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          px={{ base: "4", md: "6" }}
          align="center"
          gap="3"
          bg="bg"
          borderBottomWidth="1px"
          borderColor="border"
        >
          <IconButton
            hideFrom="md"
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <Tooltip
            content={toggleLabel}
            positioning={{ placement: "bottom" }}
            disabled={!mounted}
          >
            <IconButton
              hideBelow="md"
              variant="ghost"
              size="sm"
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
            </IconButton>
          </Tooltip>

          <Breadcrumb.Root size="sm" flex="1" minW="0">
            <Breadcrumb.List flexWrap="nowrap">
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <Fragment key={crumb.label}>
                    <Breadcrumb.Item>
                      {last ? (
                        <Breadcrumb.CurrentLink>{crumb.label}</Breadcrumb.CurrentLink>
                      ) : crumb.href ? (
                        <Breadcrumb.Link asChild>
                          <NextLink href={crumb.href}>{crumb.label}</NextLink>
                        </Breadcrumb.Link>
                      ) : (
                        <Span color="fg.muted">{crumb.label}</Span>
                      )}
                    </Breadcrumb.Item>
                    {!last && <Breadcrumb.Separator />}
                  </Fragment>
                );
              })}
            </Breadcrumb.List>
          </Breadcrumb.Root>

          <ColorModeButton />
        </Flex>

        <Box as="main" flex="1" px={{ base: "4", md: "8" }} py={{ base: "6", md: "8" }}>
          <SkipNavContent />
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

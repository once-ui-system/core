"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  ClientOnly,
  Flex,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSparkles,
} from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import {
  BreadcrumbCurrentLink,
  BreadcrumbRoot,
} from "@/components/ui/breadcrumb";
import {
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTitle,
} from "@/components/ui/drawer";
import { NavList } from "@/components/nav-list";
import { getBreadcrumb, product, user } from "@/lib/data";

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <NextLink
      href="/"
      aria-label={collapsed ? `${product.name} home` : undefined}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <HStack gap="2" justify={collapsed ? "center" : "flex-start"}>
        <Flex
          boxSize="8"
          rounded="md"
          bg="blue.solid"
          color="blue.contrast"
          align="center"
          justify="center"
          flexShrink="0"
        >
          <LuSparkles aria-hidden="true" />
        </Flex>
        {!collapsed && (
          <Text fontWeight="bold" textStyle="lg">
            {product.name}
          </Text>
        )}
      </HStack>
    </NextLink>
  );
}

function UserBlock({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <HStack gap="3" justify={collapsed ? "center" : "flex-start"} minW="0">
      <Avatar name={user.name} size="sm" />
      {!collapsed && (
        <Box minW="0">
          <Text textStyle="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text textStyle="xs" color="fg.muted" truncate>
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
  // The drawer is open only while the route it was opened on is current,
  // so navigating closes it without needing an effect.
  const [drawerOpenAt, setDrawerOpenAt] = useState<string | null>(null);
  const drawerOpen = drawerOpenAt === pathname;

  const crumbs = getBreadcrumb(pathname);

  return (
    <Flex minH="100dvh" bg="bg">
      <Box
        as="aside"
        aria-label="Sidebar"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        borderEndWidth="1px"
        bg="bg.subtle"
        transition="width 0.2s"
      >
        <Box px="3" py="4" h="14" display="flex" alignItems="center">
          <Box flex="1" minW="0">
            <Brand collapsed={collapsed} />
          </Box>
        </Box>
        <Box flex="1" overflowY="auto" px="2" py="3">
          <NavList collapsed={collapsed} idPrefix="sidebar" />
        </Box>
        <Box borderTopWidth="1px" p="3">
          <UserBlock collapsed={collapsed} />
        </Box>
      </Box>

      <Flex direction="column" flex="1" minW="0">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="sticky"
          h="14"
          borderBottomWidth="1px"
          bg="bg"
          px={{ base: "3", md: "6" }}
          display="flex"
          alignItems="center"
          gap="3"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
            onClick={() => setDrawerOpenAt(pathname)}
          >
            <LuMenu />
          </IconButton>
          <IconButton
            display={{ base: "none", md: "inline-flex" }}
            variant="ghost"
            size="sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
          </IconButton>

          <BreadcrumbRoot size="sm" flex="1" minW="0">
            {crumbs.map((crumb, i) =>
              i === crumbs.length - 1 ? (
                <BreadcrumbCurrentLink key={crumb.label}>
                  {crumb.label}
                </BreadcrumbCurrentLink>
              ) : (
                <Text as="span" key={crumb.label} color="fg.muted">
                  {crumb.label}
                </Text>
              ),
            )}
          </BreadcrumbRoot>

          <ColorModeButton />
          <Box display={{ base: "none", sm: "block" }}>
            <Avatar name={user.name} size="xs" aria-label={`Signed in as ${user.name}`} />
          </Box>
        </Box>

        <Box
          as="main"
          id="main"
          flex="1"
          px={{ base: "4", md: "8" }}
          py={{ base: "5", md: "8" }}
        >
          <Box maxW="6xl" mx="auto">
            {children}
          </Box>
        </Box>
      </Flex>

      <ClientOnly>
        <DrawerRoot
          open={drawerOpen}
          onOpenChange={(e) => setDrawerOpenAt(e.open ? pathname : null)}
          placement="start"
          size="xs"
          lazyMount
          unmountOnExit
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                <Brand />
              </DrawerTitle>
            </DrawerHeader>
            <DrawerBody>
              <NavList idPrefix="drawer" onNavigate={() => setDrawerOpenAt(null)} />
            </DrawerBody>
            <Box borderTopWidth="1px" p="4">
              <UserBlock />
            </Box>
            <DrawerCloseTrigger />
          </DrawerContent>
        </DrawerRoot>
      </ClientOnly>
    </Flex>
  );
}

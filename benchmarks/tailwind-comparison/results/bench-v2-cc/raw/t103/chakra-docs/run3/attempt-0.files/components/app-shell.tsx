"use client";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Link,
  Span,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";
import { NavList } from "@/components/nav";
import { Avatar } from "@/components/ui/avatar";
import {
  BreadcrumbCurrentLink,
  BreadcrumbLink,
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
import { user } from "@/lib/data";
import { crumbsFor } from "@/lib/nav";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      asChild
      variant="plain"
      textDecoration="none"
      _hover={{ textDecoration: "none" }}
    >
      <NextLink href="/" aria-label="Lumen home">
        <HStack gap="2">
          <Box boxSize="3" bg="brand.solid" borderRadius="l1" aria-hidden />
          {!compact && (
            <Text
              fontFamily="heading"
              fontWeight="bold"
              fontSize="md"
              letterSpacing="tight"
              color="fg"
            >
              Lumen
            </Text>
          )}
        </HStack>
      </NextLink>
    </Link>
  );
}

function UserChip({ compact = false }: { compact?: boolean }) {
  return (
    <HStack gap="3" minW="0" justifyContent={compact ? "center" : "flex-start"}>
      <Avatar size="sm" name={user.name} />
      {!compact && (
        <Box minW="0">
          <Text fontSize="sm" fontWeight="medium" truncate>
            {user.name}
          </Text>
          <Text fontSize="xs" color="fg.muted" truncate>
            {user.email}
          </Text>
        </Box>
      )}
    </HStack>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const crumb = crumbsFor(pathname);

  return (
    <Flex minH="100dvh" colorPalette="brand" bg="bg" color="fg">
      <Link
        href="#main-content"
        position="absolute"
        left="-9999px"
        top="2"
        px="3"
        py="2"
        bg="bg.panel"
        borderRadius="l2"
        borderWidth="1px"
        zIndex="skipLink"
        _focus={{ left: "2" }}
      >
        Skip to content
      </Link>

      {/* Desktop sidebar */}
      <Box
        as="aside"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        position="sticky"
        top="0"
        h="100dvh"
        flexShrink="0"
        w={collapsed ? "16" : "64"}
        transition="width 0.2s ease"
        borderEndWidth="1px"
        bg="bg.subtle"
      >
        <Flex
          h="14"
          align="center"
          px="4"
          justify={collapsed ? "center" : "flex-start"}
          borderBottomWidth="1px"
          flexShrink="0"
        >
          <Logo compact={collapsed} />
        </Flex>
        <Box flex="1" overflowY="auto" p="3">
          <NavList collapsed={collapsed} />
        </Box>
        <Box borderTopWidth="1px" p="3" flexShrink="0">
          <Flex justify={collapsed ? "center" : "flex-end"} mb="3">
            <Tooltip
              content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              positioning={{ placement: "right" }}
            >
              <IconButton
                variant="ghost"
                size="sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
              </IconButton>
            </Tooltip>
          </Flex>
          <UserChip compact={collapsed} />
        </Box>
      </Box>

      {/* Mobile drawer */}
      <DrawerRoot
        placement="start"
        size="xs"
        open={mobileOpen}
        onOpenChange={(e) => setMobileOpen(e.open)}
      >
        <DrawerContent colorPalette="brand">
          <DrawerHeader borderBottomWidth="1px">
            <DrawerTitle>
              <Logo />
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody p="3">
            <NavList onNavigate={() => setMobileOpen(false)} />
          </DrawerBody>
          <DrawerCloseTrigger />
        </DrawerContent>
      </DrawerRoot>

      <Flex direction="column" flex="1" minW="0">
        <Flex
          as="header"
          h="14"
          align="center"
          gap="3"
          px={{ base: "4", md: "6" }}
          borderBottomWidth="1px"
          bg="bg"
          position="sticky"
          top="0"
          zIndex="sticky"
        >
          <IconButton
            display={{ base: "inline-flex", md: "none" }}
            variant="ghost"
            size="sm"
            aria-label="Open navigation menu"
            onClick={() => setMobileOpen(true)}
          >
            <LuMenu />
          </IconButton>

          <BreadcrumbRoot size="sm">
            <BreadcrumbLink asChild>
              <NextLink href="/">Lumen</NextLink>
            </BreadcrumbLink>
            {crumb && <Span color="fg.muted">{crumb.group}</Span>}
            {crumb && <BreadcrumbCurrentLink>{crumb.label}</BreadcrumbCurrentLink>}
          </BreadcrumbRoot>

          <HStack ml="auto" gap="3">
            <ColorModeButton />
            <HStack gap="2" display={{ base: "none", sm: "flex" }}>
              <Avatar size="xs" name={user.name} />
              <Text fontSize="sm">{user.name}</Text>
            </HStack>
          </HStack>
        </Flex>

        <Box
          as="main"
          id="main-content"
          tabIndex={-1}
          flex="1"
          px={{ base: "4", md: "6", lg: "8" }}
          py={{ base: "6", md: "8" }}
          outline="none"
        >
          <Box maxW="6xl" mx="auto" w="full">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}

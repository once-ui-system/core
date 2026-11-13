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

"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Box, chakra, Flex, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { LuArmchair, LuCalendarDays, LuMapPin } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { event, planner } from "@/lib/data";
import { formatDate } from "@/lib/plan";

const nav = [
  { href: "/", label: "Plan" },
  { href: "/guests", label: "Guests" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <chakra.a
        href="#main"
        position="absolute"
        left="-9999px"
        _focus={{ left: "3", top: "3", zIndex: "max", bg: "bg.panel", px: "3", py: "2", rounded: "md", shadow: "md" }}
      >
        Skip to content
      </chakra.a>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <Flex align="center" gap={{ base: "3", md: "6" }} px={{ base: "4", md: "6" }} h="14" maxW="1600px" mx="auto">
          <HStack gap="2" flexShrink={0}>
            <Flex boxSize="8" rounded="lg" bg="fg" color="bg" align="center" justify="center" aria-hidden>
              <LuArmchair size={18} />
            </Flex>
            <Text fontWeight="bold" letterSpacing="tight" fontSize="lg">
              Seatwise
            </Text>
          </HStack>

          <Box as="nav" aria-label="Main">
            <HStack gap="1">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <ChakraLink
                    key={item.href}
                    asChild
                    px="3"
                    py="1.5"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    color={active ? "fg" : "fg.muted"}
                    bg={active ? "bg.muted" : "transparent"}
                    textDecoration="none"
                    _hover={{ bg: "bg.muted", color: "fg" }}
                    _focusVisible={{ outline: "2px solid", outlineColor: "teal.solid" }}
                  >
                    <NextLink href={item.href} aria-current={active ? "page" : undefined}>
                      {item.label}
                    </NextLink>
                  </ChakraLink>
                );
              })}
            </HStack>
          </Box>

          <Box flex="1" minW="0" display={{ base: "none", md: "block" }} textAlign="end">
            <Text fontSize="sm" fontWeight="semibold" truncate>
              {event.name}
            </Text>
            <HStack gap="3" justify="flex-end" color="fg.muted" fontSize="xs">
              <HStack gap="1">
                <LuCalendarDays aria-hidden />
                <Text as="span">{formatDate(event.date)}</Text>
              </HStack>
              <HStack gap="1" display={{ base: "none", xl: "flex" }}>
                <LuMapPin aria-hidden />
                <Text as="span">{event.venue}</Text>
              </HStack>
            </HStack>
          </Box>
          <Box flex="1" display={{ base: "block", md: "none" }} />

          <HStack gap="2" flexShrink={0}>
            <ColorModeButton />
            <Avatar size="sm" name={planner.name} />
          </HStack>
        </Flex>
      </Box>
      <Box as="main" flex="1" id="main">
        {children}
      </Box>
    </Flex>
  );
}

"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { user } from "@/lib/data";

function PawMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="5.5" cy="11" r="2" />
      <circle cx="9.5" cy="6.5" r="2" />
      <circle cx="14.5" cy="6.5" r="2" />
      <circle cx="18.5" cy="11" r="2" />
      <path d="M12 12c-3 0-5.5 3-5.5 5.5 0 1.5 1 2.5 2.5 2.5 1 0 1.8-.6 3-.6s2 .6 3 .6c1.5 0 2.5-1 2.5-2.5C17.5 15 15 12 12 12z" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        as="a"
        {...{ href: "#main" }}
        position="absolute"
        left="-9999px"
        top="2"
        zIndex="toast"
        bg="bg.panel"
        px="4"
        py="2"
        rounded="md"
        _focus={{ left: "3" }}
      >
        Skip to content
      </Box>
      <Box as="header" position="sticky" top="0" zIndex="sticky" bg="bg" borderBottomWidth="1px">
        <Flex maxW="1400px" mx="auto" px={{ base: "3", md: "6" }} py="3" gap="3" align="center" wrap="wrap">
          <NextLink href="/" aria-label="Pawpoint home">
            <HStack gap="2.5">
              <Flex boxSize="10" rounded="lg" bg="teal.solid" color="teal.contrast" align="center" justify="center">
                <PawMark />
              </Flex>
              <Box lineHeight="short">
                <Text fontWeight="bold" fontSize="lg">
                  Pawpoint
                </Text>
                <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                  Hillside Veterinary Clinic
                </Text>
              </Box>
            </HStack>
          </NextLink>
          <Box flex={{ base: "1 1 100%", md: "1 1 320px" }} order={{ base: 3, md: 0 }} maxW={{ md: "560px" }} mx={{ md: "auto" }}>
            <PatientSearch />
          </Box>
          <HStack ml="auto" gap="3">
            <ColorModeButton />
            <HStack gap="2.5">
              <Avatar name={user.name} size="sm" colorPalette="teal" />
              <Box display={{ base: "none", md: "block" }} lineHeight="short">
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" id="main" maxW="1400px" mx="auto" px={{ base: "3", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Box>
  );
}

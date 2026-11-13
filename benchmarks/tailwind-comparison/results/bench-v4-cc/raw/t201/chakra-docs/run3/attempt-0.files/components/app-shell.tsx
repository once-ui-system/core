"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { LuPawPrint } from "react-icons/lu";
import { Avatar } from "@/components/ui/avatar";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC, user } from "@/lib/data";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg.subtle">
      <Link
        href="#main"
        css={{
          position: "absolute",
          left: "-9999px",
          "&:focus": {
            left: "4",
            top: "2",
            zIndex: "toast",
            background: "var(--chakra-colors-bg-panel)",
            padding: "8px 12px",
            borderRadius: "8px",
          },
        }}
      >
        Skip to main content
      </Link>

      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="sticky"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border.muted"
      >
        <Flex
          maxW="96rem"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          align="center"
          gap={{ base: "3", md: "6" }}
          flexWrap="wrap"
        >
          <Link asChild variant="plain" _hover={{ textDecoration: "none" }} aria-label="Pawpoint, today's schedule">
            <NextLink href="/">
              <Flex align="center" gap="3">
                <Box
                  boxSize="10"
                  rounded="lg"
                  bg="teal.solid"
                  color="teal.contrast"
                  display="grid"
                  placeItems="center"
                >
                  <LuPawPrint size={22} aria-hidden="true" />
                </Box>
                <Box lineHeight="1.2">
                  <Text fontWeight="bold" fontSize="lg" color="fg">
                    {CLINIC.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" hideBelow="sm">
                    {CLINIC.site}
                  </Text>
                </Box>
              </Flex>
            </NextLink>
          </Link>

          <Flex
            flex="1"
            order={{ base: 3, md: 0 }}
            flexBasis={{ base: "100%", md: "0" }}
            minW="0"
            justify={{ md: "center" }}
          >
            <PatientSearch />
          </Flex>

          <Flex align="center" gap="3" ms="auto">
            <ColorModeButton />
            <Flex align="center" gap="3">
              <Avatar name={user.name} size="sm" colorPalette="teal" />
              <Box lineHeight="1.25" hideBelow="md">
                <Text fontSize="sm" fontWeight="medium">
                  {user.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {user.role}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box
        as="main"
        id="main"
        tabIndex={-1}
        w="full"
        maxW="96rem"
        mx="auto"
        px={{ base: "4", md: "6" }}
        py={{ base: "5", md: "7" }}
        flex="1"
        outline="none"
      >
        {children}
      </Box>
    </Flex>
  );
}

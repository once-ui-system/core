"use client"

import type { ReactNode } from "react"
import NextLink from "next/link"
import { Box, Flex, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import { LuPawPrint } from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { PatientSearch } from "@/components/patient-search"
import { CLINIC, USER } from "@/lib/data"

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.muted">
      <Box
        asChild
        position="absolute"
        left="-9999px"
        _focus={{ left: "4", top: "4", zIndex: "toast", bg: "bg.panel", p: "3", rounded: "md", shadow: "lg" }}
      >
        <a href="#main">Skip to content</a>
      </Box>
      <Box asChild position="sticky" top="0" zIndex="sticky" bg="bg.panel" borderBottomWidth="1px">
        <header>
          <Flex maxW="1440px" mx="auto" px={{ base: "4", md: "6" }} py="3" gap="3" align="center" wrap="wrap">
            <Box asChild order="1" rounded="md">
              <NextLink href="/" aria-label={`${CLINIC.product}, today's schedule`}>
                <HStack gap="3">
                  <Flex boxSize="10" rounded="lg" bg="teal.solid" color="teal.contrast" align="center" justify="center">
                    <Icon boxSize="5">
                      <LuPawPrint aria-hidden="true" />
                    </Icon>
                  </Flex>
                  <Stack gap="0">
                    <Text fontWeight="bold" fontSize="lg" lineHeight="1.1">
                      {CLINIC.product}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                      {CLINIC.name}
                    </Text>
                  </Stack>
                </HStack>
              </NextLink>
            </Box>
            <Box order={{ base: "3", md: "2" }} flex={{ base: "1 1 100%", md: "1 1 0" }} maxW={{ md: "560px" }} mx={{ md: "auto" }}>
              <PatientSearch />
            </Box>
            <HStack order={{ base: "2", md: "3" }} ml="auto" gap="3">
              <Stack gap="0" textAlign="end" display={{ base: "none", sm: "flex" }}>
                <Text fontSize="sm" fontWeight="semibold">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Stack>
              <Avatar name={USER.name} size="sm" colorPalette="teal" />
              <ColorModeButton />
            </HStack>
          </Flex>
        </header>
      </Box>
      <Box asChild maxW="1440px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "5", md: "8" }} display="block">
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </Box>
    </Box>
  )
}

"use client"

import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import NextLink from "next/link"
import { LuPawPrint } from "react-icons/lu"
import { Avatar } from "@/components/ui/avatar"
import { ColorModeButton } from "@/components/ui/color-mode"
import { CLINIC, CLINIC_FULL, USER } from "@/lib/data"
import { PatientSearch } from "./PatientSearch"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Flex direction="column" minH="100dvh" bg="bg.muted" colorPalette="teal">
      <Box
        asChild
        position="absolute"
        left="-9999px"
        _focus={{ left: "4", top: "4", zIndex: "toast", bg: "bg.panel", px: "4", py: "2", borderRadius: "md", shadow: "lg" }}
      >
        <a href="#main">Skip to main content</a>
      </Box>

      <Box as="header" bg="bg.panel" borderBottomWidth="1px" position="sticky" top="0" zIndex="sticky">
        <Flex
          maxW="1440px"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          gap={{ base: "3", md: "6" }}
          align="center"
          wrap="wrap"
        >
          <Box asChild>
            <NextLink href="/">
              <Flex align="center" gap="3">
                <Flex boxSize="10" borderRadius="xl" bg="teal.700" color="white" align="center" justify="center">
                  <LuPawPrint size={22} aria-hidden="true" />
                </Flex>
                <Box lineHeight="1.1">
                  <Heading as="p" size="lg" fontWeight="bold" letterSpacing="-0.02em">
                    {CLINIC}
                  </Heading>
                  <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                    {CLINIC_FULL}
                  </Text>
                </Box>
              </Flex>
            </NextLink>
          </Box>

          <Box
            flex="1"
            minW={{ base: "100%", md: "0" }}
            maxW={{ md: "lg" }}
            order={{ base: 3, md: 0 }}
            ml={{ md: "auto" }}
          >
            <PatientSearch />
          </Box>

          <Flex align="center" gap="3" ml="auto">
            <ColorModeButton />
            <Flex align="center" gap="2.5">
              <Avatar name={USER.name} size="sm" colorPalette="teal" />
              <Box lineHeight="1.2" display={{ base: "none", sm: "block" }}>
                <Text fontSize="sm" fontWeight="medium">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>

      <Box as="main" id="main" flex="1" maxW="1440px" w="full" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Flex>
  )
}

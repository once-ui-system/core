"use client"

import * as React from "react"
import NextLink from "next/link"
import { Avatar, Box, Button, Container, Flex, HStack, Icon, Link, Text } from "@chakra-ui/react"
import { LuCalendarPlus, LuClock, LuPawPrint } from "react-icons/lu"
import { ColorModeButton } from "@/components/ui/color-mode"
import { PatientSearch } from "@/components/PatientSearch"
import { BookingDialog } from "@/components/BookingDialog"
import { ClinicProvider, useClinic } from "@/lib/clinic"
import { CLINIC, USER, fmtMin } from "@/lib/data"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ClinicProvider>
      <Link
        href="#main"
        position="absolute"
        left="-9999px"
        top="2"
        zIndex="skipNav"
        bg="bg.panel"
        px="4"
        py="2"
        borderRadius="md"
        _focus={{ left: "2" }}
      >
        Skip to content
      </Link>
      <Header />
      <Box as="main" id="main" tabIndex={-1} outline="none" pb="12">
        <Container maxW="7xl" px={{ base: "4", md: "6" }} pt={{ base: "4", md: "6" }}>
          {children}
        </Container>
      </Box>
      <BookingDialog />
    </ClinicProvider>
  )
}

function Header() {
  const { nowMin, openBooking } = useClinic()
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg.panel"
      borderBottomWidth="1px"
      boxShadow="xs"
    >
      <Container maxW="7xl" px={{ base: "4", md: "6" }} py="3">
        <Flex align="center" gap={{ base: "3", md: "5" }} wrap="wrap">
          <Link asChild variant="plain" _hover={{ textDecoration: "none" }}>
            <NextLink href="/">
              <HStack gap="2.5">
                <Flex boxSize="10" align="center" justify="center" borderRadius="lg" bg="teal.solid" color="teal.contrast">
                  <Icon boxSize="6" aria-hidden>
                    <LuPawPrint />
                  </Icon>
                </Flex>
                <Box lineHeight="1.15">
                  <Text fontWeight="bold" fontSize="lg" color="fg">
                    {CLINIC.product}
                  </Text>
                  <Text fontSize="xs" color="fg.muted" display={{ base: "none", sm: "block" }}>
                    {CLINIC.name}
                  </Text>
                </Box>
              </HStack>
            </NextLink>
          </Link>

          <Box order={{ base: 3, md: 2 }} flex={{ base: "1 0 100%", md: "1" }} maxW={{ md: "lg" }}>
            <PatientSearch />
          </Box>

          <HStack order={{ base: 2, md: 3 }} gap="3" ms="auto">
            <HStack gap="1.5" color="fg.muted" fontSize="sm" display={{ base: "none", lg: "flex" }}>
              <Icon aria-hidden>
                <LuClock />
              </Icon>
              <Text as="span" fontVariantNumeric="tabular-nums">
                {fmtMin(nowMin)}
              </Text>
            </HStack>
            <Button colorPalette="teal" bg="teal.700" _hover={{ bg: "teal.800" }} onClick={() => openBooking()} size={{ base: "md", md: "md" }}>
              <LuCalendarPlus aria-hidden />
              <Text as="span" display={{ base: "none", sm: "inline" }}>
                New appointment
              </Text>
              <Text as="span" display={{ base: "inline", sm: "none" }}>
                Book
              </Text>
            </Button>
            <ColorModeButton />
            <HStack gap="2.5" display={{ base: "none", xl: "flex" }}>
              <Avatar.Root size="sm" colorPalette="teal">
                <Avatar.Fallback name={USER.name} />
              </Avatar.Root>
              <Box lineHeight="1.15">
                <Text fontSize="sm" fontWeight="medium">
                  {USER.name}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {USER.role}
                </Text>
              </Box>
            </HStack>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

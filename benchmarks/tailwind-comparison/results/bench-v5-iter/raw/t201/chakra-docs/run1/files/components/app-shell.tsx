import NextLink from "next/link";
import { Avatar, Box, Flex, HStack, Text } from "@chakra-ui/react";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PatientSearch } from "@/components/patient-search";
import { CLINIC_NAME, USER } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box
        as="header"
        bg="bg.panel"
        borderBottomWidth="1px"
        borderColor="border"
        position="sticky"
        top="0"
        zIndex="sticky"
      >
        <Flex
          maxW="1400px"
          mx="auto"
          px={{ base: "4", md: "6" }}
          py="3"
          gap={{ base: "3", md: "6" }}
          align="center"
          wrap="wrap"
        >
          <NextLink href="/">
            <HStack gap="2.5">
              <Flex
                boxSize="9"
                rounded="lg"
                bg="teal.600"
                color="white"
                align="center"
                justify="center"
                fontWeight="bold"
                fontSize="lg"
                aria-hidden
              >
                P
              </Flex>
              <Box lineHeight="1.15">
                <Text fontWeight="bold" fontSize="lg">
                  Pawpoint
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  {CLINIC_NAME}
                </Text>
              </Box>
            </HStack>
          </NextLink>

          <Box order={{ base: 3, md: 2 }} flex={{ base: "1 1 100%", md: "1 1 0" }} maxW={{ md: "28rem" }} mx={{ md: "auto" }}>
            <PatientSearch />
          </Box>

          <HStack order={{ base: 2, md: 3 }} gap="3" ms="auto">
            <Box textAlign="end" lineHeight="1.2" display={{ base: "none", sm: "block" }}>
              <Text fontSize="sm" fontWeight="semibold">
                {USER.name}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {USER.role}
              </Text>
            </Box>
            <Avatar.Root size="sm" colorPalette="teal">
              <Avatar.Fallback name={USER.name} />
            </Avatar.Root>
            <ColorModeButton />
          </HStack>
        </Flex>
      </Box>
      <Box as="main" maxW="1400px" mx="auto" px={{ base: "4", md: "6" }} py={{ base: "4", md: "6" }}>
        {children}
      </Box>
    </Box>
  );
}

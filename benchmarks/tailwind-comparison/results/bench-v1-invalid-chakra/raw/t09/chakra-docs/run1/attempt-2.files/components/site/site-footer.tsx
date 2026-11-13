import {
  Box,
  Container,
  Flex,
  HStack,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { brand, navLinks } from "@/lib/data"

export function SiteFooter() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      mt="20"
    >
      <Container maxW="6xl" py="10">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap="6"
        >
          <Box maxW="sm">
            <Text
              fontFamily="heading"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
            >
              {brand.name}
              <Box as="span" color="brand.solid" aria-hidden="true">
                .
              </Box>
            </Text>
            <Text mt="2" fontSize="sm" color="fg.muted">
              {brand.description}
            </Text>
          </Box>

          <HStack
            as="nav"
            aria-label="Footer"
            gap="6"
            align="flex-start"
            wrap="wrap"
          >
            {navLinks.map((link) => (
              <ChakraLink
                key={link.href}
                asChild
                fontSize="sm"
                color="fg.muted"
                _hover={{ color: "brand.fg" }}
              >
                <NextLink href={link.href}>{link.label}</NextLink>
              </ChakraLink>
            ))}
          </HStack>
        </Flex>

        <Text mt="8" fontSize="xs" color="fg.subtle">
          © 2025 {brand.name}. Your data is stored in the EU and encrypted at
          rest.
        </Text>
      </Container>
    </Box>
  )
}

import NextLink from "next/link"
import { Box, Container, Flex, HStack, Link, Stack, Text } from "@chakra-ui/react"
import { brand, navItems } from "@/lib/data"

export function SiteFooter() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border" bg="bg.subtle">
      <Container maxW="6xl" py={{ base: "10", md: "12" }}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap="8"
        >
          <Stack gap="3" maxW="sm">
            <Text fontFamily="heading" fontSize="xl" fontWeight="bold">
              {brand.name}
            </Text>
            <Text color="fg.muted" textStyle="sm">
              {brand.description}
            </Text>
          </Stack>
          <HStack as="nav" aria-label="Footer" gap="6" wrap="wrap" align="flex-start">
            {navItems.map((item) => (
              <Link
                key={item.href}
                asChild
                color="fg.muted"
                textStyle="sm"
                _hover={{ color: "fg", textDecoration: "none" }}
              >
                <NextLink href={item.href}>{item.label}</NextLink>
              </Link>
            ))}
          </HStack>
        </Flex>
        <Text color="fg.subtle" textStyle="xs" mt="10">
          © {new Date().getFullYear()} {brand.name}. Data hosted in the EU,
          encrypted at rest.
        </Text>
      </Container>
    </Box>
  )
}

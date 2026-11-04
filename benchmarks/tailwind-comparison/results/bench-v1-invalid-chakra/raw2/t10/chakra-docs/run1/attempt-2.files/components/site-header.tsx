import { Box, Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuHouse } from "react-icons/lu";
import { SITE } from "../lib/data";

export function SiteHeader() {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      bg="bg"
      px={{ base: 4, md: 6 }}
      py={3}
      flexShrink={0}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <ChakraLink
          asChild
          fontWeight="bold"
          fontSize="xl"
          color="teal.600"
          _dark={{ color: "teal.300" }}
          textDecoration="none"
          _hover={{ textDecoration: "none" }}
        >
          <NextLink href="/" aria-label="Haven home">
            <Flex align="center" gap={2}>
              <LuHouse aria-hidden="true" />
              {SITE.name}
            </Flex>
          </NextLink>
        </ChakraLink>
        <Box color="fg.muted" fontSize="sm" display={{ base: "none", sm: "block" }}>
          Homes for sale in {SITE.city}
        </Box>
      </Flex>
    </Box>
  );
}

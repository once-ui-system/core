import NextLink from "next/link";
import { Box, Heading, Link as ChakraLink, Text } from "@chakra-ui/react";
import { SiteHeader } from "../../../components/site-header";

export default function NotFound() {
  return (
    <Box minHeight="100dvh">
      <SiteHeader />
      <Box as="main" id="main" maxWidth="600px" mx="auto" px={4} py={16} textAlign="center">
        <Heading as="h1" size="xl" mb={2}>
          We couldn’t find that home
        </Heading>
        <Text color="fg.muted" mb={4}>
          It may have been sold or taken off the market.
        </Text>
        <ChakraLink asChild color="teal.600" _dark={{ color: "teal.300" }}>
          <NextLink href="/">Back to all homes</NextLink>
        </ChakraLink>
      </Box>
    </Box>
  );
}

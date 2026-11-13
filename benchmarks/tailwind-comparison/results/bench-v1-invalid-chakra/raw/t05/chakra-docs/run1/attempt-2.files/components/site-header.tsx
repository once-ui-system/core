import NextLink from "next/link";
import { Box, Container, Flex } from "@chakra-ui/react";
import { PRODUCT_NAME } from "@/lib/data";

export function SiteHeader({ maxW }: { maxW: string }) {
  return (
    <Box as="header" bg="bg" borderBottomWidth="1px">
      <Container maxW={maxW} py="3">
        <Flex align="center" justify="space-between">
          <NextLink
            href="/"
            style={{ fontWeight: 600, fontSize: "1.125rem", textDecoration: "none", color: "inherit" }}
          >
            {PRODUCT_NAME}
          </NextLink>
        </Flex>
      </Container>
    </Box>
  );
}

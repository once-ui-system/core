import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { LuSparkles } from "react-icons/lu";
import { ColorModeButton } from "@/components/ui/color-mode";
import { PRODUCT_NAME, WORKSPACE_NAME } from "@/lib/data";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100dvh" bg="bg.subtle">
      <Box as="header" bg="bg" borderBottomWidth="1px">
        <Container maxW="6xl">
          <Flex h="14" align="center" justify="space-between" gap="4">
            <Link href="/" aria-label={`${PRODUCT_NAME} team home`}>
              <Flex align="center" gap="2">
                <Flex
                  boxSize="8"
                  align="center"
                  justify="center"
                  rounded="md"
                  bg="orange.solid"
                  color="orange.contrast"
                  aria-hidden="true"
                >
                  <LuSparkles />
                </Flex>
                <Text fontWeight="semibold" fontSize="lg">
                  {PRODUCT_NAME}
                </Text>
              </Flex>
            </Link>
            <Flex align="center" gap="3">
              <Text color="fg.muted" fontSize="sm" display={{ base: "none", sm: "block" }}>
                {WORKSPACE_NAME}
              </Text>
              <ColorModeButton />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Box as="main" id="main">
        <Container maxW="6xl" py={{ base: "6", md: "10" }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "flex-start" }}
      justify="space-between"
      gap="4"
      mb="6"
    >
      <Box>
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        {description ? (
          <Text color="fg.muted" mt="1">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions}
    </Flex>
  );
}

import NextLink from "next/link";
import { Container, Heading, Link, Stack, Text } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Container maxW="md" py="20">
      <Stack gap="3" align="flex-start">
        <Heading as="h1" size="2xl">
          Member not found
        </Heading>
        <Text color="fg.muted">
          That person isn&apos;t part of this workspace, or they may have been removed.
        </Text>
        <Link asChild colorPalette="blue">
          <NextLink href="/">Back to team</NextLink>
        </Link>
      </Stack>
    </Container>
  );
}

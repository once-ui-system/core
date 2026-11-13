import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb={{ base: "6", md: "8" }}>
      <Heading as="h1" size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
        {title}
      </Heading>
      {description && (
        <Text mt="2" color="fg.muted" maxW="2xl">
          {description}
        </Text>
      )}
    </Box>
  );
}

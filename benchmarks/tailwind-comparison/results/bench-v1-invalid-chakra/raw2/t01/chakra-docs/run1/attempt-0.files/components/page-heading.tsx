import { Box, Heading, Text } from "@chakra-ui/react";

export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box mb="6">
      <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
        {title}
      </Heading>
      {description && (
        <Text color="fg.muted" mt="1">
          {description}
        </Text>
      )}
    </Box>
  );
}

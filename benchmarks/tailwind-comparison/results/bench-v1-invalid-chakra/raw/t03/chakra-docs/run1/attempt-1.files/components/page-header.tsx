import { Box, Heading, Text } from "@chakra-ui/react"

export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Box mb={{ base: "5", md: "6" }}>
      <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
        {title}
      </Heading>
      <Text color="fg.muted" mt="1">
        {description}
      </Text>
    </Box>
  )
}

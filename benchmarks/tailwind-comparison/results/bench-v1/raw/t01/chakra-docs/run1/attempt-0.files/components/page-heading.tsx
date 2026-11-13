import { Box, Heading, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface PageHeadingProps {
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <Box
      display="flex"
      flexDirection={{ base: "column", sm: "row" }}
      alignItems={{ base: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap="3"
      mb="6"
    >
      <Box minW="0">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        <Text color="fg.muted" mt="1">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  )
}

"use client"

import { Box, Heading, Text } from "@chakra-ui/react"

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="flex-end"
      justifyContent="space-between"
      gap="2"
      mb="4"
    >
      <Box minW="0">
        <Heading as="h1" size="xl" fontWeight="semibold" letterSpacing="-0.01em">
          {title}
        </Heading>
        {description && (
          <Text fontSize="sm" color="fg.muted" mt="0.5">
            {description}
          </Text>
        )}
      </Box>
      {children}
    </Box>
  )
}

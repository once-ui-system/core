"use client"

import { Box, Flex, Heading, Text } from "@chakra-ui/react"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      justify="space-between"
      align={{ base: "stretch", sm: "flex-end" }}
      gap="3"
      mb="4"
    >
      <Box minW="0">
        <Heading as="h1" size="xl">
          {title}
        </Heading>
        {description ? (
          <Text mt="1" color="fg.muted">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions}
    </Flex>
  )
}

"use client"

import { Box, Heading, Text } from "@chakra-ui/react"
import * as React from "react"

export function PageIntro({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="flex-end"
      justifyContent="space-between"
      gap="4"
      mb="10"
    >
      <Box>
        <Heading as="h1" size={{ base: "3xl", md: "4xl" }} letterSpacing="tight">
          {title}
        </Heading>
        <Text color="fg.muted" mt="2" textStyle="lg">
          {description}
        </Text>
      </Box>
      {actions}
    </Box>
  )
}

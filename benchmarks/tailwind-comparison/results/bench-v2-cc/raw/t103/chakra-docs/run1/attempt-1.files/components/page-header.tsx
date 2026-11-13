"use client"

import { Heading, Stack, Text } from "@chakra-ui/react"
import type * as React from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <Stack
      direction={{ base: "column", sm: "row" }}
      justify="space-between"
      align={{ base: "flex-start", sm: "flex-end" }}
      gap="4"
      mb="6"
    >
      <Stack gap="1">
        <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
          {title}
        </Heading>
        {description && <Text color="fg.muted">{description}</Text>}
      </Stack>
      {actions}
    </Stack>
  )
}

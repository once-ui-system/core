"use client"

import { Badge, HStack, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Medical alerts: solid red, icon plus words, so they never depend on colour alone. */
export function AlertChips({
  alerts,
  size = "sm",
}: {
  alerts: string[]
  size?: "xs" | "sm" | "md" | "lg"
}) {
  if (alerts.length === 0) return null
  return (
    <HStack gap="1.5" wrap="wrap" role="list" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <Badge
          key={alert}
          role="listitem"
          colorPalette="red"
          variant="solid"
          size={size}
          whiteSpace="normal"
          textAlign="start"
          gap="1.5"
        >
          <LuTriangleAlert aria-hidden="true" />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </HStack>
  )
}

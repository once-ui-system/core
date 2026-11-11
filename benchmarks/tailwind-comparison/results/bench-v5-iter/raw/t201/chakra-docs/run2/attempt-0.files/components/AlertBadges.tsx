"use client"

import { Badge, Flex, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Medical alerts as solid red chips: used wherever a patient shows up. */
export function AlertBadges({
  alerts,
  size = "sm",
}: {
  alerts: string[]
  size?: "xs" | "sm" | "md" | "lg"
}) {
  if (alerts.length === 0) return null
  return (
    <Flex gap="1.5" wrap="wrap" role="list" aria-label="Medical alerts">
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
          fontWeight="semibold"
        >
          <LuTriangleAlert aria-hidden="true" />
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Flex>
  )
}

import { Badge, Box, Flex, Heading, Icon, Stack, Text, VisuallyHidden } from "@chakra-ui/react"
import { LuTriangleAlert } from "react-icons/lu"

/** Compact, solid red chips: used wherever a patient appears. */
export function AlertChips({ alerts, size = "md" }: { alerts: string[]; size?: "sm" | "md" | "lg" }) {
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
          gap="1.5"
          textTransform="none"
          fontWeight="semibold"
          whiteSpace="normal"
          textAlign="start"
        >
          <Icon aria-hidden boxSize="3.5" flexShrink={0}>
            <LuTriangleAlert />
          </Icon>
          <VisuallyHidden>Medical alert: </VisuallyHidden>
          {alert}
        </Badge>
      ))}
    </Flex>
  )
}

/** Full-width banner on the patient record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null
  return (
    <Box
      role="region"
      aria-label={`Medical alerts for ${name}`}
      bg="red.solid"
      color="red.contrast"
      borderRadius="xl"
      px={{ base: "4", md: "6" }}
      py="4"
      boxShadow="md"
    >
      <Flex align="center" gap="3" mb="3">
        <Icon aria-hidden boxSize="7" flexShrink={0}>
          <LuTriangleAlert />
        </Icon>
        <Heading as="h2" size="lg" letterSpacing="wide" textTransform="uppercase">
          Medical alerts
        </Heading>
      </Flex>
      <Stack as="ul" gap="2" listStyle="none" m="0" p="0">
        {alerts.map((alert) => (
          <Box
            as="li"
            key={alert}
            bg="whiteAlpha.300"
            borderRadius="lg"
            px="4"
            py="2.5"
            borderWidth="1px"
            borderColor="whiteAlpha.500"
          >
            <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" lineHeight="short">
              {alert}
            </Text>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

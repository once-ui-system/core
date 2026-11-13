import { Badge, Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { LuTriangleAlert } from "react-icons/lu";

/** Compact medical alerts: solid red chips with a warning icon, shown wherever a patient appears. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <HStack as="ul" role="list" aria-label="Medical alerts" gap="1.5" flexWrap="wrap" listStyleType="none" m="0" p="0">
      {alerts.map((alert) => (
        <Box as="li" key={alert} listStyleType="none">
          <Badge
            colorPalette="red"
            variant="solid"
            size="md"
            whiteSpace="normal"
            textAlign="start"
            gap="1.5"
            px="2"
            py="1"
          >
            <LuTriangleAlert aria-hidden="true" />
            {alert}
          </Badge>
        </Box>
      ))}
    </HStack>
  );
}

/** The large, hard-to-miss alert panel on a patient's record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderColor="border.muted"
        bg="bg.panel"
        rounded="lg"
        px="4"
        py="3"
        color="fg.muted"
      >
        <Text fontSize="sm">No medical alerts on file for {name}.</Text>
      </Box>
    );
  }
  return (
    <Box
      as="section"
      aria-labelledby="medical-alerts-heading"
      bg="red.subtle"
      borderWidth="2px"
      borderColor="red.solid"
      borderStartWidth="8px"
      rounded="lg"
      p={{ base: "4", md: "5" }}
    >
      <HStack gap="2" color="red.fg" mb="2">
        <LuTriangleAlert size={24} aria-hidden="true" />
        <Heading
          id="medical-alerts-heading"
          as="h2"
          size="md"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          Medical alerts for {name}
        </Heading>
      </HStack>
      <Stack as="ul" gap="1" listStyleType="none" m="0" p="0">
        {alerts.map((alert) => (
          <Text
            as="li"
            key={alert}
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            color="red.fg"
            lineHeight="short"
          >
            {alert}
          </Text>
        ))}
      </Stack>
    </Box>
  );
}

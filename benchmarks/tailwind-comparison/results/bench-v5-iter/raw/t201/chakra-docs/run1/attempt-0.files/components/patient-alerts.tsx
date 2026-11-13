import { Box, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { FiAlertTriangle } from "react-icons/fi";

/** Compact alert chips: solid red so they read at a glance in lists and cards. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <Flex as="ul" listStyleType="none" m="0" p="0" gap="1.5" wrap="wrap" aria-label="Medical alerts">
      {alerts.map((alert) => (
        <HStack
          as="li"
          key={alert}
          gap="1.5"
          bg="red.600"
          color="white"
          _dark={{ bg: "red.500" }}
          px="2"
          py="0.5"
          rounded="md"
          fontSize="xs"
          fontWeight="semibold"
          lineHeight="1.3"
          alignItems="flex-start"
        >
          <Icon boxSize="3.5" mt="0.5" flexShrink={0} aria-hidden>
            <FiAlertTriangle />
          </Icon>
          <span>
            <Box as="span" srOnly>
              Alert:{" "}
            </Box>
            {alert}
          </span>
        </HStack>
      ))}
    </Flex>
  );
}

/** Large banner for the top of a record. */
export function AlertBanner({ alerts, extra = [] }: { alerts: string[]; extra?: string[] }) {
  const all = [...alerts, ...extra];
  if (all.length === 0) return null;
  return (
    <Box
      role="region"
      aria-label="Medical alerts"
      bg="red.600"
      color="white"
      _dark={{ bg: "red.700" }}
      rounded="lg"
      p={{ base: "3", md: "4" }}
      borderWidth="1px"
      borderColor="red.700"
    >
      <HStack gap="2" mb="2">
        <Icon boxSize="5" aria-hidden>
          <FiAlertTriangle />
        </Icon>
        <Text fontWeight="bold" fontSize="sm" letterSpacing="0.08em" textTransform="uppercase">
          Medical alerts
        </Text>
      </HStack>
      <Flex as="ul" listStyleType="none" m="0" p="0" gap="2" wrap="wrap">
        {all.map((alert) => (
          <Box
            as="li"
            key={alert}
            bg="white"
            color="red.700"
            px="3"
            py="1.5"
            rounded="md"
            fontWeight="bold"
            fontSize={{ base: "md", md: "lg" }}
          >
            {alert}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

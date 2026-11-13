import type { Metadata } from "next";
import {
  Badge,
  Box,
  Button,
  Card,
  Circle,
  Heading,
  HStack,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { LuArrowLeft, LuCheck, LuPartyPopper } from "react-icons/lu";
import { nextStepsChecklist, product, user } from "@/lib/data";

export const metadata: Metadata = {
  title: "You're all set | Lumen",
  description: "Your Lumen workspace is ready. Here is what to do next.",
};

export default function WelcomePage() {
  const firstName = user.name.split(" ")[0];

  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Box
        maxW="2xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "16" }}
      >
        <Stack gap="6">
          <Stack gap="4" align="flex-start">
            <Circle size="12" bg="green.subtle" color="green.fg">
              <LuPartyPopper size={24} aria-hidden />
            </Circle>
            <Stack gap="2">
              <HStack gap="2" wrap="wrap">
                <Badge colorPalette="green">Setup complete</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </HStack>
              <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
                You&apos;re all set, {firstName}!
              </Heading>
              <Text color="fg.muted">
                Your {product.name} workspace is ready for {user.email}. Here
                are four things to do next to get value from{" "}
                {product.name} this week.
              </Text>
            </Stack>
          </Stack>

          <Card.Root>
            <Card.Header>
              <Heading as="h2" size="lg">
                Your next steps
              </Heading>
            </Card.Header>
            <Card.Body>
              <List.Root as="ol" listStyle="none" m="0" p="0" gap="5">
                {nextStepsChecklist.map((item, i) => (
                  <List.Item key={item.title}>
                    <HStack align="flex-start" gap="4">
                      <Circle
                        size="7"
                        flexShrink={0}
                        mt="0.5"
                        borderWidth="2px"
                        borderColor="blue.solid"
                        color="blue.fg"
                        fontSize="sm"
                        fontWeight="semibold"
                      >
                        {i === 0 ? <LuCheck aria-hidden /> : i + 1}
                      </Circle>
                      <Box minW="0">
                        <Text fontWeight="semibold">{item.title}</Text>
                        <Text textStyle="sm" color="fg.muted">
                          {item.description}
                        </Text>
                      </Box>
                    </HStack>
                  </List.Item>
                ))}
              </List.Root>
            </Card.Body>
            <Card.Footer>
              <Button asChild variant="outline">
                <NextLink href="/">
                  <LuArrowLeft aria-hidden /> Back to onboarding
                </NextLink>
              </Button>
            </Card.Footer>
          </Card.Root>
        </Stack>
      </Box>
    </Box>
  );
}

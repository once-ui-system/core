"use client";

import { Box, Circle, Flex, List, Text } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";
import { wizardSteps } from "@/lib/data";

export function StepIndicator({ current }: { current: number }) {
  return (
    <Box as="nav" aria-label="Onboarding progress">
      <Text srOnly aria-live="polite">
        Step {current + 1} of {wizardSteps.length}: {wizardSteps[current].title}
      </Text>
      <List.Root as="ol" listStyle="none" m="0" p="0" display="flex" gap="0">
        {wizardSteps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <List.Item
              key={step.title}
              flex={i === wizardSteps.length - 1 ? "0 0 auto" : "1"}
              display="flex"
              alignItems="center"
              aria-current={active ? "step" : undefined}
              minW="0"
            >
              <Flex align="center" gap="3" minW="0">
                <Circle
                  size="8"
                  flexShrink={0}
                  borderWidth="2px"
                  borderColor={done || active ? "blue.solid" : "border"}
                  bg={done ? "blue.solid" : "transparent"}
                  color={done ? "white" : active ? "blue.fg" : "fg.muted"}
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {done ? <LuCheck aria-hidden /> : i + 1}
                </Circle>
                <Box display={{ base: "none", md: "block" }} minW="0">
                  <Text
                    textStyle="sm"
                    fontWeight="semibold"
                    color={active || done ? "fg" : "fg.muted"}
                    lineClamp={1}
                  >
                    {step.title}
                    <Text as="span" srOnly>
                      {done ? " (completed)" : active ? " (current)" : ""}
                    </Text>
                  </Text>
                  <Text textStyle="xs" color="fg.muted" lineClamp={1}>
                    {step.description}
                  </Text>
                </Box>
              </Flex>
              {i < wizardSteps.length - 1 && (
                <Box
                  aria-hidden
                  flex="1"
                  h="2px"
                  mx="3"
                  minW="3"
                  bg={done ? "blue.solid" : "border"}
                />
              )}
            </List.Item>
          );
        })}
      </List.Root>
    </Box>
  );
}

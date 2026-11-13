import { Box, Flex, Icon, Span, Text } from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { steps } from "@/lib/data"

interface StepIndicatorProps {
  current: number
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <Box as="nav" aria-label="Onboarding progress">
      <Text
        textStyle="sm"
        color="fg.muted"
        mb="3"
        display={{ base: "block", md: "none" }}
        aria-hidden="true"
      >
        Step {current + 1} of {steps.length}: {steps[current].short}
      </Text>
      <Flex as="ol" listStyleType="none" m="0" p="0" align="center" gap="2">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          const last = index === steps.length - 1
          return (
            <Flex
              as="li"
              key={step.id}
              align="center"
              gap="2"
              flex={last ? "0 0 auto" : "1"}
              aria-current={active ? "step" : undefined}
            >
              <Flex align="center" gap="2" flex="0 0 auto">
                <Flex
                  align="center"
                  justify="center"
                  boxSize="8"
                  rounded="full"
                  borderWidth="2px"
                  borderColor={done || active ? "colorPalette.solid" : "border"}
                  bg={done ? "colorPalette.solid" : "transparent"}
                  color={
                    done
                      ? "colorPalette.contrast"
                      : active
                        ? "colorPalette.fg"
                        : "fg.muted"
                  }
                  colorPalette="blue"
                  fontWeight="semibold"
                  textStyle="sm"
                >
                  {done ? (
                    <Icon boxSize="4" aria-hidden="true">
                      <LuCheck />
                    </Icon>
                  ) : (
                    <Span aria-hidden="true">{index + 1}</Span>
                  )}
                </Flex>
                <Span
                  textStyle="sm"
                  fontWeight={active ? "semibold" : "medium"}
                  color={active ? "fg" : "fg.muted"}
                  display={{ base: "none", md: "inline" }}
                >
                  {step.short}
                </Span>
                <Span srOnly>
                  {done ? "Completed: " : active ? "Current step: " : "Upcoming: "}
                  {step.short}
                  {` (step ${index + 1} of ${steps.length})`}
                </Span>
              </Flex>
              {!last && (
                <Box
                  flex="1"
                  h="2px"
                  minW="4"
                  rounded="full"
                  bg={done ? "blue.solid" : "border"}
                  aria-hidden="true"
                />
              )}
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}

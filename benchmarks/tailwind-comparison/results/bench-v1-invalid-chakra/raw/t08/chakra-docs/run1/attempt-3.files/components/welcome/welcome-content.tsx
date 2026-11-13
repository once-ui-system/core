"use client"

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Icon,
  Progress,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { useEffect, useState } from "react"
import { LuPartyPopper, LuRotateCcw } from "react-icons/lu"
import {
  nextSteps,
  product,
  sampleUser,
  STORAGE_KEY,
  type OnboardingData,
} from "@/lib/data"

interface WelcomeInfo {
  name: string
  email: string
  workspace: string
  invited: number
}

const fallback: WelcomeInfo = {
  name: sampleUser.name,
  email: sampleUser.email,
  workspace: "Acme Labs",
  invited: 0,
}

function readInfo(): WelcomeInfo {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<OnboardingData>
    return {
      name: parsed.name?.trim() || fallback.name,
      email: parsed.email?.trim() || fallback.email,
      workspace: parsed.workspace?.trim() || fallback.workspace,
      invited: Array.isArray(parsed.invites) ? parsed.invites.length : 0,
    }
  } catch {
    return fallback
  }
}

export function WelcomeContent() {
  const [info, setInfo] = useState<WelcomeInfo>(fallback)
  const [done, setDone] = useState<string[]>([])

  useEffect(() => {
    setInfo(readInfo())
  }, [])

  const firstName = info.name.split(" ")[0]
  const progress = Math.round((done.length / nextSteps.length) * 100)

  const toggle = (id: string, checked: boolean) => {
    setDone((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    )
  }

  const invitedText =
    info.invited > 0
      ? ` and invited ${info.invited} teammate${info.invited === 1 ? "" : "s"}.`
      : "."

  return (
    <Box as="main" minH="100vh" bg="bg.subtle">
      <Box
        maxW="3xl"
        mx="auto"
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "16" }}
      >
        <Stack gap="3" mb="8" align="flex-start">
          <Flex
            align="center"
            justify="center"
            boxSize="12"
            rounded="full"
            bg="green.subtle"
            color="green.fg"
          >
            <Icon boxSize="6" aria-hidden="true">
              <LuPartyPopper />
            </Icon>
          </Flex>
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
            {"You're all set, " + firstName + "!"}
          </Heading>
          <Text color="fg.muted" fontSize="lg">
            <Span color="fg" fontWeight="semibold">
              {info.workspace}
            </Span>
            {" is ready on " +
              product.name +
              ". We sent a sign-in link to " +
              info.email +
              invitedText}
          </Text>
        </Stack>

        <Card.Root variant="elevated">
          <Card.Header>
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
              <Heading as="h2" size="lg">
                Your next steps
              </Heading>
              <Badge
                variant="subtle"
                colorPalette={progress === 100 ? "green" : "blue"}
              >
                {done.length + " of " + nextSteps.length + " done"}
              </Badge>
            </Flex>
            <Progress.Root
              value={progress}
              size="sm"
              colorPalette="blue"
              mt="3"
              aria-label="Checklist progress"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Card.Header>
          <Card.Body>
            <Stack as="ul" listStyleType="none" m="0" p="0" gap="4">
              {nextSteps.map((item) => {
                const checked = done.includes(item.id)
                return (
                  <li key={item.id}>
                    <Checkbox.Root
                      colorPalette="blue"
                      checked={checked}
                      onCheckedChange={(e) =>
                        toggle(item.id, e.checked === true)
                      }
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                      <Checkbox.Label>
                        <Span
                          display="block"
                          fontWeight="medium"
                          textDecoration={checked ? "line-through" : "none"}
                          color={checked ? "fg.muted" : "fg"}
                        >
                          {item.title}
                        </Span>
                        <Span
                          display="block"
                          textStyle="sm"
                          color="fg.muted"
                          fontWeight="normal"
                        >
                          {item.description}
                        </Span>
                      </Checkbox.Label>
                    </Checkbox.Root>
                  </li>
                )
              })}
            </Stack>
          </Card.Body>
          <Card.Footer>
            <Button asChild variant="ghost" size="sm">
              <NextLink href="/">
                <LuRotateCcw aria-hidden="true" />
                Run onboarding again
              </NextLink>
            </Button>
          </Card.Footer>
        </Card.Root>
      </Box>
    </Box>
  )
}

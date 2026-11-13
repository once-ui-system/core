import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react"
import NextLink from "next/link"
import { LuArrowRight } from "react-icons/lu"
import { brand } from "@/lib/data"

export function Hero() {
  return (
    <Box
      as="section"
      aria-labelledby="hero-title"
      borderBottomWidth="1px"
      borderColor="border"
      bgGradient="to-b"
      gradientFrom="brand.subtle"
      gradientTo="bg"
    >
      <Container maxW="4xl" py={{ base: "16", md: "28" }}>
        <Stack gap="8" align="center" textAlign="center">
          <Badge
            colorPalette="brand"
            variant="subtle"
            size="lg"
            bg="brand.subtle"
            color="brand.fg"
          >
            For small software teams
          </Badge>
          <Heading
            as="h1"
            id="hero-title"
            fontSize={{ base: "4xl", md: "6xl" }}
            lineHeight="1.1"
            letterSpacing="tight"
          >
            {brand.tagline}
          </Heading>
          <Text fontSize={{ base: "md", md: "xl" }} color="fg.muted" maxW="2xl">
            Lumen turns your product events into one short weekly page, and lets
            you file the bug straight from the chart that revealed it.
          </Text>
          <HStack gap="3" wrap="wrap" justify="center">
            <Button asChild size="lg">
              <NextLink href="/pricing">
                Start for free <LuArrowRight />
              </NextLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <NextLink href="/#product">See how it works</NextLink>
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}

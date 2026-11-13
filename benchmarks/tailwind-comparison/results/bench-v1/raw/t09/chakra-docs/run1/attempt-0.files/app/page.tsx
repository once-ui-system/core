import NextLink from "next/link"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  List,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuArrowRight, LuCheck } from "react-icons/lu"
import { SiteShell } from "@/components/site-shell"
import { brand, features, logos } from "@/lib/data"

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Box as="section" aria-labelledby="hero-title">
        <Container maxW="4xl" py={{ base: "16", md: "28" }}>
          <Stack gap="8" align="center" textAlign="center">
            <Text
              textStyle="sm"
              fontWeight="semibold"
              color="brand.fg"
              textTransform="uppercase"
              letterSpacing="widest"
            >
              {brand.name}
            </Text>
            <Heading
              as="h1"
              id="hero-title"
              fontFamily="heading"
              fontSize={{ base: "4xl", md: "6xl" }}
              lineHeight="1.1"
              letterSpacing="tight"
            >
              {brand.tagline}
            </Heading>
            <Text color="fg.muted" fontSize={{ base: "md", md: "xl" }} maxW="2xl">
              {brand.description} See what changed, file what broke, and keep
              the whole team looking at the same page.
            </Text>
            <Flex gap="3" wrap="wrap" justify="center">
              <Button asChild size="lg">
                <NextLink href="/pricing">
                  Start free <LuArrowRight />
                </NextLink>
              </Button>
              <Button asChild size="lg" variant="outline" colorPalette="gray">
                <NextLink href="/#features">See how it works</NextLink>
              </Button>
            </Flex>
          </Stack>
        </Container>
      </Box>

      {/* Customer logos */}
      <Box
        as="section"
        id="customers"
        aria-labelledby="customers-title"
        borderTopWidth="1px"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <Container maxW="6xl" py="10">
          <Text
            id="customers-title"
            textAlign="center"
            color="fg.muted"
            textStyle="sm"
            mb="6"
          >
            Trusted by small teams that ship every week
          </Text>
          <List.Root
            as="ul"
            listStyle="none"
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            columnGap={{ base: "6", md: "12" }}
            rowGap="4"
            m="0"
            p="0"
          >
            {logos.map((logo) => (
              <List.Item
                key={logo}
                fontFamily="heading"
                fontSize={{ base: "lg", md: "2xl" }}
                fontWeight="bold"
                color="fg.muted"
                letterSpacing="tight"
              >
                {logo}
              </List.Item>
            ))}
          </List.Root>
        </Container>
      </Box>

      {/* Features */}
      <Box as="section" id="features" aria-labelledby="features-title">
        <Container maxW="6xl" py={{ base: "16", md: "24" }}>
          <Stack gap={{ base: "14", md: "20" }}>
            <Heading
              as="h2"
              id="features-title"
              fontFamily="heading"
              fontSize={{ base: "3xl", md: "4xl" }}
              textAlign="center"
              letterSpacing="tight"
            >
              Everything a small team needs, nothing it doesn&apos;t
            </Heading>
            {features.map((feature, index) => (
              <SimpleGrid
                key={feature.title}
                columns={{ base: 1, md: 2 }}
                gap={{ base: "6", md: "16" }}
                alignItems="center"
              >
                <Stack
                  gap="4"
                  order={{ base: 0, md: index % 2 === 1 ? 2 : 0 }}
                >
                  <Text
                    textStyle="sm"
                    fontWeight="semibold"
                    color="brand.fg"
                    textTransform="uppercase"
                    letterSpacing="widest"
                  >
                    {feature.eyebrow}
                  </Text>
                  <Heading
                    as="h3"
                    fontFamily="heading"
                    fontSize={{ base: "2xl", md: "3xl" }}
                    letterSpacing="tight"
                  >
                    {feature.title}
                  </Heading>
                  <Text color="fg.muted" fontSize="lg">
                    {feature.body}
                  </Text>
                </Stack>
                <Box
                  borderWidth="1px"
                  borderColor="border"
                  bg="bg.panel"
                  rounded="l3"
                  p={{ base: "5", md: "8" }}
                >
                  <List.Root gap="4" variant="plain">
                    {feature.points.map((point) => (
                      <List.Item key={point} alignItems="flex-start">
                        <List.Indicator color="brand.fg" mt="1">
                          <LuCheck />
                        </List.Indicator>
                        {point}
                      </List.Item>
                    ))}
                  </List.Root>
                </Box>
              </SimpleGrid>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Closing call to action */}
      <Box as="section" aria-labelledby="cta-title" bg="bg.subtle" borderTopWidth="1px" borderColor="border">
        <Container maxW="3xl" py={{ base: "14", md: "20" }}>
          <Stack gap="5" align="center" textAlign="center">
            <Heading
              as="h2"
              id="cta-title"
              fontFamily="heading"
              fontSize={{ base: "2xl", md: "4xl" }}
              letterSpacing="tight"
            >
              Read your product again
            </Heading>
            <Text color="fg.muted" fontSize="lg">
              Free for one seat, $12 per seat for the whole team.
            </Text>
            <Button asChild size="lg">
              <NextLink href="/pricing">Compare plans</NextLink>
            </Button>
          </Stack>
        </Container>
      </Box>
    </SiteShell>
  )
}

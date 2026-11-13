import {
  Box,
  Container,
  Grid,
  Heading,
  List,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuCheck } from "react-icons/lu"
import { features } from "@/lib/data"

export function FeatureSections() {
  return (
    <Box id="product" as="section" aria-labelledby="features-title" py="12">
      <Container maxW="6xl">
        <Heading
          id="features-title"
          as="h2"
          fontSize={{ base: "3xl", md: "4xl" }}
          letterSpacing="tight"
          textAlign="center"
          mb={{ base: "12", md: "20" }}
        >
          Everything a small team needs, nothing it doesn&apos;t
        </Heading>

        <Stack gap={{ base: "16", md: "24" }}>
          {features.map((feature, index) => (
            <Grid
              key={feature.title}
              as="article"
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={{ base: "6", md: "16" }}
              alignItems="center"
            >
              <Stack
                gap="4"
                order={{ base: 1, md: index % 2 === 0 ? 1 : 2 }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="brand.fg"
                  textTransform="uppercase"
                  letterSpacing="widest"
                >
                  {feature.eyebrow}
                </Text>
                <Heading
                  as="h3"
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
                order={{ base: 2, md: index % 2 === 0 ? 2 : 1 }}
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="l2"
                p={{ base: "5", md: "8" }}
              >
                <List.Root
                  gap="4"
                  variant="plain"
                  aria-label={`${feature.eyebrow} highlights`}
                >
                  {feature.points.map((point) => (
                    <List.Item key={point} alignItems="flex-start">
                      <List.Indicator asChild color="brand.solid" mt="1">
                        <LuCheck />
                      </List.Indicator>
                      {point}
                    </List.Item>
                  ))}
                </List.Root>
              </Box>
            </Grid>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}

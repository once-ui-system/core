import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuBath,
  LuBedDouble,
  LuCalendar,
  LuCheck,
  LuMaximize,
} from "react-icons/lu";
import { ContactForm } from "@/components/contact-form";
import HomeMap from "@/components/home-map-lazy";
import { PlaceholderPhoto } from "@/components/placeholder-photo";
import {
  HOMES,
  bedsLabel,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  return {
    title: home ? `${home.title} · Haven` : "Home not found · Haven",
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#15803d",
  A: "#22a24a",
  B: "#65b32e",
  C: "#b5c21b",
  D: "#e5b800",
  E: "#ee8a1a",
  F: "#d93a2b",
};
const ENERGY_TEXT: Record<string, string> = {
  "A+": "#ffffff",
  A: "#0b2a14",
  B: "#10260a",
  C: "#2b2f00",
  D: "#2e2500",
  E: "#2e1700",
  F: "#ffffff",
};

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box borderWidth="1px" borderRadius="md" p="3" bg="bg.subtle">
      <HStack color="fg.muted" fontSize="xs" gap="1.5">
        <span aria-hidden="true">{icon}</span>
        <Text as="span">{label}</Text>
      </HStack>
      <Text fontWeight="semibold" mt="1">
        {value}
      </Text>
    </Box>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  return (
    <Box minH="100dvh" bg="bg">
      <Container
        maxW="6xl"
        py={{ base: "4", md: "8" }}
        px={{ base: "4", md: "6" }}
      >
        <Box as="nav" aria-label="Breadcrumb" mb="4">
          <NextLink href="/">
            <HStack gap="1.5" color="teal.fg" fontSize="sm" fontWeight="medium">
              <LuArrowLeft aria-hidden="true" />
              <span>Back to search</span>
            </HStack>
          </NextLink>
        </Box>

        <Box
          as="section"
          aria-label="Photo gallery"
          mb="6"
          overflowX="auto"
          tabIndex={0}
          borderRadius="lg"
        >
          <Flex gap="3" minW="max-content">
            {[0, 1, 2, 3].map((i) => (
              <Box
                key={i}
                flex="none"
                width={{ base: "260px", md: i === 0 ? "420px" : "260px" }}
                height={{ base: "180px", md: "260px" }}
              >
                <PlaceholderPhoto
                  id={home.id}
                  shift={i}
                  rounded="lg"
                  label={`${home.title}, photo ${i + 1} of 4 (placeholder)`}
                />
              </Box>
            ))}
          </Flex>
        </Box>

        <Grid
          templateColumns={{
            base: "minmax(0, 1fr)",
            lg: "minmax(0, 3fr) minmax(0, 2fr)",
          }}
          gap={{ base: "8", lg: "10" }}
          alignItems="start"
        >
          <Box as="main">
            <Flex align="center" gap="3" wrap="wrap">
              <Text as="p" fontSize="3xl" fontWeight="bold">
                {formatPrice(home.price)}
              </Text>
              {isNew(home.listed) && (
                <Badge colorPalette="green" variant="solid">
                  New this week
                </Badge>
              )}
            </Flex>
            <Heading as="h1" size="xl" mt="1">
              {home.title}
            </Heading>
            <Text color="fg.muted" mt="1">
              {home.type} in {home.district}, Lisbon
            </Text>

            <Grid
              mt="5"
              gap="3"
              templateColumns={{
                base: "repeat(2, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              }}
            >
              <Fact
                icon={<LuBedDouble />}
                label="Bedrooms"
                value={bedsLabel(home.beds)}
              />
              <Fact
                icon={<LuBath />}
                label="Bathrooms"
                value={String(home.baths)}
              />
              <Fact
                icon={<LuMaximize />}
                label="Area"
                value={`${home.area_m2} m²`}
              />
              <Fact
                icon={<LuCalendar />}
                label="Built"
                value={String(home.year)}
              />
            </Grid>
            <Text fontSize="sm" color="fg.muted" mt="3">
              Listed {formatListed(home.listed)} ·{" "}
              {formatPrice(Math.round(home.price / home.area_m2))} per m²
            </Text>

            <Box as="section" mt="8" aria-labelledby="features-heading">
              <Heading as="h2" id="features-heading" size="md" mb="3">
                Features
              </Heading>
              <Grid
                as="ul"
                listStyleType="none"
                gap="2"
                templateColumns={{
                  base: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {home.features.map((f) => (
                  <HStack as="li" key={f} gap="2">
                    <Box color="teal.fg" aria-hidden="true">
                      <LuCheck />
                    </Box>
                    <Text>{f}</Text>
                  </HStack>
                ))}
              </Grid>
            </Box>

            <Box as="section" mt="8" aria-labelledby="energy-heading">
              <Heading as="h2" id="energy-heading" size="md" mb="3">
                Energy rating
              </Heading>
              <Flex
                gap="1.5"
                role="img"
                aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}
              >
                {ENERGY_SCALE.map((grade) => {
                  const active = grade === home.energy;
                  return (
                    <Flex
                      key={grade}
                      align="center"
                      justify="center"
                      width={active ? "56px" : "40px"}
                      height={active ? "48px" : "36px"}
                      alignSelf="center"
                      borderRadius="md"
                      fontWeight="bold"
                      fontSize={active ? "lg" : "sm"}
                      opacity={active ? 1 : 0.45}
                      outline={active ? "3px solid" : "none"}
                      outlineColor="fg"
                      outlineOffset="2px"
                      style={{
                        background: ENERGY_COLORS[grade],
                        color: ENERGY_TEXT[grade],
                      }}
                    >
                      {grade}
                    </Flex>
                  );
                })}
              </Flex>
            </Box>

            <Box as="section" mt="8" aria-labelledby="location-heading">
              <Heading as="h2" id="location-heading" size="md" mb="3">
                Location
              </Heading>
              <Box
                height="280px"
                borderRadius="lg"
                overflow="hidden"
                borderWidth="1px"
              >
                <HomeMap
                  homes={[home]}
                  center={[home.lng, home.lat]}
                  zoom={14}
                  label={`Map showing ${home.title} in ${home.district}`}
                />
              </Box>
            </Box>
          </Box>

          <Box as="aside" position={{ lg: "sticky" }} top={{ lg: "6" }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

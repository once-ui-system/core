import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Badge,
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import {
  LuArrowLeft,
  LuBath,
  LuBed,
  LuCalendar,
  LuCheck,
  LuRuler,
} from "react-icons/lu";
import { ContactForm } from "@/components/contact-form";
import { DetailMap } from "@/components/detail-map";
import { EnergyRating } from "@/components/energy-rating";
import { GalleryStrip } from "@/components/gallery-strip";
import {
  CITY,
  HOMES,
  bedsLabel,
  formatDate,
  formatPrice,
  getHome,
  isNewListing,
} from "@/lib/data";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${home.type} in ${home.district}, ${CITY}: ${bedsLabel(home.beds)}, ${home.area_m2} m², ${formatPrice(home.price)}.`,
  };
}

export default async function HomePage({ params }: { params: Params }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  return (
    <Box bg="bg.subtle" minH="100dvh">
      <Box as="header" bg="bg.panel" borderBottomWidth="1px">
        <Container maxW="6xl" py="3">
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="xl" color="teal.600">
              Haven
            </Text>
            <NextLink
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}
            >
              <LuArrowLeft aria-hidden="true" /> Back to search
            </NextLink>
          </HStack>
        </Container>
      </Box>

      <Container as="main" maxW="6xl" py={{ base: "4", md: "6" }}>
        <GalleryStrip id={home.id} title={home.title} />

        <Grid
          mt="6"
          gap="6"
          templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(0, 2fr)" }}
          alignItems="start"
        >
          <Flex direction="column" gap="6" minW="0">
            <Box>
              <HStack gap="2" wrap="wrap">
                <Badge colorPalette="teal">{home.type}</Badge>
                {isNewListing(home) && (
                  <Badge colorPalette="green" variant="solid">
                    New
                  </Badge>
                )}
              </HStack>
              <Heading as="h1" size="3xl" mt="2">
                {home.title}
              </Heading>
              <Text color="fg.muted" mt="1">
                {home.district}, {CITY} · Listed {formatDate(home.listed)}
              </Text>
              <Text fontSize="3xl" fontWeight="bold" mt="3">
                {formatPrice(home.price)}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {formatPrice(Math.round(home.price / home.area_m2))} per m²
              </Text>
            </Box>

            <Box
              as="section"
              aria-label="Key facts"
              bg="bg.panel"
              borderWidth="1px"
              rounded="lg"
              p="4"
            >
              <Grid
                as="dl"
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                }}
                gap="4"
                m="0"
              >
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuBed aria-hidden="true" />
                      <span>Bedrooms</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.beds === 0 ? "Studio" : home.beds}
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuBath aria-hidden="true" />
                      <span>Bathrooms</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.baths}
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuRuler aria-hidden="true" />
                      <span>Area</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.area_m2} m²
                  </Box>
                </Box>
                <Box>
                  <Box as="dt" color="fg.muted" fontSize="sm">
                    <HStack gap="1.5">
                      <LuCalendar aria-hidden="true" />
                      <span>Built</span>
                    </HStack>
                  </Box>
                  <Box as="dd" m="0" fontSize="xl" fontWeight="semibold">
                    {home.year}
                  </Box>
                </Box>
              </Grid>
            </Box>

            <Box as="section" aria-labelledby="features-heading">
              <Heading as="h2" size="lg" id="features-heading">
                Features
              </Heading>
              <Flex
                as="ul"
                listStyleType="none"
                m="0"
                p="0"
                mt="3"
                gap="2"
                direction="column"
              >
                {home.features.map((feature) => (
                  <HStack as="li" key={feature} gap="2">
                    <Box color="teal.600" display="flex">
                      <LuCheck aria-hidden="true" />
                    </Box>
                    <span>{feature}</span>
                  </HStack>
                ))}
              </Flex>
            </Box>

            <Box as="section" aria-labelledby="energy-heading">
              <Heading as="h2" size="lg" id="energy-heading" mb="3">
                Energy rating
              </Heading>
              <EnergyRating rating={home.energy} />
            </Box>

            <Box as="section" aria-labelledby="location-heading">
              <Heading as="h2" size="lg" id="location-heading" mb="3">
                Location
              </Heading>
              <DetailMap home={home} />
            </Box>
          </Flex>

          <Box position={{ lg: "sticky" }} top={{ lg: "4" }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Container>
    </Box>
  );
}

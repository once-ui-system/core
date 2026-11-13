import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Badge, Box, Flex, Grid, Heading, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuBath, LuBedDouble, LuCalendar, LuCheck, LuMapPin, LuMaximize } from "react-icons/lu";
import { ContactForm } from "../../../components/contact-form";
import { DetailMapLazy } from "../../../components/detail-map-lazy";
import { EnergyRating } from "../../../components/energy-rating";
import { Gallery } from "../../../components/gallery";
import { SiteHeader } from "../../../components/site-header";
import { bedsLabel, formatListed, formatPrice, getHome, HOMES, isNew } from "../../../lib/data";

export function generateStaticParams() {
  return HOMES.map((h) => ({ id: h.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found · Haven" };
  return {
    title: `${home.title}, ${home.district} · Haven`,
    description: `${bedsLabel(home.beds)}, ${home.baths} bath, ${home.area_m2} m² in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

export default async function HomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const facts: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    { icon: <LuBedDouble aria-hidden="true" />, label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { icon: <LuBath aria-hidden="true" />, label: "Bathrooms", value: String(home.baths) },
    { icon: <LuMaximize aria-hidden="true" />, label: "Area", value: `${home.area_m2} m²` },
    { icon: <LuCalendar aria-hidden="true" />, label: "Built", value: String(home.year) },
  ];

  return (
    <Box minHeight="100dvh">
      <SiteHeader />
      <Box as="main" id="main" maxWidth="1200px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
        <ChakraLink asChild fontSize="sm" color="teal.600" _dark={{ color: "teal.300" }}>
          <NextLink href="/">
            <LuArrowLeft aria-hidden="true" /> Back to all homes
          </NextLink>
        </ChakraLink>

        <Box mt={4}>
          <Gallery id={home.id} title={home.title} />
        </Box>

        <Grid
          mt={6}
          gap={{ base: 6, lg: 8 }}
          templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 380px" }}
          alignItems="start"
        >
          <Box minWidth={0}>
            <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
              <Box>
                <Heading as="h1" size={{ base: "xl", md: "2xl" }}>
                  {formatPrice(home.price)}
                </Heading>
                <Text fontSize="lg" fontWeight="medium" mt={1}>
                  {home.title}
                </Text>
                <Flex align="center" gap={1} color="fg.muted" mt={1}>
                  <LuMapPin aria-hidden="true" /> {home.district}, Lisbon
                </Flex>
              </Box>
              <HStack>
                <Badge colorPalette="teal" size="lg">
                  {home.type}
                </Badge>
                {isNew(home.listed) && (
                  <Badge colorPalette="orange" variant="solid" size="lg">
                    New
                  </Badge>
                )}
              </HStack>
            </Flex>

            <Grid
              as="dl"
              mt={5}
              gap={3}
              templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
            >
              {facts.map((f) => (
                <Box key={f.label} borderWidth="1px" rounded="lg" p={3} bg="bg.muted">
                  <Flex as="dt" align="center" gap={1.5} fontSize="sm" color="fg.muted">
                    {f.icon} {f.label}
                  </Flex>
                  <Text as="dd" fontWeight="bold" fontSize="xl" mt={1}>
                    {f.value}
                  </Text>
                </Box>
              ))}
            </Grid>
            <Text mt={3} fontSize="sm" color="fg.muted">
              Listed on {formatListed(home.listed)} · {formatPrice(Math.round(home.price / home.area_m2))} per m²
            </Text>

            <Box as="section" aria-labelledby="features-heading" mt={8}>
              <Heading as="h2" id="features-heading" size="md" mb={3}>
                Features
              </Heading>
              <Grid as="ul" listStyleType="none" gap={2} templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)" }}>
                {home.features.map((feature) => (
                  <Flex as="li" key={feature} align="center" gap={2}>
                    <Box color="teal.600" _dark={{ color: "teal.300" }}>
                      <LuCheck aria-hidden="true" />
                    </Box>
                    {feature}
                  </Flex>
                ))}
              </Grid>
            </Box>

            <Box as="section" aria-labelledby="energy-heading" mt={8}>
              <Heading as="h2" id="energy-heading" size="md" mb={3}>
                Energy rating
              </Heading>
              <EnergyRating rating={home.energy} />
            </Box>

            <Box as="section" aria-labelledby="location-heading" mt={8}>
              <Heading as="h2" id="location-heading" size="md" mb={3}>
                Location
              </Heading>
              <Box height="280px" rounded="lg" overflow="hidden" borderWidth="1px">
                <DetailMapLazy home={home} />
              </Box>
            </Box>
          </Box>

          <Box position={{ lg: "sticky" }} top={{ lg: 4 }}>
            <ContactForm homeTitle={home.title} />
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}

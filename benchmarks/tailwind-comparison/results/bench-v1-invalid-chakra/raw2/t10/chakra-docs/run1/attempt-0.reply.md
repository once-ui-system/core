Breakpoints are Chakra defaults (md = 48em). Now the final search view with a proper full-height layout, then the detail page.

```tsx components/search-view.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { LuList, LuMap } from "react-icons/lu";
import { DEFAULT_FILTERS, FilterBar, type Filters } from "@/components/filter-bar";
import { HomeCard } from "@/components/home-card";
import { SearchMapLazy } from "@/components/search-map-lazy";
import { HOMES, type Home } from "@/lib/data";

function applyFilters(homes: Home[], f: Filters): Home[] {
  const min = f.minPrice === "" ? 0 : Number(f.minPrice);
  const max = f.maxPrice === "" ? Infinity : Number(f.maxPrice);
  const beds = Number(f.minBeds);
  const list = homes.filter(
    (h) =>
      (f.type === "any" || h.type === f.type) &&
      h.price >= min &&
      h.price <= max &&
      h.beds >= beds,
  );
  const sorted = [...list];
  switch (f.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "size-asc":
      sorted.sort((a, b) => a.area_m2 - b.area_m2);
      break;
    case "size-desc":
      sorted.sort((a, b) => b.area_m2 - a.area_m2);
      break;
    default:
      sorted.sort((a, b) => b.listed.localeCompare(a.listed));
  }
  return sorted;
}

export function SearchView() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<"list" | "map">("list");

  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection of homes that were filtered out.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  const toggleSave = (id: string) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canReset = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const reset = () => setFilters(DEFAULT_FILTERS);

  const selectFromMap = (id: string | null) => {
    setSelectedId(id);
    if (id && typeof window !== "undefined" && window.matchMedia("(min-width: 48em)").matches) {
      document.getElementById(`card-${id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  return (
    <Flex direction="column" flex="1" minHeight={0}>
      <FilterBar filters={filters} onChange={setFilters} onReset={reset} canReset={canReset} />

      <Flex
        px={{ base: 4, md: 6 }}
        py={2}
        align="center"
        justify="space-between"
        gap={3}
        borderBottomWidth="1px"
        flexShrink={0}
      >
        <Heading as="h1" size="md">
          <span aria-live="polite" role="status">
            {results.length} {results.length === 1 ? "home" : "homes"} for sale in Lisbon
          </span>
        </Heading>
        <Flex display={{ base: "flex", md: "none" }} role="group" aria-label="Results view" gap={1}>
          <Button
            size="sm"
            variant={view === "list" ? "solid" : "outline"}
            colorPalette="teal"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <LuList /> List
          </Button>
          <Button
            size="sm"
            variant={view === "map" ? "solid" : "outline"}
            colorPalette="teal"
            aria-pressed={view === "map"}
            onClick={() => setView("map")}
          >
            <LuMap /> Map
          </Button>
        </Flex>
      </Flex>

      <Grid
        flex="1"
        minHeight={0}
        templateColumns={{ base: "1fr", md: "minmax(340px, 480px) 1fr", xl: "minmax(400px, 600px) 1fr" }}
      >
        <Box
          as="section"
          aria-label="Search results"
          display={{ base: view === "list" ? "block" : "none", md: "block" }}
          overflowY={{ md: "auto" }}
          p={4}
          minHeight={0}
        >
          {results.length === 0 ? (
            <Box textAlign="center" py={12} px={4}>
              <Heading as="h2" size="md" mb={2}>
                No homes match these filters
              </Heading>
              <Text color="fg.muted" mb={4}>
                Try widening the price range or lowering the bedroom count.
              </Text>
              <Button variant="outline" onClick={reset}>
                Reset filters
              </Button>
            </Box>
          ) : (
            <Grid
              as="ul"
              listStyleType="none"
              gap={4}
              templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "1fr", xl: "repeat(2, 1fr)" }}
            >
              {results.map((home) => (
                <li key={home.id}>
                  <HomeCard
                    home={home}
                    highlighted={hoveredId === home.id || selectedId === home.id}
                    saved={saved.includes(home.id)}
                    onHover={setHoveredId}
                    onToggleSave={toggleSave}
                  />
                </li>
              ))}
            </Grid>
          )}
        </Box>

        <Box
          as="section"
          aria-label="Map of results"
          display={{ base: view === "map" ? "block" : "none", md: "block" }}
          height={{ base: "70dvh", md: "auto" }}
          minHeight={{ base: "360px", md: 0 }}
          position="relative"
          borderLeftWidth={{ md: "1px" }}
        >
          <SearchMapLazy
            homes={results}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={setHoveredId}
            onSelect={selectFromMap}
          />
        </Box>
      </Grid>
    </Flex>
  );
}
```

```tsx app/page.tsx
import type { Metadata } from "next";
import { Flex } from "@chakra-ui/react";
import { SearchView } from "@/components/search-view";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Haven · Homes for sale in Lisbon",
  description: "Search apartments, houses and studios in Lisbon on a map.",
};

export default function Page() {
  return (
    <Flex direction="column" minHeight="100dvh" height={{ md: "100dvh" }}>
      <SiteHeader />
      <Flex as="main" id="main" direction="column" flex="1" minHeight={0}>
        <SearchView />
      </Flex>
    </Flex>
  );
}
```

Now the detail page pieces.

```tsx components/detail-map.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { SITE, shortPrice, type Home } from "@/lib/data";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <Map
      initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 14 }}
      mapStyle={SITE.mapStyleUrl}
      style={{ width: "100%", height: "100%" }}
      attributionControl={{ compact: true }}
      scrollZoom={false}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
        <div
          role="img"
          aria-label={`${home.title} location, ${home.district}`}
          style={{
            background: "#0f766e",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: 999,
            padding: "3px 10px",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          {shortPrice(home.price)}
        </div>
      </Marker>
    </Map>
  );
}
```

```tsx components/detail-map-lazy.tsx
"use client";

import dynamic from "next/dynamic";
import { Flex, Text } from "@chakra-ui/react";

export const DetailMapLazy = dynamic(() => import("@/components/detail-map"), {
  ssr: false,
  loading: () => (
    <Flex height="100%" align="center" justify="center" bg="bg.muted">
      <Text color="fg.muted">Loading map…</Text>
    </Flex>
  ),
});
```

```tsx components/contact-form.tsx
"use client";

import { useState } from "react";
import { Alert, Box, Button, Heading, Input, Stack, Text, Textarea } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { AGENT } from "@/lib/data";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = "Enter your name.";
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Enter a valid email address, like name@example.com.";
  if (!message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSent(false);
      const first = (["name", "email", "message"] as const).find((k) => next[k]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Box as="section" aria-labelledby="contact-heading" borderWidth="1px" rounded="lg" p={5} bg="bg">
      <Heading as="h2" id="contact-heading" size="md">
        Contact {AGENT.name}
      </Heading>
      <Text color="fg.muted" fontSize="sm" mt={1} mb={4}>
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sent && (
        <Alert.Root status="success" mb={4} role="status">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Message sent</Alert.Title>
            <Alert.Description>
              {AGENT.name} will reply about “{homeTitle}” within one working day.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Stack gap={4}>
          <Field label="Name" required invalid={!!errors.name} errorText={errors.name}>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria Santos"
            />
          </Field>
          <Field label="Email" required invalid={!!errors.email} errorText={errors.email}>
            <Input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@example.com"
            />
          </Field>
          <Field label="Message" required invalid={!!errors.message} errorText={errors.message}>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'd like to arrange a viewing this week."
            />
          </Field>
          <Button type="submit" colorPalette="teal">
            Send message
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
```

```tsx components/gallery.tsx
import { Box, Grid } from "@chakra-ui/react";
import { Placeholder } from "@/components/placeholder";

const LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export function Gallery({ id, title }: { id: string; title: string }) {
  return (
    <Box as="section" aria-label={`Photo gallery for ${title}`}>
      <Grid
        gap={2}
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        templateRows={{ md: "repeat(2, 130px)" }}
      >
        <Box gridColumn={{ base: "span 2", md: "span 2" }} gridRow={{ md: "span 2" }}>
          <Placeholder id={id} variant={0} height={{ base: "200px", md: "100%" }} label={`${title}: ${LABELS[0]} (placeholder)`} />
        </Box>
        {LABELS.slice(1).map((label, i) => (
          <Box key={label}>
            <Placeholder id={id} variant={i + 1} height={{ base: "100px", md: "100%" }} label={`${title}: ${label} (placeholder)`} />
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
```

```tsx components/energy-rating.tsx
import { Box, Flex, Text } from "@chakra-ui/react";

const SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const COLORS: Record<string, string> = {
  "A+": "#0a7d3b",
  A: "#2e9c3f",
  B: "#6aae2f",
  C: "#b5c21f",
  D: "#e3b416",
  E: "#e8861a",
  F: "#d9541f",
};

export function EnergyRating({ rating }: { rating: string }) {
  return (
    <Box>
      <Flex gap={1} role="img" aria-label={`Energy rating ${rating} on a scale from A+ (best) to F (worst)`}>
        {SCALE.map((r) => {
          const active = r === rating;
          return (
            <Flex
              key={r}
              aria-hidden="true"
              align="center"
              justify="center"
              width={active ? "52px" : "36px"}
              height={active ? "44px" : "30px"}
              alignSelf="flex-end"
              rounded="sm"
              fontWeight="bold"
              fontSize={active ? "lg" : "sm"}
              style={{
                background: COLORS[r],
                color: ["C", "D"].includes(r) ? "#1a202c" : "#ffffff",
                outline: active ? "3px solid #1a202c" : "none",
                outlineOffset: 1,
                opacity: active ? 1 : 0.55,
              }}
            >
              {r}
            </Flex>
          );
        })}
      </Flex>
      <Text fontSize="xs" color="fg.muted" mt={2}>
        Scale from A+ (most efficient) to F (least efficient).
      </Text>
    </Box>
  );
}
```

```tsx app/homes/[id]/page.tsx
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Badge, Box, Flex, Grid, Heading, HStack, Link as ChakraLink, Text } from "@chakra-ui/react";
import { LuArrowLeft, LuBath, LuBedDouble, LuCalendar, LuMapPin, LuMaximize, LuCheck } from "react-icons/lu";
import { ContactForm } from "@/components/contact-form";
import { DetailMapLazy } from "@/components/detail-map-lazy";
import { EnergyRating } from "@/components/energy-rating";
import { Gallery } from "@/components/gallery";
import { SiteHeader } from "@/components/site-header";
import { bedsLabel, formatListed, formatPrice, getHome, HOMES, isNew } from "@/lib/data";

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
```

```tsx app/homes/[id]/not-found.tsx
import NextLink from "next/link";
import { Box, Heading, Link as ChakraLink, Text } from "@chakra-ui/react";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <Box minHeight="100dvh">
      <SiteHeader />
      <Box as="main" id="main" maxWidth="600px" mx="auto" px={4} py={16} textAlign="center">
        <Heading as="h1" size="xl" mb={2}>
          We couldn’t find that home
        </Heading>
        <Text color="fg.muted" mb={4}>
          It may have been sold or taken off the market.
        </Text>
        <ChakraLink asChild color="teal.600" _dark={{ color: "teal.300" }}>
          <NextLink href="/">Back to all homes</NextLink>
        </ChakraLink>
      </Box>
    </Box>
  );
}
```
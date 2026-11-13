I have what I need. Now the detail page files.

```css
/* components/DetailMap.module.css */
.wrap {
  width: 100%;
  height: 100%;
  min-height: 260px;
  border-radius: var(--mantine-radius-md);
  overflow: hidden;
  border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.pin {
  display: block;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--mantine-color-teal-7);
  border: 2px solid #fff;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
}
```

```tsx
// components/DetailMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { MAP_STYLE_URL, formatPriceShort, type Home } from "@/lib/data";
import classes from "./DetailMap.module.css";

export default function DetailMap({ home }: { home: Home }) {
  return (
    <div className={classes.wrap}>
      <Map
        mapLib={maplibregl}
        initialViewState={{ longitude: home.lng, latitude: home.lat, zoom: 13.5 }}
        mapStyle={MAP_STYLE_URL}
        style={{ width: "100%", height: "100%", minHeight: 260 }}
        attributionControl={{ compact: true }}
        reuseMaps={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Marker longitude={home.lng} latitude={home.lat} anchor="bottom">
          <span className={classes.pin} role="img" aria-label={`${home.title} location in ${home.district}`}>
            {formatPriceShort(home.price)}
          </span>
        </Marker>
      </Map>
    </div>
  );
}
```

```tsx
// components/ContactForm.tsx
"use client";

import { useState } from "react";
import { Alert, Button, Paper, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconSend } from "@tabler/icons-react";
import { AGENT, type Home } from "@/lib/data";

interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export function ContactForm({ home }: { home: Home }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ContactValues>({
    mode: "controlled",
    initialValues: {
      name: "",
      email: "",
      message: `Hello ${AGENT.name.split(" ")[0]}, I would like to arrange a viewing of "${home.title}" in ${home.district}.`,
    },
    validate: {
      name: (v) => (v.trim().length < 2 ? "Please enter your name" : null),
      email: (v) =>
        v.trim().length === 0
          ? "Please enter your email address"
          : /^\S+@\S+\.\S+$/.test(v.trim())
            ? null
            : "Enter a valid email address, like name@example.com",
      message: (v) => (v.trim().length < 10 ? "Please write a message of at least 10 characters" : null),
    },
  });

  return (
    <Paper withBorder radius="md" p="lg" component="section" aria-labelledby="contact-heading">
      <Title order={2} fz="lg" id="contact-heading">
        Contact {AGENT.name}
      </Title>
      <Text size="sm" c="dimmed" mt={2} mb="md">
        {AGENT.agency} · {AGENT.phone}
      </Text>

      {sentTo ? (
        <Alert color="teal" icon={<IconCheck size={18} />} title="Message sent" role="status">
          Thanks, {sentTo}. {AGENT.name} will reply to you within one working day.
          <div>
            <Button mt="sm" size="xs" variant="light" color="teal" onClick={() => setSentTo(null)}>
              Send another message
            </Button>
          </div>
        </Alert>
      ) : (
        <form
          noValidate
          onSubmit={form.onSubmit((values) => {
            setSentTo(values.name.trim());
            form.reset();
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Name"
              placeholder="Your full name"
              autoComplete="name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              required
              {...form.getInputProps("email")}
            />
            <Textarea
              label="Message"
              autosize
              minRows={4}
              required
              {...form.getInputProps("message")}
            />
            <Button type="submit" color="teal" leftSection={<IconSend size={16} aria-hidden="true" />}>
              Send message
            </Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
}
```

```css
/* components/HomeDetail.module.css */
.header {
  border-bottom: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--mantine-color-teal-8);
  font-weight: 800;
  font-size: 1.25rem;
  text-decoration: none;
}

.gallery {
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 150px 150px;
  border-radius: var(--mantine-radius-md);
  overflow: hidden;
}

.galleryMain {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
}

.galleryItem {
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.galleryLabel {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 12px;
}

.galleryItemHidden {
  display: none;
}

@media (min-width: 48em) {
  .gallery {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 190px 190px;
  }

  .galleryMain {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  .galleryItemHidden {
    display: block;
  }
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--mantine-spacing-xl);
  align-items: start;
}

@media (min-width: 62em) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 380px;
  }

  .aside {
    position: sticky;
    top: 16px;
  }
}

.facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mantine-spacing-sm);
  margin: 0;
}

@media (min-width: 36em) {
  .facts {
    grid-template-columns: repeat(4, 1fr);
  }
}

.fact {
  padding: var(--mantine-spacing-sm);
  border-radius: var(--mantine-radius-md);
  border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}

.fact dt {
  font-size: var(--mantine-font-size-xs);
  color: var(--mantine-color-dimmed);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.fact dd {
  margin: 2px 0 0;
  font-weight: 700;
  font-size: var(--mantine-font-size-lg);
}

.features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.energy {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.energyStep {
  min-width: 44px;
  padding: 6px 10px;
  text-align: center;
  border-radius: 6px;
  font-weight: 700;
  color: #14213d;
  opacity: 0.55;
}

.energyStep[data-current] {
  opacity: 1;
  outline: 3px solid #14213d;
  outline-offset: 2px;
  transform: scale(1.1);
}

.mapBox {
  height: 280px;
}
```

```tsx
// components/HomeDetail.tsx
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Container,
  Group,
  Skeleton,
  Text,
  Title,
  ActionIcon,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconHeart, IconHeartFilled, IconHome2 } from "@tabler/icons-react";
import {
  AGENT,
  CITY,
  bedsLabel,
  formatDate,
  formatPrice,
  isNew,
  type Home,
} from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { Placeholder } from "./Placeholder";
import classes from "./HomeDetail.module.css";

const DetailMap = dynamic(() => import("./DetailMap"), {
  ssr: false,
  loading: () => <Skeleton h={280} radius="md" aria-label="Loading map" />,
});

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51cf66",
  B: "#94d82d",
  C: "#ffe066",
  D: "#ffc078",
  E: "#ff922b",
  F: "#fa5252",
};

const FRAMES = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Exterior"];

export function HomeDetail({ home }: { home: Home }) {
  const [saved, setSaved] = useLocalStorage<string[]>({
    key: "haven-saved-homes",
    defaultValue: [],
    getInitialValueInEffect: true,
  });
  const isSaved = saved.includes(home.id);
  const toggleSave = () =>
    setSaved((prev) => (prev.includes(home.id) ? prev.filter((x) => x !== home.id) : [...prev, home.id]));

  const facts: { label: string; value: string }[] = [
    { label: "Bedrooms", value: home.beds === 0 ? "Studio" : String(home.beds) },
    { label: "Bathrooms", value: String(home.baths) },
    { label: "Area", value: `${home.area_m2} m²` },
    { label: "Built", value: String(home.year) },
  ];

  return (
    <>
      <header className={classes.header}>
        <Container size="lg" py="sm">
          <Group justify="space-between">
            <Link href="/" className={classes.brand}>
              <IconHome2 size={26} aria-hidden="true" />
              Haven
            </Link>
            <Text size="sm" c="dimmed" visibleFrom="sm">
              Homes for sale in {CITY}
            </Text>
          </Group>
        </Container>
      </header>

      <Container component="main" size="lg" py="lg">
        <Breadcrumbs mb="md" aria-label="Breadcrumb">
          <Anchor component={Link} href="/" size="sm">
            Search
          </Anchor>
          <Anchor component={Link} href="/" size="sm">
            {home.district}
          </Anchor>
          <Text size="sm" aria-current="page">
            {home.title}
          </Text>
        </Breadcrumbs>

        <div className={classes.gallery} role="group" aria-label="Photo gallery">
          {FRAMES.map((label, i) => (
            <div
              key={label}
              className={`${classes.galleryItem} ${i === 0 ? classes.galleryMain : ""} ${
                i > 2 ? classes.galleryItemHidden : ""
              }`}
              role="img"
              aria-label={`Placeholder photo ${i + 1} of ${FRAMES.length}: ${label}`}
            >
              <Placeholder seed={home.id} variant={i} />
              <span className={classes.galleryLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={classes.layout} style={{ marginTop: "var(--mantine-spacing-xl)" }}>
          <div>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <div>
                <Group gap="xs" mb={6}>
                  <Badge color="teal" variant="light">
                    {home.type}
                  </Badge>
                  {isNew(home) && <Badge color="teal">New</Badge>}
                </Group>
                <Title order={1} fz={{ base: 26, sm: 32 }} lh={1.15}>
                  {formatPrice(home.price)}
                </Title>
                <Text fz="lg" fw={600} mt={4}>
                  {home.title}
                </Text>
                <Text c="dimmed">
                  {home.district}, {CITY} · Listed {formatDate(home.listed)}
                </Text>
              </div>
              <ActionIcon
                variant="default"
                size="xl"
                radius="xl"
                color={isSaved ? "red" : "gray"}
                aria-pressed={isSaved}
                aria-label={isSaved ? "Remove from saved homes" : "Save this home"}
                onClick={toggleSave}
              >
                {isSaved ? (
                  <IconHeartFilled size={22} color="var(--mantine-color-red-6)" />
                ) : (
                  <IconHeart size={22} />
                )}
              </ActionIcon>
            </Group>

            <Title order={2} fz="lg" mt="xl" mb="sm" id="facts-heading">
              Key facts
            </Title>
            <dl className={classes.facts} aria-labelledby="facts-heading">
              {facts.map((f) => (
                <div key={f.label} className={classes.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
            <Text size="sm" c="dimmed" mt="xs">
              {bedsLabel(home.beds)} · {Math.round(home.price / home.area_m2).toLocaleString("en-IE")} EUR per m²
            </Text>

            <Title order={2} fz="lg" mt="xl" mb="sm">
              Features
            </Title>
            <ul className={classes.features}>
              {home.features.map((feature) => (
                <li key={feature}>
                  <IconCheck size={18} color="var(--mantine-color-teal-7)" aria-hidden="true" />
                  <Text component="span">{feature}</Text>
                </li>
              ))}
            </ul>

            <Title order={2} fz="lg" mt="xl" mb="sm" id="energy-heading">
              Energy rating
            </Title>
            <ul className={classes.energy} aria-labelledby="energy-heading">
              {ENERGY_SCALE.map((grade) => (
                <li
                  key={grade}
                  className={classes.energyStep}
                  style={{ background: ENERGY_COLORS[grade] }}
                  data-current={grade === home.energy || undefined}
                  aria-current={grade === home.energy ? "true" : undefined}
                >
                  {grade}
                </li>
              ))}
            </ul>
            <Text size="sm" mt="sm">
              This home is rated <strong>{home.energy}</strong> on the energy scale (A+ is the most efficient).
            </Text>

            <Title order={2} fz="lg" mt="xl" mb="sm">
              Location
            </Title>
            <div className={classes.mapBox}>
              <DetailMap home={home} />
            </div>
            <Text size="sm" c="dimmed" mt="xs">
              {home.district}, {CITY}
            </Text>
          </div>

          <aside className={classes.aside} aria-label={`Contact ${AGENT.name}`}>
            <ContactForm home={home} />
            <Text size="xs" c="dimmed" mt="sm" ta="center">
              Or email {AGENT.email}
            </Text>
          </aside>
        </div>
      </Container>
    </>
  );
}
```

Now the routes.

```tsx
// app/page.tsx
import type { Metadata } from "next";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "Haven | Homes for sale in Lisbon",
  description: "Search apartments, houses and studios for sale in Lisbon, with prices on an interactive map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx
// app/homes/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/HomeDetail";
import { HOMES, formatPrice, getHome } from "@/lib/data";

export function generateStaticParams() {
  return HOMES.map((home) => ({ id: home.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${formatPrice(home.price)} · ${home.beds} bed · ${home.area_m2} m² in ${home.district}, Lisbon.`,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
```

One last addition: scrolling a card into view when its marker is hovered or selected, on desktop. This is the final `SearchPage.tsx`, replacing the earlier one:

```tsx
// components/SearchPage.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button, Group, Loader, NativeSelect, RangeSlider, Skeleton, Text, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconHome2, IconList, IconMap2, IconRefresh } from "@tabler/icons-react";
import {
  CITY,
  DEFAULT_FILTERS,
  HOMES,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  applyFilters,
  formatPrice,
  formatPriceShort,
  type Filters,
  type SortKey,
} from "@/lib/data";
import { HomeCard } from "./HomeCard";
import classes from "./SearchPage.module.css";

const SearchMap = dynamic(() => import("./SearchMap"), {
  ssr: false,
  loading: () => (
    <Skeleton h="100%" mih={320} radius={0} aria-label="Loading map">
      <Loader size="sm" m="md" />
    </Skeleton>
  ),
});

const TYPE_OPTIONS = [
  { value: "any", label: "Any type" },
  { value: "Apartment", label: "Apartment" },
  { value: "House", label: "House" },
  { value: "Studio", label: "Studio" },
];

const BED_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size", label: "Size: largest first" },
];

export function SearchPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const listRef = useRef<HTMLElement | null>(null);
  const [saved, setSaved] = useLocalStorage<string[]>({
    key: "haven-saved-homes",
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const savedSet = useMemo(() => new Set(saved), [saved]);
  const results = useMemo(() => applyFilters(HOMES, filters), [filters]);

  // Drop hover/selection of homes that the filters have removed.
  useEffect(() => {
    if (hoveredId && !results.some((h) => h.id === hoveredId)) setHoveredId(null);
    if (selectedId && !results.some((h) => h.id === selectedId)) setSelectedId(null);
  }, [results, hoveredId, selectedId]);

  // When a marker is hovered/selected, make sure its card is visible in the list pane (desktop).
  useEffect(() => {
    const id = selectedId ?? hoveredId;
    const pane = listRef.current;
    if (!id || !pane || pane.offsetParent === null) return;
    const card = pane.querySelector<HTMLElement>(`[data-home-id="${id}"]`);
    if (!card) return;
    const paneRect = pane.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    if (cardRect.top < paneRect.top || cardRect.bottom > paneRect.bottom) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    }
  }, [hoveredId, selectedId]);

  const toggleSave = useCallback(
    (id: string) => {
      setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setSaved],
  );

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const isDefault =
    filters.type === DEFAULT_FILTERS.type &&
    filters.minBeds === DEFAULT_FILTERS.minBeds &&
    filters.sort === DEFAULT_FILTERS.sort &&
    filters.price[0] === PRICE_MIN &&
    filters.price[1] === PRICE_MAX;

  const countLabel = `${results.length} ${results.length === 1 ? "home" : "homes"} for sale in ${CITY}`;

  return (
    <div className={classes.page}>
      <header className={classes.header}>
        <div className={classes.headerInner}>
          <Link href="/" className={classes.brand}>
            <IconHome2 size={26} aria-hidden="true" />
            Haven
          </Link>
          <Text size="sm" c="dimmed" visibleFrom="sm">
            Homes for sale in {CITY}
          </Text>
          <Text size="sm" fw={600} aria-live="polite">
            {saved.length} saved
          </Text>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <h1
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          Search homes in {CITY}
        </h1>

        <form
          className={classes.filters}
          role="search"
          aria-label="Filter homes"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className={classes.filterGrid}>
            <NativeSelect
              label="Type"
              data={TYPE_OPTIONS}
              value={filters.type}
              onChange={(e) => update("type", e.currentTarget.value)}
            />

            <div className={classes.priceField} role="group" aria-labelledby="price-label">
              <Group justify="space-between" mb={4} gap="xs">
                <Text id="price-label" size="sm" fw={500}>
                  Price range
                </Text>
                <Text size="sm" c="dimmed" aria-hidden="true">
                  {formatPrice(filters.price[0])} – {formatPrice(filters.price[1])}
                  {filters.price[1] === PRICE_MAX ? "+" : ""}
                </Text>
              </Group>
              <RangeSlider
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                minRange={PRICE_STEP}
                color="teal"
                value={filters.price}
                onChange={(v) => update("price", v)}
                label={(v) => formatPriceShort(v)}
                thumbFromLabel="Minimum price"
                thumbToLabel="Maximum price"
                thumbValueText={(v) => formatPrice(v)}
                mb={6}
                mt={10}
              />
            </div>

            <NativeSelect
              label="Min. bedrooms"
              data={BED_OPTIONS}
              value={filters.minBeds}
              onChange={(e) => update("minBeds", e.currentTarget.value)}
            />

            <NativeSelect
              label="Sort by"
              data={SORT_OPTIONS}
              value={filters.sort}
              onChange={(e) => update("sort", e.currentTarget.value as SortKey)}
            />

            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconRefresh size={16} aria-hidden="true" />}
              disabled={isDefault}
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Reset
            </Button>
          </div>
        </form>

        <div className={classes.body} data-view={view}>
          <section
            ref={listRef}
            className={classes.listPane}
            aria-labelledby="results-heading"
          >
            <Title order={2} fz="lg" id="results-heading" mb="md" aria-live="polite">
              {countLabel}
            </Title>

            {results.length > 0 ? (
              <ul className={classes.list}>
                {results.map((home) => (
                  <HomeCard
                    key={home.id}
                    home={home}
                    active={hoveredId === home.id || selectedId === home.id}
                    saved={savedSet.has(home.id)}
                    onToggleSave={toggleSave}
                    onHover={setHoveredId}
                  />
                ))}
              </ul>
            ) : (
              <div className={classes.emptyState}>
                <Text fw={600}>No homes match your filters</Text>
                <Text size="sm" c="dimmed" mt={4} mb="md">
                  Try widening the price range or lowering the minimum bedrooms.
                </Text>
                <Button variant="light" color="teal" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          <section className={classes.mapPane} aria-label={`Map of homes in ${CITY}`}>
            <SearchMap
              homes={results}
              hoveredId={hoveredId}
              selectedId={selectedId}
              savedIds={savedSet}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              resizeKey={view}
            />
          </section>
        </div>

        <div className={classes.toggleBar}>
          <Button
            radius="xl"
            size="md"
            color="dark"
            leftSection={
              view === "list" ? (
                <IconMap2 size={18} aria-hidden="true" />
              ) : (
                <IconList size={18} aria-hidden="true" />
              )
            }
            onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
          >
            {view === "list" ? "Show map" : "Show list"}
          </Button>
        </div>
      </main>
    </div>
  );
}
```
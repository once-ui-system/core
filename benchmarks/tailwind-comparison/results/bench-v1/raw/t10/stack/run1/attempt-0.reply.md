Now the final SearchMap with a resize observer, then the detail page, contact form, pages and metadata.

```tsx src/components/haven/SearchMap.tsx
"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "./haven.css";

import { Column, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { Map as MapGL, Marker, Popup, type MapRef } from "react-map-gl/maplibre";
import {
  bedsLabel,
  formatPrice,
  formatPriceShort,
  type Home,
  listings,
} from "@/lib/data";
import { Placeholder } from "./Placeholder";

type Props = {
  homes: Home[];
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export default function SearchMap({
  homes,
  highlightedId,
  onHighlight,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const fit = useCallback(
    (duration: number) => {
      const map = mapRef.current;
      if (!map || homes.length === 0) return;
      const lngs = homes.map((h) => h.lng);
      const lats = homes.map((h) => h.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 64, maxZoom: 14, duration },
      );
    },
    [homes],
  );

  // Refit when the filtered set changes.
  useEffect(() => {
    fit(500);
  }, [fit]);

  // The map column is display:none on phones in list view; resize and refit
  // when it becomes visible.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width > 0 && lastWidth === 0) {
        mapRef.current?.resize();
        fit(0);
      }
      lastWidth = width;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fit]);

  const selected = homes.find((h) => h.id === selectedId) ?? null;

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: listings.map_center[0],
          latitude: listings.map_center[1],
          zoom: 11.3,
        }}
        mapStyle={listings.map_style_url}
        style={{ width: "100%", height: "100%" }}
        attributionControl={{ compact: true }}
        onClick={() => onSelect(null)}
        onLoad={() => fit(0)}
      >
        {homes.map((home) => {
          const active = home.id === highlightedId || home.id === selectedId;
          return (
            <Marker
              key={home.id}
              longitude={home.lng}
              latitude={home.lat}
              anchor="center"
              style={{ zIndex: active ? 5 : 1 }}
            >
              <button
                type="button"
                className="haven-marker"
                data-active={active}
                aria-label={`${home.title}, ${formatPrice(home.price)}`}
                aria-pressed={home.id === selectedId}
                onMouseEnter={() => onHighlight(home.id)}
                onMouseLeave={() => onHighlight(null)}
                onFocus={() => onHighlight(home.id)}
                onBlur={() => onHighlight(null)}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(home.id);
                }}
              >
                {formatPriceShort(home.price)}
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            offset={22}
            maxWidth="260px"
            className="haven-popup"
            closeOnClick={false}
            onClose={() => onSelect(null)}
          >
            <Column style={{ width: 240 }}>
              <div style={{ height: 90 }}>
                <Placeholder seed={selected.id} />
              </div>
              <Column padding="12" gap="4">
                <Text variant="label-strong-m">{formatPrice(selected.price)}</Text>
                <Text variant="body-default-s">{selected.title}</Text>
                <Row gap="8" wrap>
                  <Text variant="body-default-xs" onBackground="neutral-weak">
                    {bedsLabel(selected.beds)} · {selected.area_m2} m² · {selected.district}
                  </Text>
                </Row>
                <Link
                  href={`/homes/${selected.id}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand-on-background-strong)",
                    marginTop: 4,
                  }}
                >
                  View home
                </Link>
              </Column>
            </Column>
          </Popup>
        )}
      </MapGL>
    </div>
  );
}
```

```tsx src/components/haven/ContactForm.tsx
"use client";

import "./haven.css";

import { Button, Column, Text } from "@once-ui-system/core";
import { type FormEvent, useState } from "react";
import { listings } from "@/lib/data";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Enter a valid email, like name@example.com.";
  if (!values.message.trim()) errors.message = "Write a short message for the agent.";
  return errors;
}

export function ContactForm({ homeTitle }: { homeTitle: string }) {
  const [values, setValues] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function update<K extends keyof Fields>(key: K, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (errors[key]) setErrors({ ...errors, [key]: validate(next)[key] });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Fields)[])[0];
    if (first) {
      document.getElementById(`c-${first}`)?.focus();
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Column gap="12" role="status" aria-live="polite">
        <Text variant="heading-strong-m">Message sent</Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          Thanks, {values.name.trim()}. {listings.agent.name} will reply to {values.email.trim()}{" "}
          about “{homeTitle}”, usually within one working day.
        </Text>
        <Button
          variant="secondary"
          size="s"
          onClick={() => {
            setValues({ name: "", email: "", message: "" });
            setSent(false);
          }}
        >
          Send another message
        </Button>
      </Column>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={`Contact ${listings.agent.name}`}>
      <Column gap="16">
        <div className="haven-field">
          <label htmlFor="c-name">Name</label>
          <input
            id="c-name"
            className="haven-input"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "c-name-err" : undefined}
          />
          {errors.name && (
            <span id="c-name-err" className="haven-error" role="alert">
              {errors.name}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-email">Email</label>
          <input
            id="c-email"
            className="haven-input"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "c-email-err" : undefined}
          />
          {errors.email && (
            <span id="c-email-err" className="haven-error" role="alert">
              {errors.email}
            </span>
          )}
        </div>
        <div className="haven-field">
          <label htmlFor="c-message">Message</label>
          <textarea
            id="c-message"
            className="haven-textarea"
            required
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "c-message-err" : undefined}
            placeholder="I would like to arrange a viewing…"
          />
          {errors.message && (
            <span id="c-message-err" className="haven-error" role="alert">
              {errors.message}
            </span>
          )}
        </div>
        <Button type="submit" fillWidth>
          Send message
        </Button>
      </Column>
    </form>
  );
}
```

```tsx src/components/haven/HomeDetail.tsx
import "./haven.css";

import { Badge, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import {
  bedsLabel,
  formatPrice,
  type Home,
  isNew,
  listings,
} from "@/lib/data";
import { ContactForm } from "./ContactForm";
import { MiniMapLoader } from "./MiniMapLoader";
import { Placeholder } from "./Placeholder";

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#1b7f3b",
  A: "#2f9e44",
  B: "#74b816",
  C: "#c4a000",
  D: "#e8890c",
  E: "#d9480f",
  F: "#c92a2a",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Column gap="4" background="surface" border radius="m" padding="16">
      <Text variant="label-default-xs" onBackground="neutral-weak">
        {label}
      </Text>
      <Text variant="heading-strong-m">{value}</Text>
    </Column>
  );
}

export function HomeDetail({ home }: { home: Home }) {
  const perM2 = Math.round(home.price / home.area_m2);

  return (
    <Column as="main" id="main" fillWidth horizontal="center" paddingX="16" paddingY="24">
      <Column fillWidth maxWidth={80} gap="24">
        <Row>
          <Button href="/" variant="tertiary" size="s" prefixIcon="chevronLeft">
            Back to search
          </Button>
        </Row>

        <div className="haven-gallery" role="group" aria-label={`Photos of ${home.title} (illustrated placeholders)`}>
          {[0, 1, 2, 3, 4].slice(0, 5).map((i) => (
            <div key={i} style={{ position: "relative" }}>
              <Placeholder seed={home.id} shift={i} label={`Placeholder photo ${i + 1} of 5`} />
            </div>
          ))}
        </div>

        <div className="haven-detail">
          <Column gap="32" minWidth={0}>
            <Column gap="12">
              <Row gap="12" vertical="center" wrap>
                <Text variant="label-default-s" onBackground="brand-medium">
                  {home.type} · {home.district}, {listings.city}
                </Text>
                {isNew(home) && (
                  <Badge effect={false} icon="sparkle">
                    New this week
                  </Badge>
                )}
              </Row>
              <Heading as="h1" variant="display-strong-xs">
                {home.title}
              </Heading>
              <Row gap="16" vertical="end" wrap>
                <Text variant="display-strong-s">{formatPrice(home.price)}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {formatPrice(perM2)} per m²
                </Text>
              </Row>
            </Column>

            <Grid columns="2" m={{ columns: 4 }} gap="12" aria-label="Key facts" as="section">
              <Fact label="Bedrooms" value={bedsLabel(home.beds)} />
              <Fact label="Bathrooms" value={String(home.baths)} />
              <Fact label="Area" value={`${home.area_m2} m²`} />
              <Fact label="Built" value={String(home.year)} />
            </Grid>

            <Column as="section" gap="12" aria-labelledby="features-h">
              <Heading as="h2" id="features-h" variant="heading-strong-l">
                Features
              </Heading>
              <ul style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: 0, margin: 0, listStyle: "none" }}>
                {home.features.map((feature) => (
                  <li key={feature}>
                    <Row
                      background="neutral-alpha-weak"
                      radius="full"
                      paddingX="12"
                      paddingY="8"
                      gap="8"
                      vertical="center"
                    >
                      <Text variant="label-default-s">{feature}</Text>
                    </Row>
                  </li>
                ))}
              </ul>
            </Column>

            <Column as="section" gap="12" aria-labelledby="energy-h">
              <Heading as="h2" id="energy-h" variant="heading-strong-l">
                Energy rating
              </Heading>
              <div
                className="haven-energy"
                role="img"
                aria-label={`Energy rating ${home.energy} on a scale from A+ (best) to F`}
              >
                {ENERGY_SCALE.map((grade, index) => (
                  <span
                    key={grade}
                    data-on={grade === home.energy}
                    style={{
                      background: ENERGY_COLORS[grade],
                      height: 28 + (ENERGY_SCALE.length - index) * 4,
                    }}
                  >
                    {grade}
                  </span>
                ))}
              </div>
              <Text variant="body-default-s" onBackground="neutral-weak">
                This home is rated {home.energy}. A+ is the most efficient, F the least.
              </Text>
            </Column>

            <Column as="section" gap="12" aria-labelledby="loc-h">
              <Heading as="h2" id="loc-h" variant="heading-strong-l">
                Location
              </Heading>
              <MiniMapLoader home={home} />
              <Text variant="body-default-s" onBackground="neutral-weak">
                {home.district}, {listings.city}
              </Text>
            </Column>
          </Column>

          <aside className="haven-detail__aside" aria-label="Contact the agent">
            <Column background="surface" border radius="l" padding="24" gap="20">
              <Column gap="4">
                <Heading as="h2" variant="heading-strong-l">
                  Contact the agent
                </Heading>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {listings.agent.name}, {listings.agent.agency}
                </Text>
                <Row gap="16" wrap>
                  <Link
                    href={`tel:${listings.agent.phone.replace(/\s/g, "")}`}
                    style={{ fontSize: 14, color: "var(--brand-on-background-strong)" }}
                  >
                    {listings.agent.phone}
                  </Link>
                  <Link
                    href={`mailto:${listings.agent.email}`}
                    style={{ fontSize: 14, color: "var(--brand-on-background-strong)" }}
                  >
                    {listings.agent.email}
                  </Link>
                </Row>
              </Column>
              <ContactForm homeTitle={home.title} />
            </Column>
          </aside>
        </div>
      </Column>
    </Column>
  );
}
```

```tsx src/app/page.tsx
import type { Metadata } from "next";
import { SearchPage } from "@/components/haven/SearchPage";

export const metadata: Metadata = {
  title: "Haven: homes for sale in Lisbon",
  description:
    "Search apartments, houses and studios for sale in Lisbon. Filter by type, price and bedrooms, and see every home on the map.",
};

export default function Page() {
  return <SearchPage />;
}
```

```tsx src/app/homes/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeDetail } from "@/components/haven/HomeDetail";
import { formatPrice, getHome, listings } from "@/lib/data";

type Params = { id: string };

export function generateStaticParams(): Params[] {
  return listings.homes.map((home) => ({ id: home.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const home = getHome(id);
  if (!home) return { title: "Home not found | Haven" };
  return {
    title: `${home.title}, ${home.district} | Haven`,
    description: `${home.type} in ${home.district}, ${listings.city}: ${home.beds === 0 ? "studio" : `${home.beds} bedrooms`}, ${home.area_m2} m², ${formatPrice(home.price)}.`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();
  return <HomeDetail home={home} />;
}
```

One adjustment: `src/lib/data.ts` references `React.CSSProperties` without importing React, so I'm replacing that file with a typed import.

```ts src/lib/data.ts
import type { CSSProperties } from "react";

export type HomeType = "Apartment" | "House" | "Studio";

export type Home = {
  id: string;
  title: string;
  type: HomeType;
  price: number;
  beds: number;
  baths: number;
  area_m2: number;
  district: string;
  lat: number;
  lng: number;
  year: number;
  energy: string;
  features: string[];
  listed: string;
};

export const listings = {
  site: "Haven, a home search site for one city",
  city: "Lisbon",
  map_style_url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  map_center: [-9.1393, 38.7223] as [number, number],
  currency: "EUR",
  agent: {
    name: "Inês Carvalho",
    agency: "Haven Homes",
    phone: "+351 210 000 123",
    email: "ines@havenhomes.example",
  },
  homes: [
    {
      id: "h-101",
      title: "Sunlit flat with river view",
      type: "Apartment",
      price: 485000,
      beds: 2,
      baths: 1,
      area_m2: 84,
      district: "Alfama",
      lat: 38.7114,
      lng: -9.1305,
      year: 1962,
      energy: "C",
      features: ["Balcony", "River view", "Renovated kitchen"],
      listed: "2026-10-21",
    },
    {
      id: "h-102",
      title: "Family house with garden",
      type: "House",
      price: 895000,
      beds: 4,
      baths: 3,
      area_m2: 210,
      district: "Restelo",
      lat: 38.7037,
      lng: -9.2129,
      year: 1988,
      energy: "B",
      features: ["Garden", "Garage", "Fireplace"],
      listed: "2026-10-18",
    },
    {
      id: "h-103",
      title: "Compact studio near the metro",
      type: "Studio",
      price: 219000,
      beds: 0,
      baths: 1,
      area_m2: 31,
      district: "Arroios",
      lat: 38.7316,
      lng: -9.1358,
      year: 1975,
      energy: "D",
      features: ["Metro 2 min", "Furnished"],
      listed: "2026-10-29",
    },
    {
      id: "h-104",
      title: "Loft in a converted warehouse",
      type: "Apartment",
      price: 640000,
      beds: 2,
      baths: 2,
      area_m2: 120,
      district: "Marvila",
      lat: 38.7486,
      lng: -9.1031,
      year: 2019,
      energy: "A",
      features: ["High ceilings", "Terrace", "Parking"],
      listed: "2026-10-11",
    },
    {
      id: "h-105",
      title: "Classic flat with tiled facade",
      type: "Apartment",
      price: 529000,
      beds: 3,
      baths: 2,
      area_m2: 112,
      district: "Campo de Ourique",
      lat: 38.7181,
      lng: -9.1662,
      year: 1940,
      energy: "C",
      features: ["Original tiles", "Lift", "Storage room"],
      listed: "2026-10-25",
    },
    {
      id: "h-106",
      title: "Penthouse with rooftop pool",
      type: "Apartment",
      price: 1450000,
      beds: 3,
      baths: 3,
      area_m2: 168,
      district: "Avenidas Novas",
      lat: 38.7392,
      lng: -9.1467,
      year: 2021,
      energy: "A",
      features: ["Rooftop pool", "Concierge", "2 parking spaces"],
      listed: "2026-10-02",
    },
    {
      id: "h-107",
      title: "Townhouse on a quiet lane",
      type: "House",
      price: 735000,
      beds: 3,
      baths: 2,
      area_m2: 156,
      district: "Graça",
      lat: 38.7176,
      lng: -9.1295,
      year: 1910,
      energy: "D",
      features: ["Patio", "Restored beams"],
      listed: "2026-10-27",
    },
    {
      id: "h-108",
      title: "Two-bed flat by the park",
      type: "Apartment",
      price: 412000,
      beds: 2,
      baths: 1,
      area_m2: 78,
      district: "Alvalade",
      lat: 38.753,
      lng: -9.1445,
      year: 1958,
      energy: "C",
      features: ["Park view", "Lift"],
      listed: "2026-10-30",
    },
    {
      id: "h-109",
      title: "Riverside new build",
      type: "Apartment",
      price: 780000,
      beds: 3,
      baths: 2,
      area_m2: 131,
      district: "Parque das Nações",
      lat: 38.7681,
      lng: -9.0947,
      year: 2024,
      energy: "A+",
      features: ["Gym", "Pool", "Concierge"],
      listed: "2026-10-15",
    },
    {
      id: "h-110",
      title: "Bright studio with mezzanine",
      type: "Studio",
      price: 265000,
      beds: 1,
      baths: 1,
      area_m2: 42,
      district: "Bairro Alto",
      lat: 38.7127,
      lng: -9.145,
      year: 1900,
      energy: "E",
      features: ["Mezzanine", "Central"],
      listed: "2026-10-22",
    },
    {
      id: "h-111",
      title: "Villa with sea glimpse",
      type: "House",
      price: 1290000,
      beds: 5,
      baths: 4,
      area_m2: 290,
      district: "Belém",
      lat: 38.6979,
      lng: -9.2063,
      year: 2001,
      energy: "B",
      features: ["Pool", "Garden", "Sea glimpse"],
      listed: "2026-09-30",
    },
    {
      id: "h-112",
      title: "Renovated flat near the market",
      type: "Apartment",
      price: 455000,
      beds: 2,
      baths: 2,
      area_m2: 89,
      district: "Cais do Sodré",
      lat: 38.7066,
      lng: -9.1442,
      year: 1930,
      energy: "C",
      features: ["Renovated", "Air conditioning"],
      listed: "2026-10-28",
    },
  ] as Home[],
};

/** The site's "today": fixed so server and client agree on what is new. */
export const REFERENCE_DATE = "2026-10-31";

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSinceListed(home: Home): number {
  const ref = Date.parse(`${REFERENCE_DATE}T00:00:00Z`);
  const listed = Date.parse(`${home.listed}T00:00:00Z`);
  return Math.floor((ref - listed) / DAY_MS);
}

export function isNew(home: Home): boolean {
  return daysSinceListed(home) <= 7;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: listings.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Short price for map markers: 485k, 1.45M. */
export function formatPriceShort(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${Number.isInteger(m) ? m : m.toFixed(2).replace(/0$/, "")}M`;
  }
  return `€${Math.round(value / 1000)}k`;
}

export function bedsLabel(beds: number): string {
  return beds === 0 ? "Studio" : `${beds} bed${beds === 1 ? "" : "s"}`;
}

export function getHome(id: string): Home | undefined {
  return listings.homes.find((h) => h.id === id);
}

/** Deterministic hue pair so every home gets its own CSS placeholder. */
export function placeholderStyle(seed: string, shift = 0): CSSProperties {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  const h1 = (hash + shift * 37) % 360;
  const h2 = (h1 + 48) % 360;
  return {
    background: `linear-gradient(135deg, hsl(${h1} 38% 62%) 0%, hsl(${h2} 42% 46%) 100%)`,
  };
}
```
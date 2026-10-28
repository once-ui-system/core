"use client";

import { Avatar, Button, Column, Row, Tag, Text } from "@once-ui-system/core";
import {
  type LngLat,
  // biome-ignore lint/suspicious/noShadowRestrictedNames: the docs show the component under its own name
  Map,
  MapCircle,
  MapMarker,
  MapMarkers,
  MapPin,
  MapPopup,
  type MapViewport,
} from "@once-ui-system/core/map";
import { useMemo, useState } from "react";

const BUDAPEST: LngLat = [19.0402, 47.4979];

interface Listing {
  id: string;
  position: LngLat;
  price: number;
  title: string;
  rooms: number;
}

// A fixed scatter around Budapest, so the page draws the same map each time.
function listingsAround([lng, lat]: LngLat, count: number): Listing[] {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const streets = ["Andrássy út", "Király utca", "Bartók Béla út", "Váci utca", "Dob utca"];
  return Array.from({ length: count }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const distance = random() ** 1.6 * 0.07;
    return {
      id: `listing-${index}`,
      position: [lng + Math.cos(angle) * distance * 1.5, lat + Math.sin(angle) * distance],
      price: Math.round(40 + random() * 160) * 1_000_000,
      title: `${streets[index % streets.length]} ${Math.round(random() * 90) + 1}`,
      rooms: 1 + Math.floor(random() * 4),
    };
  });
}

const price = (value: number) =>
  `${(value / 1_000_000).toLocaleString("en", { maximumFractionDigits: 0 })}M Ft`;

export function MapBasicExample() {
  return (
    <Map height={384} defaultViewport={{ center: BUDAPEST, zoom: 12 }} labels={{ map: "Budapest" }}>
      <MapMarker position={BUDAPEST} />
    </Map>
  );
}

export function MapListingsExample() {
  const listings = useMemo(() => listingsAround(BUDAPEST, 60), []);
  const [hovered, setHovered] = useState<string>();
  const [open, setOpen] = useState<Listing>();

  return (
    <Map
      height={512}
      bounds={listings.map((listing) => listing.position)}
      labels={{ map: "Listings" }}
    >
      <MapMarkers
        items={listings}
        cluster
        activeId={hovered ?? open?.id}
        renderItem={(listing) => (
          <MapPin
            active={listing.id === (hovered ?? open?.id)}
            onClick={() => setOpen(listing)}
            onMouseEnter={() => setHovered(listing.id)}
            onMouseLeave={() => setHovered(undefined)}
            aria-label={`${listing.title}, ${price(listing.price)}`}
          >
            {price(listing.price)}
          </MapPin>
        )}
      />
      {open && (
        <MapPopup position={open.position} onClose={() => setOpen(undefined)}>
          <Text textVariant="label-strong-m">{open.title}</Text>
          <Row gap="8" vertical="center">
            <Tag size="s">
              {open.rooms} {open.rooms === 1 ? "room" : "rooms"}
            </Tag>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {price(open.price)}
            </Text>
          </Row>
          <Button size="s" variant="secondary" fillWidth>
            View listing
          </Button>
        </MapPopup>
      )}
    </Map>
  );
}

const VENUES = [
  { id: "a", name: "Ada", position: [19.0559, 47.5068] as LngLat },
  { id: "b", name: "Bori", position: [19.0368, 47.4925] as LngLat },
  { id: "c", name: "Csaba", position: [19.0703, 47.4893] as LngLat },
];

export function MapAvatarExample() {
  return (
    <Map height={384} bounds={VENUES.map((venue) => venue.position)} controls={false}>
      {VENUES.map((venue) => (
        <MapMarker key={venue.id} position={venue.position} anchor="center">
          <Avatar size="m" value={venue.name.slice(0, 1)} aria-label={venue.name} />
        </MapMarker>
      ))}
    </Map>
  );
}

export function MapAreaExample() {
  return (
    <Map height={384} defaultViewport={{ center: [19.0545, 47.5065], zoom: 14 }}>
      <MapCircle position={[19.0545, 47.5065]} radius={400} />
    </Map>
  );
}

export function MapControlledExample() {
  const [viewport, setViewport] = useState<MapViewport>({ center: BUDAPEST, zoom: 11 });
  const places: { label: string; position: LngLat }[] = [
    { label: "Parliament", position: [19.0457, 47.507] },
    { label: "Gellért Hill", position: [19.0466, 47.4865] },
    { label: "City Park", position: [19.0827, 47.5143] },
  ];
  return (
    <Column fillWidth gap="12">
      <Row gap="8" wrap>
        {places.map((place) => (
          <Button
            key={place.label}
            size="s"
            variant="secondary"
            onClick={() => setViewport({ center: place.position, zoom: 15 })}
          >
            {place.label}
          </Button>
        ))}
      </Row>
      <Map height={384} viewport={viewport} onViewportChange={setViewport}>
        {places.map((place) => (
          <MapMarker key={place.label} position={place.position}>
            <MapPin color="accent" aria-label={place.label} />
          </MapMarker>
        ))}
      </Map>
      <Text textVariant="label-default-s" onBackground="neutral-weak">
        {viewport.center.map((value) => value.toFixed(4)).join(", ")} · zoom{" "}
        {viewport.zoom.toFixed(1)}
      </Text>
    </Column>
  );
}

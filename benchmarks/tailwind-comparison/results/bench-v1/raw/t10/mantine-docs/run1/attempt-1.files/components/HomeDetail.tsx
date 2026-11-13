"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Container,
  Group,
  Skeleton,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconCheck, IconHeart, IconHeartFilled, IconHome2 } from "@tabler/icons-react";
import { AGENT, CITY, bedsLabel, formatDate, formatPrice, isNew, type Home } from "@/lib/data";
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
        <Breadcrumbs mb="md">
          <Anchor component={Link} href="/" size="sm">
            Search
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

        <div className={classes.layout}>
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

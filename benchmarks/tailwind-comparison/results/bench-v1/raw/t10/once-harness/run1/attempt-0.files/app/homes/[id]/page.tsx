import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { ContactForm } from "@/components/ContactForm";
import DetailMap from "@/components/DetailMapLoader";
import { DetailSave } from "@/components/DetailSave";
import { SiteHeader } from "@/components/SiteHeader";
import styles from "@/components/haven.module.css";
import {
  AGENT,
  HOMES,
  bathsLabel,
  bedsLabel,
  formatListed,
  formatPrice,
  getHome,
  isNew,
} from "@/lib/data";
import { placeholderStyle } from "@/lib/placeholder";

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
  if (!home) return { title: "Home not found — Haven" };
  return {
    title: `${home.title}, ${home.district} — Haven`,
    description: `${bedsLabel(home.beds)}, ${home.area_m2} m² ${home.type.toLowerCase()} in ${home.district}, Lisbon for ${formatPrice(home.price)}.`,
  };
}

const ENERGY_SCALE = ["A+", "A", "B", "C", "D", "E", "F"];
const ENERGY_COLORS: Record<string, string> = {
  "A+": "#2f9e44",
  A: "#51b25a",
  B: "#8fcf5a",
  C: "#d3e04f",
  D: "#f5cf47",
  E: "#f59f3d",
  F: "#e8590c",
};

const GALLERY_LABELS = ["Living room", "Kitchen", "Bedroom", "Bathroom", "Outdoor"];

function galleryStyle(id: string, i: number): CSSProperties {
  return placeholderStyle(id, i + 1);
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fact}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function HomeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const home = getHome(id);
  if (!home) notFound();

  const pricePerM2 = Math.round(home.price / home.area_m2);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Column fillWidth horizontal="center" paddingX="16" paddingY="24">
          <Column fillWidth gap="24" style={{ maxWidth: "72rem" }}>
            <Link href="/" className={styles.backLink}>
              <span aria-hidden="true">←</span> Back to search
            </Link>

            <ul className={styles.gallery} aria-label="Photo gallery">
              {GALLERY_LABELS.map((label, i) => (
                <li key={label} className={styles.galleryItem}>
                  <div
                    className={styles.galleryFill}
                    style={galleryStyle(home.id, i)}
                    role="img"
                    aria-label={`${label} (placeholder image)`}
                  >
                    <span className={styles.photoLabel}>{label}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.detailLayout}>
              <Column gap="32" fillWidth>
                <Column gap="12">
                  <Row gap="8" wrap vertical="center">
                    <Tag label={home.type} size="s" />
                    {isNew(home) ? <Tag label="New this week" tone="brand" size="s" /> : null}
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatListed(home.listed)}
                    </Text>
                  </Row>
                  <Heading as="h1" textVariant="display-strong-xs">
                    {home.title}
                  </Heading>
                  <Text textVariant="body-default-m" onBackground="neutral-weak">
                    {home.district}, Lisbon
                  </Text>
                  <Row gap="16" vertical="center" wrap>
                    <Text as="p" textVariant="display-strong-xs">
                      {formatPrice(home.price)}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {formatPrice(pricePerM2)} per m²
                    </Text>
                    <DetailSave id={home.id} title={home.title} />
                  </Row>
                </Column>

                <section aria-labelledby="facts-h">
                  <Heading as="h2" id="facts-h" textVariant="heading-strong-l" marginBottom="12">
                    Key facts
                  </Heading>
                  <dl className={styles.factGrid}>
                    <Fact label="Bedrooms" value={home.beds === 0 ? "Studio" : String(home.beds)} />
                    <Fact label="Bathrooms" value={String(home.baths)} />
                    <Fact label="Area" value={`${home.area_m2} m²`} />
                    <Fact label="Built" value={String(home.year)} />
                    <Fact label="Type" value={home.type} />
                    <Fact label="Energy" value={home.energy} />
                  </dl>
                  <Text as="p" onBackground="neutral-weak" marginTop="12" textVariant="body-default-s">
                    {bedsLabel(home.beds)} · {bathsLabel(home.baths)} · {home.area_m2} m²
                  </Text>
                </section>

                <section aria-labelledby="features-h">
                  <Heading as="h2" id="features-h" textVariant="heading-strong-l" marginBottom="12">
                    Features
                  </Heading>
                  <ul className={styles.featureList}>
                    {home.features.map((f) => (
                      <li key={f} className={styles.featureItem}>
                        <span aria-hidden="true">✓</span>
                        <Text textVariant="body-default-m">{f}</Text>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-labelledby="energy-h">
                  <Heading as="h2" id="energy-h" textVariant="heading-strong-l" marginBottom="12">
                    Energy rating
                  </Heading>
                  <ul
                    className={styles.energyScale}
                    aria-label={`Energy rating ${home.energy} on a scale from A+ to F`}
                  >
                    {ENERGY_SCALE.map((grade) => {
                      const active = grade === home.energy;
                      return (
                        <li
                          key={grade}
                          className={`${styles.energyStep} ${active ? styles.energyStepActive : ""}`}
                          style={{ background: ENERGY_COLORS[grade] }}
                          aria-current={active ? "true" : undefined}
                        >
                          {grade}
                        </li>
                      );
                    })}
                  </ul>
                  <Text as="p" onBackground="neutral-weak" marginTop="8" textVariant="body-default-s">
                    This home is rated {home.energy}. A+ is the most efficient, F the least.
                  </Text>
                </section>

                <section aria-labelledby="location-h">
                  <Heading as="h2" id="location-h" textVariant="heading-strong-l" marginBottom="12">
                    Location
                  </Heading>
                  <div
                    className={styles.smallMap}
                    role="region"
                    aria-label={`Map showing ${home.district}`}
                  >
                    <DetailMap home={home} />
                  </div>
                </section>
              </Column>

              <aside className={styles.stickyAside} aria-labelledby="contact-h">
                <Column background="surface" border radius="l" padding="24" gap="16">
                  <Column gap="4">
                    <Heading as="h2" id="contact-h" textVariant="heading-strong-l">
                      Contact the agent
                    </Heading>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.name}, {AGENT.agency}
                    </Text>
                    <Text textVariant="body-default-s" onBackground="neutral-weak">
                      {AGENT.phone} · {AGENT.email}
                    </Text>
                  </Column>
                  <ContactForm homeTitle={home.title} />
                </Column>
              </aside>
            </div>
          </Column>
        </Column>
      </main>
    </>
  );
}

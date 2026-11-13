import "./haven.css";

import { Badge, Button, Column, Heading, Row, Text } from "@once-ui-system/core";
import Link from "next/link";
import { bedsLabel, formatPrice, type Home, isNew, listings } from "@/lib/data";
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

        <div
          className="haven-gallery"
          role="group"
          aria-label={`Photos of ${home.title} (illustrated placeholders)`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
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

            <section className="haven-facts" aria-label="Key facts">
              <Fact label="Bedrooms" value={bedsLabel(home.beds)} />
              <Fact label="Bathrooms" value={String(home.baths)} />
              <Fact label="Area" value={`${home.area_m2} m²`} />
              <Fact label="Built" value={String(home.year)} />
            </section>

            <Column as="section" gap="12" aria-labelledby="features-h">
              <Heading as="h2" id="features-h" variant="heading-strong-l">
                Features
              </Heading>
              <ul
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  padding: 0,
                  margin: 0,
                  listStyle: "none",
                }}
              >
                {home.features.map((feature) => (
                  <li key={feature}>
                    <Row
                      background="neutral-alpha-weak"
                      radius="full"
                      paddingX="12"
                      paddingY="8"
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

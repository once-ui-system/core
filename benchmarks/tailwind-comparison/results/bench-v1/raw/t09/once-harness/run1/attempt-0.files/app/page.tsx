import { Background, Button, Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { FeatureSection } from "../components/FeatureSection";
import { SiteShell } from "../components/SiteShell";
import { brand, features, logos } from "../lib/data";

export default function HomePage() {
  return (
    <SiteShell>
      {/* Hero */}
      <Column
        as="section"
        aria-labelledby="hero-title"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingY="104"
      >
        <Background
          position="absolute"
          top="0"
          left="0"
          fill
          pointerEvents="none"
          gradient={{
            display: true,
            colorStart: "brand-alpha-medium",
            colorEnd: "static-transparent",
            x: "50%",
            y: 0,
            width: "150%",
            height: "80%",
            opacity: 50,
          }}
          dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
        />
        <Column zIndex={1} horizontal="center" gap="24" maxWidth="48rem">
          <Text textVariant="label-default-s" onBackground="brand-medium">
            Analytics + issues for small teams
          </Text>
          <Heading as="h1" id="hero-title" textVariant="display-strong-l" align="center">
            {brand.tagline}
          </Heading>
          <Text as="p" textVariant="body-default-l" onBackground="neutral-weak" align="center">
            Lumen puts what your users do and what your team owes them in one calm place, so the
            whole team sees the same picture every week.
          </Text>
          <Row gap="12" horizontal="center" wrap marginTop="8">
            <Button href="/pricing" size="l" arrowIcon data-border="rounded">
              Start for free
            </Button>
            <Button href="/#features" size="l" variant="secondary" data-border="rounded">
              See how it works
            </Button>
          </Row>
        </Column>
      </Column>

      {/* Customer logos, as text */}
      <Column
        as="section"
        id="customers"
        aria-labelledby="customers-title"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingBottom="104"
      >
        <Column maxWidth="l" gap="24" horizontal="center">
          <Text
            as="h2"
            id="customers-title"
            textVariant="label-default-s"
            onBackground="neutral-weak"
            align="center"
          >
            Trusted by small teams at
          </Text>
          <Grid as="ul" columns="5" m={{ columns: 3 }} s={{ columns: 2 }} gap="16" fillWidth>
            {logos.map((name) => (
              <Row
                as="li"
                key={name}
                center
                paddingY="16"
                paddingX="12"
                border
                radius="m"
                background="surface"
              >
                <Text
                  family="heading"
                  textVariant="heading-strong-s"
                  onBackground="neutral-medium"
                  align="center"
                >
                  {name}
                </Text>
              </Row>
            ))}
          </Grid>
        </Column>
      </Column>

      {/* Three feature sections */}
      <Column
        id="features"
        fillWidth
        horizontal="center"
        paddingX="16"
        paddingBottom="104"
        style={{ scrollMarginTop: "5rem" }}
      >
        <Column maxWidth="l" gap="104">
          <Column gap="16" maxWidth="40rem">
            <Text textVariant="label-default-s" onBackground="brand-medium">
              Why Lumen
            </Text>
            <Heading as="h2" textVariant="display-strong-s">
              Less to set up, more to read
            </Heading>
          </Column>
          {features.map((feature, index) => (
            <FeatureSection key={feature.id} feature={feature} reverse={index % 2 === 1} />
          ))}
        </Column>
      </Column>

      {/* Closing call to action */}
      <Column fillWidth horizontal="center" paddingX="16" paddingBottom="104">
        <Column
          maxWidth="l"
          center
          gap="24"
          padding="64"
          background="surface"
          border="brand-alpha-medium"
          radius="l"
          s={{ padding: "32" }}
        >
          <Heading as="h2" textVariant="display-strong-xs" align="center">
            Give your team one place to look
          </Heading>
          <Text as="p" textVariant="body-default-m" onBackground="neutral-weak" align="center">
            Free for one seat, $12 per seat for teams. Cancel whenever you like.
          </Text>
          <Button href="/pricing" arrowIcon data-border="rounded">
            See pricing
          </Button>
        </Column>
      </Column>
    </SiteShell>
  );
}

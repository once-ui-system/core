import { features, plans } from "@/content";
import { baseURL, brand, landing } from "@/resources";
import { Button, Column, Grid, Heading, Icon, Meta, Row, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL: baseURL,
    path: landing.home.path,
    canonical: landing.home.canonical,
    image: landing.home.image,
    robots: landing.home.robots,
    alternates: landing.home.alternates,
  });
}

export default function Home() {
  return (
    <Column fillWidth horizontal="center" gap="104">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.home.title}
        description={landing.home.description}
        path={landing.home.path}
      />

      <Column maxWidth="s" horizontal="center" align="center" gap="24" paddingTop="64" paddingX="l" s={{ paddingX: "16" }}>
        <Heading as="h1" variant="display-strong-l" wrap="balance">
          {brand.name}
        </Heading>
        <Text variant="body-default-xl" onBackground="neutral-medium" wrap="balance">
          {brand.tagline}
        </Text>
        <Row paddingTop="8">
          <Button id="hero-cta" href="/auth" arrowIcon>
            Get started
          </Button>
        </Row>
      </Column>

      <Column id="features" fillWidth maxWidth="l" gap="32" paddingX="l" s={{ paddingX: "16" }}>
        <Heading as="h2" variant="display-strong-xs">
          Features
        </Heading>
        <Grid fillWidth columns={3} s={{ columns: 1 }} gap="12">
          {features.map((feature) => (
            <Column
              key={feature.title}
              fillWidth
              gap="8"
              padding="32"
              radius="xl"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Icon
                name={feature.icon}
                size="s"
                padding="8"
                radius="m"
                background="brand-alpha-weak"
                onBackground="brand-medium"
                marginBottom="16"
              />
              <Heading as="h3" variant="heading-strong-m">
                {feature.title}
              </Heading>
              <Text onBackground="neutral-weak" variant="body-default-s">
                {feature.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column id="pricing" fillWidth maxWidth="m" gap="32" paddingX="l" s={{ paddingX: "16" }}>
        <Heading as="h2" variant="display-strong-xs">
          Pricing
        </Heading>
        <Grid fillWidth columns={2} s={{ columns: 1 }} gap="12">
          {plans.map((plan) => (
            <Column
              key={plan.name}
              fillWidth
              gap="16"
              padding="32"
              radius="xl"
              border="neutral-alpha-weak"
              background="surface"
            >
              <Heading as="h3" variant="heading-strong-l">
                {plan.name}
              </Heading>
              <Row vertical="end" gap="8">
                <Heading as="p" variant="display-strong-s">
                  {plan.price}
                </Heading>
                {plan.period && (
                  <Text variant="body-default-s" onBackground="neutral-weak" paddingBottom="8">
                    {plan.period}
                  </Text>
                )}
              </Row>
              <Text variant="label-default-m" onBackground="brand-medium">
                {plan.detail}
              </Text>
              <Column gap="8">
                {plan.features.map((item) => (
                  <Row key={item} gap="8" vertical="center">
                    <Icon name="check" size="xs" onBackground="brand-medium" />
                    <Text variant="body-default-s">{item}</Text>
                  </Row>
                ))}
              </Column>
              <Button href="/auth" variant={plan.name === "Team" ? "primary" : "secondary"} fillWidth>
                Get started
              </Button>
            </Column>
          ))}
        </Grid>
      </Column>
    </Column>
  );
}

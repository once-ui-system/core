import { Button, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { features, hero, plans } from "@/content/landing";
import { landing } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export function generateMetadata() {
  return pageMetadata({
    title: landing.home.title,
    description: landing.home.description,
    path: landing.home.path,
    canonical: landing.home.canonical,
    image: landing.home.image,
    robots: landing.home.robots,
    alternates: landing.home.alternates,
  });
}

export default function Home() {
  return (
    <>
      <Column as="section" fillWidth gap="24" paddingY="40" horizontal="center" align="center">
        <Heading as="h1" variant="display-strong-l" align="center">
          {hero.title}
        </Heading>
        <Text variant="heading-default-xl" onBackground="neutral-medium" align="center">
          {hero.tagline}
        </Text>
        <Button href={hero.cta.href} label={hero.cta.label} size="l" arrowIcon />
      </Column>

      <Column as="section" fillWidth gap="24">
        <Grid columns="3" s={{ columns: "1" }} gap="16" fillWidth>
          {features.map((feature) => (
            <Column key={feature.title} background="surface" border radius="l" padding="24" gap="12">
              <Icon name="document" onBackground="brand-medium" />
              <Heading as="h2" variant="heading-strong-m">
                {feature.title}
              </Heading>
              <Text variant="body-default-m" onBackground="neutral-medium">
                {feature.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column as="section" id="pricing" fillWidth gap="24">
        <Column gap="8">
          <Heading as="h2" variant="display-strong-xs">
            Pricing
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-medium">
            Start on Free, and move to Team when your organization needs more members.
          </Text>
        </Column>
        <Grid columns="2" s={{ columns: "1" }} gap="16" fillWidth>
          {plans.map((plan) => (
            <Column key={plan.name} background="surface" border radius="l" padding="24" gap="16">
              <Heading as="h3" variant="heading-strong-l">
                {plan.name}
              </Heading>
              <Row vertical="end" gap="8">
                <Text variant="display-strong-s">{plan.price}</Text>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {plan.period}
                </Text>
              </Row>
              <Text variant="body-default-m" onBackground="neutral-medium">
                {plan.description}
              </Text>
              <Column as="ul" gap="8" paddingLeft="16">
                {plan.points.map((point) => (
                  <Text as="li" key={point} variant="body-default-s" onBackground="neutral-medium">
                    {point}
                  </Text>
                ))}
              </Column>
              <Button href="/auth" label="Get started" variant="secondary" />
            </Column>
          ))}
        </Grid>
      </Column>
    </>
  );
}

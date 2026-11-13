import { SiteShell } from "@/components/site/SiteShell";
import { brand, features, logos } from "@/lib/data";
import { baseURL, landing } from "@/resources";
import {
  Background,
  Button,
  Column,
  Grid,
  Heading,
  Icon,
  Meta,
  Row,
  Text,
} from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.home.title,
    description: landing.home.description,
    baseURL,
    path: landing.home.path,
    image: landing.home.image,
  });
}

export default function Page() {
  return (
    <SiteShell>
      <Column fillWidth horizontal="center" gap="104" paddingBottom="104">
        {/* Hero */}
        <Column fillWidth horizontal="center" paddingX="24" paddingY="80">
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
              x: 50,
              y: 0,
              width: 150,
              height: 80,
              opacity: 60,
            }}
            dots={{ display: true, color: "neutral-alpha-weak", size: "2", opacity: 40 }}
          />
          <Column zIndex={1} horizontal="center" gap="24" maxWidth={48}>
            <Text variant="label-default-s" onBackground="brand-medium">
              Analytics and issues, in one place
            </Text>
            <Heading as="h1" variant="display-strong-l" align="center">
              {brand.tagline}
            </Heading>
            <Text variant="body-default-l" onBackground="neutral-weak" align="center">
              Lumen shows a small team what changed, why it matters and who is on it, without a
              data analyst or a twenty-tab report.
            </Text>
            <Row gap="12" horizontal="center" s={{ direction: "column", horizontal: "stretch" }}>
              <Button href="/pricing" arrowIcon label="Start for free" />
              <Button href="/pricing" variant="secondary" label="See pricing" />
            </Row>
          </Column>
        </Column>

        {/* Customers: logos set as text */}
        <Column
          as="section"
          id="customers"
          aria-labelledby="customers-title"
          fillWidth
          horizontal="center"
          paddingX="24"
          gap="24"
        >
          <Text id="customers-title" variant="label-default-s" onBackground="neutral-weak" align="center">
            Trusted by small teams at
          </Text>
          <Row
            as="ul"
            maxWidth="l"
            horizontal="center"
            gap="32"
            wrap
            margin="0"
            padding="0"
            style={{ listStyle: "none" }}
          >
            {logos.map((name) => (
              <Text as="li" key={name} variant="heading-strong-l" onBackground="neutral-weak">
                {name}
              </Text>
            ))}
          </Row>
        </Column>

        {/* Three feature sections */}
        <Column id="product" fillWidth horizontal="center" paddingX="24" gap="104">
          {features.map((feature, index) => {
            const text = (
              <Column key="text" gap="24">
                <Text variant="label-default-s" onBackground="brand-medium">
                  {feature.eyebrow}
                </Text>
                <Heading as="h2" variant="display-strong-xs">
                  {feature.title}
                </Heading>
                <Text variant="body-default-m" onBackground="neutral-weak">
                  {feature.description}
                </Text>
              </Column>
            );
            const panel = (
              <Column
                key="panel"
                background="surface"
                border
                radius="l"
                padding="32"
                gap="24"
              >
                <Row
                  center
                  width="48"
                  height="48"
                  radius="m"
                  background="brand-alpha-weak"
                  border="brand-alpha-medium"
                >
                  <Icon name={feature.icon} size="m" onBackground="brand-medium" />
                </Row>
                <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
                  {feature.points.map((point) => (
                    <Row as="li" key={point} gap="12" vertical="center">
                      <Icon name="check" size="xs" onBackground="brand-medium" />
                      <Text variant="body-default-m">{point}</Text>
                    </Row>
                  ))}
                </Column>
              </Column>
            );
            return (
              <Column as="section" key={feature.id} maxWidth="l" aria-label={feature.eyebrow}>
                <Grid columns="2" gap="40" vertical="center" s={{ columns: 1 }}>
                  {index % 2 === 0 ? [text, panel] : [panel, text]}
                </Grid>
              </Column>
            );
          })}
        </Column>
      </Column>
    </SiteShell>
  );
}

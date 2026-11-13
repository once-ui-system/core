import { Box, Container, Group, Stack, Text, Title } from "@mantine/core";
import { FeatureSection } from "@/components/home/FeatureSection";
import { LinkButton } from "@/components/LinkButton";
import { brand, features, logos } from "@/lib/data";
import classes from "@/components/home/Home.module.css";

export default function HomePage() {
  return (
    <>
      <Box component="section" className={classes.hero} aria-labelledby="hero-title">
        <Container>
          <Stack gap="lg" maw={760}>
            <Text className={classes.kicker}>For small software teams</Text>
            <Title order={1} id="hero-title" className={classes.heroTitle}>
              {brand.tagline}
            </Title>
            <Text size="lg" c="dimmed" maw={620}>
              Lumen puts funnels, retention and your issue tracker in one calm
              place, so the numbers lead straight to the fix.
            </Text>
            <Group gap="sm">
              <LinkButton href="/pricing" size="md">
                Start free
              </LinkButton>
              <LinkButton href="/pricing" size="md" variant="default">
                See pricing
              </LinkButton>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Box component="section" className={classes.logos} aria-labelledby="logos-title">
        <Container>
          <Text id="logos-title" ta="center" size="sm" c="dimmed" mb="md">
            Trusted by small teams shipping every week
          </Text>
          <ul className={classes.logoList}>
            {logos.map((name) => (
              <li key={name} className={classes.logo}>
                {name}
              </li>
            ))}
          </ul>
        </Container>
      </Box>

      {features.map((feature, index) => (
        <FeatureSection
          key={feature.id}
          id={feature.id}
          kicker={feature.kicker}
          title={feature.title}
          body={feature.body}
          points={feature.points}
          reverse={index % 2 === 1}
        />
      ))}

      <Box component="section" className={classes.cta} aria-labelledby="cta-title">
        <Container size="sm">
          <Stack gap="md" align="center">
            <Title order={2} id="cta-title" className={classes.featureTitle}>
              Read your numbers on Monday, fix them by Friday
            </Title>
            <LinkButton href="/pricing" size="md">
              Start free
            </LinkButton>
          </Stack>
        </Container>
      </Box>
    </>
  );
}

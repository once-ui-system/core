import Link from "next/link";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { brand } from "@/lib/data";
import classes from "./Hero.module.css";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className={classes.hero}>
      <Container>
        <div className={classes.content}>
          <Text className={classes.eyebrow}>For small software teams</Text>
          <Title order={1} id="hero-title" className={classes.title}>
            {brand.tagline}
          </Title>
          <Text className={classes.lead}>{brand.description}</Text>
          <Group gap="sm" mt="xl">
            <Button component={Link} href="/pricing" size="lg">
              Start free
            </Button>
            <Button component={Link} href="/#features" size="lg" variant="default">
              See how it works
            </Button>
          </Group>
        </div>
      </Container>
    </section>
  );
}

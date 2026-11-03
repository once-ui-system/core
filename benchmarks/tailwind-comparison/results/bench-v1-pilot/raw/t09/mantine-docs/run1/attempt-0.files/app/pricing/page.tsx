import type { Metadata } from "next";
import { Container, Text, Title } from "@mantine/core";
import { FaqAccordion } from "@/components/FaqAccordion";
import { PlanComparison } from "@/components/PlanComparison";
import { PricingPlans } from "@/components/PricingPlans";
import classes from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Lumen pricing: a free plan for one person, Team at $12 per seat and Business at $29 per seat. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <>
      <section aria-labelledby="pricing-title" className={classes.intro}>
        <Container>
          <Title order={1} id="pricing-title" className={classes.title}>
            Simple pricing for small teams
          </Title>
          <Text size="lg" c="dimmed" maw={600} mt="md">
            Start free, upgrade when your team grows. Pay yearly and get two months free.
          </Text>
        </Container>
      </section>

      <PricingPlans />

      <section aria-labelledby="compare-title" className={classes.section}>
        <Container>
          <Title order={2} id="compare-title" mb="lg">
            Compare plans
          </Title>
          <PlanComparison />
        </Container>
      </section>

      <section aria-labelledby="faq-title" className={classes.section}>
        <Container size="md">
          <Title order={2} id="faq-title" mb="lg">
            Frequently asked questions
          </Title>
          <FaqAccordion />
        </Container>
      </section>
    </>
  );
}

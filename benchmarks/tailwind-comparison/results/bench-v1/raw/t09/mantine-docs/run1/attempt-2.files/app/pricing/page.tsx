import type { Metadata } from "next";
import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { FaqAccordion } from "@/components/pricing/FaqAccordion";
import classes from "@/components/pricing/Pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing | Lumen",
  description:
    "Simple per-seat pricing for small teams. Yearly billing includes two months free.",
};

export default function PricingPage() {
  return (
    <>
      <Box component="section" className={classes.head} aria-labelledby="pricing-title">
        <Container>
          <Stack gap="sm" maw={680}>
            <Title order={1} id="pricing-title" className={classes.title}>
              Pricing that stays out of the way
            </Title>
            <Text size="lg" c="dimmed">
              Start free, add seats as the team grows. Pay yearly and get two
              months free.
            </Text>
          </Stack>
        </Container>
      </Box>

      <PricingPlans />
      <ComparisonTable />
      <FaqAccordion />
    </>
  );
}

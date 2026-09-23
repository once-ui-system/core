import { BlobFx, Button, Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  benefits: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "Everything you need to launch your first project.",
    benefits: ["1 workspace", "Up to 3 team members", "Community support"],
    cta: "Start for free",
    href: "#",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams that need more power and priority support.",
    benefits: [
      "Unlimited workspaces",
      "Unlimited team members",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start free trial",
    href: "#",
    featured: true,
  },
];

interface CustomTier {
  id: string;
  name: string;
  price: string;
  description: string;
  cta: string;
  href: string;
}

const customTiers: CustomTier[] = [
  {
    id: "team",
    name: "Team",
    price: "Custom",
    description: "Bundle multiple workspaces under centralized billing and roles.",
    cta: "Talk to sales",
    href: "#",
  },
  {
    id: "business",
    name: "Business",
    price: "Custom",
    description: "SSO, audit logs, and dedicated onboarding for scaling teams.",
    cta: "Talk to sales",
    href: "#",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Custom contracts, SLAs, and a dedicated success manager.",
    cta: "Talk to sales",
    href: "#",
  },
];

function TierCard({ tier }: { tier: Tier }) {
  return (
    <Column
      fillWidth
      flex={1}
      padding="l"
      gap="16"
      radius="l"
      border={tier.featured ? "brand-alpha-strong" : "neutral-alpha-weak"}
      background={tier.featured ? "brand-alpha-weak" : "transparent"}
      overflow="hidden"
    >
      {tier.featured && (
        <BlobFx
          position="absolute"
          top="0"
          right="0"
          data-solid="inverse"
          translateX="30%"
          translateY="-30%"
        />
      )}
      <Column gap="8">
        <Row fillWidth vertical="center" gap="8">
          <Text
            variant="label-default-s"
            onBackground={tier.featured ? "brand-weak" : "neutral-weak"}
          >
            {tier.name}
          </Text>
          {tier.featured && (
            <Tag size="s" scheme="brand" data-border="rounded">
              Most popular
            </Tag>
          )}
        </Row>
        <Row vertical="end" gap="4">
          <Heading as="h3" variant="display-strong-xs">
            {tier.price}
          </Heading>
          {tier.period && (
            <Text variant="label-default-s" onBackground="neutral-weak" paddingBottom="4">
              {tier.period}
            </Text>
          )}
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {tier.description}
        </Text>
      </Column>
      <Column fillWidth flex={1} gap="8" paddingY="12">
        {tier.benefits.map((benefit) => (
          <Row key={benefit} vertical="center" gap="8">
            <Icon name="check" size="xs" onBackground="brand-weak" />
            <Text variant="label-default-s">{benefit}</Text>
          </Row>
        ))}
      </Column>
      <Button
        fillWidth
        rounded
        href={tier.href}
        variant={tier.featured ? "primary" : "secondary"}
        weight="default"
      >
        {tier.cta}
      </Button>
    </Column>
  );
}

function CustomTierCard({ tier }: { tier: CustomTier }) {
  return (
    <Column fillWidth padding="l" gap="20" radius="l" border vertical="between">
      <Column gap="8">
        <Row fillWidth horizontal="between" vertical="center">
          <Heading as="h3" variant="heading-strong-m">
            {tier.name}
          </Heading>
          <Text variant="label-default-s" onBackground="brand-weak">
            {tier.price}
          </Text>
        </Row>
        <Text variant="body-default-s" onBackground="neutral-weak" wrap="balance">
          {tier.description}
        </Text>
      </Column>
      <Button fillWidth rounded variant="secondary" weight="default" size="s" href={tier.href}>
        {tier.cta}
      </Button>
    </Column>
  );
}

export const Plans6 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="64" {...flex}>
      <Column fillWidth gap="16" maxWidth={48}>
        <Heading as="h2" variant="display-strong-m">
          Simple pricing for every stage
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak" wrap="balance">
          Start for free, upgrade when you need more, or talk to us for a custom plan.
        </Text>
      </Column>

      <Row fillWidth gap="16" s={{ direction: "column" }}>
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </Row>

      <Column fillWidth gap="24">
        <Text variant="label-default-s" onBackground="neutral-weak">
          NEED MORE?
        </Text>
        <Grid fillWidth columns="3" m={{ columns: 1 }} gap="16">
          {customTiers.map((tier) => (
            <CustomTierCard key={tier.id} tier={tier} />
          ))}
        </Grid>
      </Column>
    </Column>
  );
};

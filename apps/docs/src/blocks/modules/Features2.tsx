import {
  Background,
  Column,
  Grid,
  Heading,
  Icon,
  Mask,
  MatrixFx,
  Row,
  Text,
} from "@once-ui-system/core";

const features = [
  {
    title: "Observability",
    description:
      "Trace releases, performance, and product adoption from one shared operational view.",
    icon: "analytics" as const,
  },
  {
    title: "Access Controls",
    description: "Protect every workspace with granular roles, audit trails, and secure defaults.",
    icon: "security" as const,
  },
  {
    title: "Automations",
    description: "Turn repetitive handoffs into reliable workflows that keep projects moving.",
    icon: "bolt" as const,
  },
  {
    title: "Integrations",
    description: "Connect the tools your team already uses without rebuilding your stack.",
    icon: "integration" as const,
  },
  {
    title: "Global Delivery",
    description: "Serve fast, resilient experiences close to every customer by default.",
    icon: "globe" as const,
  },
  {
    title: "Developer API",
    description: "Extend the platform through typed APIs, webhooks, and practical guides.",
    icon: "api" as const,
  },
];

export const Features2: React.FC<React.ComponentProps<typeof Row>> = ({ ...flex }) => {
  return (
    <Column fillWidth horizontal="center" borderTop="neutral-medium" {...flex}>
      <Row fillWidth horizontal="center" borderLeft="neutral-medium" borderRight="neutral-medium">
        <Background
          fill={false}
          fillWidth
          s={{ hide: true }}
          borderRight="neutral-medium"
          mask={{ x: 100, y: 50, radius: 50 }}
          lines={{
            display: true,
            size: "8",
            angle: -45,
            thickness: 1,
            color: "neutral-border-medium",
          }}
        />
        <Column fillWidth>
          <Column fillWidth horizontal="center" padding="32">
            <Heading as="h2" variant="heading-strong-l" align="center" marginBottom="8">
              Platform foundations
            </Heading>
            <Text align="center" onBackground="neutral-strong" variant="body-default-s">
              The capabilities teams need to operate reliable products at scale
            </Text>
          </Column>
        </Column>
        <Background
          fill={false}
          fillWidth
          s={{ hide: true }}
          borderLeft="neutral-medium"
          mask={{ x: 0, y: 50, radius: 50 }}
          lines={{
            display: true,
            size: "8",
            angle: 45,
            thickness: 1,
            color: "neutral-border-medium",
          }}
        />
      </Row>
      <Grid borderLeft borderTop columns="3" m={{ columns: 2 }} s={{ columns: 1 }}>
        {features.map((feature, index) => (
          <Column padding="40" borderBottom borderRight key={index} fillWidth gap="24">
            <Mask position="absolute" left="0" top="0" radius={33} x={25} y={0}>
              <MatrixFx spacing={3} size={1.5} colors={["brand-background-strong"]} flicker />
            </Mask>
            <Row vertical="center" gap="16">
              <Icon
                padding="8"
                name={feature.icon}
                onBackground="brand-weak"
                size="xs"
                radius="m"
                border="brand-alpha-medium"
                background="brand-alpha-weak"
              />
              <Heading as="h3" variant="label-default-m" onBackground="brand-weak">
                {feature.title}
              </Heading>
            </Row>
            <Text wrap="balance" onBackground="neutral-weak" variant="body-default-s">
              {feature.description}
            </Text>
          </Column>
        ))}
      </Grid>
    </Column>
  );
};

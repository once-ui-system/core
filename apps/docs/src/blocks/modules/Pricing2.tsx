import { Background, Button, Column, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";

interface FeatureRow {
  label: string;
  free: boolean;
  pro: boolean;
}

const features: FeatureRow[] = [
  { label: "Unlimited projects", free: true, pro: true },
  { label: "Core components", free: true, pro: true },
  { label: "Community support", free: true, pro: true },
  { label: "Advanced analytics", free: false, pro: true },
  { label: "Team collaboration", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
  { label: "Custom integrations", free: false, pro: true },
];

export const Pricing2 = (flex: React.ComponentProps<typeof Column>) => {
  return (
    <Column fillWidth horizontal="center" gap="64" {...flex}>
      <Column maxWidth={40} gap="12" horizontal="center">
        <Tag scheme="brand" size="s">
          Pricing
        </Tag>
        <Heading as="h1" align="center" variant="display-strong-m">
          Compare plans side by side
        </Heading>
        <Text align="center" onBackground="neutral-medium" variant="body-default-l" wrap="balance">
          Every plan includes the essentials. Upgrade when your team needs more power.
        </Text>
      </Column>

      <Column maxWidth="m" fillWidth radius="xl" border overflow="hidden">
        <Row fillWidth borderBottom>
          <Row flex="2" paddingX="24" paddingY="20" />
          <Column flex="1" paddingX="24" paddingY="20" horizontal="center" gap="4" borderLeft>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Free
            </Text>
            <Text variant="heading-strong-m">$0</Text>
          </Column>
          <Column
            flex="1"
            paddingX="24"
            paddingY="20"
            horizontal="center"
            gap="4"
            borderLeft
            background="brand-alpha-weak"
          >
            <Text variant="label-default-s" onBackground="brand-medium">
              Pro
            </Text>
            <Row gap="4" vertical="end">
              <Text variant="heading-strong-m">$29</Text>
              <Text variant="body-default-s" onBackground="neutral-weak" paddingBottom="4">
                /mo
              </Text>
            </Row>
          </Column>
        </Row>
        {features.map((row, index) => (
          <Row
            key={row.label}
            fillWidth
            borderBottom={index !== features.length - 1 ? "neutral-alpha-weak" : undefined}
          >
            <Row flex="2" paddingX="24" paddingY="16" vertical="center">
              <Text variant="body-default-s">{row.label}</Text>
            </Row>
            <Row
              flex="1"
              paddingX="24"
              paddingY="16"
              horizontal="center"
              vertical="center"
              borderLeft
            >
              <Icon
                name={row.free ? "check" : "minus"}
                size="s"
                onBackground={row.free ? "neutral-strong" : "neutral-weak"}
              />
            </Row>
            <Row
              flex="1"
              paddingX="24"
              paddingY="16"
              horizontal="center"
              vertical="center"
              borderLeft
              background="brand-alpha-weak"
            >
              <Icon
                name={row.pro ? "check" : "minus"}
                size="s"
                onBackground={row.pro ? "brand-medium" : "neutral-weak"}
              />
            </Row>
          </Row>
        ))}
      </Column>

      <Row maxWidth="m" fillWidth gap="16" s={{ direction: "column" }}>
        <Column flex="1" fillWidth padding="24" radius="l" border gap="12">
          <Text variant="label-default-s" onBackground="neutral-weak">
            Stay on Free
          </Text>
          <Text variant="body-default-s" onBackground="neutral-medium" wrap="balance">
            Perfect for solo projects and getting started without a credit card.
          </Text>
          <Row>
            <Button variant="secondary" size="s" data-border="rounded">
              Continue free
            </Button>
          </Row>
        </Column>
        <Column
          flex="1"
          fillWidth
          padding="24"
          radius="l"
          border="brand-alpha-medium"
          background="brand-alpha-weak"
          gap="12"
          overflow="hidden"
          position="relative"
        >
          <Background
            position="absolute"
            top="0"
            left="0"
            gradient={{
              display: true,
              x: 100,
              y: 0,
              width: 100,
              height: 100,
              colorStart: "brand-solid-medium",
            }}
          />
          <Text variant="label-default-s" onBackground="brand-medium">
            Go Pro
          </Text>
          <Text variant="body-default-s" wrap="balance">
            Unlock team collaboration, advanced analytics, and priority support.
          </Text>
          <Row>
            <Button size="s" data-border="rounded" arrowIcon>
              Upgrade to Pro
            </Button>
          </Row>
        </Column>
      </Row>
    </Column>
  );
};

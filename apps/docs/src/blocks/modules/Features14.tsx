import { Column, Grid, Heading, Icon, type IconName, Row, Text } from "@once-ui-system/core";

type Feature = {
  icon: IconName;
  title: string;
  time: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: "bolt" as const,
    title: "Product",
    time: "3 days",
    description: "Ship a landing page, auth flow and dashboard with Magic Convert.",
  },
  {
    icon: "pages" as const,
    title: "Documentation",
    time: "2 days",
    description: "Ship a documentation with Magic Docs.",
  },
  {
    icon: "person" as const,
    title: "Personal brand",
    time: "1 day",
    description: "Ship a personal founder site with Magic Spotlight.",
  },
  {
    icon: "plus" as const,
    title: "Community",
    time: "1 day",
    description: "Ship a fully functional community platform with Orbit Core.",
  },
  {
    icon: "cart" as const,
    title: "Brand store",
    time: "1 day",
    description: "Ship a brand store with Magic Store.",
  },
  {
    icon: "trendUp" as const,
    title: "Strategy",
    time: "2 days",
    description: "Design a brand and a launch strategy.",
  },
];

export const Features14 = (flex: React.ComponentProps<typeof Row>) => {
  return (
    <Row fillWidth horizontal="center" {...flex}>
      <Row flex={1} minWidth="16" borderY />
      <Column maxWidth="xl">
        <Column fillWidth borderX borderTop gap="8" padding="l">
          <Heading as="h2" variant="display-strong-m">
            Make an irresistible offer
          </Heading>
          <Text onBackground="neutral-weak" variant="heading-default-xl" wrap="balance">
            Turn months of prompting into days of delivery
          </Text>
        </Column>
        <Grid fillWidth columns={3} m={{ columns: 2 }} xs={{ columns: 1 }} borderTop borderLeft>
          {features.map((feature, index) => (
            <Column key={index} fillWidth padding="l" borderBottom borderRight gap="8">
              <Icon
                name={feature.icon}
                size="s"
                border="brand-alpha-weak"
                background="brand-alpha-weak"
                onBackground="brand-weak"
                radius="m"
                padding="8"
                marginBottom="12"
              />
              <Heading as="h3" variant="heading-strong-m">
                {feature.title}{" "}
                <Text marginLeft="8" onBackground="brand-weak" weight="default">
                  {feature.time}
                </Text>
              </Heading>
              <Text onBackground="neutral-weak" variant="body-default-s" wrap="balance">
                {feature.description}
              </Text>
            </Column>
          ))}
        </Grid>
        <Row fillWidth borderX padding="8" borderBottom>
          <Row
            fillWidth
            background="brand-alpha-weak"
            border="brand-alpha-weak"
            radius="l"
            padding="20"
            onBackground="brand-weak"
            align="center"
            horizontal="center"
          >
            <Text wrap="balance">
              Startups are paying $20–40k for fragmented builds. You deliver the entire system —
              faster, consistently, and at higher margins.
            </Text>
          </Row>
        </Row>
      </Column>
      <Row flex={1} minWidth="16" borderY />
    </Row>
  );
};

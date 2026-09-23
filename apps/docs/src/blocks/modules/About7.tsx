"use client";

import { Button, Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";

const programBenefits = [
  {
    title: "Recognition",
    description: "Get featured as a trusted voice in the community",
    icon: "medal" as const,
  },
  {
    title: "Early access",
    description: "Try out new features before they launch",
    icon: "bolt" as const,
  },
  {
    title: "Swag",
    description: "Exclusive merch to celebrate your work",
    icon: "tshirt" as const,
  },
  {
    title: "Expert support",
    description: "Get direct support on your projects",
    icon: "lifering" as const,
  },
];

export const About7 = () => {
  return (
    <Row fillWidth borderBottom m={{ direction: "column-reverse" }}>
      <Column fillWidth gap="40" padding="8">
        <Grid columns={2} gap="4" m={{ columns: 1 }}>
          {programBenefits.map((benefit) => (
            <Column
              key={benefit.title}
              fillWidth
              border="neutral-alpha-medium"
              radius="l"
              gap="8"
              padding="l"
              background="page"
            >
              <Icon name={benefit.icon} size="s" onBackground="neutral-weak" />
              <Heading as="h3" marginTop="12" variant="body-default-m">
                {benefit.title}
              </Heading>
              <Text wrap="balance" onBackground="neutral-weak" variant="label-default-s">
                {benefit.description}
              </Text>
            </Column>
          ))}
        </Grid>
      </Column>
      <Column fill center paddingX="8" paddingY="24" gap="8" background="page" borderLeft>
        <Heading align="center" as="h2" variant="display-strong-xs" wrap="balance">
          Frontier benefits
        </Heading>
        <Column onBackground="neutral-weak" horizontal="center" align="center" gap="20">
          <Text variant="body-default-s" align="center" wrap="balance">
            Become a Frontier — reach out on Discord
          </Text>
          <Button size="s" rounded variant="secondary" href="#">
            Join Discord
          </Button>
        </Column>
      </Column>
    </Row>
  );
};

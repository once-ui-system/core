import { Card, Column, Grid, Heading, Icon, Text } from "@once-ui-system/core";
import type { IconName } from "@/resources/icons";

const features: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book",
    title: "Shared notebooks",
    text: "Keep your team's notes in notebooks everyone can open, edit and build on together.",
  },
  {
    icon: "search",
    title: "Instant search",
    text: "Find any note in moments, across every notebook your team has access to.",
  },
  {
    icon: "security",
    title: "Roles and permissions",
    text: "Owners, admins and members: each person gets exactly the access their role needs.",
  },
];

export function Features(props: React.ComponentProps<typeof Column>) {
  return (
    <Column fillWidth gap="32" {...props}>
      <Heading as="h2" variant="display-strong-xs" align="center">
        Everything your team needs to remember
      </Heading>
      <Grid columns="3" m={{ columns: 1 }} gap="16" fillWidth>
        {features.map((feature) => (
          <Card key={feature.title} direction="column" gap="12" padding="24" radius="l" border="neutral-alpha-medium" fillWidth>
            <Icon name={feature.icon} size="m" onBackground="brand-medium" />
            <Heading as="h3" variant="heading-strong-m">
              {feature.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {feature.text}
            </Text>
          </Card>
        ))}
      </Grid>
    </Column>
  );
}

import { Column, Grid, Heading, Icon, type IconName, Text } from "@once-ui-system/core";

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "book",
    title: "Shared notebooks",
    text: "Give every project, team or customer a notebook everyone can read and add to.",
  },
  {
    icon: "search",
    title: "Instant search",
    text: "Find the note you need across every notebook as fast as you can type.",
  },
  {
    icon: "security",
    title: "Roles and permissions",
    text: "Owners, admins and members: each person gets exactly the access they need.",
  },
];

export const Features: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => (
  <Column fillWidth gap="32" {...flex}>
    <Heading as="h2" variant="display-strong-xs" align="center">
      Everything your team needs to keep notes together
    </Heading>
    <Grid columns="3" m={{ columns: 1 }} s={{ columns: 1 }} gap="16" fillWidth>
      {FEATURES.map((feature) => (
        <Column
          key={feature.title}
          gap="12"
          padding="24"
          radius="l"
          border="neutral-alpha-medium"
          background="surface"
        >
          <Icon name={feature.icon} onBackground="brand-medium" />
          <Heading as="h3" variant="heading-strong-m">
            {feature.title}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {feature.text}
          </Text>
        </Column>
      ))}
    </Grid>
  </Column>
);

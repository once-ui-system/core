import { Card, Column, Grid, Heading, Icon, Text } from "@once-ui-system/core";
import { landingCopy } from "@/content";

/** The three features, one card each. */
export const Features: React.FC<React.ComponentProps<typeof Column>> = (props) => {
  const { features } = landingCopy;
  return (
    <Column fillWidth gap="32" {...props}>
      <Heading as="h2" variant="heading-strong-xl" align="center">
        {features.title}
      </Heading>
      <Grid fillWidth columns={3} m={{ columns: 1 }} s={{ columns: 1 }} gap="16">
        {features.items.map((item) => (
          <Card key={item.title} direction="column" padding="24" gap="12" radius="l" border="neutral-alpha-weak" fillWidth>
            <Icon name={item.icon} size="m" onBackground="brand-weak" />
            <Heading as="h3" variant="heading-strong-m">
              {item.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {item.description}
            </Text>
          </Card>
        ))}
      </Grid>
    </Column>
  );
};

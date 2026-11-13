import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { PageHeader } from "../components/PageHeader";
import { recentActivity, summary, user } from "../lib/data";

export default function DashboardPage() {
  const firstName = user.name.split(" ")[0];

  return (
    <Column gap="40">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${firstName}!`}
        description="Your team closed 18 issues this week. Here is how things look across your projects."
      />

      <Grid
        as="section"
        aria-label="Summary"
        columns="4"
        l={{ columns: 2 }}
        s={{ columns: 1 }}
        gap="20"
      >
        {summary.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="16">
            <Row horizontal="between" vertical="center">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {card.label}
              </Text>
              <Row center width="40" height="40" radius="m" background="brand-alpha-weak">
                <Icon name={card.icon} onBackground="brand-strong" />
              </Row>
            </Row>
            <Heading as="p" textVariant="display-strong-m">
              {card.value}
            </Heading>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column id="reports" as="section" aria-labelledby="activity-title" gap="20">
        <Heading as="h2" id="activity-title" textVariant="heading-strong-l">
          Recent activity
        </Heading>
        <Column background="surface" border radius="l" padding="8">
          {recentActivity.map((item, index) => (
            <Row
              key={`${item.who}-${item.when}`}
              paddingX="16"
              paddingY="16"
              gap="16"
              vertical="center"
              horizontal="between"
              wrap
              borderTop={index > 0}
            >
              <Text as="p" textVariant="body-default-m">
                <Text as="span" textVariant="label-strong-m">
                  {item.who}
                </Text>{" "}
                {item.what}{" "}
                <Text as="span" textVariant="label-strong-m" onBackground="brand-strong">
                  {item.where}
                </Text>
              </Text>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </Column>
  );
}

import { Column, Grid, Heading, Icon, Row, Text } from "@once-ui-system/core";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SummaryLink } from "@/components/SummaryLink";
import { product, recentActivity, summaryCards, user } from "@/lib/data";

export default function Page() {
  return (
    <AppShell>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={`Here is how things look across your workspace today. ${product.tagline}.`}
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="section" aria-label="Summary">
        {summaryCards.map((card) => (
          <SummaryLink key={card.label} card={card} />
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16" as="section" aria-labelledby="activity-title">
        <Heading as="h2" id="activity-title" textVariant="heading-strong-m">
          Recent activity
        </Heading>
        <Column as="ul" gap="12">
          {recentActivity.map((item) => (
            <Row as="li" key={item.id} horizontal="between" vertical="center" gap="16" wrap>
              <Row gap="12" vertical="center" flex={1}>
                <Icon name="chevronRight" size="xs" onBackground="neutral-weak" />
                <Column>
                  <Text textVariant="label-default-m">{item.text}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {item.who}
                  </Text>
                </Column>
              </Row>
              <Text textVariant="body-default-s" onBackground="neutral-weak">
                {item.when}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </AppShell>
  );
}

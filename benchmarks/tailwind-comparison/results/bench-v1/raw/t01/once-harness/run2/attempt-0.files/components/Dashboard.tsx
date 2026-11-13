import { Column, Grid, Heading, Icon, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { projects, recentActivity, statusTone, summary, user } from "@/lib/data";

export function Dashboard() {
  const firstName = user.name.split(" ")[0];
  const active = projects.filter((p) => p.status === "Active");

  return (
    <Column gap="32">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here is how your workspace is doing today."
      />

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16" as="ul" padding="0" margin="0">
        {summary.map((item) => (
          <Column
            as="li"
            key={item.label}
            background="surface"
            border
            radius="l"
            padding="20"
            gap="12"
          >
            <Row horizontal="between" vertical="center">
              <Text textVariant="label-default-s" onBackground="neutral-weak">
                {item.label}
              </Text>
              <Icon name={item.icon} size="s" onBackground="neutral-weak" />
            </Row>
            <Text textVariant="display-strong-xs">{item.value}</Text>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {item.hint}
            </Text>
          </Column>
        ))}
      </Grid>

      <Grid columns="2" s={{ columns: 1 }} gap="16">
        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" textVariant="heading-strong-m">
            Active projects
          </Heading>
          <Column as="ul" gap="12" padding="0" margin="0">
            {active.map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="12">
                <Column gap="2">
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-xs" onBackground="neutral-weak">
                    {p.key} · {p.issues} open issues
                  </Text>
                </Column>
                <Tag tone={statusTone(p.status)} label={p.status} size="s" />
              </Row>
            ))}
          </Column>
        </Column>

        <Column background="surface" border radius="l" padding="24" gap="16">
          <Heading as="h2" textVariant="heading-strong-m">
            Recent activity
          </Heading>
          <Column as="ul" gap="12" padding="0" margin="0">
            {recentActivity.map((item) => (
              <Column as="li" key={item.text} gap="2">
                <Text textVariant="label-default-m">{item.text}</Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {item.when}
                </Text>
              </Column>
            ))}
          </Column>
        </Column>
      </Grid>
    </Column>
  );
}

import { Column, Grid, Heading, Row, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const busiest = projects.reduce((a, b) => (b.issues > a.issues ? b : a));
  const latest = projects.reduce((a, b) => (b.updated > a.updated ? b : a));

  const cards = [
    { label: "Open issues", value: String(open), note: `Across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "Paused and archived not counted" },
    { label: "Busiest project", value: busiest.key, note: `${busiest.name}, ${busiest.issues} open issues` },
    { label: "Last update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Column gap="24">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-s" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" gap="12" m={{ columns: 2 }} s={{ columns: 1 }} as="ul" padding="0" margin="0">
        {cards.map((card) => (
          <Column
            as="li"
            key={card.label}
            background="surface"
            border
            radius="m"
            padding="16"
            gap="4"
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text textVariant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="m" padding="16" gap="8">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" margin="0" padding="0" gap="4">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" paddingY="4" gap="12">
                <Text textVariant="body-default-s">
                  {p.key} · {p.name}
                </Text>
                <Text textVariant="body-default-xs" onBackground="neutral-weak">
                  {formatDate(p.updated)}
                </Text>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}

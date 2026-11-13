import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone, user } from "../lib/data";

const activeCount = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Open issues", value: String(openIssues), note: "Across all projects" },
  { label: "Active projects", value: String(activeCount), note: `${projects.length} in total` },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
];

export default function DashboardPage() {
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text textVariant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text textVariant="heading-strong-l">{card.value}</Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" gap="8">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="16" paddingY="8" wrap>
                <Column gap="2">
                  <Text textVariant="label-strong-m">{p.name}</Text>
                  <Text textVariant="body-default-s" onBackground="neutral-weak">
                    {p.key} · {p.issues} open issues · {formatDate(p.updated)}
                  </Text>
                </Column>
                <Tag tone={statusTone(p.status)} label={p.status} />
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}

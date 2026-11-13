import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

const active = projects.filter((p) => p.status === "Active");
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Active projects", value: String(active.length), note: `of ${projects.length} in your workspace` },
  { label: "Open issues", value: String(openIssues), note: "across every project" },
  { label: "Busiest project", value: "Customer app", note: "31 open issues" },
  { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
];

export default function DashboardPage() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-l">
          Here is how your team is doing today. Nice work keeping things moving.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="20">
        {cards.map((card) => (
          <Column key={card.label} background="surface" border radius="l" padding="24" gap="8">
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Text as="p" textVariant="heading-strong-xl">
              {card.value}
            </Text>
            <Text textVariant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column background="surface" border radius="l" padding="24" gap="16">
        <Heading as="h2" textVariant="heading-strong-l">
          Recently updated
        </Heading>
        <Column as="ul" gap="12" margin="0" padding="0">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="16" wrap>
                <Row gap="12" vertical="center">
                  <Tag label={p.key} size="s" />
                  <Text textVariant="label-strong-m">{p.name}</Text>
                </Row>
                <Text textVariant="body-default-s" onBackground="neutral-weak">
                  {formatDate(p.updated)}
                </Text>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}

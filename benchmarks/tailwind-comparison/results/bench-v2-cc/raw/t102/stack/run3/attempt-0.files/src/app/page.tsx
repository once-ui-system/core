import { Column, Grid, Heading, Text, Tag, Row } from "@once-ui-system/core";
import { projects, user, formatDate } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active");
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: "Across all projects" },
    { label: "Active projects", value: String(active.length), note: `${projects.length} projects in total` },
    { label: "Busiest project", value: "Customer app", note: "31 open issues" },
    { label: "Latest update", value: formatDate(latest.updated), note: latest.name },
  ];

  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Here is how your team is doing today.
        </Text>
      </Column>
      <Grid columns="4" s={{ columns: 1 }} m={{ columns: 2 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="l" padding="24" gap="8" as="section" aria-label={card.label}>
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="p" variant="heading-strong-xl">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column background="neutral-alpha-weak" border radius="l" padding="24" gap="16" as="section" aria-labelledby="active-title">
        <Heading as="h2" id="active-title" variant="heading-strong-l">
          Active projects
        </Heading>
        {active.map((p) => (
          <Row key={p.key} fillWidth vertical="center" horizontal="between" gap="16" paddingY="8" wrap>
            <Row gap="12" vertical="center">
              <Tag scheme="brand" size="m" label={p.key} />
              <Text variant="body-strong-m">{p.name}</Text>
            </Row>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {p.issues} open issues
            </Text>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

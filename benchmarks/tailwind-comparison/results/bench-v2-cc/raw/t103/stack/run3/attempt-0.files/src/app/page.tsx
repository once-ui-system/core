import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

  const cards = [
    { label: "Open issues", value: String(openIssues), note: `across ${projects.length} projects` },
    { label: "Active projects", value: String(active), note: "currently shipping" },
    { label: "Paused projects", value: String(paused), note: "waiting to resume" },
    { label: "Last updated", value: latest.key, note: `${latest.name}, ${formatDate(latest.updated)}` },
  ];

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>
      <Grid as="section" aria-label="Summary" columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="display-strong-xs">
              {card.value}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>
      <Column as="section" aria-labelledby="recent" background="neutral-alpha-weak" border radius="m" padding="20" gap="12">
        <Heading as="h2" id="recent" variant="heading-strong-m">
          Recently updated
        </Heading>
        {[...projects]
          .sort((a, b) => b.updated.localeCompare(a.updated))
          .slice(0, 3)
          .map((p) => (
            <Row key={p.key} horizontal="between" vertical="center" gap="12" wrap>
              <Row gap="12" vertical="center">
                <Tag size="s" label={p.key} />
                <Text variant="body-default-m">{p.name}</Text>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {formatDate(p.updated)}
              </Text>
            </Row>
          ))}
      </Column>
    </>
  );
}

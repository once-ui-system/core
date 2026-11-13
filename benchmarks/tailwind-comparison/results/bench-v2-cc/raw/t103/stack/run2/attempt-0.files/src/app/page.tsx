import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, user } from "@/lib/data";

export default function Page() {
  const active = projects.filter((p) => p.status === "Active").length;
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];
  const cards = [
    { label: "Open issues", value: String(open), note: "across all projects" },
    { label: "Active projects", value: String(active), note: `of ${projects.length} in the workspace` },
    { label: "Paused", value: String(projects.filter((p) => p.status === "Paused").length), note: "Mobile beta" },
    { label: "Last activity", value: formatDate(latest.updated), note: latest.name },
  ];
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 3);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Here is how your workspace looks today.
        </Text>
      </Column>

      <Grid columns="4" l={{ columns: "2" }} s={{ columns: "1" }} gap="16">
        {cards.map((card) => (
          <Column key={card.label} background="neutral-alpha-weak" border radius="m" padding="20" gap="8">
            <Text variant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" variant="heading-strong-l">
              {card.value}
            </Heading>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {card.note}
            </Text>
          </Column>
        ))}
      </Grid>

      <Column gap="12">
        <Heading as="h2" variant="heading-strong-m">
          Recently updated
        </Heading>
        <Column border radius="m" background="surface">
          {recent.map((p, i) => (
            <Row
              key={p.key}
              horizontal="between"
              vertical="center"
              padding="16"
              gap="12"
              wrap
              borderTop={i === 0 ? undefined : true}
            >
              <Row gap="12" vertical="center">
                <Tag size="s" label={p.key} />
                <Text variant="label-strong-m">{p.name}</Text>
              </Row>
              <Text variant="body-default-s" onBackground="neutral-weak">
                {p.issues} open issues, updated {formatDate(p.updated)}
              </Text>
            </Row>
          ))}
        </Column>
      </Column>
    </>
  );
}

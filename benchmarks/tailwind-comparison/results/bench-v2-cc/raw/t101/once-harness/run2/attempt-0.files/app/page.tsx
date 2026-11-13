import { Column, Grid, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusTone, user } from "../lib/data";

export default function DashboardPage() {
  const open = projects.reduce((sum, p) => sum + p.issues, 0);
  const active = projects.filter((p) => p.status === "Active").length;
  const paused = projects.filter((p) => p.status === "Paused").length;
  const archived = projects.filter((p) => p.status === "Archived").length;
  const recent = [...projects].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4);

  const cards = [
    { label: "Open issues", value: open, note: `across ${projects.length} projects` },
    { label: "Active projects", value: active, note: "currently shipping" },
    { label: "Paused projects", value: paused, note: "waiting on a decision" },
    { label: "Archived projects", value: archived, note: "read-only" },
  ];

  return (
    <Column gap="20">
      <Column gap="4">
        <Heading as="h1" textVariant="heading-strong-l">
          Welcome back, {user.name.split(" ")[0]}
        </Heading>
        <Text onBackground="neutral-weak" textVariant="body-default-s">
          {open} issues are open across {active} active projects. Last change on{" "}
          {formatDate(recent[0].updated)}.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: "2" }} s={{ columns: "1" }} gap="12" as="ul" padding="0" margin="0">
        {cards.map((card) => (
          <Column
            as="li"
            key={card.label}
            background="surface"
            border
            radius="m"
            padding="12"
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

      <Column background="surface" border radius="m" padding="12" gap="8" as="section" aria-labelledby="recent">
        <Heading as="h2" id="recent" textVariant="heading-strong-m">
          Recently updated
        </Heading>
        <Column as="ul" padding="0" margin="0" gap="4">
          {recent.map((p) => (
            <Row
              as="li"
              key={p.key}
              vertical="center"
              gap="12"
              paddingY="4"
              borderBottom
              wrap
            >
              <Text textVariant="code-default-s" onBackground="neutral-weak">
                {p.key}
              </Text>
              <Text textVariant="label-strong-s" flex={1}>
                {p.name}
              </Text>
              <Tag size="s" tone={statusTone(p.status)} label={p.status} />
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

import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { Tag } from "@once-ui-system/core/components/Tag";
import { Text } from "@once-ui-system/core/components/Text";
import { projects, statusTone, user } from "../lib/data";

const active = projects.filter((p) => p.status === "Active").length;
const openIssues = projects.reduce((sum, p) => sum + p.issues, 0);
const latest = [...projects].sort((a, b) => b.updated.localeCompare(a.updated))[0];

const cards = [
  { label: "Projects", value: String(projects.length), note: `${active} active` },
  { label: "Open issues", value: String(openIssues), note: "Across all projects" },
  { label: "Busiest project", value: "APP", note: "31 open issues" },
  { label: "Last activity", value: latest.updated, note: latest.name },
];

export default function DashboardPage() {
  const first = user.name.split(" ")[0];
  return (
    <Column fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" textVariant="heading-strong-l">
          Welcome back, {first}
        </Heading>
        <Text textVariant="body-default-m" onBackground="neutral-weak">
          Here is where your workspace stands today.
        </Text>
      </Column>

      <Grid columns="4" m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
        {cards.map((card) => (
          <Column
            key={card.label}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
            as="section"
            aria-label={card.label}
          >
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {card.label}
            </Text>
            <Heading as="h2" textVariant="heading-strong-xl">
              {card.value}
            </Heading>
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
        <Column as="ul" gap="12">
          {[...projects]
            .sort((a, b) => b.updated.localeCompare(a.updated))
            .slice(0, 3)
            .map((p) => (
              <Row as="li" key={p.key} horizontal="between" vertical="center" gap="12" wrap>
                <Row gap="12" vertical="center">
                  <Text textVariant="code-strong-s">{p.key}</Text>
                  <Text textVariant="body-default-m">{p.name}</Text>
                </Row>
                <Row gap="12" vertical="center">
                  <Tag tone={statusTone[p.status]} label={p.status} size="s" />
                  <Text textVariant="code-default-s" onBackground="neutral-weak">
                    {p.updated}
                  </Text>
                </Row>
              </Row>
            ))}
        </Column>
      </Column>
    </Column>
  );
}

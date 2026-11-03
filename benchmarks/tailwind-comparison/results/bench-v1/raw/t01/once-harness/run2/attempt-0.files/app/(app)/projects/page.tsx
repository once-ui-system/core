import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, projects, statusTone } from "@/lib/data";

export const metadata = { title: "Projects · Lumen" };

export default function ProjectsPage() {
  return (
    <Column gap="32">
      <PageHeader
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />

      <Column as="ul" gap="12" padding="0" margin="0">
        {projects.map((p) => (
          <Row
            as="li"
            key={p.key}
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            wrap
          >
            <Row
              width="40"
              height="40"
              radius="m"
              background="brand-alpha-weak"
              center
              aria-hidden="true"
            >
              <Text textVariant="label-strong-s" onBackground="brand-strong">
                {p.key}
              </Text>
            </Row>
            <Column flex={1} minWidth={12} gap="2">
              <Heading as="h2" textVariant="heading-strong-s">
                {p.name}
              </Heading>
              <Text textVariant="body-default-xs" onBackground="neutral-weak">
                Updated {formatDate(p.updated)}
              </Text>
            </Column>
            <Text textVariant="label-default-s" onBackground="neutral-weak">
              {p.issues} {p.issues === 1 ? "issue" : "issues"}
            </Text>
            <Tag tone={statusTone(p.status)} label={p.status} size="s" />
          </Row>
        ))}
      </Column>
    </Column>
  );
}

import { Column, Heading, Row, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export function ProjectsList() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>

      <Column as="ul" gap="12" margin="0" padding="0" style={{ listStyle: "none" }}>
        {projects.map((project) => (
          <Row
            as="li"
            key={project.key}
            background="surface"
            border
            radius="l"
            padding="16"
            gap="16"
            vertical="center"
            horizontal="between"
            wrap
          >
            <Row gap="16" vertical="center">
              <Row
                background="neutral-alpha-weak"
                radius="m"
                width="48"
                height="48"
                center
                textVariant="label-strong-s"
                aria-hidden="true"
              >
                {project.key}
              </Row>
              <Column gap="4">
                <Text variant="heading-strong-s">{project.name}</Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  Updated {formatDate(project.updated)}
                </Text>
              </Column>
            </Row>
            <Row gap="16" vertical="center">
              <Text variant="body-default-s" onBackground="neutral-weak">
                {project.issues} {project.issues === 1 ? "issue" : "issues"}
              </Text>
              <Tag scheme={scheme[project.status]} size="m" label={project.status} />
            </Row>
          </Row>
        ))}
      </Column>
    </Column>
  );
}

import { Column, Heading, Row, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, statusScheme } from "@/lib/data";

export default function Page() {
  const headers = [
    { content: "Key", key: "key" },
    { content: "Project", key: "name" },
    { content: "Status", key: "status" },
    { content: "Open issues", key: "issues", align: "right" as const },
    { content: "Last updated", key: "updated" },
  ];

  const rows = projects.map((project) => [
    <Text key="key" variant="label-strong-s">
      {project.key}
    </Text>,
    <Text key="name" variant="body-default-m">
      {project.name}
    </Text>,
    <Tag key="status" scheme={statusScheme[project.status]} label={project.status} />,
    <Text key="issues" variant="body-default-m">
      {project.issues}
    </Text>,
    <Text key="updated" variant="body-default-s" onBackground="neutral-weak">
      {formatDate(project.updated)}
    </Text>,
  ]);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace, from the marketing site to the mobile beta.
        </Text>
      </Column>
      <Row fillWidth overflowX="auto" background="surface" border radius="l">
        <Table data={{ headers, rows }} searchable searchPlaceholder="Search projects" />
      </Row>
    </>
  );
}

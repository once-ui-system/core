import { Column, Heading, Tag, Text } from "@once-ui-system/core";
import { Table } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function ProjectsPage() {
  const rows = projects.map((p) => [
    <Tag key={`${p.key}-key`} size="s" label={p.key} />,
    <Text key={`${p.key}-name`} variant="label-strong-m">
      {p.name}
    </Text>,
    <Tag key={`${p.key}-status`} size="s" scheme={statusScheme[p.status]} label={p.status} />,
    <Text key={`${p.key}-issues`} variant="body-default-m">
      {p.issues}
    </Text>,
    <Text key={`${p.key}-updated`} variant="body-default-m">
      {formatDate(p.updated)}
    </Text>,
  ]);

  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-m">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table
          data={{
            headers: [
              { content: "Key", key: "key" },
              { content: "Name", key: "name" },
              { content: "Status", key: "status" },
              { content: "Open issues", key: "issues" },
              { content: "Last updated", key: "updated" },
            ],
            rows,
          }}
        />
      </Column>
    </>
  );
}

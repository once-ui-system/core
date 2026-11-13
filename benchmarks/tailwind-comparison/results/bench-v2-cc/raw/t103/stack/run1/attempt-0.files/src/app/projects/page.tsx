import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme = (status: ProjectStatus) =>
  status === "Active" ? "success" : status === "Paused" ? "warning" : "neutral";

export default function ProjectsPage() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in this workspace.
        </Text>
      </Column>

      <Column fillWidth overflowX="auto">
        <Table
          data={{
            headers: [
              { content: "Key", key: "key" },
              { content: "Name", key: "name" },
              { content: "Status", key: "status" },
              { content: "Issues", key: "issues", align: "right" },
              { content: "Updated", key: "updated" },
            ],
            rows: projects.map((p) => [
              <Text key="k" variant="code-default-s">
                {p.key}
              </Text>,
              p.name,
              <Tag key="s" size="s" scheme={scheme(p.status)} label={p.status} />,
              String(p.issues),
              formatDate(p.updated),
            ]),
          }}
        />
      </Column>
    </>
  );
}

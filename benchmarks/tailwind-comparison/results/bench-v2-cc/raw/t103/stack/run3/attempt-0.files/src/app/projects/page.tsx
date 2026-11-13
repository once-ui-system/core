import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const statusScheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function Page() {
  return (
    <>
      <Column gap="8">
        <Heading as="h1" variant="heading-strong-xl">
          Projects
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
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
            <Tag key="s" size="s" scheme={statusScheme[p.status]} label={p.status} />,
            String(p.issues),
            formatDate(p.updated),
          ]),
        }}
      />
    </>
  );
}

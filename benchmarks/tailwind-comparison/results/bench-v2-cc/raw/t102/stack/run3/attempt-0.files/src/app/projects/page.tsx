import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { projects, formatDate, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
};

export default function Page() {
  return (
    <Column gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Projects
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {projects.length} projects in your workspace.
        </Text>
      </Column>
      <Table
        data={{
          headers: [
            { content: "Key", key: "key" },
            { content: "Project", key: "name" },
            { content: "Status", key: "status" },
            { content: "Open issues", key: "issues", align: "right" },
            { content: "Updated", key: "updated", hide: { s: true } },
          ],
          rows: projects.map((p) => [
            <Text key="k" variant="label-strong-s">{p.key}</Text>,
            <Text key="n" variant="body-strong-m">{p.name}</Text>,
            <Tag key="s" scheme={scheme[p.status]} size="m" label={p.status} />,
            <Text key="i" variant="body-default-m">{p.issues}</Text>,
            <Text key="u" variant="body-default-m">{formatDate(p.updated)}</Text>,
          ]),
        }}
      />
    </Column>
  );
}

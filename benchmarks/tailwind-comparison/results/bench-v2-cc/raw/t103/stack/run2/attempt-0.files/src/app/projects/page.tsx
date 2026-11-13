import { Column, Heading, Table, Tag, Text } from "@once-ui-system/core";
import { formatDate, projects, type ProjectStatus } from "@/lib/data";

const scheme: Record<ProjectStatus, "success" | "warning" | "neutral"> = {
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
          {projects.length} projects in the Acme Labs workspace.
        </Text>
      </Column>
      <Column fillWidth overflowX="auto">
        <Table
          data={{
            headers: [
              { content: "Key", key: "key" },
              { content: "Name", key: "name" },
              { content: "Status", key: "status" },
              { content: "Open issues", key: "issues", align: "right" },
              { content: "Updated", key: "updated", hide: { xs: true } },
            ],
            rows: projects.map((p) => [
              <Text key="k" variant="code-default-s">{p.key}</Text>,
              <Text key="n" variant="label-strong-s">{p.name}</Text>,
              <Tag key="s" size="s" scheme={scheme[p.status]} label={p.status} />,
              <Text key="i" variant="body-default-s">{p.issues}</Text>,
              <Text key="u" variant="body-default-s">{formatDate(p.updated)}</Text>,
            ]),
          }}
        />
      </Column>
    </>
  );
}

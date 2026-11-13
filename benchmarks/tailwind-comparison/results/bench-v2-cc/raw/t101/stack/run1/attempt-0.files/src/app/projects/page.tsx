import { Column, Table, Tag } from "@once-ui-system/core";
import { PageTitle } from "@/components/PageTitle";
import { projects, statusScheme } from "@/lib/data";

export default function ProjectsPage() {
  const headers = [
    { content: "Key", key: "key", sortable: true, width: "96px" },
    { content: "Name", key: "name", sortable: true },
    { content: "Status", key: "status" },
    { content: "Issues", key: "issues", sortable: true, align: "right" as const },
    { content: "Updated", key: "updated", sortable: true },
  ];
  const rows = projects.map((p) => [
    p.key,
    p.name,
    <Tag key={p.key} scheme={statusScheme[p.status]} size="s" label={p.status} />,
    String(p.issues),
    p.updated,
  ]);

  return (
    <>
      <PageTitle
        title="Projects"
        description={`${projects.length} projects in the Acme Labs workspace.`}
      />
      <Column fillWidth overflowX="auto">
        <Table data={{ headers, rows }} compact searchable searchPlaceholder="Search projects" />
      </Column>
    </>
  );
}

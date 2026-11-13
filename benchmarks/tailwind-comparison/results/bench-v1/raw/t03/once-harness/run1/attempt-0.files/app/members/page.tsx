import { Column } from "@once-ui-system/core";
import { MembersTable } from "@/components/MembersTable";
import { PageHeader } from "@/components/PageHeader";

export default function MembersPage() {
  return (
    <Column gap="32">
      <PageHeader title="Members" description="People with access to Lumen and the role each one holds." />
      <MembersTable />
    </Column>
  );
}

"use client";

import { Column } from "@once-ui-system/core";
import { MembersTable } from "./MembersTable";
import { PageHeader } from "./PageHeader";

export function MembersView() {
  return (
    <Column gap="32">
      <PageHeader title="Members" description="People with access to Lumen and the role each one holds." />
      <MembersTable />
    </Column>
  );
}

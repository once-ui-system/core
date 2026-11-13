"use client";

import { Column, Table } from "@once-ui-system/core";
import { PageHeader } from "../../components/PageHeader";
import { formatDate, type Report, reports } from "../../lib/data";

export default function ReportsPage() {
  return (
    <Column fillWidth gap="16">
      <PageHeader title="Reports" description="Scheduled reports for the workspace." />
      <Table
        aria-label="Reports"
        rows={reports}
        compact
        getRowId={(row: Report) => row.name}
        columns={[
          { key: "name", header: "Report", sortable: true },
          { key: "cadence", header: "Cadence", sortable: true },
          { key: "owner", header: "Owner" },
          {
            key: "lastRun",
            header: "Last run",
            sortable: true,
            cell: (row: Report) => formatDate(row.lastRun),
          },
        ]}
      />
    </Column>
  );
}

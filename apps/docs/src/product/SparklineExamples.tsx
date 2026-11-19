"use client";

import { Table, type TableColumn } from "@once-ui-system/core";
import { Sparkline } from "@once-ui-system/core/data";

type PageRow = { page: string; visits: string; trend: number[] };

const pages: PageRow[] = [
  { page: "/pricing", visits: "12,480", trend: [8, 9, 11, 10, 12, 13, 12] },
  { page: "/docs", visits: "9,310", trend: [12, 11, 10, 10, 9, 9, 9] },
  { page: "/blog", visits: "4,022", trend: [2, 3, 2, 5, 4, 6, 4] },
];

const columns: TableColumn<PageRow>[] = [
  { key: "page", header: "Page" },
  { key: "visits", header: "Visits", align: "right" },
  {
    key: "trend",
    header: "Last 7 days",
    cell: (row) => <Sparkline data={row.trend} width={96} height={20} showLast />,
  },
];

/** A Sparkline in a Table cell. A client component: the column's `cell` is a function. */
export function SparklineTableExample() {
  return (
    <Table
      aria-label="Pages by visits"
      getRowId={(row) => row.page}
      columns={columns}
      rows={pages}
    />
  );
}

import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Table,
  tableCellVariants,
  tableContainerVariants,
  tableHeaderCellVariants,
  tableRowVariants,
  tableVariants,
} from "../components/Table";

describe("Table", () => {
  const sampleHeaders = [
    { key: "name", content: "Name", sortable: true },
    { key: "role", content: "Role", sortable: true },
    { key: "status", content: "Status", align: "center" as const },
  ];

  const sampleRows = [
    ["Alice", "Engineer", "Active"],
    ["Charlie", "Designer", "Pending"],
    ["Bob", "Manager", "Active"],
  ];

  it("renders table headers and rows correctly", () => {
    render(<Table data={{ headers: sampleHeaders, rows: sampleRows }} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("forwards ref to the outer container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Table ref={ref} data={{ headers: sampleHeaders, rows: sampleRows }} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("handles sorting when a sortable header is clicked", () => {
    const { container } = render(<Table data={{ headers: sampleHeaders, rows: sampleRows }} />);

    const nameHeader = screen.getByText("Name");
    // Sort ascending by Name (Alice, Bob, Charlie)
    fireEvent.click(nameHeader);
    let cells = container.querySelectorAll("tbody tr td:first-child");
    expect(cells[0].textContent).toBe("Alice");
    expect(cells[1].textContent).toBe("Bob");
    expect(cells[2].textContent).toBe("Charlie");

    // Sort descending by Name (Charlie, Bob, Alice)
    fireEvent.click(nameHeader);
    cells = container.querySelectorAll("tbody tr td:first-child");
    expect(cells[0].textContent).toBe("Charlie");
    expect(cells[1].textContent).toBe("Bob");
    expect(cells[2].textContent).toBe("Alice");

    // Clear sort button in footer
    const clearSortBtn = screen.getByRole("button", { name: /clear sort/i });
    expect(clearSortBtn).toBeInTheDocument();
    fireEvent.click(clearSortBtn);
    expect(screen.queryByRole("button", { name: /clear sort/i })).not.toBeInTheDocument();
  });

  it("filters rows when searchable is enabled", () => {
    render(
      <Table
        searchable
        searchPlaceholder="Filter users..."
        data={{ headers: sampleHeaders, rows: sampleRows }}
      />,
    );

    const searchInput = screen.getByPlaceholderText("Filter users...");
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "des" } });
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    expect(screen.getByText("1 of 3")).toBeInTheDocument();
  });

  it("handles onRowClick and custom rowClassName / cellClassName", () => {
    const handleRowClick = vi.fn();
    const { container } = render(
      <Table
        data={{ headers: sampleHeaders, rows: sampleRows }}
        onRowClick={handleRowClick}
        rowClassName={(idx) => `custom-row-${idx}`}
        cellClassName={(rIdx, cIdx) => `cell-${rIdx}-${cIdx}`}
      />,
    );

    const firstRow = container.querySelector("tbody tr");
    expect(firstRow).toHaveClass("custom-row-0");
    const firstCell = firstRow?.querySelector("td");
    expect(firstCell).toHaveClass("cell-0-0");

    if (firstRow) {
      fireEvent.click(firstRow);
    }
    expect(handleRowClick).toHaveBeenCalledWith(0);
  });

  it("renders row actions and handles action clicks with stopPropagation", () => {
    const handleRowClick = vi.fn();
    const handleActionClick = vi.fn();

    render(
      <Table
        data={{ headers: sampleHeaders, rows: sampleRows }}
        onRowClick={handleRowClick}
        actions={[
          {
            icon: "edit",
            label: "Edit Row",
            onClick: handleActionClick,
          },
          {
            icon: "trash",
            label: "Delete Row",
            onClick: vi.fn(),
            disabled: (idx) => idx === 0,
          },
        ]}
      />,
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
    const editButtons = screen.getAllByRole("button", { name: /edit row/i });
    expect(editButtons.length).toBe(3);

    fireEvent.click(editButtons[0]);
    expect(handleActionClick).toHaveBeenCalledWith(0);
    expect(handleRowClick).not.toHaveBeenCalled();

    const deleteButtons = screen.getAllByRole("button", { name: /delete row/i });
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).not.toBeDisabled();
  });

  it("renders default empty state when rows are empty", () => {
    render(<Table data={{ headers: sampleHeaders, rows: [] }} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.getByText("There are no items to display")).toBeInTheDocument();
  });

  it("renders custom emptyState when provided", () => {
    render(
      <Table
        data={{ headers: sampleHeaders, rows: [] }}
        emptyState={<div>Custom Empty Notice</div>}
      />,
    );
    expect(screen.getByText("Custom Empty Notice")).toBeInTheDocument();
  });

  it("renders default loading state when loading is true", () => {
    render(<Table loading data={{ headers: sampleHeaders, rows: sampleRows }} />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("renders custom loadingState when provided", () => {
    render(
      <Table
        loading
        loadingState={<div>Custom Spinner Loading...</div>}
        data={{ headers: sampleHeaders, rows: sampleRows }}
      />,
    );
    expect(screen.getByText("Custom Spinner Loading...")).toBeInTheDocument();
  });

  it("handles pagination controls correctly", () => {
    const manyRows = Array.from({ length: 15 }, (_, i) => [
      `User ${i + 1}`,
      `Role ${i + 1}`,
      "Active",
    ]);

    render(
      <Table
        paginated
        defaultPageSize={5}
        pageSizeOptions={[5, 10]}
        data={{ headers: sampleHeaders, rows: manyRows }}
      />,
    );

    // First page contains User 1 to 5
    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("User 5")).toBeInTheDocument();
    expect(screen.queryByText("User 6")).not.toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Click page 2 button
    const page2Button = screen.getByRole("button", { name: "2" });
    fireEvent.click(page2Button);
    expect(screen.getByText("User 6")).toBeInTheDocument();
    expect(screen.getByText("User 10")).toBeInTheDocument();
    expect(screen.queryByText("User 1")).not.toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { container } = render(
      <Table
        striped
        hoverable
        compact
        stickyHeader
        data={{ headers: sampleHeaders, rows: sampleRows }}
      />,
    );

    const table = container.querySelector("table");
    expect(table).toHaveClass("w-full");
    expect(table?.className).toContain("[&>tbody>tr:nth-child(odd)]:bg-neutral-alpha-weak");
    expect(table?.className).toContain("[&>tbody>tr:hover]:bg-neutral-alpha-weak");
    expect(table?.className).toContain("[&>thead>tr>th]:py-8");
    expect(table?.className).toContain("[&>thead]:sticky");
  });

  it("exports CVA variant generators for composability", () => {
    expect(tableVariants({ striped: true })).toContain(
      "[&>tbody>tr:nth-child(odd)]:bg-neutral-alpha-weak",
    );
    expect(tableContainerVariants()).toContain("[&::-webkit-scrollbar]:w-8");
    expect(tableHeaderCellVariants({ sortable: true, active: true })).toContain(
      "bg-neutral-alpha-weak",
    );
    expect(tableCellVariants({ align: "center" })).toContain("text-center");
    expect(tableRowVariants()).toContain("table-row");
  });
});

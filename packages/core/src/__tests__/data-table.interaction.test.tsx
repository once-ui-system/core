import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type Row = { id: number; name: string; joined: Date | null; tags: string[]; active: boolean };

const rows: Row[] = [
  { id: 1, name: "Bea", joined: new Date("2024-05-01T00:00:00Z"), tags: ["a", "b"], active: true },
  { id: 2, name: "Ada", joined: new Date("2023-01-15T00:00:00Z"), tags: [], active: false },
  { id: 3, name: "Cy", joined: null, tags: ["c"], active: true },
];

const columns: TableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "joined", header: "Joined", sortable: true },
  { key: "tags", header: "Tags" },
  { key: "active", header: "Active", sortable: true },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).queryAllByRole("row");
const column = (index: number) =>
  bodyRows().map((row) => within(row).getAllByRole("cell")[index].textContent);

/**
 * DataTable behaviour not covered by data-table.test.tsx: field rendering
 * (dates as YYYY-MM-DD, arrays joined), date and boolean sorting with empty
 * values last, the table's accessible name, numeric ids reported as strings,
 * Tab order through the selection checkboxes, and the per-page select.
 */
describe("DataTable interaction", () => {
  it("prints dates, arrays and booleans as text", () => {
    render(<Table columns={columns} rows={rows} aria-label="Members" />, { wrapper });
    expect(screen.getByRole("table", { name: "Members" })).toBeInTheDocument();
    expect(column(1)).toEqual(["2024-05-01", "2023-01-15", ""]);
    expect(column(2)).toEqual(["a, b", "", "c"]);
    expect(column(3)).toEqual(["true", "false", "true"]);
  });

  it("sorts dates in time order with empty dates last, both ways", async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} rows={rows} />, { wrapper });
    const sortJoined = screen.getByRole("button", { name: "Joined" });
    await user.click(sortJoined);
    expect(column(0)).toEqual(["Ada", "Bea", "Cy"]);
    await user.click(sortJoined);
    expect(column(0)).toEqual(["Bea", "Ada", "Cy"]);
    await user.click(sortJoined);
    expect(column(0)).toEqual(["Bea", "Ada", "Cy"]);
    expect(screen.getByRole("columnheader", { name: "Joined" })).not.toHaveAttribute("aria-sort");
  });

  it("sorts booleans false first", async () => {
    const user = userEvent.setup();
    render(<Table columns={columns} rows={rows} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Active" }));
    expect(column(0)[0]).toBe("Ada");
  });

  it("reports numeric ids as strings and tabs through the checkboxes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <Table
        columns={columns}
        rows={rows}
        selectable
        getRowLabel={(row) => `Select ${row.name}`}
        onSelectionChange={onSelectionChange}
      />,
      { wrapper },
    );
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveFocus();
    await user.tab(); // Name sort
    await user.tab(); // Joined sort
    await user.tab(); // Active sort
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Select Bea" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onSelectionChange).toHaveBeenLastCalledWith(["1"]);
    expect(bodyRows()[0]).toHaveAttribute("data-selected", "true");
  });

  it("starts from defaultSelected and defaultSort", () => {
    render(
      <Table
        columns={columns}
        rows={rows}
        selectable
        defaultSelected={["2"]}
        defaultSort={{ key: "name", direction: "desc" }}
      />,
      { wrapper },
    );
    // Cell 0 is the checkbox.
    expect(column(1)).toEqual(["Cy", "Bea", "Ada"]);
    const checkboxes = screen.getAllByRole("checkbox", { name: "Select row" });
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  });

  it("changes the page size from the per-page select", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `r${i}`, name: `Item ${i + 1}` }));
    const onPerPageChange = vi.fn();
    const { container } = render(
      <Table
        columns={[{ key: "name", header: "Name" }]}
        rows={many}
        paginated
        defaultPerPage={5}
        perPageOptions={[5, 10]}
        onPerPageChange={onPerPageChange}
        aria-labelledby="title"
      />,
      { wrapper },
    );
    expect(bodyRows()).toHaveLength(5);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(await screen.findByRole("option", { name: "10" }));
    expect(onPerPageChange).toHaveBeenCalledWith(10);
    expect(bodyRows()).toHaveLength(10);
    expect(container.querySelector("table")).toHaveAttribute("aria-labelledby", "title");
  });

  // A page-size change must not leave the table on a page past the end:
  // Pagination moves to the page that holds the first row on screen, and
  // DataTable follows it (page 3 at 5 rows is row 11, page 2 at 10).
  it("keeps its first row in view, within range, when the page size changes", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 12 }, (_, i) => ({ id: `r${i}`, name: `Item ${i + 1}` }));
    const onPageChange = vi.fn();
    render(
      <Table
        columns={[{ key: "name", header: "Name" }]}
        rows={many}
        paginated
        defaultPerPage={5}
        defaultPage={3}
        perPageOptions={[5, 10]}
        onPageChange={onPageChange}
        aria-label="Items"
      />,
      { wrapper },
    );
    expect(bodyRows()).toHaveLength(2);
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(await screen.findByRole("option", { name: "10" }));
    expect(onPageChange.mock.calls).toEqual([[2]]);
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Item 11", "Item 12"]);
    // Back at 5 a page, row 11 is on page 3 again, not on a stale page.
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(await screen.findByRole("option", { name: "5" }));
    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
    expect(bodyRows().map((row) => row.textContent)).toEqual(["Item 11", "Item 12"]);
  });

  it("marks the table busy while loading and hides the skeleton rows", async () => {
    const { container } = render(
      <Table columns={columns} rows={rows} loading aria-label="Members" />,
      { wrapper },
    );
    expect(screen.getByRole("table", { name: "Members" })).toHaveAttribute("aria-busy", "true");
    expect(bodyRows()).toHaveLength(0);
    await expectNoAxeViolations(container);
  });
});

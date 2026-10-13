import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn, type DataTableSort } from "../components/DataTable";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type Person = { id: string; name: string; role: string; age: number | null };

const people: Person[] = [
  { id: "p1", name: "Bea", role: "Design", age: 31 },
  { id: "p2", name: "Ada", role: "Engineering", age: 36 },
  { id: "p3", name: "Cy", role: "Product", age: 28 },
];

const columns: DataTableColumn<Person>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role", cell: (row) => <strong>{row.role}</strong> },
  { key: "age", header: "Age", sortable: true, align: "right" },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).queryAllByRole("row");

/** The text of one column for every data row, in order. */
const column = (index: number) =>
  bodyRows().map((row) => within(row).getAllByRole("cell")[index].textContent);

const header = (name: string) => screen.getByRole("columnheader", { name });

describe("DataTable", () => {
  it("renders typed rows through the column definitions", async () => {
    const { container } = render(
      <DataTable aria-label="People" columns={columns} rows={people} />,
      { wrapper: wrap },
    );

    expect(screen.getByRole("table", { name: "People" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Name",
      "Role",
      "Age",
    ]);
    expect(column(0)).toEqual(["Bea", "Ada", "Cy"]);
    // `cell` renders; without one the cell shows the field.
    expect(within(bodyRows()[0]).getByText("Design").tagName).toBe("STRONG");
    expect(column(2)).toEqual(["31", "36", "28"]);
    await expectNoAxeViolations(container);
  });

  describe("sorting", () => {
    it("cycles ascending, descending and unsorted from the header button", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      const { container } = render(
        <DataTable columns={columns} rows={people} onSortChange={onSortChange} />,
        { wrapper: wrap },
      );

      const button = within(header("Name")).getByRole("button", { name: "Name" });
      expect(within(header("Role")).queryByRole("button")).toBeNull();

      await user.click(button);
      expect(header("Name")).toHaveAttribute("aria-sort", "ascending");
      expect(column(0)).toEqual(["Ada", "Bea", "Cy"]);
      expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });

      await user.click(button);
      expect(header("Name")).toHaveAttribute("aria-sort", "descending");
      expect(column(0)).toEqual(["Cy", "Bea", "Ada"]);
      await expectNoAxeViolations(container);

      await user.click(button);
      expect(header("Name")).not.toHaveAttribute("aria-sort");
      expect(column(0)).toEqual(["Bea", "Ada", "Cy"]);
      expect(onSortChange).toHaveBeenLastCalledWith(null);
    });

    it("sorts from the keyboard, and only the sorted header carries aria-sort", async () => {
      const user = userEvent.setup();
      render(<DataTable columns={columns} rows={people} />, { wrapper: wrap });

      await user.tab();
      expect(within(header("Name")).getByRole("button")).toHaveFocus();
      await user.keyboard("{Enter}");
      expect(header("Name")).toHaveAttribute("aria-sort", "ascending");

      await user.tab();
      await user.keyboard(" ");
      expect(header("Age")).toHaveAttribute("aria-sort", "ascending");
      expect(header("Name")).not.toHaveAttribute("aria-sort");
      expect(column(2)).toEqual(["28", "31", "36"]);
    });

    it("compares numbers as numbers, text naturally, and keeps empty values last", async () => {
      const user = userEvent.setup();
      const items = [
        { id: "a", name: "Item 10", age: 9 },
        { id: "b", name: "Item 2", age: null },
        { id: "c", name: "item 1", age: 10 },
        { id: "d", name: "", age: 100 },
      ];
      render(
        <DataTable
          columns={[
            { key: "name", header: "Name", sortable: true },
            { key: "age", header: "Age", sortable: true },
          ]}
          rows={items}
        />,
        { wrapper: wrap },
      );

      await user.click(screen.getByRole("button", { name: "Name" }));
      expect(column(0)).toEqual(["item 1", "Item 2", "Item 10", ""]);
      await user.click(screen.getByRole("button", { name: "Name" }));
      expect(column(0)).toEqual(["Item 10", "Item 2", "item 1", ""]);

      await user.click(screen.getByRole("button", { name: "Age" }));
      expect(column(1)).toEqual(["9", "10", "100", ""]);
      await user.click(screen.getByRole("button", { name: "Age" }));
      expect(column(1)).toEqual(["100", "10", "9", ""]);
    });

    it("uses a column's own comparator, reversed for descending", async () => {
      const user = userEvent.setup();
      const byRoleLength: DataTableColumn<Person> = {
        key: "role",
        header: "Role",
        sortable: true,
        sort: (a, b) => a.role.length - b.role.length,
      };
      render(<DataTable columns={[columns[0], byRoleLength]} rows={people} />, { wrapper: wrap });

      await user.click(screen.getByRole("button", { name: "Role" }));
      expect(column(1)).toEqual(["Design", "Product", "Engineering"]);
      await user.click(screen.getByRole("button", { name: "Role" }));
      expect(column(1)).toEqual(["Engineering", "Product", "Design"]);
    });

    it("follows the host's sort when controlled", async () => {
      const user = userEvent.setup();
      const onSortChange = vi.fn();
      const sort: DataTableSort = { key: "age", direction: "desc" };
      render(
        <DataTable columns={columns} rows={people} sort={sort} onSortChange={onSortChange} />,
        { wrapper: wrap },
      );

      expect(header("Age")).toHaveAttribute("aria-sort", "descending");
      expect(column(2)).toEqual(["36", "31", "28"]);

      await user.click(screen.getByRole("button", { name: "Name" }));
      expect(onSortChange).toHaveBeenCalledWith({ key: "name", direction: "asc" });
      expect(header("Age")).toHaveAttribute("aria-sort", "descending");
    });

    it("never treats a column without a key as the sorted one", () => {
      // Untyped callers can leave `key` out; undefined === undefined must not
      // make every keyless column look sorted before anything is.
      const loose = [
        { header: "First", sortable: true },
        { header: "Second" },
      ] as unknown as DataTableColumn<Person>[];
      render(<DataTable columns={loose} rows={people} />, { wrapper: wrap });

      for (const cell of screen.getAllByRole("columnheader")) {
        expect(cell).not.toHaveAttribute("aria-sort");
        expect(within(cell).queryByRole("button")).toBeNull();
      }
      expect(bodyRows()).toHaveLength(3);
    });

    it("does not submit an enclosing form", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <DataTable columns={columns} rows={people} />
        </form>,
        { wrapper: wrap },
      );
      await user.click(screen.getByRole("button", { name: "Name" }));
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("selection", () => {
    it("selects rows, and selects all of them from the header", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      const { container } = render(
        <DataTable
          aria-label="People"
          columns={columns}
          rows={people}
          selectable
          getRowLabel={(row) => `Select ${row.name}`}
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: wrap },
      );

      const all = screen.getByRole("checkbox", { name: "Select all rows" });
      expect(all).toHaveAttribute("aria-checked", "false");

      await user.click(screen.getByRole("checkbox", { name: "Select Ada" }));
      expect(onSelectionChange).toHaveBeenLastCalledWith(["p2"]);
      expect(screen.getByRole("checkbox", { name: "Select Ada" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(all).toHaveAttribute("aria-checked", "mixed");
      expect(bodyRows()[1]).toHaveAttribute("data-selected", "true");
      await expectNoAxeViolations(container);

      await user.click(all);
      expect(onSelectionChange).toHaveBeenLastCalledWith(["p2", "p1", "p3"]);
      expect(all).toHaveAttribute("aria-checked", "true");

      await user.click(all);
      expect(onSelectionChange).toHaveBeenLastCalledWith([]);
      expect(all).toHaveAttribute("aria-checked", "false");
    });

    it("selects from the keyboard", async () => {
      const user = userEvent.setup();
      render(<DataTable columns={columns} rows={people} selectable />, { wrapper: wrap });

      const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
      boxes[2].focus();
      await user.keyboard(" ");
      expect(boxes[2]).toHaveAttribute("aria-checked", "true");
    });

    it("follows the host's selection when controlled", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          columns={columns}
          rows={people}
          selectable
          selected={["p3"]}
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: wrap },
      );

      const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
      expect(boxes.map((box) => box.getAttribute("aria-checked"))).toEqual([
        "false",
        "false",
        "true",
      ]);
      await user.click(boxes[0]);
      expect(onSelectionChange).toHaveBeenCalledWith(["p3", "p1"]);
      expect(boxes[0]).toHaveAttribute("aria-checked", "false");
    });

    it("gives rows without an id their own selection, not a shared one", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      const anonymous = people.map(({ id: _id, ...rest }) => rest);
      render(
        <DataTable
          columns={columns as unknown as DataTableColumn<(typeof anonymous)[number]>[]}
          rows={anonymous}
          // Returns undefined at runtime: every row would share the id "undefined".
          getRowId={(row) => (row as { uuid?: string }).uuid as string}
          selectable
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: wrap },
      );

      const boxes = screen.getAllByRole("checkbox", { name: "Select row" });
      await user.click(boxes[1]);
      expect(onSelectionChange).toHaveBeenLastCalledWith(["1"]);
      expect(boxes.map((box) => box.getAttribute("aria-checked"))).toEqual([
        "false",
        "true",
        "false",
      ]);
    });
  });

  describe("pagination", () => {
    const many = Array.from({ length: 23 }, (_, index) => ({
      id: `r${index + 1}`,
      name: `Item ${index + 1}`,
      size: 23 - index,
    }));
    const manyColumns: DataTableColumn<(typeof many)[number]>[] = [
      { key: "name", header: "Name" },
      { key: "size", header: "Size", sortable: true },
    ];
    const pagination = () => screen.getByRole("navigation", { name: "Pagination" });

    it("pages the rows on the client", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const { container } = render(
        <DataTable
          columns={manyColumns}
          rows={many}
          paginated
          defaultPerPage={5}
          onPageChange={onPageChange}
        />,
        { wrapper: wrap },
      );

      expect(column(0)).toEqual(["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]);
      await user.click(within(pagination()).getByRole("button", { name: "2" }));
      expect(onPageChange).toHaveBeenLastCalledWith(2);
      expect(column(0)[0]).toBe("Item 6");

      await user.click(within(pagination()).getByRole("button", { name: "5" }));
      expect(column(0)).toEqual(["Item 21", "Item 22", "Item 23"]);
      await expectNoAxeViolations(container);
    });

    it("returns to the first page when the sort changes", async () => {
      const user = userEvent.setup();
      render(
        <DataTable
          columns={manyColumns}
          rows={many}
          paginated
          defaultPerPage={5}
          defaultPage={3}
        />,
        {
          wrapper: wrap,
        },
      );

      expect(column(0)[0]).toBe("Item 11");
      await user.click(screen.getByRole("button", { name: "Size" }));
      expect(column(1)).toEqual(["1", "2", "3", "4", "5"]);
      expect(pagination().querySelector('[aria-current="page"]')).toHaveTextContent("1");
    });

    it("offers page sizes", async () => {
      const user = userEvent.setup();
      const onPerPageChange = vi.fn();
      render(
        <DataTable
          columns={manyColumns}
          rows={many}
          paginated
          defaultPerPage={5}
          perPageOptions={[5, 10, 25]}
          onPerPageChange={onPerPageChange}
        />,
        { wrapper: wrap },
      );

      await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
      await user.click(await screen.findByRole("option", { name: "10" }));
      expect(onPerPageChange).toHaveBeenCalledWith(10);
      expect(bodyRows()).toHaveLength(10);
    });

    it("selects all on the current page only, and keeps the selection across pages", async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn();
      render(
        <DataTable
          columns={manyColumns}
          rows={many}
          paginated
          defaultPerPage={5}
          selectable
          onSelectionChange={onSelectionChange}
        />,
        { wrapper: wrap },
      );

      const all = screen.getByRole("checkbox", { name: "Select all rows on this page" });
      await user.click(all);
      expect(onSelectionChange).toHaveBeenLastCalledWith(["r1", "r2", "r3", "r4", "r5"]);

      await user.click(within(pagination()).getByRole("button", { name: "Next page" }));
      expect(all).toHaveAttribute("aria-checked", "false");
      await user.click(screen.getAllByRole("checkbox", { name: "Select row" })[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith(["r1", "r2", "r3", "r4", "r5", "r6"]);

      await user.click(within(pagination()).getByRole("button", { name: "Previous page" }));
      expect(all).toHaveAttribute("aria-checked", "true");
    });

    it("leaves sorting and slicing to the host with a server count", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      const onSortChange = vi.fn();
      const pageRows = many.slice(0, 10);

      const Server = () => {
        const [page, setPage] = useState(1);
        return (
          <DataTable
            columns={manyColumns}
            rows={pageRows}
            count={95}
            perPage={10}
            page={page}
            onPageChange={(next) => {
              setPage(next);
              onPageChange(next);
            }}
            onSortChange={onSortChange}
          />
        );
      };
      render(<Server />, { wrapper: wrap });

      // 95 rows at 10 a page is 10 pages, though only 10 rows are here.
      expect(within(pagination()).getByRole("button", { name: "10" })).toBeInTheDocument();
      expect(bodyRows()).toHaveLength(10);

      await user.click(within(pagination()).getByRole("button", { name: "Next page" }));
      expect(onPageChange).toHaveBeenLastCalledWith(2);
      // The host has not fetched page 2 yet: the rows stay as given.
      expect(column(0)[0]).toBe("Item 1");

      await user.click(screen.getByRole("button", { name: "Size" }));
      expect(onSortChange).toHaveBeenCalledWith({ key: "size", direction: "asc" });
      expect(onPageChange).toHaveBeenLastCalledWith(1);
      expect(column(0)[0]).toBe("Item 1");
    });

    it("draws no pagination for a single page without page sizes", () => {
      render(<DataTable columns={manyColumns} rows={many.slice(0, 3)} paginated />, {
        wrapper: wrap,
      });
      expect(screen.queryByRole("navigation")).toBeNull();
    });

    it("takes translated names, keeping the defaults it is not given", () => {
      render(
        <>
          <h2 id="people-heading">Leute</h2>
          <DataTable
            aria-labelledby="people-heading"
            columns={manyColumns}
            rows={many}
            paginated
            selectable
            labels={{ selectAll: "Alle auf dieser Seite", pagination: "Seiten", next: "Weiter" }}
          />
        </>,
        { wrapper: wrap },
      );
      expect(screen.getByRole("table", { name: "Leute" })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Alle auf dieser Seite" })).toBeInTheDocument();
      expect(screen.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(10);
      const landmark = screen.getByRole("navigation", { name: "Seiten" });
      expect(within(landmark).getByRole("button", { name: "Weiter" })).toBeInTheDocument();
      expect(within(landmark).getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    });
  });

  describe("empty and loading", () => {
    it("shows the default empty state, or the one given", () => {
      const { rerender } = render(<DataTable columns={columns} rows={[]} paginated />, {
        wrapper: wrap,
      });
      expect(screen.getByText("No data available")).toBeInTheDocument();
      expect(within(bodyRows()[0]).getByRole("cell")).toHaveAttribute("colspan", "3");
      expect(screen.queryByRole("navigation")).toBeNull();

      rerender(
        <DataTable columns={columns} rows={[]} selectable emptyState={<p>No people yet</p>} />,
      );
      expect(screen.getByText("No people yet")).toBeInTheDocument();
      expect(within(bodyRows()[0]).getByRole("cell")).toHaveAttribute("colspan", "4");
      expect(screen.getByRole("checkbox", { name: "Select all rows" })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("swaps the rows for skeletons while loading, and disables the controls", async () => {
      const many = Array.from({ length: 12 }, (_, index) => ({
        id: `r${index}`,
        name: `Row ${index}`,
        role: "",
        age: index,
      }));
      const { container } = render(
        <DataTable columns={columns} rows={many} paginated defaultPerPage={5} selectable loading />,
        { wrapper: wrap },
      );

      const table = screen.getByRole("table");
      expect(table).toHaveAttribute("aria-busy", "true");
      expect(screen.queryByText("Row 0")).toBeNull();
      // One skeleton row per row of the page, hidden from assistive technology.
      const skeletons = table.querySelectorAll('tbody tr[aria-hidden="true"]');
      expect(skeletons).toHaveLength(5);
      expect(within(header("Name")).getByRole("button")).toBeDisabled();
      expect(
        screen.getByRole("checkbox", { name: "Select all rows on this page" }),
      ).toHaveAttribute("aria-disabled", "true");
      for (const button of within(screen.getByRole("navigation")).getAllByRole("button")) {
        expect(button).toBeDisabled();
      }
      await expectNoAxeViolations(container);
    });
  });
});

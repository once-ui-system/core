import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilters,
  type DataTableQuery,
} from "../components/DataTable";
import { resetScrollLockState } from "../components/ScrollLock";
import { Table } from "../components/Table";
import tableStyles from "../components/Table.module.scss";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { clearLastOpenedDropdown } from "../utils/dropdownState";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

beforeEach(() => {
  resetScrollLockState();
  clearLastOpenedDropdown();
});

type Order = {
  id: string;
  customer: string;
  status: "paid" | "pending" | "refunded";
  tags: string[];
};

const orders: Order[] = [
  { id: "o1", customer: "Acme", status: "paid", tags: ["eu"] },
  { id: "o2", customer: "Globex", status: "pending", tags: ["us"] },
  { id: "o3", customer: "Initech", status: "paid", tags: ["us", "eu"] },
  { id: "o4", customer: "Hooli", status: "refunded", tags: [] },
];

const STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
];

const columns: DataTableColumn<Order>[] = [
  { key: "id", header: "Order", sortable: true },
  { key: "customer", header: "Customer", sortable: true },
  { key: "status", header: "Status", filter: { options: STATUS_OPTIONS } },
  { key: "tags", header: "Region", hide: { s: true } },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).queryAllByRole("row");
const firstColumn = () => bodyRows().map((row) => within(row).getAllByRole("cell")[0].textContent);

const searchField = () => screen.getByRole("textbox", { name: "Search" });
const filterField = (name: string) => screen.getByRole("combobox", { name });

const pick = async (user: ReturnType<typeof userEvent.setup>, field: string, option: string) => {
  await user.click(filterField(field));
  await waitFor(() => expect(filterField(field)).toHaveAttribute("aria-expanded", "true"));
  await user.click(await screen.findByRole("option", { name: option }));
};

describe("DataTable search and filters", () => {
  it("draws no toolbar unless one is asked for", () => {
    render(<DataTable aria-label="Orders" columns={columns.slice(0, 2)} rows={orders} />, {
      wrapper,
    });
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("searches every column's field on the client, and announces the count", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    const { container } = render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders}
        searchable
        onSearchChange={onSearchChange}
      />,
      { wrapper },
    );

    await user.type(searchField(), "GLOB");
    expect(firstColumn()).toEqual(["o2"]);
    expect(onSearchChange).toHaveBeenLastCalledWith("GLOB");
    expect(screen.getByRole("status")).toHaveTextContent("1 result");

    // An array field is searched too.
    await user.clear(searchField());
    await user.type(searchField(), "eu");
    expect(firstColumn()).toEqual(["o1", "o3"]);
    expect(screen.getByRole("status")).toHaveTextContent("2 results");
    await expectNoAxeViolations(container);
  });

  it("filters by a column's select, and its All option clears the filter", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    const { container } = render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders}
        searchable
        onFiltersChange={onFiltersChange}
      />,
      { wrapper },
    );

    // Unfiltered, the select is empty and named after its column.
    expect(filterField("Status")).toHaveValue("");
    await pick(user, "Status", "Paid");
    expect(firstColumn()).toEqual(["o1", "o3"]);
    expect(onFiltersChange).toHaveBeenLastCalledWith({ status: "paid" });
    expect(filterField("Status")).toHaveValue("Paid");
    await expectNoAxeViolations(container);

    // Search and filter both have to pass.
    await user.type(searchField(), "init");
    expect(firstColumn()).toEqual(["o3"]);

    await pick(user, "Status", "All");
    expect(onFiltersChange).toHaveBeenLastCalledWith({});
    expect(firstColumn()).toEqual(["o3"]);
    expect(filterField("Status")).toHaveValue("");
  });

  it("takes multiple values, a custom match and controlled filters", async () => {
    const user = userEvent.setup();
    const regionColumns: DataTableColumn<Order>[] = [
      { key: "id", header: "Order" },
      {
        key: "status",
        header: "Status",
        filter: { options: STATUS_OPTIONS, multiple: true },
      },
      {
        key: "tags",
        header: <span>Region</span>,
        label: "Region",
        filter: {
          options: [{ value: "none", label: "No region" }],
          match: (row) => row.tags.length === 0,
        },
      },
    ];
    const seen: DataTableFilters[] = [];
    function Host() {
      const [filters, setFilters] = useState<DataTableFilters>({ status: ["paid", "pending"] });
      return (
        <DataTable
          aria-label="Orders"
          columns={regionColumns}
          rows={orders}
          filters={filters}
          onFiltersChange={(next) => {
            seen.push(next);
            setFilters(next);
          }}
        />
      );
    }
    render(<Host />, { wrapper });

    expect(firstColumn()).toEqual(["o1", "o2", "o3"]);
    await pick(user, "Status", "Refunded");
    expect(seen.at(-1)).toEqual({ status: ["paid", "pending", "refunded"] });
    expect(firstColumn()).toEqual(["o1", "o2", "o3", "o4"]);

    // `label` names a column whose header is not text.
    await pick(user, "Region", "No region");
    expect(seen.at(-1)).toEqual({ status: ["paid", "pending", "refunded"], tags: "none" });
    expect(firstColumn()).toEqual(["o4"]);
  });

  it("tells no results apart from no data, and clears the query from there", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders}
        searchable
        defaultSearch="zzz"
      />,
      { wrapper },
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.queryByText("No data available")).toBeNull();
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(searchField()).toHaveValue("");
    expect(firstColumn()).toEqual(["o1", "o2", "o3", "o4"]);

    rerender(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={[]}
        searchable
        noResultsState="Nothing matches"
      />,
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();

    await user.type(searchField(), "x");
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("goes back to the first page when the search changes", async () => {
    const user = userEvent.setup();
    const many = Array.from({ length: 12 }, (_, n) => ({
      id: `r${n + 1}`,
      customer: n % 2 ? "Odd" : "Even",
      status: "paid" as const,
      tags: [],
    }));
    const onPageChange = vi.fn();
    render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={many}
        searchable
        paginated
        defaultPerPage={5}
        defaultPage={2}
        onPageChange={onPageChange}
      />,
      { wrapper },
    );

    expect(firstColumn()[0]).toBe("r6");
    await user.type(searchField(), "r");
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(firstColumn()[0]).toBe("r1");
  });
});

describe("DataTable server mode queries", () => {
  it("reports the search and filters without filtering the server's rows", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onSearchChange = vi.fn();
    render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders.slice(0, 2)}
        count={40}
        perPage={2}
        searchable
        onSearchChange={onSearchChange}
        onQueryChange={onQueryChange}
      />,
      { wrapper },
    );

    await user.type(searchField(), "a");
    expect(onSearchChange).toHaveBeenLastCalledWith("a");
    // The page is the server's: nothing is taken out of it.
    expect(firstColumn()).toEqual(["o1", "o2"]);
    expect(onQueryChange).toHaveBeenLastCalledWith({
      page: 1,
      perPage: 2,
      sort: null,
      search: "a",
      filters: {},
    } satisfies DataTableQuery);

    await pick(user, "Status", "Pending");
    expect(onQueryChange).toHaveBeenLastCalledWith({
      page: 1,
      perPage: 2,
      sort: null,
      search: "a",
      filters: { status: "pending" },
    });
    expect(firstColumn()).toEqual(["o1", "o2"]);
  });

  it("reports each page, sort and page-size change once, with the whole query", async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onPageChange = vi.fn();
    function Host() {
      const [page, setPage] = useState(1);
      return (
        <DataTable
          aria-label="Orders"
          columns={columns}
          rows={orders.slice(0, 2)}
          count={40}
          page={page}
          onPageChange={(next) => {
            onPageChange(next);
            setPage(next);
          }}
          defaultPerPage={10}
          perPageOptions={[10, 20]}
          onQueryChange={onQueryChange}
        />
      );
    }
    render(<Host />, { wrapper });

    await user.click(screen.getByRole("button", { name: "3" }));
    expect(onQueryChange.mock.calls).toEqual([
      [{ page: 3, perPage: 10, sort: null, search: "", filters: {} }],
    ]);

    onQueryChange.mockClear();
    await user.click(screen.getByRole("button", { name: "Customer" }));
    expect(onQueryChange.mock.calls).toEqual([
      [
        {
          page: 1,
          perPage: 10,
          sort: { key: "customer", direction: "asc" },
          search: "",
          filters: {},
        },
      ],
    ]);

    // Page 3 at 10 rows starts at row 21: at 20 rows that is page 2.
    await user.click(screen.getByRole("button", { name: "3" }));
    onQueryChange.mockClear();
    onPageChange.mockClear();
    await user.click(screen.getByRole("combobox", { name: "Rows per page" }));
    await user.click(await screen.findByRole("option", { name: "20" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(onQueryChange.mock.calls).toEqual([
      [
        {
          page: 2,
          perPage: 20,
          sort: { key: "customer", direction: "asc" },
          search: "",
          filters: {},
        },
      ],
    ]);
  });

  it("keeps the last rows on screen, dimmed and busy, with keepRowsWhileLoading", async () => {
    const { container, rerender } = render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders}
        count={4}
        selectable
        loading
        keepRowsWhileLoading
      />,
      { wrapper },
    );

    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(bodyRows().map((row) => within(row).getAllByRole("cell")[1].textContent)).toEqual([
      "o1",
      "o2",
      "o3",
      "o4",
    ]);
    for (const box of within(screen.getAllByRole("rowgroup")[1]).getAllByRole("checkbox")) {
      expect(box).toHaveAttribute("aria-disabled", "true");
    }
    await expectNoAxeViolations(container);

    // Without rows yet, skeletons stand in as before.
    rerender(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={[]}
        count={0}
        loading
        keepRowsWhileLoading
      />,
    );
    const rowsNow = within(container.querySelectorAll("tbody")[0] as HTMLElement).queryAllByRole(
      "row",
      { hidden: true },
    );
    expect(rowsNow.every((row) => row.getAttribute("aria-hidden") === "true")).toBe(true);
  });
});

describe("DataTable columns", () => {
  it("hides a column per breakpoint with classes the server renders", () => {
    render(
      <DataTable
        aria-label="Orders"
        columns={[
          ...columns.slice(0, 3),
          { key: "tags", header: "Region", hide: { m: true, xs: false } },
        ]}
        rows={orders}
      />,
      { wrapper },
    );

    const region = screen.getByRole("columnheader", { name: "Region" });
    expect(region).toHaveClass(tableStyles.hideM, tableStyles.showXs);
    expect(region).not.toHaveClass(tableStyles.hideS);
    for (const row of bodyRows()) {
      expect(within(row).getAllByRole("cell")[3]).toHaveClass(tableStyles.hideM);
    }
    expect(screen.getByRole("columnheader", { name: "Order" }).className).not.toMatch(/hide|show/);
  });

  it("puts the hide classes in the server render, before any script runs", () => {
    const html = renderToString(
      <LayoutProvider>
        <DataTable aria-label="Orders" columns={columns} rows={orders} />
      </LayoutProvider>,
    );
    // The header and the four cells of the Region column.
    expect(html.split(tableStyles.hideS).length - 1).toBe(5);
  });

  it("shows and hides columns from the columns menu, keeping the last one", async () => {
    const user = userEvent.setup();
    const onColumnVisibilityChange = vi.fn();
    const { baseElement } = render(
      <DataTable
        aria-label="Orders"
        columns={columns.slice(0, 2)}
        rows={orders}
        columnsMenu
        defaultColumnVisibility={{ id: false }}
        onColumnVisibilityChange={onColumnVisibilityChange}
      />,
      { wrapper },
    );

    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Customer",
    ]);
    await user.click(screen.getByRole("button", { name: "Columns" }));
    const customer = await screen.findByRole("checkbox", { name: "Customer" });
    // The only column on screen cannot go.
    expect(customer).toHaveAttribute("aria-disabled", "true");
    await expectNoAxeViolations(baseElement);

    await user.click(screen.getByRole("checkbox", { name: "Order" }));
    expect(onColumnVisibilityChange).toHaveBeenLastCalledWith({ id: true });
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Order",
      "Customer",
    ]);
    expect(screen.getByRole("checkbox", { name: "Customer" })).toHaveAttribute(
      "aria-disabled",
      "false",
    );
  });

  it("follows controlled column visibility", () => {
    render(
      <DataTable
        aria-label="Orders"
        columns={columns}
        rows={orders}
        columnVisibility={{ status: false, tags: false }}
      />,
      { wrapper },
    );
    expect(screen.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Order",
      "Customer",
    ]);
    expect(within(bodyRows()[0]).getAllByRole("cell")).toHaveLength(2);
  });
});

describe("Table column hide", () => {
  it("hides a header and its cells per breakpoint", () => {
    render(
      <Table
        data={{
          headers: [
            { key: "name", content: "Name" },
            { key: "email", content: "Email", hide: { s: true } },
          ],
          rows: [["Bea", "bea@example.com"]],
        }}
      />,
      { wrapper },
    );
    expect(screen.getByRole("columnheader", { name: "Email" })).toHaveClass(tableStyles.hideS);
    expect(screen.getByRole("cell", { name: "bea@example.com" })).toHaveClass(tableStyles.hideS);
    expect(screen.getByRole("cell", { name: "Bea" }).className).not.toMatch(/hide/);
  });
});

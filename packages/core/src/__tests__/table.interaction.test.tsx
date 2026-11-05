import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Table } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const people = {
  headers: [
    { content: "Name", key: "name", sortable: true },
    { content: "Team", key: "team" },
  ],
  rows: [
    ["Bea", "Design"],
    ["Ada", "Engineering"],
    ["Cy", "Product"],
    ["Dee", "Design"],
    ["Eve", "Sales"],
  ],
};

/** The page Pagination marks as current. */
const currentPage = () => document.querySelector('[aria-current="page"]')?.textContent;

const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).queryAllByRole("cell")[0]?.textContent);

/**
 * Table's interactive features beyond sorting (table-sort.test.tsx): search
 * filters rows and resets to the first page, row clicks and row actions
 * report the row's index in `rows`, pagination slices the rows, and a third
 * press on a header clears the sort.
 */
describe("Table interaction", () => {
  it("filters rows by search and counts what is left", async () => {
    const user = userEvent.setup();
    render(
      <Table
        searchable
        searchPlaceholder="Find"
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
      />,
      { wrapper },
    );
    await user.type(screen.getByPlaceholderText("Find"), "des");
    expect(names()).toEqual(["Bea", "Dee"]);
    expect(screen.getByText("2 of 5")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Find"));
    await user.type(screen.getByPlaceholderText("Find"), "zzz");
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try a different search or filter")).toBeInTheDocument();
  });

  it("reports the original row index on row click, sorted or not", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <Table
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        onRowClick={(_row, ...args) => onRowClick(...args)}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(names()[0]).toBe("Ada");
    await user.click(screen.getByRole("cell", { name: "Ada" }));
    expect(onRowClick).toHaveBeenCalledWith(1);
  });

  it("runs row actions with the row index, without clicking the row", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onDelete = vi.fn();
    render(
      <Table
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        onRowClick={(_row, ...args) => onRowClick(...args)}
        actions={[
          {
            icon: "trash",
            tooltip: "Delete",
            onClick: (_row, ...args) => onDelete(...args),
            disabled: (_row, i) => i === 0,
          },
        ]}
      />,
      { wrapper },
    );
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: "Delete" });
    expect(buttons[0]).toBeDisabled();
    await user.click(buttons[2]);
    expect(onDelete).toHaveBeenCalledWith(2);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("pages the rows and moves between pages", async () => {
    const user = userEvent.setup();
    render(
      <Table
        paginated
        defaultPerPage={2}
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
      />,
      { wrapper },
    );
    expect(names()).toEqual(["Bea", "Ada"]);
    expect(currentPage()).toBe("1");
    expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(names()).toEqual(["Cy", "Dee"]);
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(names()).toEqual(["Eve"]);
  });

  it("still shows rows when they shrink under the current page", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Table
        paginated
        defaultPerPage={2}
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
      />,
      {
        wrapper,
      },
    );
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(names()).toEqual(["Eve"]);
    rerender(
      <Table
        paginated
        defaultPerPage={2}
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows.slice(0, 3)}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
      />,
    );
    expect(currentPage()).toBe("2");
    expect(screen.queryByRole("button", { name: "3" })).toBeNull();
    expect(names()).toEqual(["Cy"]);
  });

  it("returns to the first page when the search changes", async () => {
    const user = userEvent.setup();
    render(
      <Table
        paginated
        defaultPerPage={2}
        searchable
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.type(screen.getByPlaceholderText("Search..."), "e");
    expect(currentPage()).toBe("1");
  });

  it("clears the sort on a third press of the header", async () => {
    const user = userEvent.setup();
    render(
      <Table
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    await user.click(screen.getByRole("button", { name: "Name" }));
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(names()[0]).toBe("Bea");
    expect(screen.getByRole("columnheader", { name: "Name" })).not.toHaveAttribute("aria-sort");
  });

  it("shows loading and custom empty states", () => {
    const { rerender } = render(
      <Table
        loading
        loadingState="Loading data..."
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
      />,
      { wrapper },
    );
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    rerender(
      <Table
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={[]}
        emptyState="Nobody here"
      />,
    );
    expect(screen.getByText("Nobody here")).toBeInTheDocument();
  });

  it("has no axe violations with search, actions and pages", async () => {
    const { container } = render(
      <Table
        searchable
        paginated
        defaultPerPage={2}
        columns={people.headers.map(({ content, ...column }) => ({ ...column, header: content }))}
        rows={people.rows}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
        actions={[
          { icon: "trash", tooltip: "Delete", onClick: (_row, ...args) => vi.fn()(...args) },
        ]}
      />,
      { wrapper },
    );
    await expectNoAxeViolations(container);
  });
});

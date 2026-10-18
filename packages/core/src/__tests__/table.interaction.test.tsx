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

const names = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).queryAllByRole("cell")[0]?.textContent);

/**
 * Table's interactive features beyond sorting (table-sort.test.tsx): search
 * filters rows and resets to the first page, row clicks and row actions
 * report the row's index in `data.rows`, pagination slices the rows, and the
 * sort can be cleared.
 */
describe("Table interaction", () => {
  it("filters rows by search and counts what is left", async () => {
    const user = userEvent.setup();
    render(<Table data={people} searchable searchPlaceholder="Find" />, { wrapper });
    await user.type(screen.getByPlaceholderText("Find"), "des");
    expect(names()).toEqual(["Bea", "Dee"]);
    expect(screen.getByText("2 of 5")).toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Find"));
    await user.type(screen.getByPlaceholderText("Find"), "zzz");
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.getByText("Try adjusting your search")).toBeInTheDocument();
  });

  it("reports the original row index on row click, sorted or not", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<Table data={people} onRowClick={onRowClick} />, { wrapper });
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
        data={people}
        onRowClick={onRowClick}
        actions={[
          { icon: "trash", tooltip: "Delete", onClick: onDelete, disabled: (i) => i === 0 },
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
    render(<Table data={people} paginated defaultPageSize={2} />, { wrapper });
    expect(names()).toEqual(["Bea", "Ada"]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(names()).toEqual(["Cy", "Dee"]);
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(names()).toEqual(["Eve"]);
  });

  it("still shows rows when they shrink under the current page", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Table data={people} paginated defaultPageSize={2} />, {
      wrapper,
    });
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(names()).toEqual(["Eve"]);
    rerender(
      <Table data={{ ...people, rows: people.rows.slice(0, 3) }} paginated defaultPageSize={2} />,
    );
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(names()).toEqual(["Cy"]);
  });

  it("returns to the first page when the search changes", async () => {
    const user = userEvent.setup();
    render(<Table data={people} paginated defaultPageSize={2} searchable />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.type(screen.getByPlaceholderText("Search..."), "e");
    expect(screen.getByText(/^1 \//)).toBeInTheDocument();
  });

  it("clears the sort from the footer", async () => {
    const user = userEvent.setup();
    render(<Table data={people} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getByText("Sorted by Name")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear sort" }));
    expect(names()[0]).toBe("Bea");
    expect(screen.getByRole("columnheader", { name: "Name" })).not.toHaveAttribute("aria-sort");
  });

  it("shows loading and custom empty states", () => {
    const { rerender } = render(<Table data={people} loading />, { wrapper });
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    rerender(<Table data={{ ...people, rows: [] }} emptyState="Nobody here" />);
    expect(screen.getByText("Nobody here")).toBeInTheDocument();
  });

  it("has no axe violations with search, actions and pages", async () => {
    const { container } = render(
      <Table
        data={people}
        searchable
        paginated
        defaultPageSize={2}
        actions={[{ icon: "trash", tooltip: "Delete", onClick: vi.fn() }]}
      />,
      { wrapper },
    );
    await expectNoAxeViolations(container);
  });
});

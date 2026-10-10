import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Table } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const data = {
  headers: [
    { content: "Name", key: "name", sortable: true },
    { content: "Role", key: "role", sortable: true },
    { content: "Notes", key: "notes" },
  ],
  rows: [
    ["Bea", "Design", "-"],
    ["Ada", "Engineering", "-"],
    ["Cy", "Product", "-"],
  ],
};

const firstColumn = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

/** Sortable headers are operable without a pointer (ROADMAP W3). */
describe("Table sorting accessibility", () => {
  it("renders sortable headers as buttons inside the column headers", async () => {
    const { container } = render(<Table data={data} />, { wrapper: wrap });

    const nameHeader = screen.getByRole("columnheader", { name: "Name" });
    expect(within(nameHeader).getByRole("button", { name: "Name" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(
      within(screen.getByRole("columnheader", { name: "Notes" })).queryByRole("button"),
    ).toBeNull();
    for (const header of screen.getAllByRole("columnheader")) {
      expect(header).not.toHaveAttribute("aria-sort");
    }
    await expectNoAxeViolations(container);
  });

  it("sorts from the keyboard and reports the direction with aria-sort", async () => {
    const user = userEvent.setup();
    const { container } = render(<Table data={data} />, { wrapper: wrap });
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });

    await user.tab();
    expect(within(nameHeader).getByRole("button")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(firstColumn()).toEqual(["Ada", "Bea", "Cy"]);

    await user.keyboard(" ");
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(firstColumn()).toEqual(["Cy", "Bea", "Ada"]);

    // aria-sort moves with the sort: only one header carries it.
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("columnheader", { name: "Role" })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(nameHeader).not.toHaveAttribute("aria-sort");
    await expectNoAxeViolations(container);
  });

  it("still sorts from a click anywhere in the header cell", async () => {
    const user = userEvent.setup();
    render(<Table data={data} />, { wrapper: wrap });
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });

    await user.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(nameHeader).getByRole("button"));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("does not submit an enclosing form when sorting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Table data={data} />
      </form>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

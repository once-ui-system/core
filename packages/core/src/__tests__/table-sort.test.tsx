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

// 2.x's data={{ headers, rows }} as the codemod writes it: each header's
// `content` is the column's `header`, and the array rows are read by position.
const data = {
  columns: [
    { header: "Name", key: "name", sortable: true },
    { header: "Role", key: "role", sortable: true },
    { header: "Notes", key: "notes" },
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
    const { container } = render(<Table {...data} />, { wrapper: wrap });

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
    const { container } = render(<Table {...data} />, { wrapper: wrap });
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

  // The button's ::after covers the whole cell, padding included, so a click
  // anywhere in it lands on the button in a browser; jsdom draws no boxes.
  it("sorts from a click on the header's button, the whole cell in a browser", async () => {
    const user = userEvent.setup();
    render(<Table {...data} />, { wrapper: wrap });
    const nameHeader = screen.getByRole("columnheader", { name: "Name" });

    await user.click(within(nameHeader).getByRole("button"));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(nameHeader).getByRole("button"));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("does not submit an enclosing form when sorting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Table {...data} />
      </form>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("renders headers without a key, as untyped MDX tables write them", () => {
    const keyless = {
      columns: [{ header: "Class" }, { header: "Value" }],
      rows: [[".m-0", "0"]],
    } as unknown as typeof data;
    render(<Table {...keyless} />, { wrapper: wrap });

    const header = screen.getByRole("columnheader", { name: "Class" });
    expect(header).not.toHaveAttribute("aria-sort");
  });
});

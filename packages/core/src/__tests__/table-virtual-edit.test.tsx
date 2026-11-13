import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type Item = { id: string; name: string; qty: number };

const many: Item[] = Array.from({ length: 1000 }, (_, n) => ({
  id: `i${n}`,
  name: `Item ${n}`,
  qty: n,
}));

const columns: TableColumn<Item>[] = [
  { key: "name", header: "Name" },
  { key: "qty", header: "Qty", align: "right" },
];

describe("Table virtualize", () => {
  it("renders a window of the rows, with spacers and row positions", () => {
    const { container } = render(
      <Table
        aria-label="Stock"
        columns={columns}
        rows={many}
        getRowId={(row) => row.id}
        virtualize
        maxHeight={20}
      />,
      { wrapper },
    );
    const rows = container.querySelectorAll("tbody tr:not([aria-hidden])");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(60);
    expect(screen.getByText("Item 0")).toBeTruthy();
    expect(screen.queryByText("Item 500")).toBeNull();
    expect(screen.getByRole("table").getAttribute("aria-rowcount")).toBe("1001");
    expect(rows[0].getAttribute("aria-rowindex")).toBe("2");
    const bottom = container.querySelector("tbody tr[aria-hidden]:last-child td") as HTMLElement;
    expect(Number.parseFloat(bottom.style.height)).toBeGreaterThan(0);
  });

  it("moves the window with the scroll position", () => {
    const { container } = render(
      <Table
        aria-label="Stock"
        columns={columns}
        rows={many}
        getRowId={(row) => row.id}
        virtualize
        rowHeight={40}
        maxHeight={20}
      />,
      { wrapper },
    );
    const scroller = container.querySelector("table")?.parentElement as HTMLElement;
    Object.defineProperty(scroller, "clientHeight", { configurable: true, value: 400 });
    scroller.scrollTop = 40 * 500;
    fireEvent.scroll(scroller);
    expect(screen.getByText("Item 500")).toBeTruthy();
    expect(screen.queryByText("Item 0")).toBeNull();
    const first = container.querySelector("tbody tr[aria-rowindex]");
    expect(Number(first?.getAttribute("aria-rowindex"))).toBe(500 - 6 + 2);
  });

  it("renders every row without virtualize", () => {
    const { container } = render(
      <Table aria-label="Stock" columns={columns} rows={many.slice(0, 80)} maxHeight={20} />,
      { wrapper },
    );
    expect(container.querySelectorAll("tbody tr").length).toBe(80);
    expect(screen.getByRole("table").hasAttribute("aria-rowcount")).toBe(false);
  });
});

function Editable({ onCommit }: { onCommit?: (row: Item, value: string) => void }) {
  const [rows, setRows] = useState(many.slice(0, 3));
  return (
    <Table
      aria-label="Stock"
      getRowId={(row) => row.id}
      rows={rows}
      columns={[
        {
          key: "name",
          header: "Name",
          edit: {
            onCommit: (row, value) => {
              onCommit?.(row, value);
              setRows((all) => all.map((r) => (r.id === row.id ? { ...r, name: value } : r)));
            },
            disabled: (row) => row.id === "i2",
          },
        },
        { key: "qty", header: "Qty" },
      ]}
    />
  );
}

describe("Table editable cells", () => {
  it("opens a field on click, saves on Enter and focuses the cell again", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Editable onCommit={onCommit} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Item 0, Edit Name" }));
    const field = screen.getByRole("textbox", { name: "Edit Name" });
    expect(field).toHaveProperty("value", "Item 0");
    await user.clear(field);
    await user.type(field, "Bolts{Enter}");
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ id: "i0" }), "Bolts");
    expect(screen.getByText("Bolts")).toBeTruthy();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Bolts, Edit Name" }));
  });

  it("cancels on Escape", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Editable onCommit={onCommit} />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Item 1, Edit Name" }));
    await user.type(screen.getByRole("textbox", { name: "Edit Name" }), "x{Escape}");
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByText("Item 1")).toBeTruthy();
  });

  it("saves when the field loses focus, and keeps disabled rows read-only", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Editable onCommit={onCommit} />, { wrapper });
    expect(screen.queryByRole("button", { name: /Item 2/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Item 0, Edit Name" }));
    await user.type(screen.getByRole("textbox", { name: "Edit Name" }), "!");
    await user.click(document.body);
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ id: "i0" }), "Item 0!");
  });

  it("does not run the row click when a cell is edited", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <Table
        aria-label="Stock"
        rows={many.slice(0, 2)}
        onRowClick={onRowClick}
        columns={[{ key: "name", header: "Name", edit: { onCommit: () => {} } }]}
      />,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Item 0, Edit Name" }));
    await user.type(screen.getByRole("textbox", { name: "Edit Name" }), "{Escape}");
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Editable />, { wrapper });
    await expectNoAxeViolations(container);
  });
});

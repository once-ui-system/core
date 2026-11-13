import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Button } from "../components/Button.js";
import { EmptyState } from "../components/EmptyState.js";
import { Table } from "../components/Table.js";
import { LayoutProvider } from "../contexts/LayoutProvider.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("EmptyState", () => {
  it("renders the title as a heading, the description and the action", () => {
    render(
      <EmptyState
        title="No clients yet"
        description="Invite a client by email."
        action={<Button onClick={() => {}}>New client</Button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "No clients yet" })).toBeTruthy();
    expect(screen.getByText("Invite a client by email.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New client" })).toBeTruthy();
  });

  it("takes the heading level from titleAs", () => {
    render(<EmptyState titleAs="h3" title="No results" />);
    expect(screen.getByRole("heading", { level: 3, name: "No results" })).toBeTruthy();
  });

  it("puts a visual above the title, hidden from screen readers, and prefers it over icon", () => {
    const { container } = render(
      <EmptyState icon="inbox" visual={<span data-testid="art" />} title="Empty" />,
    );
    const art = screen.getByTestId("art");
    expect(art.closest("[aria-hidden='true']")).toBeTruthy();
    expect(container.querySelectorAll("svg").length).toBe(0);
  });

  it("marks its size for styling", () => {
    const { container } = render(<EmptyState size="l" title="Empty" />);
    expect(container.firstElementChild?.getAttribute("data-size")).toBe("l");
  });
});

describe("Table empty states use EmptyState", () => {
  const columns = [{ key: "name" as const, header: "Name", sortable: true }];

  it("shows the default empty state with no rows", () => {
    const { container } = render(<Table columns={columns} rows={[]} />, { wrapper });
    expect(screen.getByRole("heading", { level: 3, name: "No data available" })).toBeTruthy();
    expect(container.querySelector("[data-size='s']")).toBeTruthy();
  });

  it("keeps the clear filters action when a search matches nothing", () => {
    render(<Table columns={columns} rows={[{ name: "Ada" }]} searchable defaultSearch="zzz" />, {
      wrapper,
    });
    expect(screen.getByRole("heading", { level: 3, name: "No results" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Ada")).toBeTruthy();
  });
});

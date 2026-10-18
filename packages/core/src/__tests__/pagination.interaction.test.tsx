import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../components/Pagination";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const current = () => screen.getByRole("button", { current: "page" });
const pageButton = (n: number) => screen.getByRole("button", { name: String(n) });

/**
 * Keyboard paging, which pagination.test.tsx covers only for the arrows:
 * Tab walks the controls in reading order, Enter and Space pick a page, and
 * focus stays on a control that still exists after the page set redraws.
 */
describe("Pagination: keyboard", () => {
  it("tabs through previous, the pages and next in order", async () => {
    const user = userEvent.setup();
    render(<Pagination total={3} defaultPage={2} />, { wrapper });
    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      await user.tab();
      order.push(
        document.activeElement?.getAttribute("aria-label") ??
          document.activeElement?.textContent ??
          "",
      );
    }
    expect(order).toEqual(["Previous page", "1", "2", "3", "Next page"]);
  });

  it("picks a page with Enter and with Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination total={5} onPageChange={onChange} />, { wrapper });
    pageButton(3).focus();
    await user.keyboard("{Enter}");
    expect(current()).toHaveTextContent("3");
    pageButton(4).focus();
    await user.keyboard(" ");
    expect(current()).toHaveTextContent("4");
    expect(onChange.mock.calls.map(([page]) => page)).toEqual([3, 4]);
  });

  it("keeps focus on the page button that was pressed when the set redraws", async () => {
    const user = userEvent.setup();
    render(<Pagination total={20} />, { wrapper });
    pageButton(5).focus();
    await user.keyboard("{Enter}");
    expect(current()).toHaveTextContent("5");
    expect(current()).toHaveFocus();
  });

  it("skips disabled arrows in the Tab order", async () => {
    const user = userEvent.setup();
    render(<Pagination total={3} showFirstLast />, { wrapper });
    await user.tab();
    expect(pageButton(1)).toHaveFocus();
  });
});

describe("Pagination: rendering", () => {
  it("passes axe with ellipses and first/last buttons", async () => {
    const { container } = render(<Pagination total={50} defaultPage={25} showFirstLast />, {
      wrapper,
    });
    const list = within(screen.getByRole("navigation", { name: "Pagination" })).getByRole("list");
    expect(within(list).getAllByText("…")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "First page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Last page" })).toBeEnabled();
    await expectNoAxeViolations(container);
  });

  it("works as a controlled pair with the host", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [page, setPage] = useState(1);
      return (
        <>
          <Pagination total={10} page={page} onPageChange={setPage} showFirstLast />
          <output>{page}</output>
        </>
      );
    };
    render(<Host />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(screen.getByRole("status")).toHaveTextContent("10");
    expect(current()).toHaveTextContent("10");
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "First page" }));
    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  it("names two paginations apart and forwards the ref", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <>
        <Pagination ref={ref} total={2} aria-label="Top pages" />
        <Pagination total={2} aria-label="Bottom pages" />
      </>,
      { wrapper },
    );
    expect(ref.current).toBe(screen.getByRole("navigation", { name: "Top pages" }));
    expect(screen.getByRole("navigation", { name: "Bottom pages" })).toBeInTheDocument();
  });
});

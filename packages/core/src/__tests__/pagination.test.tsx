import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../components/Pagination";
import { Table } from "../components/Table";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { paginationItems } from "../internal/pagination";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const nav = () => screen.getByRole("navigation", { name: "Pagination" });

/** What the list shows, in order: page numbers, "…" for a gap. Arrows are left out. */
const shown = () =>
  within(nav())
    .getAllByRole("listitem")
    .map((item) => item.textContent)
    .filter((label) => label !== "");

const currentPage = () => nav().querySelector('[aria-current="page"]');

describe("paginationItems", () => {
  it("lists every page when they all fit", () => {
    expect(paginationItems(1, 7, 1, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginationItems(1, 1, 1, 1)).toEqual([1]);
    expect(paginationItems(2, 2, 1, 1)).toEqual([1, 2]);
    expect(paginationItems(1, 3, 1, 0)).toEqual([1, 2, 3]);
  });

  it("keeps the same number of items wherever the current page is", () => {
    expect(paginationItems(1, 20, 1, 1)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 20]);
    expect(paginationItems(4, 20, 1, 1)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 20]);
    expect(paginationItems(5, 20, 1, 1)).toEqual([
      1,
      "start-ellipsis",
      4,
      5,
      6,
      "end-ellipsis",
      20,
    ]);
    expect(paginationItems(17, 20, 1, 1)).toEqual([1, "start-ellipsis", 16, 17, 18, 19, 20]);
    expect(paginationItems(20, 20, 1, 1)).toEqual([1, "start-ellipsis", 16, 17, 18, 19, 20]);
    for (let page = 1; page <= 20; page++) {
      expect(paginationItems(page, 20, 1, 1)).toHaveLength(7);
      expect(paginationItems(page, 20, 2, 2)).toHaveLength(11);
    }
  });

  it("draws the page instead of an ellipsis that would hide only one", () => {
    // Page 2 is the only page between 1 and the window 3–5.
    expect(paginationItems(4, 9, 1, 1)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 9]);
  });

  it("takes the sibling and boundary counts", () => {
    expect(paginationItems(10, 20, 0, 2)).toEqual([
      1,
      2,
      "start-ellipsis",
      10,
      "end-ellipsis",
      19,
      20,
    ]);
    expect(paginationItems(10, 20, 2, 0)).toEqual([
      "start-ellipsis",
      8,
      9,
      10,
      11,
      12,
      "end-ellipsis",
    ]);
  });
});

describe("Pagination", () => {
  it("is a navigation landmark with a list of page buttons", async () => {
    const { container } = render(<Pagination total={5} />, { wrapper: wrap });

    const list = within(nav()).getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(shown()).toEqual(["1", "2", "3", "4", "5"]);
    expect(within(nav()).getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(within(nav()).getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(within(nav()).getByRole("button", { name: "1" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it("moves through its own pages, from the buttons and the arrows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Pagination total={20} defaultPage={1} onPageChange={onChange} />,
      {
        wrapper: wrap,
      },
    );

    expect(shown()).toEqual(["1", "2", "3", "4", "5", "…", "20"]);

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(currentPage()).toHaveTextContent("5");
    expect(shown()).toEqual(["1", "…", "4", "5", "6", "…", "20"]);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenLastCalledWith(6);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onChange).toHaveBeenLastCalledWith(5);

    await user.click(screen.getByRole("button", { name: "20" }));
    expect(shown()).toEqual(["1", "…", "16", "17", "18", "19", "20"]);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it("does not report the page already shown", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination total={3} onPageChange={onChange} />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "1" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("follows the host's page when controlled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Pagination total={10} page={3} onPageChange={onChange} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenCalledWith(4);
    // Nothing moves until the host says so.
    expect(currentPage()).toHaveTextContent("3");

    rerender(<Pagination total={10} page={7} onPageChange={onChange} />);
    expect(currentPage()).toHaveTextContent("7");
  });

  it("works out the page count from count and perPage", () => {
    render(<Pagination count={95} perPage={10} page={1} />, { wrapper: wrap });
    expect(shown()).toEqual(["1", "2", "3", "4", "5", "…", "10"]);
  });

  it("clamps a page outside the range and shows one page for an empty list", () => {
    const { rerender } = render(<Pagination total={4} page={9} />, { wrapper: wrap });
    expect(currentPage()).toHaveTextContent("4");

    rerender(<Pagination count={0} perPage={10} />);
    expect(shown()).toEqual(["1"]);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("keeps keyboard focus in the control when an arrow disables itself", async () => {
    const user = userEvent.setup();
    render(<Pagination total={3} defaultPage={2} />, { wrapper: wrap });

    screen.getByRole("button", { name: "Next page" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "3" })).toHaveFocus();

    screen.getByRole("button", { name: "Previous page" }).focus();
    await user.keyboard("{Enter}");
    // Page 2 is not an end: the arrow stays enabled and keeps focus.
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "1" })).toHaveFocus();
  });

  it("adds first and last buttons with showFirstLast", async () => {
    const user = userEvent.setup();
    render(<Pagination total={12} defaultPage={6} showFirstLast />, { wrapper: wrap });

    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(currentPage()).toHaveTextContent("12");
    expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "First page" }));
    expect(currentPage()).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
  });

  it("disables every control while disabled", () => {
    render(<Pagination total={5} defaultPage={3} disabled />, { wrapper: wrap });
    for (const button of within(nav()).getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("takes translated names", () => {
    render(
      <Pagination total={3} aria-label="Seiten" labels={{ previous: "Zurück", next: "Weiter" }} />,
      { wrapper: wrap },
    );
    const landmark = screen.getByRole("navigation", { name: "Seiten" });
    expect(within(landmark).getByRole("button", { name: "Zurück" })).toBeInTheDocument();
    expect(within(landmark).getByRole("button", { name: "Weiter" })).toBeInTheDocument();
  });

  it("keeps a default name for a label passed as undefined", () => {
    // A wrapper forwarding `{ previous: labels?.previous }` must not unname the button.
    render(<Pagination total={3} labels={{ previous: undefined, next: "Weiter" }} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
  });

  it("does not submit an enclosing form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Pagination total={3} showFirstLast />
      </form>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("button", { name: "2" }));
    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "First page" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  describe("per-page select", () => {
    const Host = ({ onPerPageChange }: { onPerPageChange?: (perPage: number) => void }) => {
      const [page, setPage] = useState(5);
      const [perPage, setPerPage] = useState(10);
      return (
        <Pagination
          count={200}
          page={page}
          onPageChange={setPage}
          perPage={perPage}
          perPageOptions={[10, 20, 50]}
          onPerPageChange={(next) => {
            setPerPage(next);
            onPerPageChange?.(next);
          }}
        />
      );
    };

    it("is labelled and shows the current size", async () => {
      const { container } = render(<Host />, { wrapper: wrap });
      const field = screen.getByRole("combobox", { name: "Per page" });
      expect(field).toHaveValue("10");
      await expectNoAxeViolations(container);
    });

    it("keeps the first item on screen in view at the new size", async () => {
      const user = userEvent.setup();
      const onPerPageChange = vi.fn();
      render(<Host onPerPageChange={onPerPageChange} />, { wrapper: wrap });
      // Page 5 at 10 a page starts at item 41; at 20 a page that is page 3.
      expect(currentPage()).toHaveTextContent("5");

      await user.click(screen.getByRole("combobox", { name: "Per page" }));
      await user.click(await screen.findByRole("option", { name: "20" }));

      expect(onPerPageChange).toHaveBeenCalledWith(20);
      await waitFor(() => expect(currentPage()).toHaveTextContent("3"));
      expect(shown()).toContain("10");
      expect(shown()).not.toContain("20");
    });
  });
});

describe("Table pagination", () => {
  const rows = Array.from({ length: 23 }, (_, index) => [`Item ${index + 1}`]);
  const data = { columns: [{ header: "Name", key: "name" }], rows };
  const firstCell = () => screen.getAllByRole("row")[1]?.querySelector("td")?.textContent ?? null;

  it("pages its rows through Pagination", async () => {
    const user = userEvent.setup();
    render(
      <Table
        paginated
        defaultPerPage={5}
        perPageOptions={[5, 10, 20, 50]}
        showFirstLast
        {...data}
      />,
      { wrapper: wrap },
    );

    expect(shown()).toEqual(["1", "2", "3", "4", "5"]);
    expect(firstCell()).toBe("Item 1");

    await user.click(within(nav()).getByRole("button", { name: "3" }));
    expect(firstCell()).toBe("Item 11");
    // 2.x's "3 / 5" beside the page-size select is gone: the page buttons say it.
    expect(within(nav()).getByRole("button", { name: "3" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(within(nav()).getByRole("button", { name: "Last page" }));
    expect(firstCell()).toBe("Item 21");
    expect(within(nav()).getByRole("button", { name: "Next page" })).toBeDisabled();

    await user.click(within(nav()).getByRole("button", { name: "First page" }));
    expect(firstCell()).toBe("Item 1");
  });

  it("draws no page buttons for a single page", () => {
    render(<Table paginated defaultPerPage={50} {...data} />, { wrapper: wrap });
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

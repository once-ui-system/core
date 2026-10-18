import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmojiPicker } from "../components/EmojiPicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

// The built-in eight-a-category set instead of the 1,800 generated emojis:
// the same component paths, at a size axe and role queries get through fast.
vi.mock("../data/emoji-data.json", () => ({ default: {} }));

failOnConsoleError();

const cell = (name: string) => screen.getByRole("gridcell", { name });
const search = () => screen.getByRole("textbox", { name: "Search emojis" });

/**
 * EmojiPicker: a search field, a grid of emoji cells the arrow keys move
 * through, and category tabs. The grid failed axe twice over: its cells sat in
 * it without rows, and the category tabs were icons with no names. And the
 * first cell stayed a tab stop next to the focused one, so Shift+Tab out of
 * the grid stopped on it first.
 */
describe("EmojiPicker", () => {
  it("renders a named grid of rows of named cells, and category tabs with names", async () => {
    const { container } = render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    const grid = screen.getByRole("grid", { name: "smileys emojis" });
    const rows = within(grid).getAllByRole("row");
    expect(within(rows[0]).getAllByRole("gridcell")).toHaveLength(8);
    expect(cell("grinning face")).toHaveTextContent("😀");

    const tabs = screen.getByRole("tablist", { name: "Emoji categories" });
    expect(within(tabs).getByRole("tab", { name: "Smileys" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(tabs).getByRole("tab", { name: "Animals" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("lays rows out by `columns`", () => {
    render(<EmojiPicker onSelect={() => {}} columns="4" />, { wrapper: wrap });
    const [first] = screen.getAllByRole("row");
    expect(within(first).getAllByRole("gridcell")).toHaveLength(4);
  });

  it("reports a clicked emoji, then closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<EmojiPicker onSelect={onSelect} onClose={onClose} />, { wrapper: wrap });

    await user.click(cell("face with tears of joy"));
    expect(onSelect).toHaveBeenCalledWith("😂");
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("is one tab stop: search, then the grid, then the categories", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    await user.tab();
    expect(search()).toHaveFocus();
    await user.tab();
    expect(cell("grinning face")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("tab", { name: "Smileys" })).toHaveFocus();
  });

  it("moves through the grid with the arrow keys, wrapping round", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} columns="4" />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    const first = document.activeElement as HTMLElement;
    const cells = screen.getAllByRole("gridcell");
    expect(first).toBe(cells[0]);

    await user.keyboard("{ArrowRight}");
    expect(cells[1]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(cells[5]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(cells[1]).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(cells[cells.length - 1]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cells[0]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    // Up from the top row lands in the same column of the last row, or the
    // last cell when that row is short.
    const lastRowStart = Math.floor((cells.length - 1) / 4) * 4;
    expect(cells[Math.min(lastRowStart, cells.length - 1)]).toHaveFocus();
  });

  it("leaves the grid with Shift+Tab from any cell, past no other cell", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const focused = document.activeElement as HTMLElement;
    expect(focused).toHaveAttribute("tabindex", "0");
    expect(
      screen.getAllByRole("gridcell").filter((el) => el.getAttribute("tabindex") === "0"),
    ).toEqual([focused]);

    await user.tab({ shift: true });
    expect(search()).toHaveFocus();
  });

  it("picks the focused emoji with Enter and with Space, once each", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EmojiPicker onSelect={onSelect} />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowRight} ");
    expect(onSelect.mock.calls).toEqual([["😀"], ["😃"]]);
  });

  it("switches category from its tab", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    await user.click(screen.getByRole("tab", { name: "Animals" }));
    expect(screen.getByRole("grid", { name: "animals emojis" })).toBeInTheDocument();
    expect(screen.queryByRole("gridcell", { name: "grinning face" })).toBeNull();
    expect(screen.getByRole("tab", { name: "Animals" })).toHaveAttribute("aria-selected", "true");
  });

  describe("search", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("searches every category after a pause, and hides the categories meanwhile", async () => {
      const { container } = render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

      fireEvent.change(search(), { target: { value: "Cat Face" } });
      act(() => vi.advanceTimersByTime(299));
      // Debounced: nothing changes until typing has paused for 300ms.
      expect(screen.getByRole("grid", { name: "smileys emojis" })).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));

      const grid = screen.getByRole("grid", { name: "Search results" });
      expect(within(grid).getByRole("gridcell", { name: "cat face" })).toBeInTheDocument();
      expect(screen.queryByRole("tablist")).toBeNull();
      // axe schedules its own timers.
      vi.useRealTimers();
      await expectNoAxeViolations(container);
    });

    it("says so when nothing matches", () => {
      render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });
      fireEvent.change(search(), { target: { value: "zzzzqqq" } });
      act(() => vi.advanceTimersByTime(300));
      expect(screen.queryByRole("grid")).toBeNull();
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });
});

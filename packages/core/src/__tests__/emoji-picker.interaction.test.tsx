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

const emojis = (name = "smileys emojis") => screen.getByRole("group", { name });
const cell = (name: string) => within(emojis()).getByRole("button", { name });
const cells = () => within(emojis()).getAllByRole("button");
const search = () => screen.getByRole("textbox", { name: "Search emojis" });

/**
 * EmojiPicker: a search field, a named group of emoji buttons laid out in
 * `columns` that the arrow keys move through (roving focus), and category
 * tabs. The group used to claim role="grid" without the rows and cells a
 * grid needs (axe: aria-required-children).
 */
describe("EmojiPicker", () => {
  it("renders a named group of named emoji buttons, and category tabs with names", async () => {
    const { container } = render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    expect(screen.queryByRole("grid")).toBeNull();
    expect(cells()).toHaveLength(8);
    expect(cell("grinning face")).toHaveTextContent("😀");

    const tabs = screen.getByRole("tablist");
    expect(within(tabs).getByRole("tab", { name: "Smileys" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(within(tabs).getByRole("tab", { name: "Animals" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("lays rows out by `columns`", () => {
    const { rerender } = render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });
    expect(emojis()).toHaveClass("columns-8");
    rerender(<EmojiPicker onSelect={() => {}} columns="4" />);
    expect(emojis()).toHaveClass("columns-4");
    expect(emojis()).not.toHaveClass("columns-8");
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

  it("tabs from the search to the emojis to the categories", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    await user.tab();
    expect(search()).toHaveFocus();
    await user.tab();
    expect(cell("grinning face")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("tab", { name: "Smileys" })).toHaveFocus();
  });

  it("moves through the emojis with the arrow keys, wrapping round", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} columns="4" />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    const first = document.activeElement as HTMLElement;
    const all = cells();
    expect(first).toBe(all[0]);

    await user.keyboard("{ArrowRight}");
    expect(all[1]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(all[5]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(all[1]).toHaveFocus();
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(all[all.length - 1]).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(all[0]).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    // Up from the top row lands in the same column of the last row, or the
    // last cell when that row is short.
    const lastRowStart = Math.floor((all.length - 1) / 4) * 4;
    expect(all[Math.min(lastRowStart, all.length - 1)]).toHaveFocus();
  });

  it("leaves the group with Shift+Tab from its first button", async () => {
    const user = userEvent.setup();
    render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    const focused = document.activeElement as HTMLElement;
    expect(focused).toBe(cells()[2]);
    expect(focused).toHaveAttribute("tabindex", "0");
    // Only the focused button and the first one (the way back in) are tab
    // stops; every other button is reached with the arrow keys.
    expect(cells().filter((el) => el.getAttribute("tabindex") === "0")).toEqual([
      cells()[0],
      focused,
    ]);

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(cells()[0]).toHaveFocus();
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
    expect(
      within(emojis("animals emojis")).getByRole("button", { name: "dog face" }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "grinning face" })).toBeNull();
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
      expect(emojis()).toBeInTheDocument();
      act(() => vi.advanceTimersByTime(1));

      const results = emojis("Search results");
      expect(
        within(results)
          .getAllByRole("button")
          .map((b) => b.getAttribute("aria-label")),
      ).toEqual(["cat face"]);
      expect(screen.queryByRole("tablist")).toBeNull();
      // axe schedules its own timers.
      vi.useRealTimers();
      await expectNoAxeViolations(container);
    });

    it("says so when nothing matches", () => {
      render(<EmojiPicker onSelect={() => {}} />, { wrapper: wrap });
      fireEvent.change(search(), { target: { value: "zzzzqqq" } });
      act(() => vi.advanceTimersByTime(300));
      expect(screen.queryByRole("group", { name: "Search results" })).toBeNull();
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });
  });
});

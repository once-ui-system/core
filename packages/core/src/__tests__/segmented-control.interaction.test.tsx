import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../components/SegmentedControl";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const views = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

const tab = (name: string) => screen.getByRole("tab", { name });

/**
 * SegmentedControl as a tab strip a keyboard user can drive: one Tab stop on
 * the selected segment, arrows move focus (wrapping) without selecting,
 * Enter or Space selects, a click selects and reports the event, it follows
 * a controlled `value`, and disabled segments can be neither reached nor
 * selected.
 */
describe("SegmentedControl: interaction", () => {
  it("is one Tab stop: the selected segment", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <SegmentedControl
          aria-label="View"
          buttons={views}
          defaultValue="grid"
          onChange={vi.fn()}
        />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(tab("Grid")).toHaveFocus();
    expect(tab("Grid")).toHaveAttribute("aria-selected", "true");
    expect(tab("List")).toHaveAttribute("aria-selected", "false");
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("selects the first segment without value or defaultValue", () => {
    render(<SegmentedControl aria-label="View" buttons={views} onChange={vi.fn()} />, {
      wrapper: wrap,
    });
    expect(tab("List")).toHaveAttribute("aria-selected", "true");
  });

  it("moves focus with the arrows, wrapping, and selects only on Enter or Space", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedControl aria-label="View" buttons={views} onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(tab("Board")).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{ArrowRight}");
    expect(tab("List")).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(tab("Board")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(tab("Grid")).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith("grid");
    expect(tab("Grid")).toHaveAttribute("aria-selected", "true");
    expect(tab("Grid")).toHaveAttribute("tabindex", "0");
    expect(tab("List")).toHaveAttribute("tabindex", "-1");
  });

  it("reports a click with its value and the click event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedControl aria-label="View" buttons={views} onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.click(tab("Board"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe("board");
    expect(onChange.mock.calls[0][1]).toHaveProperty("type", "click");
  });

  it("follows a controlled value", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState("list");
      return (
        <>
          <SegmentedControl aria-label="View" buttons={views} value={value} onChange={setValue} />
          <button type="button" onClick={() => setValue("board")}>
            Reset to board
          </button>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.click(tab("Grid"));
    expect(tab("Grid")).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: "Reset to board" }));
    expect(tab("Board")).toHaveAttribute("aria-selected", "true");
  });

  // A disabled button cannot take focus, so the arrows used to stop dead in
  // front of one: the segments after it could not be reached at all.
  it("skips disabled segments with the arrows", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="View"
        buttons={[views[0], { ...views[1], disabled: true }, views[2]]}
        onChange={onChange}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(tab("Board")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tab("List")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(tab("Board")).toHaveFocus();
    await user.click(tab("Grid"));
    expect(onChange).not.toHaveBeenCalled();
  });

  // The option's own props were spread after the control's click handler, so
  // a segment given `onClick` (for analytics, say) stopped selecting.
  it("still selects a segment that has its own onClick, and calls it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClick = vi.fn();
    render(
      <SegmentedControl
        aria-label="View"
        buttons={[views[0], { ...views[1], onClick }]}
        onChange={onChange}
      />,
      { wrapper: wrap },
    );
    await user.click(tab("Grid"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("grid", expect.anything());
    expect(tab("Grid")).toHaveAttribute("aria-selected", "true");
  });
});

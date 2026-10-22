import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import scrollerStyles from "../components/Scroller.module.scss";
import { SegmentedControl } from "../components/SegmentedControl";
import styles from "../components/SegmentedControl.module.scss";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const buttons = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

/** No `aria-controls` pointing at panels that do not exist (ROADMAP W3). */
describe("SegmentedControl accessibility", () => {
  it("sets no aria-controls when no panel id is given", async () => {
    const { container } = render(<SegmentedControl buttons={buttons} onChange={() => {}} />, {
      wrapper: wrap,
    });

    for (const tab of screen.getAllByRole("tab")) {
      expect(tab).not.toHaveAttribute("aria-controls");
    }
    await expectNoAxeViolations(container);
  });

  it("points aria-controls at a panel id the caller supplies", async () => {
    const { container } = render(
      <>
        <SegmentedControl
          buttons={[
            { value: "monthly", label: "Monthly", "aria-controls": "monthly-panel" },
            { value: "yearly", label: "Yearly", "aria-controls": "yearly-panel" },
          ]}
          onChange={() => {}}
        />
        <div id="monthly-panel" role="tabpanel" aria-label="Monthly prices" />
        <div id="yearly-panel" role="tabpanel" aria-label="Yearly prices" hidden />
      </>,
      { wrapper: wrap },
    );

    expect(screen.getByRole("tab", { name: "Monthly" })).toHaveAttribute(
      "aria-controls",
      "monthly-panel",
    );
    await expectNoAxeViolations(container);
  });

  it("moves between segments with the arrow keys and selects with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SegmentedControl buttons={buttons} onChange={onChange} />, { wrapper: wrap });

    await user.tab();
    expect(screen.getByRole("tab", { name: "Monthly" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("yearly");
    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("SegmentedControl keeps the selected option in view", () => {
  // jsdom lays nothing out: a 200px strip over a 600px track, with each
  // option 100px wide, placed by its index.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(600);
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.getAttribute("role") !== "tab" || !this.parentElement) {
        return DOMRect.fromRect({ x: 0, y: 0, width: 200, height: 40 });
      }
      const index = Array.from(this.parentElement.children).indexOf(this);
      return DOMRect.fromRect({ x: index * 100, y: 0, width: 100, height: 40 });
    });
    HTMLElement.prototype.scrollBy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: jsdom has no scrollBy to restore.
    delete (HTMLElement.prototype as any).scrollBy;
  });

  const six = ["a", "b", "c", "d", "e", "f"].map((value) => ({ value, label: value }));
  const scrolledBy = () =>
    vi
      .mocked(HTMLElement.prototype.scrollBy)
      .mock.calls.map(([options]) => (options as ScrollToOptions).left);

  it("scrolls the strip, not the page, to a selected option out of view", () => {
    render(<SegmentedControl buttons={six} value="e" onChange={vi.fn()} />, { wrapper: wrap });
    // "e" spans 400–500px; its right edge lands 40px short of the strip's 200px.
    expect(scrolledBy()).toEqual([500 - 160]);
    // The strip that moved is the Scroller's scrolling row, around the options' row.
    const strip = screen.getByRole("tab", { name: "e" }).parentElement?.parentElement;
    expect(vi.mocked(HTMLElement.prototype.scrollBy).mock.contexts).toEqual([strip]);
  });

  it("has no axe violations once it overflows and shows a scroll button", async () => {
    const { container } = render(<SegmentedControl buttons={six} value="a" onChange={vi.fn()} />, {
      wrapper: wrap,
    });
    expect(await screen.findByRole("button", { name: "Scroll Next" })).toBeInTheDocument();
    // The button sits beside the tablist, not inside it: a tablist owns only tabs.
    expect(screen.getByRole("tablist")).not.toContainElement(
      screen.getByRole("button", { name: "Scroll Next" }),
    );
    await expectNoAxeViolations(container);
  });

  it("leaves a strip alone when the selected option is in view", () => {
    render(<SegmentedControl buttons={six} value="a" onChange={vi.fn()} />, { wrapper: wrap });
    // "a" spans 0–100px at the start of the strip, where there is no
    // Previous button to clear.
    expect(scrolledBy()).toEqual([]);
  });
});

describe("SegmentedControl's name", () => {
  it("goes to the tablist", async () => {
    const { container } = render(
      <SegmentedControl aria-label="Billing period" buttons={buttons} onChange={vi.fn()} />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("tablist", { name: "Billing period" })).toContainElement(
      screen.getByRole("tab", { name: "Monthly" }),
    );
    await expectNoAxeViolations(container);
  });
});

describe("Scroller", () => {
  it("forwards its ref, as SegmentedControl's does", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SegmentedControl ref={ref} buttons={buttons} onChange={vi.fn()} />, { wrapper: wrap });
    expect(ref.current).toContainElement(screen.getByRole("tab", { name: "Monthly" }));
  });
});

/**
 * `scroll={false}`: a plain row for a narrow sidebar, where a scroll strip
 * clipped the last option behind its Next button. And `description`, a
 * second line under an option's label.
 */
describe("SegmentedControl without scrolling", () => {
  it("renders no Scroller, and its options share the row and may shrink", () => {
    const { container } = render(
      <SegmentedControl scroll={false} buttons={buttons} onChange={vi.fn()} />,
      { wrapper: wrap },
    );
    expect(container.querySelector(`.${scrollerStyles.scroller}`)).toBeNull();
    expect(screen.getByRole("tablist").style.minWidth).toBe("0px");
    for (const tab of screen.getAllByRole("tab")) {
      expect(tab).toHaveClass(styles.shrink, styles.share);
      // The label sits in a box that truncates it.
      expect(tab.querySelector(`.${styles.label}`)?.textContent).toBe(tab.textContent);
    }
  });

  it("keeps the scroll strip by default", () => {
    const { container } = render(<SegmentedControl buttons={buttons} onChange={vi.fn()} />, {
      wrapper: wrap,
    });
    expect(container.querySelector(`.${scrollerStyles.scroller}`)).not.toBeNull();
    expect(screen.getByRole("tablist").style.minWidth).toBe("max-content");
    expect(screen.getByRole("tab", { name: "Monthly" })).not.toHaveClass(styles.shrink);
  });

  it("does not share the row when fillWidth is off", () => {
    render(
      <SegmentedControl scroll={false} fillWidth={false} buttons={buttons} onChange={vi.fn()} />,
      { wrapper: wrap },
    );
    const tab = screen.getByRole("tab", { name: "Monthly" });
    expect(tab).toHaveClass(styles.shrink);
    expect(tab).not.toHaveClass(styles.share);
  });

  it("selects and forwards its ref the same way", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onChange = vi.fn();
    render(
      <SegmentedControl
        ref={ref}
        scroll={false}
        aria-label="Billing period"
        buttons={buttons}
        onChange={onChange}
      />,
      { wrapper: wrap },
    );
    expect(ref.current).toContainElement(screen.getByRole("tablist", { name: "Billing period" }));
    await user.click(screen.getByRole("tab", { name: "Yearly" }));
    expect(onChange).toHaveBeenCalledWith("yearly", expect.anything());
    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveAttribute("aria-selected", "true");
  });

  it("is uncontrolled without onChange, starting from defaultValue", async () => {
    const user = userEvent.setup();
    render(<SegmentedControl scroll={false} buttons={buttons} defaultValue="yearly" />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("tab", { name: "Yearly" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "Monthly" }));
    expect(screen.getByRole("tab", { name: "Monthly" })).toHaveAttribute("aria-selected", "true");
  });

  it("shows a description as a second line, part of the tab's name", async () => {
    const { container } = render(
      <SegmentedControl
        aria-label="Mode"
        buttons={[
          { value: "fast", label: "Fast", description: "Quick answers" },
          { value: "deep", label: "Deep", description: "Reads sources" },
        ]}
      />,
      { wrapper: wrap },
    );
    const tab = screen.getByRole("tab", { name: "Fast Quick answers" });
    expect(tab).toHaveClass(styles.twoLine);
    expect(tab).not.toHaveAttribute("description");
    expect(screen.getByText("Quick answers").tagName).toBe("SPAN");
    await expectNoAxeViolations(container);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SegmentedControl scroll={false} aria-label="Billing period" buttons={buttons} />,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
  });
});

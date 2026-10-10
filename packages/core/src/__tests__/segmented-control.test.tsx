import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../components/SegmentedControl";
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

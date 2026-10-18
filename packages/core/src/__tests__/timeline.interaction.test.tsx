import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Timeline, type TimelineItem } from "../components/Timeline";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items: TimelineItem[] = [
  { label: "Ordered", description: "Mon", state: "success", marker: "1" },
  { label: "Shipped", description: "Tue", state: "active", marker: "2" },
  { label: "Delivered", state: "default", marker: "3" },
];

/**
 * A read-only sequence of steps: label, description, marker and any children
 * per step, laid out vertically (either side) or as a row. It has no
 * interaction of its own, but interactive children stay operable.
 */
describe("Timeline", () => {
  it("renders every step's label, description and marker, and passes axe", async () => {
    const { container } = render(<Timeline items={items} />, { wrapper });
    for (const text of ["Ordered", "Mon", "Shipped", "Tue", "Delivered", "1", "2", "3"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    await expectNoAxeViolations(container);
  });

  it("draws a connector before every step but the first and after every step but the last", () => {
    const { container } = render(<Timeline items={items} />, { wrapper });
    const steps = Array.from((container.firstElementChild as HTMLElement).children);
    expect(steps).toHaveLength(3);
    const linesIn = (step: Element) => (step.firstElementChild as HTMLElement).children.length;
    expect(steps.map(linesIn)).toEqual([2, 3, 2]);
  });

  it("puts the content on the left with alignment=right", () => {
    const { container } = render(<Timeline items={items} alignment="right" />, { wrapper });
    const step = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
    expect(step.className).toMatch(/row-reverse/);
  });

  it("lays the steps out in a row with direction=row, passing axe", async () => {
    const { container } = render(<Timeline items={items} direction="row" />, { wrapper });
    expect(screen.getByText("Delivered")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("keeps a step's interactive children operable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Timeline
        items={[
          {
            label: "Review",
            children: (
              <button type="button" onClick={onClick}>
                Approve
              </button>
            ),
          },
        ]}
      />,
      { wrapper },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Approve" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders nothing inside for no items", () => {
    const { container } = render(<Timeline items={[]} />, { wrapper });
    expect(container.firstElementChild).toBeEmptyDOMElement();
  });

  it("forwards the ref to its root", () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(<Timeline ref={ref} items={items} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });
});

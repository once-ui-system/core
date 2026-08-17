import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { HoverCard } from "../components/HoverCard";

describe("HoverCard", () => {
  it("renders trigger element", () => {
    render(
      <HoverCard trigger={<button type="button">Trigger Button</button>}>
        <div>HoverCard Content</div>
      </HoverCard>,
    );

    expect(screen.getByRole("button", { name: "Trigger Button" })).toBeInTheDocument();
    expect(screen.queryByText("HoverCard Content")).not.toBeInTheDocument();
  });

  it("shows portal content when trigger is hovered", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("pointer: fine"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(
      <HoverCard trigger={<div>Hover target</div>} className="custom-hover-card">
        <div data-testid="hover-card-content">Hover Card Popup</div>
      </HoverCard>,
    );

    const triggerWrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(triggerWrapper);

    const content = screen.getByTestId("hover-card-content");
    expect(content).toBeInTheDocument();

    fireEvent.mouseLeave(triggerWrapper);
    expect(screen.queryByTestId("hover-card-content")).not.toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <HoverCard ref={ref} trigger={<div>Ref Target</div>}>
        <div>Card</div>
      </HoverCard>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("accepts custom placement and AnimationProps", () => {
    const { container } = render(
      <HoverCard
        trigger={<div>Bottom Target</div>}
        placement="bottom"
        duration={150}
        offsetDistance="16"
      >
        <div>Bottom Content</div>
      </HoverCard>,
    );

    const triggerWrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(triggerWrapper);

    expect(screen.getByText("Bottom Content")).toBeInTheDocument();
  });
});

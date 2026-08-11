import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScrollContainer } from "../components/ScrollContainer";

describe("ScrollContainer", () => {
  it("renders items with snap classes", () => {
    const items = [
      <div key="1">Item 1</div>,
      <div key="2">Item 2</div>,
      <div key="3">Item 3</div>,
    ];

    const { container } = render(<ScrollContainer items={items} />);

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();

    const scrollTrack = container.querySelector(".snap-x");
    expect(scrollTrack).toBeInTheDocument();
    expect(scrollTrack).toHaveClass("snap-mandatory");

    const snapItems = container.querySelectorAll(".snap-start");
    expect(snapItems.length).toBe(3);
  });

  it("handles bottom placement and merges className", () => {
    const items = [<div key="1">Card A</div>];

    const { container } = render(
      <ScrollContainer
        items={items}
        controlPlacement="bottom-between"
        className="custom-scroll-container"
      />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-scroll-container");
    expect(root).toHaveClass("flex-col-reverse");
  });
});

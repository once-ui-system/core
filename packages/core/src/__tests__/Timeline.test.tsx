import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Timeline, timelineVariants } from "../components/Timeline";

describe("Timeline", () => {
  it("renders timeline items with label and description", () => {
    render(
      <Timeline
        items={[
          { label: "Step 1", description: "First step details", state: "default" },
          { label: "Step 2", description: "Second step details", state: "active" },
          { label: "Step 3", description: "Third step details", state: "success" },
        ]}
      />,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("First step details")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Second step details")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
    expect(screen.getByText("Third step details")).toBeInTheDocument();
  });

  it("renders with custom markers and children content", () => {
    render(
      <Timeline
        items={[
          {
            marker: <span data-testid="marker-1">1</span>,
            label: "Marker Step",
            children: <div data-testid="extra-child">Extra info</div>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId("marker-1")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByTestId("extra-child")).toBeInTheDocument();
  });

  it("handles different states and normalized aliases", () => {
    const { container } = render(
      <Timeline
        items={[
          { label: "Default State", state: "default" },
          { label: "Active State", state: "active" },
          { label: "Success State", state: "success" },
          { label: "Danger State", state: "danger" },
          { label: "Completed State", state: "completed" },
          { label: "Error State", state: "error" },
        ]}
      />,
    );

    expect(screen.getByText("Default State")).toBeInTheDocument();
    expect(screen.getByText("Active State")).toBeInTheDocument();
    expect(screen.getByText("Success State")).toBeInTheDocument();
    expect(screen.getByText("Danger State")).toBeInTheDocument();
    expect(screen.getByText("Completed State")).toBeInTheDocument();
    expect(screen.getByText("Error State")).toBeInTheDocument();

    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(6);
  });

  it("renders correctly with different sizes", () => {
    const { container: containerXs } = render(
      <Timeline size="xs" items={[{ label: "XS Item", state: "default" }]} />,
    );
    const dotXs = containerXs.querySelector(".rounded-full");
    expect(dotXs).toHaveClass("min-h-8", "max-h-8", "min-w-8", "max-w-8");

    const { container: containerXl } = render(
      <Timeline size="xl" items={[{ label: "XL Item", state: "default" }]} />,
    );
    const dotXl = containerXl.querySelector(".rounded-full");
    expect(dotXl).toHaveClass("min-h-48", "max-h-48", "min-w-48", "max-w-48");
  });

  it("supports horizontal orientation when direction is row", () => {
    render(
      <Timeline
        direction="row"
        items={[
          { label: "Horizontal 1", description: "H1 desc" },
          { label: "Horizontal 2", description: "H2 desc" },
        ]}
      />,
    );

    expect(screen.getByText("Horizontal 1")).toBeInTheDocument();
    expect(screen.getByText("Horizontal 2")).toBeInTheDocument();
  });

  it("supports right alignment in vertical layout", () => {
    const { container } = render(
      <Timeline
        alignment="right"
        items={[{ label: "Right aligned", description: "Aligned to right" }]}
      />,
    );

    expect(screen.getByText("Right aligned")).toBeInTheDocument();
    const row = container.querySelector(".flex-row-reverse");
    expect(row).toBeInTheDocument();
  });

  it("forwards ref to root Column element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Timeline ref={ref} items={[{ label: "Ref Test" }]} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("flex-col");
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <Timeline
        className="custom-timeline-class"
        style={{ marginTop: 24 }}
        items={[{ label: "Styled Item" }]}
      />,
    );

    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-timeline-class");
    expect((root as HTMLElement).style.marginTop).toBe("24px");
  });

  it("exports timelineVariants for composability", () => {
    expect(timelineVariants).toBeDefined();
    expect(typeof timelineVariants).toBe("function");
  });
});

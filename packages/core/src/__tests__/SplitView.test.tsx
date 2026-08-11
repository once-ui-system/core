import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SplitView } from "../components/SplitView";

describe("SplitView", () => {
  it("renders left and right panels with default split ratio", () => {
    render(
      <SplitView
        leftPanel={<div>Left Content</div>}
        rightPanel={<div>Right Content</div>}
      />,
    );

    expect(screen.getByText("Left Content")).toBeInTheDocument();
    expect(screen.getByText("Right Content")).toBeInTheDocument();

    const leftContainer = screen.getByText("Left Content").parentElement;
    const rightContainer = screen.getByText("Right Content").parentElement;

    expect(leftContainer?.style.width).toBe("30%");
    expect(rightContainer?.style.width).toBe("70%");
  });

  it("renders with custom split and merges className", () => {
    const { container } = render(
      <SplitView
        defaultSplit={0.5}
        className="custom-split"
        leftPanel={<div>Left Panel</div>}
        rightPanel={<div>Right Panel</div>}
      />,
    );

    expect(container.firstElementChild).toHaveClass("custom-split");

    const leftContainer = screen.getByText("Left Panel").parentElement;
    const rightContainer = screen.getByText("Right Panel").parentElement;

    expect(leftContainer?.style.width).toBe("50%");
    expect(rightContainer?.style.width).toBe("50%");
  });

  it("handles mouse dragging to resize split", () => {
    const { container } = render(
      <SplitView
        defaultSplit={0.3}
        minSplit={0.2}
        maxSplit={0.8}
        leftPanel={<div>Left</div>}
        rightPanel={<div>Right</div>}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    Object.defineProperty(root, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 1000, height: 500 }),
    });

    const handle = container.querySelector(".cursor-col-resize");
    expect(handle).toBeInTheDocument();

    if (handle) {
      fireEvent.mouseDown(handle);
      fireEvent.mouseMove(document, { clientX: 600, clientY: 200 });
      fireEvent.mouseUp(document);
    }

    const leftContainer = screen.getByText("Left").parentElement;
    expect(leftContainer?.style.width).toBe("60%");
  });
});

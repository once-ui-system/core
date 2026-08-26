import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlipFx, flipFxSideVariants, flipFxVariants } from "../components/FlipFx";

describe("FlipFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders front and back faces with 3D preserve and perspective classes", () => {
    const { container } = render(
      <FlipFx
        front={<div data-testid="front-content">Front Side</div>}
        back={<div data-testid="back-content">Back Side</div>}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "select-none");
    expect(root.getAttribute("role")).toBe("button");
    expect(root.getAttribute("aria-pressed")).toBe("false");
    expect(root.getAttribute("tabIndex")).toBe("0");

    expect(screen.getByTestId("front-content")).toBeInTheDocument();
    expect(screen.getByTestId("back-content")).toBeInTheDocument();

    const frontFace = screen.getByTestId("front-content").parentElement;
    const backFace = screen.getByTestId("back-content").parentElement;

    expect(frontFace).toHaveAttribute("aria-hidden", "false");
    expect(backFace).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FlipFx ref={ref} front={<div>Front</div>} back={<div>Back</div>} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("toggles flipped state on click in uncontrolled mode", () => {
    const onFlip = vi.fn();
    const { container } = render(
      <FlipFx onFlip={onFlip} front={<div>Front</div>} back={<div>Back</div>} />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-pressed")).toBe("false");
    expect(root.style.transform).toBe("none");

    fireEvent.click(root);

    expect(onFlip).toHaveBeenCalledWith(true);
    expect(root.getAttribute("aria-pressed")).toBe("true");
    expect(root.style.transform).toBe("rotateY(180deg)");

    fireEvent.click(root);

    expect(onFlip).toHaveBeenCalledWith(false);
    expect(root.getAttribute("aria-pressed")).toBe("false");
    expect(root.style.transform).toBe("none");
  });

  it("toggles flipped state on Enter and Space keydown", () => {
    const onFlip = vi.fn();
    const { container } = render(
      <FlipFx onFlip={onFlip} front={<div>Front</div>} back={<div>Back</div>} />,
    );

    const root = container.firstElementChild as HTMLElement;

    fireEvent.keyDown(root, { key: "Enter" });
    expect(onFlip).toHaveBeenCalledWith(true);
    expect(root.getAttribute("aria-pressed")).toBe("true");

    fireEvent.keyDown(root, { key: " " });
    expect(onFlip).toHaveBeenCalledWith(false);
    expect(root.getAttribute("aria-pressed")).toBe("false");
  });

  it("does not flip when disableClickFlip is true", () => {
    const onFlip = vi.fn();
    const { container } = render(
      <FlipFx disableClickFlip onFlip={onFlip} front={<div>Front</div>} back={<div>Back</div>} />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("tabIndex")).toBe("-1");

    fireEvent.click(root);
    expect(onFlip).not.toHaveBeenCalled();
    expect(root.getAttribute("aria-pressed")).toBe("false");

    fireEvent.keyDown(root, { key: "Enter" });
    expect(onFlip).not.toHaveBeenCalled();
  });

  it("supports vertical flip direction", () => {
    const { container } = render(
      <FlipFx
        flipDirection="vertical"
        flipped={true}
        front={<div>Front</div>}
        back={<div data-testid="back-el">Back</div>}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.transform).toBe("rotateX(180deg)");

    const backFace = screen.getByTestId("back-el").parentElement;
    expect(backFace?.className).toContain("[transform:rotateX(180deg)]");
  });

  it("handles controlled flipped prop", () => {
    const onFlip = vi.fn();
    const { container, rerender } = render(
      <FlipFx flipped={false} onFlip={onFlip} front={<div>Front</div>} back={<div>Back</div>} />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.transform).toBe("none");

    fireEvent.click(root);
    expect(onFlip).toHaveBeenCalledWith(true);
    // Controlled: stays false until parent updates prop
    expect(root.style.transform).toBe("none");

    rerender(
      <FlipFx flipped={true} onFlip={onFlip} front={<div>Front</div>} back={<div>Back</div>} />,
    );
    expect(root.style.transform).toBe("rotateY(180deg)");
  });

  it("handles autoFlipInterval", () => {
    const onFlip = vi.fn();
    const { container } = render(
      <FlipFx
        autoFlipInterval={2}
        onFlip={onFlip}
        front={<div>Front</div>}
        back={<div>Back</div>}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("tabIndex")).toBe("-1");

    // Clicking does not flip during autoFlip
    fireEvent.click(root);
    expect(onFlip).not.toHaveBeenCalled();

    // Advance timer by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onFlip).toHaveBeenCalledWith(true);
    expect(root.getAttribute("aria-pressed")).toBe("true");

    // Advance timer by another 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onFlip).toHaveBeenCalledWith(false);
    expect(root.getAttribute("aria-pressed")).toBe("false");
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <FlipFx
        className="custom-flip-class"
        style={{ zIndex: 15 }}
        timing={1500}
        front={<div>Front</div>}
        back={<div>Back</div>}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-flip-class", "relative", "select-none");
    expect(root.style.zIndex).toBe("15");
    expect(root.style.transition).toContain("1500ms");
  });

  it("exports flipFxVariants and flipFxSideVariants CVA functions", () => {
    expect(flipFxVariants()).toContain("relative");
    expect(flipFxVariants({ className: "test-cva" })).toContain("test-cva");

    expect(flipFxSideVariants({ side: "front" })).toContain("[backface-visibility:hidden]");
    expect(flipFxSideVariants({ side: "backHorizontal" })).toContain("[transform:rotateY(180deg)]");
    expect(flipFxSideVariants({ side: "backVertical" })).toContain("[transform:rotateX(180deg)]");
  });
});

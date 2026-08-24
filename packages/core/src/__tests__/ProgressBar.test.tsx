import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ProgressBar, progressBarVariants } from "../components/ProgressBar";

describe("ProgressBar", () => {
  it("renders default progress bar with progressbar role and aria attributes", () => {
    render(<ProgressBar value={50} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("calculates percentage width correctly", () => {
    const { container } = render(<ProgressBar value={75} min={0} max={100} />);

    const fill = container.querySelector("[role='progressbar'] > div");
    expect(fill).toBeInTheDocument();
    expect((fill as HTMLElement).style.width).toBe("75%");
  });

  it("clamps percentage between 0% and 100%", () => {
    const { container: underContainer } = render(<ProgressBar value={-10} min={0} max={100} />);
    const underFill = underContainer.querySelector("[role='progressbar'] > div");
    expect((underFill as HTMLElement).style.width).toBe("0%");

    const { container: overContainer } = render(<ProgressBar value={150} min={0} max={100} />);
    const overFill = overContainer.querySelector("[role='progressbar'] > div");
    expect((overFill as HTMLElement).style.width).toBe("100%");
  });

  it("calculates percentage correctly with custom min and max", () => {
    const { container } = render(<ProgressBar value={50} min={25} max={75} />);

    const fill = container.querySelector("[role='progressbar'] > div");
    expect(fill).toBeInTheDocument();
    expect((fill as HTMLElement).style.width).toBe("50%");
  });

  it("handles min === max gracefully without NaN", () => {
    const { container } = render(<ProgressBar value={10} min={10} max={10} />);

    const fill = container.querySelector("[role='progressbar'] > div");
    expect(fill).toBeInTheDocument();
    expect((fill as HTMLElement).style.width).toBe("0%");
  });

  it("renders label by default", () => {
    render(<ProgressBar value={60} />);

    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it("hides label when label is false", () => {
    render(<ProgressBar value={60} label={false} />);

    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("renders with labelPosition='top'", () => {
    const { container } = render(<ProgressBar value={30} labelPosition="top" />);

    const progressbar = screen.getByRole("progressbar");
    const label = screen.getByText(/%/);
    expect(progressbar).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex-col");
  });

  it("renders with labelPosition='bottom'", () => {
    const { container } = render(<ProgressBar value={30} labelPosition="bottom" />);

    const progressbar = screen.getByRole("progressbar");
    const label = screen.getByText(/%/);
    expect(progressbar).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex-col");
  });

  it("renders with labelPosition='left'", () => {
    const { container } = render(<ProgressBar value={30} labelPosition="left" />);

    const progressbar = screen.getByRole("progressbar");
    const label = screen.getByText(/%/);
    expect(progressbar).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex-row");
  });

  it("renders with labelPosition='right'", () => {
    const { container } = render(<ProgressBar value={30} labelPosition="right" />);

    const progressbar = screen.getByRole("progressbar");
    const label = screen.getByText(/%/);
    expect(progressbar).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex-row");
  });

  it("applies custom barBackground solid color", () => {
    const { container } = render(<ProgressBar value={40} barBackground="accent-strong" />);

    const fill = container.querySelector("[role='progressbar'] > div");
    expect(fill).toHaveClass("bg-accent-solid-strong");
  });

  it("forwards ref to container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressBar ref={ref} value={50} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <ProgressBar value={50} className="custom-progress" style={{ opacity: 0.9 }} />,
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("custom-progress");
    expect(root.style.opacity).toBe("0.9");
  });

  it("exports progressBarVariants function for composability", () => {
    expect(progressBarVariants({ labelPosition: "top" })).toContain("flex-col");
    expect(progressBarVariants({ labelPosition: "bottom" })).toContain("flex-col");
    expect(progressBarVariants({ labelPosition: "left" })).toContain("flex-row");
    expect(progressBarVariants({ labelPosition: "right" })).toContain("flex-row");
  });
});

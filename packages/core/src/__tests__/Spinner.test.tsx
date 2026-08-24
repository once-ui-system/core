import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Spinner, spinnerVariants } from "../components/Spinner";

describe("Spinner", () => {
  it("renders default spinner with default classes and role", () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();

    const statusEl = screen.getByRole("status", { name: "Loading" });
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveClass(
      "relative",
      "inline-flex",
      "items-center",
      "justify-center",
      "w-24",
      "h-24",
      "p-[3px]",
    );

    // Inner track ring
    const innerContainer = statusEl.firstElementChild as HTMLElement;
    const trackRing = innerContainer.children[0] as HTMLElement;
    expect(trackRing).toHaveClass(
      "w-full",
      "h-full",
      "rounded-full",
      "border-solid",
      "border-neutral-alpha-medium",
      "absolute",
      "border-2",
    );

    // Inner spinning ring
    const spinningRing = innerContainer.children[1] as HTMLElement;
    expect(spinningRing).toHaveClass(
      "w-full",
      "h-full",
      "rounded-full",
      "border-solid",
      "animate-spin",
      "border-transparent",
      "border-2",
    );
  });

  it("forwards ref to the status element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute("role", "status");
  });

  it("customizes aria-label", () => {
    render(<Spinner ariaLabel="Fetching data..." />);
    expect(screen.getByRole("status", { name: "Fetching data..." })).toBeInTheDocument();
  });

  it("renders all size variants correctly", () => {
    const { rerender } = render(<Spinner size="xs" />);
    let statusEl = screen.getByRole("status");
    expect(statusEl).toHaveClass("w-16", "h-16", "p-2");
    let innerContainer = statusEl.firstElementChild as HTMLElement;
    expect(innerContainer.children[0]).toHaveClass("border-2");

    rerender(<Spinner size="s" />);
    statusEl = screen.getByRole("status");
    expect(statusEl).toHaveClass("w-20", "h-20", "p-2");
    innerContainer = statusEl.firstElementChild as HTMLElement;
    expect(innerContainer.children[0]).toHaveClass("border-2");

    rerender(<Spinner size="m" />);
    statusEl = screen.getByRole("status");
    expect(statusEl).toHaveClass("w-24", "h-24", "p-[3px]");
    innerContainer = statusEl.firstElementChild as HTMLElement;
    expect(innerContainer.children[0]).toHaveClass("border-2");

    rerender(<Spinner size="l" />);
    statusEl = screen.getByRole("status");
    expect(statusEl).toHaveClass("w-32", "h-32", "p-4");
    innerContainer = statusEl.firstElementChild as HTMLElement;
    expect(innerContainer.children[0]).toHaveClass("border-[3px]");

    rerender(<Spinner size="xl" />);
    statusEl = screen.getByRole("status");
    expect(statusEl).toHaveClass("w-40", "h-40", "p-8");
    innerContainer = statusEl.firstElementChild as HTMLElement;
    expect(innerContainer.children[0]).toHaveClass("border-[3px]");
  });

  it("merges custom className and style on root", () => {
    const { container } = render(
      <Spinner className="custom-spinner-class" style={{ zIndex: 10 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-spinner-class");
    expect(root.style.zIndex).toBe("10");
  });

  it("generates correct classes from spinnerVariants", () => {
    expect(spinnerVariants({ size: "xs" })).toContain("w-16 h-16 p-2");
    expect(spinnerVariants({ size: "s" })).toContain("w-20 h-20 p-2");
    expect(spinnerVariants({ size: "m" })).toContain("w-24 h-24 p-[3px]");
    expect(spinnerVariants({ size: "l" })).toContain("w-32 h-32 p-4");
    expect(spinnerVariants({ size: "xl" })).toContain("w-40 h-40 p-8");
  });
});

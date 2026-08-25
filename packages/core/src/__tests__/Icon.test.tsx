import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Icon, iconVariants } from "../components/Icon";
import { IconProvider } from "../contexts/IconProvider";

describe("Icon", () => {
  it("renders default icon with m size and decorative by default", () => {
    const { container } = render(<Icon name="person" />);
    const span = container.firstElementChild as HTMLElement;

    expect(span).toBeInTheDocument();
    expect(span.tagName).toBe("SPAN");
    expect(span).toHaveAttribute("aria-hidden", "true");
    expect(span).not.toHaveAttribute("aria-label");
    expect(span).toHaveClass(
      "inline-flex",
      "w-fit",
      "h-fit",
      "text-[length:var(--static-space-24)]",
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders all size variants correctly", () => {
    const { container, rerender } = render(<Icon name="person" size="xs" />);
    expect(container.firstElementChild).toHaveClass("text-[length:var(--static-space-16)]");

    rerender(<Icon name="person" size="s" />);
    expect(container.firstElementChild).toHaveClass("text-[length:var(--static-space-20)]");

    rerender(<Icon name="person" size="m" />);
    expect(container.firstElementChild).toHaveClass("text-[length:var(--static-space-24)]");

    rerender(<Icon name="person" size="l" />);
    expect(container.firstElementChild).toHaveClass("text-[length:var(--static-space-32)]");

    rerender(<Icon name="person" size="xl" />);
    expect(container.firstElementChild).toHaveClass("text-[length:var(--static-space-40)]");
  });

  it("handles non-decorative state with aria-label", () => {
    const { container } = render(<Icon name="close" decorative={false} />);
    const span = container.firstElementChild as HTMLElement;

    expect(span).not.toHaveAttribute("aria-hidden");
    expect(span).toHaveAttribute("aria-label", "close");
  });

  it("applies onBackground and onSolid color classes", () => {
    const { container, rerender } = render(<Icon name="check" onBackground="neutral-strong" />);
    expect(container.firstElementChild).toHaveClass(
      "neutral-on-background-strong",
      "text-neutral-on-background-strong",
    );

    rerender(<Icon name="check" onSolid="brand-medium" />);
    expect(container.firstElementChild).toHaveClass(
      "brand-on-solid-medium",
      "text-brand-on-solid-medium",
    );
  });

  it("warns and returns null when icon name is not found", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Icon name="nonExistentIconName" />);

    expect(container.firstChild).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      'Icon "nonExistentIconName" does not exist in the library.',
    );
    warnSpy.mockRestore();
  });

  it("renders custom icons provided via IconProvider", () => {
    const CustomIconComponent = () => <svg data-testid="custom-svg" />;
    const { container } = render(
      <IconProvider
        icons={{
          myCustomIcon: CustomIconComponent,
        }}
      >
        <Icon name="myCustomIcon" />
      </IconProvider>,
    );

    expect(screen.getByTestId("custom-svg")).toBeInTheDocument();
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("renders tooltip when tooltip prop is provided and hovered", () => {
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

    const { container } = render(<Icon name="help" tooltip="Help information" />);
    const triggerWrapper = container.firstElementChild as HTMLElement;

    expect(screen.queryByText("Help information")).not.toBeInTheDocument();

    fireEvent.mouseEnter(triggerWrapper);
    expect(screen.getByText("Help information")).toBeInTheDocument();

    fireEvent.mouseLeave(triggerWrapper);
    expect(screen.queryByText("Help information")).not.toBeInTheDocument();
  });

  it("forwards ref to the span element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Icon ref={ref} name="person" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Icon name="person" className="custom-icon-class" style={{ opacity: 0.5 }} />,
    );
    const span = container.firstElementChild as HTMLElement;
    expect(span).toHaveClass("custom-icon-class");
    expect(span.style.opacity).toBe("0.5");
  });

  it("exports iconVariants with correct classes", () => {
    expect(iconVariants({ size: "xs" })).toContain("text-[length:var(--static-space-16)]");
    expect(iconVariants({ size: "s" })).toContain("text-[length:var(--static-space-20)]");
    expect(iconVariants({ size: "m" })).toContain("text-[length:var(--static-space-24)]");
    expect(iconVariants({ size: "l" })).toContain("text-[length:var(--static-space-32)]");
    expect(iconVariants({ size: "xl" })).toContain("text-[length:var(--static-space-40)]");
  });
});

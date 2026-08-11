import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CursorCard } from "../components/CursorCard";

describe("CursorCard", () => {
  it("renders trigger element", () => {
    render(
      <CursorCard
        trigger={<button type="button">Hover trigger</button>}
        overlay={<div>Overlay content</div>}
      />,
    );

    expect(screen.getByText("Hover trigger")).toBeInTheDocument();
    expect(screen.queryByText("Overlay content")).not.toBeInTheDocument();
  });

  it("shows overlay on hover with animation and merges className", () => {
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
      <CursorCard
        trigger={<div>Hover target</div>}
        overlay={<div>Overlay popup</div>}
        className="custom-cursor-card"
      />,
    );

    const triggerWrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(triggerWrapper);

    const overlay = screen.getByText("Overlay popup");
    expect(overlay).toBeInTheDocument();

    const overlayContainer = overlay.closest(".custom-cursor-card");
    expect(overlayContainer).toBeInTheDocument();
    expect(overlayContainer).toHaveClass("animate-fadeIn");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Card } from "../components/Card";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Card", () => {
  it("is a plain button with onClick, so it never submits a form around it", () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const click = vi.fn();
    render(
      <form onSubmit={submit}>
        <Card onClick={click}>Pick</Card>
      </form>,
      { wrapper: wrap },
    );
    const card = screen.getByRole("button", { name: "Pick" });
    expect(card).toHaveAttribute("type", "button");
    fireEvent.click(card);
    expect(click).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
  });

  it("hugs its width instead of stretching when given one", () => {
    const { container } = render(
      <Card onClick={() => {}} width={320}>
        Sized
      </Card>,
      {
        wrapper: wrap,
      },
    );
    const outer = container.querySelector("button");
    expect(outer).toHaveClass("fit-width");
    expect(outer).not.toHaveClass("fill-width");
  });

  it("still fills its row without a width", () => {
    const { container } = render(<Card onClick={() => {}}>Wide</Card>, { wrapper: wrap });
    expect(container.querySelector("button")).toHaveClass("fill-width");
  });

  it("fills its row up to a maxWidth, which caps the card rather than sizing it", () => {
    const { container } = render(
      <Card onClick={() => {}} maxWidth="xs">
        Capped
      </Card>,
      { wrapper: wrap },
    );
    expect(container.querySelector("button")).toHaveClass("fill-width");
  });
});

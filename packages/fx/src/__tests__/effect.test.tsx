import { LayoutProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Effect } from "../Effect.js";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Effect", () => {
  it("renders its content with no layer when switched off", () => {
    const { container } = render(<Effect type="none">Hero</Effect>, { wrapper: wrap });
    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("paints a canvas layer for a canvas-backed effect", () => {
    const { container } = render(<Effect type="matrix">Hero</Effect>, { wrapper: wrap });
    expect(container.querySelector("canvas")).not.toBeNull();
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });

  it("keeps the content in place across a swap — that is the point", () => {
    const { container, rerender } = render(<Effect type="matrix">Hero</Effect>, { wrapper: wrap });
    const before = container.firstElementChild?.className;
    rerender(
      <LayoutProvider>
        <Effect type="blob">Hero</Effect>
      </LayoutProvider>,
    );
    expect(container.firstElementChild?.className).toBe(before);
    expect(screen.getByText("Hero")).toBeInTheDocument();
  });
});

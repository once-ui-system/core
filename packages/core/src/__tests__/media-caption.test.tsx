import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Media } from "../components/Media";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * `caption` rendered the media box as the `figure` and the `figcaption` after
 * it, outside the figure, so the caption described nothing. The figure now
 * holds both, and draws no box of its own, so the media box and the caption
 * lay out exactly as they did.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Media caption", () => {
  it("renders the figcaption inside the figure, after the media", () => {
    const { container } = render(
      <Media src="/flow.png" alt="A diagram" caption="The request flow" />,
      { wrapper },
    );
    const figure = screen.getByRole("figure");
    const caption = container.querySelector("figcaption");
    expect(figure).toContainElement(screen.getByRole("img", { name: "A diagram" }));
    expect(caption).toHaveTextContent("The request flow");
    expect(caption?.parentElement).toBe(figure);
    expect(figure.lastElementChild).toBe(caption);
    expect(container.querySelectorAll("figure")).toHaveLength(1);
  });

  it("draws no box for the figure, so the layout is the media box and the caption", () => {
    const { container } = render(
      <Media
        src="/flow.png"
        alt="A diagram"
        caption="The request flow"
        radius="l"
        className="custom"
      />,
      { wrapper },
    );
    const figure = container.querySelector("figure") as HTMLElement;
    expect(figure.style.display).toBe("contents");

    // The media box keeps its own props and classes, as when it was the figure.
    const box = figure.firstElementChild as HTMLElement;
    expect(box.tagName).toBe("DIV");
    expect(box).toHaveClass("custom");
    expect(box).toHaveClass("radius-l");
    expect(box).toContainElement(screen.getByRole("img", { name: "A diagram" }));
  });

  it("renders no figure without a caption", () => {
    const { container } = render(<Media src="/flow.png" alt="A diagram" />, { wrapper });
    expect(container.querySelector("figure")).toBeNull();
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Media src="/flow.png" alt="A diagram" caption="The request flow" />,
      { wrapper },
    );
    await expectNoAxeViolations(container);
  });
});

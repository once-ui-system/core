import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoloFx } from "../HoloFx.js";
import { LayoutProvider } from "@once-ui-system/core";
import { expectNoAxeViolations } from "../test/axe.js";
import {
  installIntersectingObserver,
  mockReducedMotion,
  resetIntersectionObserver,
} from "../test/fxTestUtils.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const rect = (el: HTMLElement) =>
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

/**
 * HoloFx stacks burn/shine copies of its children and a texture over the
 * real content, and moves their highlight with the pointer while on screen
 * and motion is allowed. The copies are decoration: assistive tech and the
 * tab order see the content once.
 */
describe("HoloFx", () => {
  beforeEach(() => {
    installIntersectingObserver();
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  });
  afterEach(() => {
    resetIntersectionObserver();
  });

  it("exposes its children once", async () => {
    const { container } = render(
      <HoloFx>
        <a href="/card">Rare card</a>
      </HoloFx>,
      { wrapper },
    );
    expect(screen.getAllByRole("link", { hidden: true })).toHaveLength(3);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    const copies = screen
      .getAllByRole("link", { hidden: true })
      .filter((link) => link.closest("[inert]"));
    expect(copies).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it("follows the pointer with the highlight", () => {
    mockReducedMotion(false);
    const { container } = render(<HoloFx reducedMotion={false}>Card</HoloFx>, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    rect(el);
    fireEvent.mouseMove(document, { clientX: 150, clientY: 25 });
    expect(el.style.getPropertyValue("--gradient-pos-x")).toBe("50%");
    expect(el.style.getPropertyValue("--gradient-pos-y")).toBe("-50%");
  });

  it("holds still under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const { container } = render(<HoloFx>Card</HoloFx>, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    rect(el);
    fireEvent.mouseMove(document, { clientX: 150, clientY: 25 });
    expect(el.style.getPropertyValue("--gradient-pos-x")).toBe("");
  });

  it("holds still while off screen", () => {
    installIntersectingObserver(false);
    const { container } = render(<HoloFx reducedMotion={false}>Card</HoloFx>, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    rect(el);
    fireEvent.mouseMove(document, { clientX: 150, clientY: 25 });
    expect(el.style.getPropertyValue("--gradient-pos-x")).toBe("");
  });

  it("stops listening to the pointer on unmount", () => {
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<HoloFx reducedMotion={false}>Card</HoloFx>, { wrapper });
    unmount();
    expect(remove).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });

  it("applies layer options and forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <HoloFx
        ref={ref}
        shine={{ opacity: 70, mask: { maskPosition: "40" } }}
        burn={{ blending: "multiply" }}
        texture={{ image: "url(/grain.png)" }}
      >
        Card
      </HoloFx>,
      { wrapper },
    );
    expect(ref.current).toBe(container.firstElementChild);
    const layers = Array.from(container.querySelectorAll<HTMLElement>("[aria-hidden='true']"));
    const [burn, shine, texture] = layers;
    expect(shine.style.getPropertyValue("--shine-opacity")).toBe("70%");
    expect(shine.style.maskImage).toContain("ellipse 40% 40%");
    // Layers without a custom mask keep the default ellipse.
    expect(burn.style.maskImage).toContain("ellipse 100% 200%");
    expect(burn.style.mixBlendMode).toBe("multiply");
    expect(texture.style.backgroundImage).toContain("grain.png");
  });
});

import { act, render as baseRender, fireEvent, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Mascot, mascotLook } from "../modules/ai/Mascot";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

describe("Mascot", () => {
  it("is one image named for what it is doing", () => {
    const { rerender } = render(<Mascot />);
    expect(screen.getByRole("img", { name: "Assistant" })).toBeTruthy();
    rerender(<Mascot state="thinking" mood="happy" />);
    const img = screen.getByRole("img", { name: "Assistant, thinking" });
    expect(img.getAttribute("data-state")).toBe("thinking");
    expect(img.getAttribute("data-mood")).toBe("happy");
  });

  it("draws Once UI tile eyes by default, other eye shapes on request", () => {
    const { container, rerender } = render(<Mascot />);
    const img = screen.getByRole("img");
    expect(img.getAttribute("data-eyes")).toBe("tile");
    expect(container.querySelectorAll("g[clip-path*='-top-'] path")).toHaveLength(2);
    rerender(<Mascot eyes="pill" />);
    expect(img.getAttribute("data-eyes")).toBe("shape");
    expect(container.querySelectorAll("g[clip-path*='-top-'] rect")).toHaveLength(2);
    rerender(<Mascot eyes={{ path: "M0 -10 L10 0 L0 10 L-10 0Z" }} />);
    expect(container.querySelector("g[clip-path*='-top-'] path")?.getAttribute("d")).toBe(
      "M0 -10 L10 0 L0 10 L-10 0Z",
    );
  });

  it("shows z's only while sleeping", () => {
    const { container, rerender } = render(<Mascot />);
    expect(container.querySelectorAll("text")).toHaveLength(0);
    rerender(<Mascot state="sleeping" />);
    expect(container.querySelectorAll("text")).toHaveLength(2);
  });

  it("adds a mouth, brows, cheeks and an accessory when asked", () => {
    const { container } = render(
      <Mascot mouth="smile" brows cheeks accessory={<circle data-testid="hat" r={4} />} />,
    );
    expect(container.querySelectorAll("path[class*='brow']")).toHaveLength(2);
    expect(container.querySelectorAll("ellipse[class*='cheek']")).toHaveLength(2);
    expect(container.querySelector("[data-testid='hat']")).toBeTruthy();
  });

  it("gives the same seed the same look, and lets props win over it", () => {
    expect(mascotLook("acme")).toEqual(mascotLook("acme"));
    expect(mascotLook("acme")).not.toEqual(mascotLook("lumen"));
    render(<Mascot seed="acme" color="#123456" surface="flat" />);
    const img = screen.getByRole("img");
    expect(img.style.getPropertyValue("--mascot-color")).toBe("#123456");
    expect(img.getAttribute("data-surface")).toBe("flat");
  });

  it("takes a scheme or any CSS color", () => {
    const { rerender } = render(<Mascot color="accent" />);
    const img = screen.getByRole("img");
    expect(img.style.getPropertyValue("--mascot-color")).toBe("var(--function-accent-500)");
    rerender(<Mascot color="#ff5a36" />);
    expect(img.style.getPropertyValue("--mascot-color")).toBe("#ff5a36");
  });

  it("changes its outline with roundness and aspect", () => {
    const outline = (ui: ReactElement) => {
      const { container, unmount } = render(ui);
      const d = container.querySelector("svg > g path")?.getAttribute("d");
      unmount();
      return d;
    };
    const base = outline(<Mascot />);
    expect(outline(<Mascot roundness={1} />)).not.toBe(base);
    expect(outline(<Mascot aspect={1.3} />)).not.toBe(base);
  });

  it("pulses with a level, clamped", () => {
    render(<Mascot state="speaking" level={2} />);
    const img = screen.getByRole("img");
    expect(img.hasAttribute("data-live")).toBe(true);
    expect(img.style.getPropertyValue("--mascot-level")).toBe("1");
  });

  it("looks where it is told", () => {
    render(<Mascot lookAt={{ x: 0.5, y: -3 }} />);
    const img = screen.getByRole("img");
    expect(img.style.getPropertyValue("--mascot-look-x")).toBe("0.5");
    expect(img.style.getPropertyValue("--mascot-look-y")).toBe("-1");
  });

  it("follows the pointer", async () => {
    render(<Mascot />);
    const img = screen.getByRole("img");
    await act(async () => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 2000, clientY: 0 }));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });
    expect(Number(img.style.getPropertyValue("--mascot-look-x"))).toBeGreaterThan(0);
  });

  it("looks surprised for a moment when poked, unless poke is off", () => {
    vi.useFakeTimers();
    try {
      const { rerender } = render(<Mascot mood="happy" />);
      const img = screen.getByRole("img");
      fireEvent.pointerDown(img);
      expect(img.getAttribute("data-mood")).toBe("surprised");
      act(() => {
        vi.advanceTimersByTime(700);
      });
      expect(img.getAttribute("data-mood")).toBe("happy");
      rerender(<Mascot mood="happy" poke={false} />);
      fireEvent.pointerDown(screen.getByRole("img"));
      expect(screen.getByRole("img").getAttribute("data-mood")).toBe("happy");
    } finally {
      vi.useRealTimers();
    }
  });

  it("takes a token-scale size and eye styles", () => {
    const { container } = render(<Mascot eyes="wide" size={64} />);
    const img = screen.getByRole("img");
    expect(img.style.width).toBe("var(--static-space-64)");
    const eye = container.querySelector("g[clip-path*='-top-'] rect");
    expect(Number(eye?.getAttribute("width"))).toBeGreaterThan(Number(eye?.getAttribute("height")));
  });

  it("renders on the server with stable gradient ids", () => {
    const html = renderToString(
      <LayoutProvider>
        <Mascot state="listening" />
      </LayoutProvider>,
    );
    const id = html.match(/id="([^"]+)-light"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`url(#${id}-light)`);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Mascot state="speaking" />);
    await expectNoAxeViolations(container);
  });
});

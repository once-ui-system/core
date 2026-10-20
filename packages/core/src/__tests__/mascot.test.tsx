import { act, render as baseRender, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Mascot } from "../modules/ai/Mascot";
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

  it("draws one body and two eyes, and nothing else", () => {
    const { container } = render(<Mascot />);
    expect(container.querySelectorAll("rect")).toHaveLength(2);
    expect(container.querySelectorAll("text")).toHaveLength(0);
  });

  it("closes its eyes into arcs when happy or asleep, with z's while sleeping", () => {
    const { container, rerender } = render(<Mascot mood="happy" />);
    expect(container.querySelectorAll("rect")).toHaveLength(0);
    expect(container.querySelectorAll("text")).toHaveLength(0);
    rerender(<Mascot state="sleeping" />);
    expect(container.querySelectorAll("rect")).toHaveLength(0);
    expect(container.querySelectorAll("text")).toHaveLength(2);
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

  it("takes a pixel size and eye styles", () => {
    const { container } = render(<Mascot eyes="wide" size={64} />);
    const img = screen.getByRole("img");
    expect(img.style.width).toBe("64px");
    const eye = container.querySelector("rect");
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

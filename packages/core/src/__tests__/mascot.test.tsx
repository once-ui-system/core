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

  it("draws the Once UI tiles for the mark shape, one body for the others", () => {
    const { container, rerender } = render(<Mascot shape="mark" />);
    expect(container.querySelectorAll("g[transform] path")).toHaveLength(4);
    rerender(<Mascot shape="orb" />);
    expect(container.querySelectorAll("g[transform] path")).toHaveLength(0);
    expect(container.querySelector("circle[r='78']")).toBeTruthy();
  });

  it("closes its eyes and shows z's while sleeping", () => {
    const { container } = render(<Mascot state="sleeping" />);
    expect(container.querySelectorAll("ellipse[rx='13']")).toHaveLength(0);
    expect(container.querySelectorAll("text")).toHaveLength(2);
  });

  it("opens the mouth with a level, clamped", () => {
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

  it("recolors single parts from palette", () => {
    render(<Mascot palette={{ body: "#ff8a3d", ink: "#2b1300" }} />);
    const img = screen.getByRole("img");
    expect(img.style.getPropertyValue("--mascot-body")).toBe("#ff8a3d");
    expect(img.style.getPropertyValue("--mascot-ink")).toBe("#2b1300");
  });

  it("takes accessories, eyes and a pixel size", () => {
    const { container } = render(<Mascot accessory="halo" eyes="visor" size={64} />);
    const img = screen.getByRole("img");
    expect(img.style.width).toBe("64px");
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });

  it("renders on the server with stable gradient ids", () => {
    const html = renderToString(
      <LayoutProvider>
        <Mascot state="listening" />
      </LayoutProvider>,
    );
    const id = html.match(/id="([^"]+)-body"/)?.[1];
    expect(id).toBeTruthy();
    expect(html).toContain(`url(#${id}-body)`);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Mascot state="speaking" accessory="antenna" />);
    await expectNoAxeViolations(container);
  });
});

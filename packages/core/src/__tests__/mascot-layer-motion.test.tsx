import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { parseMascotDesign } from "../modules/ai/design";
import { Mascot } from "../modules/ai/Mascot";
import { mascotSvg } from "../modules/ai/mascotSvg";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const FLAME = "M90 150Q100 120 110 150Z";
const CAPE = "M60 80L40 180H160L140 80Z";

describe("layer motion", () => {
  it("keeps a known motion and a valid origin, and drops the rest", () => {
    const design = parseMascotDesign({
      v: 1,
      layers: [
        { d: FLAME, fill: "#ff7a1a", motion: "flicker", origin: "100 150" },
        { d: CAPE, motion: "dance", origin: "nowhere" },
      ],
    });
    expect(design?.layers?.[0]).toMatchObject({ motion: "flicker", origin: "100 150" });
    expect(design?.layers?.[1]?.motion).toBeUndefined();
    expect(design?.layers?.[1]?.origin).toBeUndefined();
  });

  it("allows a whole outfit of layers", () => {
    const layers = Array.from({ length: 60 }, () => ({ d: FLAME }));
    expect(parseMascotDesign({ v: 1, layers })?.layers).toHaveLength(48);
  });

  it("wraps a moving layer in a group that turns around its origin", () => {
    const { container } = render(
      <Mascot
        layers={[{ d: FLAME, fill: "#ff7a1a", motion: "spin", origin: "100 150" }, { d: CAPE }]}
      />,
      { wrapper },
    );
    const moving = container.querySelector(`path[d="${FLAME}"]`)?.parentElement;
    expect(moving?.tagName.toLowerCase()).toBe("g");
    expect(moving?.getAttribute("style")).toContain("transform-origin: 100px 150px");
    expect(
      container.querySelector(`path[d="${CAPE}"]`)?.parentElement?.getAttribute("style"),
    ).toBeNull();
  });

  it("draws built-in accessories and layers together", () => {
    const { container } = render(
      <Mascot accessory="crown" layers={[{ d: CAPE, place: "back" }]} />,
      {
        wrapper,
      },
    );
    expect(container.querySelector(`path[d="${CAPE}"]`)).not.toBeNull();
    // The crown is still there: more paths than the cape alone adds.
    const alone = render(<Mascot accessory="crown" />, { wrapper }).container;
    expect(container.querySelectorAll("path").length).toBeGreaterThan(
      alone.querySelectorAll("path").length,
    );
  });

  it("mascotSvg draws layers as a still", () => {
    const svg = mascotSvg({ layers: [{ d: FLAME, fill: "#ff7a1a", motion: "flicker" }] });
    expect(svg).toContain(FLAME);
    expect(svg).not.toContain("animation");
  });
});

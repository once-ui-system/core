import { render as baseRender } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { parseMascotDesign } from "../modules/ai/design";
import { Mascot } from "../modules/ai/Mascot";
import {
  furStrands,
  lowPolyFacets,
  MASCOT_MEDIUMS,
  mediumFilterMarkup,
} from "../modules/ai/mascotMedium";
import { bodyShape } from "../modules/ai/mascotShape";
import { mascotSvg } from "../modules/ai/mascotSvg";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);
const render = (ui: ReactElement) => baseRender(ui, { wrapper });

describe("Mascot medium", () => {
  it("draws the vector mascot by default, with no filter", () => {
    const { container } = render(<Mascot />);
    expect(container.querySelector("filter")).toBeNull();
    expect(container.querySelector("[data-medium]")).toBeNull();
  });

  it("puts each filter medium's filter in use", () => {
    for (const medium of ["plush", "clay", "pixel", "toon"] as const) {
      const { container, unmount } = render(<Mascot medium={medium} />);
      const filter = container.querySelector("filter");
      expect(filter, medium).not.toBeNull();
      const id = filter?.getAttribute("id");
      expect(container.querySelector(`[filter="url(#${id})"]`), medium).not.toBeNull();
      expect(container.querySelector("[role=img]")?.getAttribute("data-medium")).toBe(medium);
      unmount();
    }
  });

  it("cuts the body into lit facets for lowpoly", () => {
    const facets = lowPolyFacets(bodyShape(0.7, 1).d);
    expect(facets.length).toBeGreaterThan(20);
    for (const facet of facets) {
      expect(facet.light).toBeGreaterThanOrEqual(-1);
      expect(facet.light).toBeLessThanOrEqual(1);
    }
    const { container } = render(<Mascot medium="lowpoly" />);
    expect(container.querySelectorAll("polygon").length).toBe(facets.length);
  });

  it("grows fur as tufts of hairs, the same on every render", () => {
    const d = bodyShape(0.7, 1).d;
    const coat = furStrands(d);
    expect(coat.length).toBeGreaterThan(10);
    expect(furStrands(d)).toEqual(coat);
    const { container } = render(<Mascot medium="fur" />);
    expect(container.querySelector("filter")).toBeNull();
    expect(container.querySelector("[data-medium=fur]")).not.toBeNull();
  });

  it("draws the same media in a still SVG, with hyphenated presentation attributes", () => {
    for (const medium of MASCOT_MEDIUMS) {
      const svg = mascotSvg({ medium, color: "#e86a5a" });
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.includes("filter=")).toBe(
        ["plush", "clay", "pixel", "toon"].includes(medium),
      );
    }
    expect(mediumFilterMarkup("x", "toon")).toContain('flood-color="#111318"');
    expect(mascotSvg({ medium: "lowpoly" })).toContain("<polygon");
  });

  it("keeps a known medium in a design and drops anything else", () => {
    expect(parseMascotDesign({ medium: "pixel" }).medium).toBe("pixel");
    expect(parseMascotDesign({ medium: "shader('evil')" }).medium).toBeUndefined();
  });
});

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  MASCOT_DESIGN_DEFAULTS,
  type MascotDesign,
  mascotDesignProps,
  parseMascotDesign,
} from "../modules/ai/design";
import { Mascot, mascotLook } from "../modules/ai/Mascot";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("parseMascotDesign", () => {
  it("keeps a valid design as it is", () => {
    const design: MascotDesign = {
      v: 1,
      color: "oklch(0.72 0.16 200)",
      roundness: 0.4,
      aspect: 1.2,
      surface: "matte",
      eyes: "pill",
      eyeSize: 1.1,
      eyeSpacing: 0.9,
      eyeHeight: -0.2,
      eyeColor: "#101010",
      mouth: "smile",
      brows: true,
      cheeks: true,
      personality: "bouncy",
      accessory: ["crown", "bow"],
      accessoryColor: "gold",
      working: "d20",
      sides: { front: "#ff0000", top: "brand" },
      face: "flat",
    };
    expect(parseMascotDesign(design)).toEqual(design);
    expect(parseMascotDesign(JSON.stringify(design))).toEqual(design);
  });

  it("drops what it does not know and clamps numbers", () => {
    expect(
      parseMascotDesign({
        color: "url(javascript:alert(1))",
        roundness: 7,
        aspect: -3,
        eyeHeight: Number.NaN,
        eyes: "laser",
        surface: "chrome",
        accessory: ["crown", "monocle", "crown"],
        working: "sphere",
        extra: { nested: true },
        brows: "yes",
      }),
    ).toEqual({ v: 1, roundness: 1, aspect: 0.6, accessory: ["crown"] });
  });

  it("only takes path data as a path", () => {
    expect(parseMascotDesign({ bodyPath: "M0 0 L10 10 Z" }).bodyPath).toBe("M0 0 L10 10 Z");
    expect(parseMascotDesign({ bodyPath: '"/><script>' }).bodyPath).toBeUndefined();
    expect(parseMascotDesign({ eyes: { path: "M-5 0 a5 5 0 1 0 10 0" } }).eyes).toEqual({
      path: "M-5 0 a5 5 0 1 0 10 0",
    });
    expect(parseMascotDesign({ bodyPath: "M0 0".repeat(2000) }).bodyPath).toBeUndefined();
  });

  it("accepts one accessory name as a list", () => {
    expect(parseMascotDesign({ accessory: "helmet" }).accessory).toEqual(["helmet"]);
  });

  it("never throws, and unreadable input is the default mascot", () => {
    for (const input of [undefined, null, 3, "not json", "[1,2]", [], true]) {
      expect(parseMascotDesign(input)).toEqual({ v: 1 });
    }
  });

  it("reads a seeded look", () => {
    const look = mascotLook("aveiro-agent-7");
    const { v: _v, ...parsed } = parseMascotDesign(look);
    expect(parsed).toEqual(
      Object.fromEntries(
        Object.entries(look).map(([key, value]) =>
          typeof value === "number" ? [key, Math.round(value * 1000) / 1000] : [key, value],
        ),
      ),
    );
  });
});

describe("mascotDesignProps", () => {
  it("spreads onto the mascot", () => {
    const design = parseMascotDesign({ eyes: "round", surface: "flat", accessory: ["bow"] });
    expect(mascotDesignProps(design)).toEqual({
      eyes: "round",
      surface: "flat",
      accessory: ["bow"],
    });
    const { getByRole } = render(<Mascot {...mascotDesignProps(design)} />, { wrapper });
    expect(getByRole("img").getAttribute("data-surface")).toBe("flat");
  });

  it("shares its defaults with the mascot", () => {
    const { getByRole } = render(<Mascot />, { wrapper });
    const img = getByRole("img");
    expect(img.getAttribute("data-surface")).toBe(MASCOT_DESIGN_DEFAULTS.surface);
    expect(img.getAttribute("data-personality")).toBe(MASCOT_DESIGN_DEFAULTS.personality);
  });
});

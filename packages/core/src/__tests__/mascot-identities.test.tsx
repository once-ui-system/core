import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Mascot, mascotLook } from "../modules/ai/Mascot";
import {
  MASCOT_IDENTITIES,
  MASCOT_IDENTITY_KEYS,
  mascotIdentity,
  mascotIdentityKey,
} from "../modules/ai/mascotIdentities";
import { mascotSvg } from "../modules/ai/mascotSvg";

const draw = (ui: React.ReactElement) => render(<LayoutProvider>{ui}</LayoutProvider>).container;

describe("canonical mascots", () => {
  it("resolves a name in any spelling, and only the whole seed", () => {
    for (const seed of ["once-ui", "Once UI", "onceui", "ONCE_UI", "once"]) {
      expect(mascotIdentity(seed)?.handle).toBe("once-ui");
    }
    expect(mascotIdentity("Holo Zone")?.handle).toBe("holo-zone");
    expect(mascotIdentity("magicdocs")?.handle).toBe("magic-docs");
    expect(mascotIdentity("quasar")?.name).toBe("Quasar");
    expect(mascotIdentity("once-ui-fan")).toBeUndefined();
    expect(mascotIdentity("happy-red-fox")).toBeUndefined();
    expect(mascotIdentity("")).toBeUndefined();
    expect(mascotIdentity(undefined)).toBeUndefined();
  });

  it("holds every product, Once UI and Quasar, and no client brands", () => {
    const handles = MASCOT_IDENTITIES.map((identity) => identity.handle);
    for (const handle of [
      "once-ui",
      "quasar",
      "dopler",
      "stack",
      "aveiro",
      "chirio",
      "tavilio",
      "sigilio",
      "frametic",
      "worldline",
      "holo-zone",
      "magic-docs",
      "motion",
      "liverio",
    ]) {
      expect(handles).toContain(handle);
    }
    expect(MASCOT_IDENTITY_KEYS).not.toContain("xeso");
    expect(new Set(MASCOT_IDENTITY_KEYS).size).toBe(MASCOT_IDENTITY_KEYS.length);
    expect(MASCOT_IDENTITY_KEYS.every((key) => key === mascotIdentityKey(key))).toBe(true);
  });

  it("overrides the generator, unless canonical is false", () => {
    const once = mascotLook("once-ui");
    expect(once).toMatchObject({ color: "#08a97c", eyes: "tile", surface: "flat" });
    expect(once.bodyPath).toBe(mascotIdentity("once-ui")?.look.bodyPath);
    const generated = mascotLook("once-ui", { canonical: false });
    expect(generated.bodyPath).toBeUndefined();
    expect(generated.color).not.toBe("#08a97c");
    // A seed that names nothing is unchanged.
    expect(mascotLook("happy-red-fox")).toEqual(mascotLook("happy-red-fox", { canonical: false }));
  });

  it("draws the canonical body and layers, and props still win", () => {
    const sigilio = mascotIdentity("sigilio");
    const html = draw(<Mascot seed="sigilio" />).innerHTML;
    expect(html).toContain(sigilio?.look.bodyPath?.slice(0, 40));
    expect(html).toContain("#f5b301"); // the ribbons

    const own = draw(<Mascot seed="sigilio" color="#123456" accessory="crown" />).innerHTML;
    expect(own).toContain("#123456");
    expect(own).not.toContain("#f5b301");

    const guarded = draw(<Mascot seed="sigilio" canonical={false} />).innerHTML;
    expect(guarded).not.toContain(sigilio?.look.bodyPath?.slice(0, 40));
  });

  it("draws the same identity as a still SVG", () => {
    const svg = mascotSvg({ seed: "quasar" });
    expect(svg).toContain(mascotIdentity("quasar")?.look.bodyPath?.slice(0, 40));
    expect(svg).toContain("#3fe3f2");
    expect(svg).toContain('fill="#ffffff"'); // light eyes on the ink body
    expect(mascotSvg({ seed: "quasar", canonical: false })).not.toContain("#3fe3f2");
    // Every identity draws without throwing and keeps its own color.
    for (const identity of MASCOT_IDENTITIES) {
      expect(mascotSvg({ seed: identity.handle })).toContain(String(identity.look.color));
    }
  });
});

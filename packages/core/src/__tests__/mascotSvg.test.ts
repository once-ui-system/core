import { describe, expect, it } from "vitest";
import { mascotDataUrl, mascotSvg } from "../modules/ai/mascotSvg";

/** `mascotSvg` draws the mascot as a still string, for places without React or CSS. */
describe("mascotSvg", () => {
  it("draws a standalone 200 × 200 SVG", () => {
    const svg = mascotSvg();
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"')).toBe(
      true,
    );
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).not.toMatch(/NaN|undefined|var\(|color-mix/);
  });

  it("writes the body color out, since there is no CSS", () => {
    expect(mascotSvg({ color: "#10b981" })).toContain('fill="#10b981"');
  });

  it("needs a color for a scheme name, and falls back without one", () => {
    expect(mascotSvg({ color: "brand", schemes: { brand: "#ff7a1a" } })).toContain(
      'fill="#ff7a1a"',
    );
    expect(mascotSvg({ color: "brand" })).toContain('fill="#5b7cfa"');
    expect(mascotSvg({ color: "not a color" })).toContain('fill="#5b7cfa"');
  });

  it("draws each mood differently", () => {
    const moods = [
      "neutral",
      "happy",
      "sad",
      "surprised",
      "wink",
      "determined",
      "skeptical",
    ] as const;
    const drawings = new Set(
      moods.map((mood) => mascotSvg({ color: "#10b981", mouth: "smile", mood })),
    );
    expect(drawings.size).toBe(moods.length);
  });

  it("draws a kawaii mood as its base mood, keeping the blush", () => {
    const love = mascotSvg({ color: "#10b981", mood: "love" });
    expect(love).toContain('fill-opacity="0.5"');
    expect(love.replace(/m[a-z0-9]+-/g, "")).toContain("rotate(180)");
  });

  it("follows a seed like Mascot does, with options winning", () => {
    expect(mascotSvg({ seed: "aveiro" })).toBe(mascotSvg({ seed: "aveiro" }));
    expect(mascotSvg({ seed: "aveiro", color: "#123456" })).toContain('fill="#123456"');
  });

  it("draws a body path and an accessory", () => {
    const svg = mascotSvg({
      color: "#f00",
      bodyPath: "M10 10L190 10L100 190Z",
      accessory: '<circle cx="1" cy="2" r="3"/>',
    });
    expect(svg).toContain('d="M10 10L190 10L100 190Z"');
    expect(svg).toContain('<circle cx="1" cy="2" r="3"/>');
  });

  it("gives two different mascots different ids, so they can share a page", () => {
    const a = mascotSvg({ color: "#f00" }).match(/id="(m[a-z0-9]+)-light"/)?.[1];
    const b = mascotSvg({ color: "#0f0" }).match(/id="(m[a-z0-9]+)-light"/)?.[1];
    expect(a).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it("escapes the title", () => {
    expect(mascotSvg({ title: "<Ana & Bo>" })).toContain("<title>&lt;Ana &amp; Bo&gt;</title>");
  });

  it("encodes a data URL for an img", () => {
    expect(mascotDataUrl({ color: "#10b981" }).startsWith("data:image/svg+xml;utf8,%3Csvg")).toBe(
      true,
    );
  });
});

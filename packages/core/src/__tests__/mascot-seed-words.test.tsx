import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Mascot, mascotLook } from "../modules/ai/Mascot";
import { mascotSvg } from "../modules/ai/mascotSvg";
import { MASCOT_SEED_WORDS, readSeedWords, seedWords } from "../modules/ai/mascotWords";

describe("seed words", () => {
  it("splits at dashes, underscores, spaces, digits and camelCase", () => {
    expect(seedWords("happy-red_fox")).toEqual(["happy", "red", "fox"]);
    expect(seedWords("sleepyPandaDJ")).toEqual(["sleepy", "panda", "dj"]);
    expect(seedWords("Royal Robot 42")).toEqual(["royal", "robot"]);
    expect(seedWords("fox42cat")).toEqual(["fox", "cat"]);
    expect(seedWords("HTMLParser")).toEqual(["html", "parser"]);
    expect(seedWords(1234)).toEqual([]);
  });

  it("colours set the hue, animals the body and ears, moods the face, objects accessories", () => {
    const fox = readSeedWords("happy-red-fox");
    expect(fox.matched).toEqual(["happy", "red", "fox"]);
    expect(fox.look.color).toBe("oklch(0.72 0.16 25)");
    expect(fox.look).toMatchObject({ eyes: "round", mouth: "smile", roundness: 0.6, aspect: 1.15 });
    expect(fox.accessory).toEqual(["catEars"]);

    expect(readSeedWords("royal-dj").accessory).toEqual(["crown", "headphones"]);
    expect(readSeedWords("sleepy").look).toMatchObject({ eyes: "pill", personality: "calm" });
  });

  it("gives an animal its own colour only when the seed names none", () => {
    expect(readSeedWords("fox").look.color).toBe("oklch(0.72 0.16 55)");
    expect(readSeedWords("blue-fox").look.color).toBe("oklch(0.72 0.16 260)");
    expect(readSeedWords("fox-blue").look.color).toBe("oklch(0.72 0.16 260)");
  });

  it("reads plurals and hex colours, and gives dark bodies light eyes", () => {
    expect(readSeedWords("cats").accessory).toEqual(["catEars"]);
    expect(readSeedWords("#3fe3f2-owl").look.color).toBe("#3fe3f2");
    expect(readSeedWords("ink-blob").look).toMatchObject({ eyeColor: "#ffffff" });
  });

  it("keeps a seed with no known words exactly as its hash made it", () => {
    for (const seed of ["acme", "lumen", "user_8fj2k", 42]) {
      expect(readSeedWords(seed).matched).toEqual([]);
      expect(mascotLook(seed)).toEqual(mascotLook(seed));
    }
    // The hash still fills what the words leave open, and stays stable.
    const look = mascotLook("happy-zorblax");
    expect(look.eyes).toBe("round");
    expect(look).toEqual(mascotLook("happy-zorblax"));
    expect(look.roundness).toBe(mascotLook("happy-zorblax").roundness);
  });

  it("lists its vocabulary without duplicates", () => {
    const all = Object.values(MASCOT_SEED_WORDS).flat();
    expect(all.length).toBeGreaterThan(150);
    expect(MASCOT_SEED_WORDS.animals).toContain("fox");
  });

  it("puts the seed's accessories on a Mascot unless accessory is passed", () => {
    const wrap = (node: React.ReactNode) => render(<LayoutProvider>{node}</LayoutProvider>);
    const withCrown = wrap(<Mascot seed="royal-cat" />).container.innerHTML;
    const plain = wrap(<Mascot seed="royal-cat" accessory={[]} />).container.innerHTML;
    expect(withCrown.length).toBeGreaterThan(plain.length);
  });

  it("draws seeded looks on the server, with light eyes on a dark body", () => {
    expect(mascotSvg({ seed: "green-frog" })).toContain("oklch(0.72 0.16 145)");
    expect(mascotSvg({ seed: "ink-cat" })).toContain("#ffffff");
    expect(mascotSvg({ seed: "ink-cat", color: "#ffd54d" })).not.toContain('fill="#ffffff"');
  });

  it("keeps a named colour glossy unless the seed asks for a surface", () => {
    expect(readSeedWords("red-fox").look.surface).toBe("glossy");
    expect(readSeedWords("red-glass-fox").look.surface).toBe("glass");
    expect(readSeedWords("ghost").look.surface).toBe("glass");
  });

  it("gives a Mascot with a dark seed light eyes, unless you pass a colour", () => {
    const wrap = (node: React.ReactNode) => render(<LayoutProvider>{node}</LayoutProvider>);
    const eye = (node: React.ReactNode) =>
      (wrap(node).container.firstElementChild as HTMLElement).style.getPropertyValue("--mascot-eye");
    expect(eye(<Mascot seed="ink-cat" />)).toBe("#ffffff");
    expect(eye(<Mascot seed="ink-cat" color="#ffd54d" />)).toBe("");
  });
});

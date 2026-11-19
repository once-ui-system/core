import { defineOgSkin } from "@once-ui-system/core/next";
import { onceMarkSvg, onceMascotSvg } from "./og-art";

export const ogSkin = defineOgSkin({
  name: "Once UI",
  domain: "docs.once-ui.com",
  brand: "emerald",
  accent: "orange",
  mark: onceMarkSvg,
  mascot: { svg: onceMascotSvg },
  fonts: [
    { name: "Geist", weight: 700, google: "Geist" },
    { name: "Geist", weight: 800, google: "Geist" },
    { name: "GeistBody", weight: 400, google: "Geist" },
    { name: "Geist Mono", weight: 500, google: "Geist Mono" },
    { name: "Instrument Serif", weight: 400, style: "italic", google: "Instrument Serif" },
  ],
  headingFont: "Geist",
  bodyFont: "GeistBody",
  monoFont: "Geist Mono",
  emphasisFont: "Instrument Serif",
});

/** "data-viz" → "Data Viz", for a card's eyebrow. */
export function ogSection(slug: string | undefined) {
  if (!slug) return "Docs";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

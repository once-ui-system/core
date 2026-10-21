import * as core from "@once-ui-system/core";
import { describe, expect, it } from "vitest";
import * as blocks from "../index.js";

/** 3.0, F10: the six compositions are this package's, and core's root no longer has them. */
const BLOCKS = ["Banner", "Book", "LogoCloud", "ScrollToTop", "StyleOverlay", "StylePanel"];

/** The page sections and what describes them (`sections/`). */
const SECTIONS = [
  "AboutSection",
  "ContactSection",
  "CtaSection",
  "FaqSection",
  "FeaturesSection",
  "HeroSection",
  "LogosSection",
  "PricingSection",
  "Sections",
  "StatsSection",
  "TeamSection",
  "TestimonialsSection",
  "aboutLayouts",
  "contactLayouts",
  "ctaLayouts",
  "faqLayouts",
  "featuresLayouts",
  "heroLayouts",
  "isSectionType",
  "logosLayouts",
  "pricingLayouts",
  "sectionComponents",
  "sectionSchemas",
  "sectionTypes",
  "statsLayouts",
  "teamLayouts",
  "testimonialsLayouts",
];

describe("@once-ui-system/blocks", () => {
  it("exports the six blocks, StylePanel's hook and the page sections", () => {
    expect(Object.keys(blocks).sort()).toEqual([...BLOCKS, "useStylePanel", ...SECTIONS].sort());
  });

  it.each([...BLOCKS, "useStylePanel"])("%s is not on @once-ui-system/core", (name) => {
    expect(name in core).toBe(false);
  });

  it("keeps StylePanel's composable sections", () => {
    expect(typeof blocks.StylePanel.Root).toBe("function");
    expect(typeof blocks.StylePanel.Brand).toBe("function");
  });
});

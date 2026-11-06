import * as core from "@once-ui-system/core";
import { describe, expect, it } from "vitest";
import * as blocks from "../index.js";

/** 3.0, F10: the six compositions are this package's, and core's root no longer has them. */
const BLOCKS = ["Banner", "Book", "LogoCloud", "ScrollToTop", "StyleOverlay", "StylePanel"];

/** The page sections and what describes them (`sections/`). */
const PAGE_SECTIONS = [
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

/** The settings blocks (`settings/`): profile, sign-in and security, organization. */
const SETTINGS = [
  "AccountSettings",
  "OrganizationSettings",
  "SecuritySettings",
  "SettingsLabelsProvider",
  "SettingsLayout",
  "createDemoAccountAdapter",
  "createDemoOrganizationAdapter",
  "defaultSettingsLabels",
  "settingsLabelsHu",
  "useAccount",
  "useOrganization",
  "useSettingsLabels",
];

/** 3.0, F11: StylePanel's sections are plain named exports, not statics on StylePanel. */
const SECTIONS = [
  "Root",
  "Group",
  "Row",
  "Theme",
  "Shape",
  "Brand",
  "Accent",
  "Neutral",
  "Solid",
  "Effect",
  "Surface",
  "Density",
  "Scaling",
  "Transition",
  "DataStyle",
  "BodySize",
  "BodyLineHeight",
  "Page",
  "Color",
  "SolidStyle",
  "BodyText",
  "Advanced",
].map((part) => `StylePanel${part}`);

describe("@once-ui-system/blocks", () => {
  it("exports the six blocks, StylePanel's sections, its hook, the page sections and the settings blocks", () => {
    expect(Object.keys(blocks).sort()).toEqual(
      [...BLOCKS, ...SECTIONS, "useStylePanel", ...PAGE_SECTIONS, ...SETTINGS].sort(),
    );
  });

  it.each([...BLOCKS, ...SECTIONS, ...PAGE_SECTIONS, ...SETTINGS, "useStylePanel"])(
    "%s is not on @once-ui-system/core",
    (name) => {
      expect(name in core).toBe(false);
    },
  );

  it.each(SECTIONS)("exports %s as a component", (name) => {
    expect(typeof (blocks as Record<string, unknown>)[name]).toBe("function");
  });

  it("attaches no sections to StylePanel", () => {
    expect(Object.keys(blocks.StylePanel).filter((key) => /^[A-Z]/.test(key))).toEqual([]);
  });
});

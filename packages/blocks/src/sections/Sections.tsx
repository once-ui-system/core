import { type ComponentType, Fragment, type ReactNode } from "react";
import { AboutSection } from "./AboutSection.js";
import { ContactSection } from "./ContactSection.js";
import { CtaSection } from "./CtaSection.js";
import { FaqSection } from "./FaqSection.js";
import { FeaturesSection } from "./FeaturesSection.js";
import { HeroSection } from "./HeroSection.js";
import { LogosSection } from "./LogosSection.js";
import { PricingSection } from "./PricingSection.js";
import { StatsSection } from "./StatsSection.js";
import type { SectionType } from "./schema.js";
import type { SectionBaseProps } from "./shared.js";
import { TeamSection } from "./TeamSection.js";
import { TestimonialsSection } from "./TestimonialsSection.js";

// biome-ignore lint/suspicious/noExplicitAny: each section reads its own props defensively
type AnySection = ComponentType<any>;

/** The component for each section type. */
export const sectionComponents: Record<SectionType, AnySection> = {
  hero: HeroSection,
  features: FeaturesSection,
  about: AboutSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  team: TeamSection,
  pricing: PricingSection,
  faq: FaqSection,
  logos: LogosSection,
  cta: CtaSection,
  contact: ContactSection,
};

/** One stored section: its type, its props, and an id that stays when the list is reordered. */
export interface SectionItem {
  id?: string;
  type: string;
  props?: Record<string, unknown>;
}

export interface SectionsProps {
  /** The page's sections, in order, as a page builder stores them. */
  items?: SectionItem[];
  /** Applied to every section's links; see `SectionBaseProps.resolveHref`. */
  resolveHref?: SectionBaseProps["resolveHref"];
  /**
   * Draws a type this package does not have (a product's own section: a menu,
   * a booking form, listings). Return nothing to leave it out.
   */
  renderCustom?: (item: SectionItem, index: number) => ReactNode;
}

/**
 * A page from stored sections. A type this package does not know goes to
 * `renderCustom`, or is left out, so a page saved by a newer editor still
 * renders.
 *
 * ```tsx
 * <Sections items={page.sections} renderCustom={(s) => s.type === "menu" && <Menu {...s.props} />} />
 * ```
 */
export function Sections({ items = [], resolveHref, renderCustom }: SectionsProps) {
  return (
    <>
      {items.map((item, index) => {
        const key = item.id ?? `${index}-${item.type}`;
        const Section = sectionComponents[item.type as SectionType];
        if (!Section) {
          const custom = renderCustom?.(item, index);
          return custom ? <Fragment key={key}>{custom}</Fragment> : null;
        }
        return <Section key={key} resolveHref={resolveHref} {...item.props} />;
      })}
    </>
  );
}

// Page sections for site builders: hero, features, about, stats,
// testimonials, team, pricing, FAQ, logos, call to action and contact. Each
// reads its props defensively, takes a `layout`, and is described as plain
// data in `sectionSchemas` for an editor panel or a model.
export * from "./AboutSection.js";
export * from "./ContactSection.js";
export * from "./CtaSection.js";
export * from "./FaqSection.js";
export * from "./FeaturesSection.js";
export * from "./HeroSection.js";
export * from "./LogosSection.js";
export {
  aboutLayouts,
  contactLayouts,
  ctaLayouts,
  faqLayouts,
  featuresLayouts,
  heroLayouts,
  logosLayouts,
  pricingLayouts,
  statsLayouts,
  teamLayouts,
  testimonialsLayouts,
} from "./layouts.js";
export * from "./PricingSection.js";
export * from "./Sections.js";
export * from "./StatsSection.js";
export * from "./schema.js";
export type { SectionBaseProps } from "./shared.js";
export * from "./TeamSection.js";
export * from "./TestimonialsSection.js";

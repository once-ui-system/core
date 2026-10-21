// The layouts of each page section, one list per section, shared by the
// schema (an editor's layout picker, a model's options) and the renderer, so
// a layout added here is offered and drawn from one place.
//
// The first value of each list is the default: what a new section uses, and
// what a section saved with an unknown value falls back to.

export const heroLayouts = ["split", "centered", "cover", "boxed"] as const;
export const featuresLayouts = ["cards", "list", "split"] as const;
export const aboutLayouts = ["split", "stacked"] as const;
export const statsLayouts = ["row", "cards"] as const;
export const testimonialsLayouts = ["cards", "spotlight", "plain"] as const;
export const teamLayouts = ["grid", "list"] as const;
export const pricingLayouts = ["cards", "list"] as const;
export const faqLayouts = ["stacked", "split", "grid"] as const;
export const logosLayouts = ["row", "grid"] as const;
export const ctaLayouts = ["banner", "split", "minimal"] as const;
export const contactLayouts = ["split", "cards", "centered"] as const;

/** Which side of a two-column section the picture sits on. */
export const IMAGE_SIDES = ["right", "left"] as const;

/** How wide a section's content runs, as Once UI `maxWidth` tokens. */
export const SECTION_WIDTHS = ["l", "m", "s"] as const;
export type SectionWidth = (typeof SECTION_WIDTHS)[number];

/** Columns a grid section may ask for; the renderer steps down on smaller screens. */
export const SECTION_COLUMNS = ["3", "2", "4"] as const;

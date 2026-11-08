// The layouts of each page section, one list per section, shared by the
// schema (an editor's layout picker, a model's options) and the renderer, so
// a layout added here is offered and drawn from one place.
//
// The first value of each list is the default: what a new section uses, and
// what a section saved with an unknown value falls back to.

export const heroLayouts = [
  "split",
  "centered",
  "cover",
  "boxed",
  "fullscreen",
  "halves",
  "editorial",
] as const;
export const featuresLayouts = ["cards", "list", "split"] as const;
export const aboutLayouts = ["split", "stacked"] as const;
export const statsLayouts = ["row", "cards", "strip"] as const;
export const galleryLayouts = ["grid", "mosaic", "masonry"] as const;
export const testimonialsLayouts = ["cards", "spotlight", "plain"] as const;
export const teamLayouts = ["grid", "list"] as const;
export const pricingLayouts = ["cards", "list"] as const;
export const faqLayouts = ["stacked", "split", "grid"] as const;
export const logosLayouts = ["row", "grid"] as const;
export const ctaLayouts = ["banner", "split", "minimal", "cover"] as const;
export const contactLayouts = ["split", "cards", "centered"] as const;

/**
 * One sentence per hero layout on when it suits, for a model choosing one
 * (or an editor's tooltip). The first screen decides whether a visitor
 * stays, so the hero is picked for the site, not by habit.
 */
export const heroLayoutGuide: Record<(typeof heroLayouts)[number], string> = {
  fullscreen:
    "the picture fills the screen, the headline large at its foot. The strongest first impression; for anything visual: portfolios, venues, places, products you can see.",
  halves:
    "the screen cut in two, the words on one half and the picture filling the other. Calm and confident; for services, studios, personal sites. Keeps a portrait picture whole.",
  editorial:
    "a very large headline first, the lead and buttons beside each other under a rule, the picture a wide band beneath. For writers, blogs, journals, agencies with something to say.",
  cover: "the picture in a tall rounded frame, the words over its faded foot.",
  split: "the words beside a portrait picture. Plain; when nothing else fits.",
  boxed: "the words and a picture inside a framed box.",
  centered: "centred words over a wide picture beneath.",
};

/** Which side of a two-column section the picture sits on. */
export const IMAGE_SIDES = ["right", "left"] as const;

/** How wide a section's content runs, as Once UI `maxWidth` tokens. */
export const SECTION_WIDTHS = ["l", "m", "s"] as const;
export type SectionWidth = (typeof SECTION_WIDTHS)[number];

/** Columns a grid section may ask for; the renderer steps down on smaller screens. */
export const SECTION_COLUMNS = ["3", "2", "4"] as const;

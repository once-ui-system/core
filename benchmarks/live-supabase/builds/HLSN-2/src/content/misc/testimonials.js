/**
 * @typedef {object} Testimonial
 * @property {string} content
 * @property {string} [name]
 * @property {string} role
 * @property {string} [company]
 * @property {string} [companyUrl]
 * @property {string} [avatar]
 * @property {string} [socialLink]
 * @property {import("@once-ui-system/core").IconName} [socialIcon]
 */

// Placeholder quotes: replace with real ones (add name and avatar when you have them).

/** @type {Testimonial[]} */
const testimonials = [
  { content: "A short quote about the problem your product solved.", role: "Product lead, sample company" },
  { content: "A short quote about how much time your product saves.", role: "Engineering manager, sample company" },
  { content: "A short quote about how easy it was to get started.", role: "Founder, sample company" },
];

/** @type {Testimonial[]} */
const featuredTestimonials = [
  { content: "A longer quote from a happy customer goes here.", role: "Operations lead, sample company" },
];

export { testimonials, featuredTestimonials };

/**
 * @typedef {object} Testimonial
 * @property {string} content
 * @property {string} name
 * @property {string} role
 * @property {string} company
 * @property {string} [companyUrl]
 * @property {string} avatar
 * @property {string} [socialLink]
 * @property {import("@once-ui-system/core").IconName} [socialIcon]
 */

/** @type {Testimonial[]} */
const testimonials = [
  {
    content: "Stack saved us hundreds of hours of manual work.",
    name: "Lorant One",
    role: "Indie Builder",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
  {
    content: "Once UI is so easy to build with.",
    name: "Lorant One",
    role: "SEO Specialist",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
  {
    content: "Stack helped us launch faster.",
    name: "Lorant One",
    role: "Developer",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
  {
    content: "The team at Once UI is incredible.",
    name: "Lorant One",
    role: "Marketing Specialist",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
  {
    content: "Stack with the other templates is a game-changer.",
    name: "Lorant One",
    role: "Design Engineer",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
  {
    content: "This is the best landing page template ever!",
    name: "Lorant One",
    role: "Founder",
    company: "Once UI",
    avatar: "/images/lorant.jpg",
  },
];

/** @type {Testimonial[]} */
const featuredTestimonials = [
  {
    content: "Stack helped us launch in a weekend.",
    name: "Lorant One",
    role: "Design Engineer",
    company: "Once UI",
    companyUrl: "https://once-ui.com",
    avatar: "/images/lorant.jpg",
    socialLink: "https://threads.net/@lorant",
    socialIcon: "threads",
  },
  {
    content: "Once UI provides the best tools for indie builders.",
    name: "Lorant One",
    role: "Indie Builder",
    company: "Once UI",
    companyUrl: "https://once-ui.com",
    avatar: "/images/lorant.jpg",
    socialLink: "https://threads.net/@lorant",
    socialIcon: "threads",
  },
];

export { testimonials, featuredTestimonials };
import {
  aboutLayouts,
  contactLayouts,
  ctaLayouts,
  faqLayouts,
  featuresLayouts,
  heroLayouts,
  IMAGE_SIDES,
  logosLayouts,
  pricingLayouts,
  SECTION_COLUMNS,
  SECTION_WIDTHS,
  statsLayouts,
  teamLayouts,
  testimonialsLayouts,
} from "./layouts.js";

// What each page section takes, as plain data: an editor draws its panel from
// it, a model reads it to fill a section, and a product's own catalog can
// translate the labels by `type` and `key`. No functions, so the whole table
// serialises to JSON (`JSON.stringify(sectionSchemas)`) for an agent or an API.

export type SectionFieldKind =
  | "text"
  | "textarea"
  | "image"
  | "link"
  | "choice"
  | "boolean"
  | "list";

export interface SectionField {
  key: string;
  kind: SectionFieldKind;
  /** English label; products translate by section `type` and field `key`. */
  label: string;
  /** For `choice`: the values, first = default. */
  options?: readonly string[];
  /** For `textarea`: how it is split (`"lines"`: one entry per line; `"paragraphs"`: blank line between). */
  split?: "lines" | "paragraphs";
  /** For `list`: the fields of one row. */
  fields?: SectionField[];
  /** For `list`: the most rows that make sense. */
  max?: number;
  /** For `list`: the row field to title a row with in an editor. */
  rowTitle?: string;
  /** Show the field only while another field holds one of these values. */
  when?: { key: string; is: readonly string[] };
  hint?: string;
}

export type SectionType =
  | "hero"
  | "features"
  | "about"
  | "stats"
  | "testimonials"
  | "team"
  | "pricing"
  | "faq"
  | "logos"
  | "cta"
  | "contact";

export interface SectionSchema {
  type: SectionType;
  /** The component's name, and its MDX tag. */
  component: string;
  label: string;
  /** What the section is for, in one line: what a model picks it by. */
  description: string;
  /** The `layout` values, first = default. */
  layouts: readonly string[];
  fields: SectionField[];
  /** Filled-in example props: a new section's starting copy, and a model's example. */
  sample: Record<string, unknown>;
}

const heading: SectionField[] = [
  { key: "eyebrow", kind: "text", label: "Eyebrow" },
  { key: "title", kind: "text", label: "Title" },
  { key: "description", kind: "textarea", label: "Description" },
];

const actionPair: SectionField[] = [
  { key: "primaryLabel", kind: "text", label: "Primary button" },
  { key: "primaryHref", kind: "link", label: "Primary button link" },
  { key: "secondaryLabel", kind: "text", label: "Secondary button" },
  { key: "secondaryHref", kind: "link", label: "Secondary button link" },
];

const image: SectionField[] = [
  { key: "image", kind: "image", label: "Image" },
  { key: "imageAlt", kind: "text", label: "Image description" },
];

const layoutField = (layouts: readonly string[]): SectionField => ({
  key: "layout",
  kind: "choice",
  label: "Layout",
  options: layouts,
});

const width: SectionField = {
  key: "width",
  kind: "choice",
  label: "Width",
  options: SECTION_WIDTHS,
};

const columns: SectionField = {
  key: "columns",
  kind: "choice",
  label: "Columns",
  options: SECTION_COLUMNS,
};

export const sectionSchemas: Record<SectionType, SectionSchema> = {
  hero: {
    type: "hero",
    component: "HeroSection",
    label: "Hero",
    description: "The page's opening: headline, lead, two buttons and a picture",
    layouts: heroLayouts,
    fields: [layoutField(heroLayouts), ...heading, ...actionPair, ...image, width],
    sample: {
      eyebrow: "Welcome",
      title: "Say what you do in one line",
      description: "Follow it with a sentence on who it is for and what they get.",
      primaryLabel: "Get started",
      primaryHref: "#",
      secondaryLabel: "Learn more",
      secondaryHref: "#",
    },
  },
  features: {
    type: "features",
    component: "FeaturesSection",
    label: "Features",
    description: "What a product or service does, one point per item, with an icon",
    layouts: featuresLayouts,
    fields: [
      layoutField(featuresLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Features",
        rowTitle: "title",
        max: 12,
        fields: [
          {
            key: "icon",
            kind: "text",
            label: "Icon",
            hint: "An icon name from the app's icon set",
          },
          { key: "title", kind: "text", label: "Title" },
          { key: "description", kind: "textarea", label: "Description" },
        ],
      },
      { ...columns, when: { key: "layout", is: ["cards"] } },
      width,
    ],
    sample: {
      title: "Why people choose us",
      items: [
        { title: "Fast", description: "Ready the same day." },
        { title: "Clear", description: "One price, no surprises." },
        { title: "Local", description: "A team that knows the area." },
      ],
    },
  },
  about: {
    type: "about",
    component: "AboutSection",
    label: "About",
    description: "A story beside a picture: who you are, how you work, why it matters",
    layouts: aboutLayouts,
    fields: [
      layoutField(aboutLayouts),
      ...heading,
      { key: "body", kind: "textarea", label: "Text", split: "paragraphs" },
      ...image,
      {
        key: "imageSide",
        kind: "choice",
        label: "Image side",
        options: IMAGE_SIDES,
        when: { key: "layout", is: ["split"] },
      },
      ...actionPair,
      width,
    ],
    sample: {
      title: "Our story",
      body: "We started small, with one idea.\n\nToday the same idea runs everything we do.",
    },
  },
  stats: {
    type: "stats",
    component: "StatsSection",
    label: "Stats",
    description: "A few figures that make the case, each with what it counts",
    layouts: statsLayouts,
    fields: [
      layoutField(statsLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Figures",
        rowTitle: "value",
        max: 8,
        fields: [
          { key: "value", kind: "text", label: "Figure" },
          { key: "label", kind: "text", label: "Label" },
          { key: "description", kind: "textarea", label: "Description" },
        ],
      },
      width,
    ],
    sample: {
      items: [
        { value: "12", label: "Years" },
        { value: "3,400", label: "Clients" },
        { value: "4.9", label: "Average rating" },
      ],
    },
  },
  testimonials: {
    type: "testimonials",
    component: "TestimonialsSection",
    label: "Testimonials",
    description: "What customers say, quote by quote",
    layouts: testimonialsLayouts,
    fields: [
      layoutField(testimonialsLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Quotes",
        rowTitle: "name",
        max: 9,
        fields: [
          { key: "quote", kind: "textarea", label: "Quote" },
          { key: "name", kind: "text", label: "Name" },
          { key: "role", kind: "text", label: "Role" },
          { key: "avatar", kind: "image", label: "Photo" },
        ],
      },
      width,
    ],
    sample: {
      title: "What people say",
      items: [{ quote: "Exactly what we needed, on time.", name: "Anna K.", role: "Customer" }],
    },
  },
  team: {
    type: "team",
    component: "TeamSection",
    label: "Team",
    description: "The people behind the work, with photo, role and a short bio",
    layouts: teamLayouts,
    fields: [
      layoutField(teamLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "People",
        rowTitle: "name",
        max: 24,
        fields: [
          { key: "name", kind: "text", label: "Name" },
          { key: "role", kind: "text", label: "Role" },
          { key: "bio", kind: "textarea", label: "Bio" },
          { key: "photo", kind: "image", label: "Photo" },
        ],
      },
      { ...columns, when: { key: "layout", is: ["grid"] } },
      width,
    ],
    sample: {
      title: "Meet the team",
      items: [
        { name: "Dóra Szabó", role: "Founder" },
        { name: "Máté Kovács", role: "Lead" },
      ],
    },
  },
  pricing: {
    type: "pricing",
    component: "PricingSection",
    label: "Pricing",
    description: "Plans or packages side by side, one highlighted",
    layouts: pricingLayouts,
    fields: [
      layoutField(pricingLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Plans",
        rowTitle: "name",
        max: 6,
        fields: [
          { key: "name", kind: "text", label: "Name" },
          { key: "price", kind: "text", label: "Price", hint: "As written, e.g. €49" },
          { key: "period", kind: "text", label: "Period", hint: "e.g. / month" },
          { key: "description", kind: "textarea", label: "Description" },
          { key: "features", kind: "textarea", label: "Features", split: "lines" },
          { key: "ctaLabel", kind: "text", label: "Button" },
          { key: "ctaHref", kind: "link", label: "Button link" },
          { key: "badge", kind: "text", label: "Badge" },
          { key: "highlighted", kind: "boolean", label: "Highlighted" },
        ],
      },
      width,
    ],
    sample: {
      title: "Pricing",
      items: [
        { name: "Basic", price: "€19", period: "/ month", features: "One site\nEmail support" },
        {
          name: "Pro",
          price: "€49",
          period: "/ month",
          features: "Five sites\nPriority support",
          badge: "Popular",
          highlighted: true,
        },
      ],
    },
  },
  faq: {
    type: "faq",
    component: "FaqSection",
    label: "FAQ",
    description: "Questions people ask before they get in touch, with answers",
    layouts: faqLayouts,
    fields: [
      layoutField(faqLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Questions",
        rowTitle: "question",
        max: 20,
        fields: [
          { key: "question", kind: "text", label: "Question" },
          { key: "answer", kind: "textarea", label: "Answer" },
        ],
      },
      width,
    ],
    sample: {
      title: "Questions",
      items: [{ question: "How long does it take?", answer: "Usually a week." }],
    },
  },
  logos: {
    type: "logos",
    component: "LogosSection",
    label: "Logos",
    description: "Clients, press or partners that vouch for the work",
    layouts: logosLayouts,
    fields: [
      layoutField(logosLayouts),
      ...heading,
      {
        key: "items",
        kind: "list",
        label: "Logos",
        max: 16,
        fields: [
          { key: "src", kind: "image", label: "Logo" },
          { key: "srcDark", kind: "image", label: "Logo in dark mode" },
          { key: "href", kind: "link", label: "Link" },
        ],
      },
      width,
    ],
    sample: { eyebrow: "Trusted by" },
  },
  cta: {
    type: "cta",
    component: "CtaSection",
    label: "Call to action",
    description: "The one thing to do next, usually the page's last section",
    layouts: ctaLayouts,
    fields: [layoutField(ctaLayouts), ...heading, ...actionPair, width],
    sample: {
      title: "Ready when you are",
      primaryLabel: "Get in touch",
      primaryHref: "#contact",
    },
  },
  contact: {
    type: "contact",
    component: "ContactSection",
    label: "Contact",
    description: "Email, phone, address and opening hours, each a link where it can be",
    layouts: contactLayouts,
    fields: [
      layoutField(contactLayouts),
      ...heading,
      { key: "email", kind: "text", label: "Email" },
      { key: "phone", kind: "text", label: "Phone" },
      { key: "address", kind: "textarea", label: "Address", split: "lines" },
      { key: "mapHref", kind: "link", label: "Map link" },
      { key: "hours", kind: "textarea", label: "Opening hours", split: "lines" },
      { key: "primaryLabel", kind: "text", label: "Button" },
      { key: "primaryHref", kind: "link", label: "Button link" },
      width,
    ],
    sample: {
      title: "Get in touch",
      email: "hello@example.com",
      hours: "Mon–Fri 9:00–17:00",
    },
  },
};

/** Every section type, in the order an editor offers them. */
export const sectionTypes = Object.keys(sectionSchemas) as SectionType[];

export const isSectionType = (value: unknown): value is SectionType =>
  typeof value === "string" && value in sectionSchemas;

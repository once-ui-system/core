"use client";

import {
  FamilyFooter,
  type FamilyFooterProps,
  type FamilyParent,
  type FamilyProduct,
} from "@once-ui-system/blocks";
import {
  Button,
  Column,
  Input,
  Row,
  StyleScope,
  type StyleScopeConfig,
  Text,
} from "@once-ui-system/core";

// A made-up family, so the examples show no real product's marks: Halden & Co
// and its five products, each with its own colour for the letter mark.
const parent: FamilyParent = { name: "Halden & Co", href: "https://halden.example" };

const products: FamilyProduct[] = [
  {
    id: "fjell",
    name: "Fjell",
    line: "Trail maps for the north",
    href: "https://fjell.example",
    color: "#0e7490",
  },
  {
    id: "ember",
    name: "Ember",
    line: "Bookings for small cafés",
    href: "https://ember.example",
    color: "#c2410c",
  },
  {
    id: "quill",
    name: "Quill",
    line: "Contracts your clients can read",
    href: "https://quill.example",
    color: "#6d28d9",
  },
  {
    id: "tide",
    name: "Tide",
    line: "Newsletters that read like letters",
    href: "https://tide.example",
    color: "#1d4ed8",
  },
  {
    id: "mosaic",
    name: "Mosaic",
    line: "Photo books from your phone",
    href: "https://mosaic.example",
    color: "#be185d",
  },
];

const legalColumn = {
  title: "Legal",
  links: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

type Brand = "fjell" | "ember" | "quill";

const brands: Record<
  Brand,
  { style: StyleScopeConfig; footer: Omit<FamilyFooterProps, "products" | "parent"> }
> = {
  // Dark, with a glow behind the brand band and a big wordmark as its extra.
  fjell: {
    style: { brand: "cyan", accent: "emerald", neutral: "slate", border: "playful" },
    footer: {
      current: "fjell",
      brand: {
        name: "Fjell",
        tagline: "Offline trail maps for hikers who go past the signal.",
        action: { label: "Get the app", href: "#" },
        extra: (
          <Text
            aria-hidden
            style={{
              fontSize: "clamp(4rem, 14vw, 10rem)",
              lineHeight: 0.85,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "transparent",
              WebkitTextStroke: "1px var(--brand-alpha-strong)",
            }}
          >
            FJELL
          </Text>
        ),
      },
      decoration: (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 80% at 20% 0%, var(--brand-alpha-medium), transparent 70%), radial-gradient(40% 60% at 90% 10%, var(--accent-alpha-weak), transparent 70%)",
          }}
        />
      ),
      columns: [
        {
          title: "Product",
          links: [
            { label: "Maps", href: "#" },
            { label: "Routes", href: "#", tag: "New" },
            { label: "Pricing", href: "#" },
          ],
        },
        {
          title: "Developers",
          links: [
            { label: "Tiles API", href: "#" },
            { label: "Status", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Journal", href: "#" },
          ],
        },
        legalColumn,
      ],
      legal: "Halden & Co AS",
      social: [
        { icon: "mail", label: "Email", href: "#" },
        { icon: "globe", label: "Website", href: "#" },
      ],
    },
  },
  // Warm and light, a line drawing behind the band and a newsletter field.
  ember: {
    style: { brand: "orange", accent: "yellow", neutral: "sand", border: "rounded" },
    footer: {
      current: "ember",
      brand: {
        name: "Ember",
        tagline: "Tables, takeaway and the week's specials, in one place.",
        action: { label: "Open your café", href: "#" },
        extra: (
          <Column gap="8" fillWidth style={{ maxWidth: "28rem" }}>
            <Text variant="label-strong-s" onBackground="neutral-strong">
              A letter from the counter, once a month
            </Text>
            <Row gap="8" fillWidth vertical="center">
              <Input id="ember-newsletter" label="Email" height="s" />
              <Button size="m" variant="secondary">
                Subscribe
              </Button>
            </Row>
          </Column>
        ),
      },
      decoration: (
        <svg
          aria-hidden="true"
          viewBox="230 40 150 120"
          preserveAspectRatio="xMaxYMax meet"
          style={{ position: "absolute", right: "4%", top: "30%", height: "34%", opacity: 0.35 }}
          fill="none"
          stroke="var(--brand-on-background-weak)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M250 150h90a10 10 0 0 0 10-10v-40h-110v40a10 10 0 0 0 10 10z" />
          <path d="M350 108h14a14 14 0 0 1 0 28h-14" />
          <path d="M270 80c0-12 12-12 12-24M295 80c0-12 12-12 12-24M320 80c0-12 12-12 12-24" />
        </svg>
      ),
      columns: [
        {
          title: "For cafés",
          links: [
            { label: "Bookings", href: "#" },
            { label: "Menus", href: "#" },
            { label: "Websites", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "Our story", href: "#" },
            { label: "Contact", href: "#" },
          ],
        },
        legalColumn,
      ],
      legal: "Halden & Co AS",
      social: [{ icon: "mail", label: "Email", href: "#" }],
    },
  },
  // Quiet: no decoration, five columns, the brand only in the button and tags.
  quill: {
    style: { brand: "violet", accent: "indigo", neutral: "gray", border: "conservative" },
    footer: {
      current: "quill",
      brand: {
        name: "Quill",
        tagline: "Contracts in plain words, signed in minutes.",
        action: { label: "Start a contract", href: "#" },
      },
      columns: [
        {
          title: "Product",
          links: [
            { label: "Templates", href: "#" },
            { label: "Signing", href: "#" },
            { label: "Payments", href: "#", tag: "Beta" },
          ],
        },
        {
          title: "Use cases",
          links: [
            { label: "Freelancers", href: "#" },
            { label: "Agencies", href: "#" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "Guides", href: "#" },
            { label: "Changelog", href: "#" },
          ],
        },
        {
          title: "Company",
          links: [
            { label: "About", href: "#" },
            { label: "Careers", href: "#" },
          ],
        },
        legalColumn,
      ],
      legal: "Halden & Co AS",
    },
  },
};

/** The family footer on one of three made-up brands of the same family. */
export function FamilyFooterExample({ brand = "fjell" }: { brand?: Brand }) {
  const { style, footer } = brands[brand];
  return (
    <StyleScope
      config={style}
      fillWidth
      background="page"
      radius="l"
      overflow="hidden"
      data-family-footer={brand}
    >
      <FamilyFooter {...footer} products={products} parent={parent} year={2026} />
    </StyleScope>
  );
}

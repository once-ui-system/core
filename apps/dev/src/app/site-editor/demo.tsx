"use client";

import { Button, Column, Heading, Row, SmartLink, Text } from "@once-ui-system/core";
import {
  type ChromeDefinition,
  createLocalAdapter,
  type LocalSite,
  type PageEntry,
} from "@once-ui-system/site-editor";

// The demo site: a small coffee roastery with three pages, kept in this
// browser's localStorage. "Start over" on the editor page brings it back.

const seed = (): LocalSite => ({
  pages: [
    { id: "home", title: "Home", slug: "", home: true },
    { id: "p-about", title: "About", slug: "about" },
    { id: "p-pricing", title: "Subscriptions", slug: "subscriptions" },
  ],
  content: {
    home: {
      sections: [
        {
          id: "hero",
          type: "hero",
          props: {
            layout: "split",
            eyebrow: "Small-batch roastery",
            title: "Coffee roasted on Tuesday, in your cup by Friday",
            description:
              "We buy from six farms we know by name and roast to order, so every bag arrives at its best.",
            primaryLabel: "Start a subscription",
            primaryHref: "/subscriptions",
            secondaryLabel: "Our story",
            secondaryHref: "/about",
            image: "/images/cover-02.jpg",
            imageAlt: "Coffee being poured",
          },
        },
        {
          id: "features",
          type: "features",
          props: {
            layout: "cards",
            title: "Why people stay",
            items: [
              {
                _id: "f1",
                icon: "calendar",
                title: "Roasted to order",
                description: "Nothing sits on a shelf.",
              },
              {
                _id: "f2",
                icon: "world",
                title: "Six farms",
                description: "Direct trade, prices published.",
              },
              {
                _id: "f3",
                icon: "gift",
                title: "Pause anytime",
                description: "Skip a month in one click.",
              },
            ],
          },
        },
        {
          id: "stats",
          type: "stats",
          props: {
            layout: "row",
            items: [
              { _id: "s1", value: "9", label: "Years roasting" },
              { _id: "s2", value: "2,400", label: "Subscribers" },
              { _id: "s3", value: "4.9", label: "Average review" },
            ],
          },
        },
        {
          id: "testimonials",
          type: "testimonials",
          props: {
            layout: "cards",
            title: "What subscribers say",
            items: [
              {
                _id: "t1",
                quote: "The only coffee I don't have to think about.",
                name: "Réka",
                role: "Since 2021",
              },
              {
                _id: "t2",
                quote: "Fresh every time, and the notes are spot on.",
                name: "Tamás",
                role: "Since 2023",
              },
            ],
          },
        },
        {
          id: "cta",
          type: "cta",
          props: {
            layout: "banner",
            title: "Your first bag ships this week",
            primaryLabel: "Pick a plan",
            primaryHref: "/subscriptions",
          },
        },
      ],
    },
    "p-about": {
      sections: [
        {
          id: "about",
          type: "about",
          props: {
            layout: "split",
            title: "One roaster, one street",
            body: "We started with a ten-kilo roaster in a garage.\n\nToday the same two people taste every batch before it ships.",
            image: "/images/cover-04.jpg",
          },
        },
        {
          id: "team",
          type: "team",
          props: {
            layout: "grid",
            title: "The two of us",
            items: [
              { _id: "m1", name: "Dóra", role: "Roaster" },
              { _id: "m2", name: "Bence", role: "Green buyer" },
            ],
          },
        },
      ],
    },
    "p-pricing": {
      sections: [
        {
          id: "pricing",
          type: "pricing",
          props: {
            layout: "cards",
            title: "Subscriptions",
            items: [
              {
                _id: "pl1",
                name: "Taster",
                price: "€14",
                period: "/ month",
                features: "One 250 g bag\nFree shipping",
              },
              {
                _id: "pl2",
                name: "Regular",
                price: "€26",
                period: "/ month",
                features: "Two 250 g bags\nFree shipping\nTasting notes",
                badge: "Most picked",
                highlighted: true,
              },
              {
                _id: "pl3",
                name: "Office",
                price: "€80",
                period: "/ month",
                features: "Four 1 kg bags\nGrinder on loan",
              },
            ],
          },
        },
        {
          id: "faq",
          type: "faq",
          props: {
            layout: "stacked",
            title: "Questions",
            items: [
              { _id: "q1", question: "Can I pause?", answer: "Yes, any month, from your account." },
              {
                _id: "q2",
                question: "Whole bean or ground?",
                answer: "Either; tell us your brewer.",
              },
            ],
          },
        },
      ],
    },
  },
  style: {
    config: {
      brand: "orange",
      accent: "yellow",
      neutral: "sand",
      theme: "light",
      border: "rounded",
    },
    header: { name: "Kettle & Co.", ctaLabel: "Subscribe", ctaHref: "/subscriptions" },
    footer: { text: "Kettle & Co. · Roasted in Budapest" },
  },
});

export const adapter = createLocalAdapter({
  key: "dev-demo",
  previewPath: "/site-editor/preview",
  seed,
});

export const chrome: { header: ChromeDefinition; footer: ChromeDefinition } = {
  header: {
    label: "Header",
    fields: [
      { key: "name", kind: "text", label: "Site name" },
      { key: "ctaLabel", kind: "text", label: "Button" },
      { key: "ctaHref", kind: "link", label: "Button link" },
    ],
  },
  footer: {
    label: "Footer",
    fields: [{ key: "text", kind: "textarea", label: "Text" }],
  },
};

const text = (value: unknown) => (typeof value === "string" ? value : "");

export function SiteHeader({
  props = {},
  pages,
}: {
  props?: Record<string, unknown>;
  pages: PageEntry[];
}) {
  return (
    <Row
      data-site-chrome="header"
      as="header"
      fillWidth
      paddingX="24"
      paddingY="12"
      horizontal="between"
      vertical="center"
      gap="16"
      borderBottom="neutral-alpha-weak"
    >
      <Heading as="span" variant="heading-strong-s">
        {text(props.name)}
      </Heading>
      <Row gap="16" vertical="center" s={{ hide: true }}>
        {pages.map((page) => (
          <SmartLink key={page.id} href={`/${page.slug}`}>
            {page.title}
          </SmartLink>
        ))}
      </Row>
      {text(props.ctaLabel) && (
        <Button size="s" href={text(props.ctaHref) || "#"}>
          {text(props.ctaLabel)}
        </Button>
      )}
    </Row>
  );
}

export function SiteFooter({ props = {} }: { props?: Record<string, unknown> }) {
  return (
    <Column
      data-site-chrome="footer"
      as="footer"
      fillWidth
      paddingX="24"
      paddingY="32"
      horizontal="center"
      borderTop="neutral-alpha-weak"
    >
      <Text variant="body-default-s" onBackground="neutral-weak">
        {text(props.text)}
      </Text>
    </Column>
  );
}

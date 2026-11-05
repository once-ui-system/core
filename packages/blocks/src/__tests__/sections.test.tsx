import { LayoutProvider } from "@once-ui-system/core";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  HeroSection,
  PricingSection,
  Sections,
  sectionComponents,
  sectionSchemas,
  sectionTypes,
} from "../index.js";

const html = (node: React.ReactNode) =>
  renderToStaticMarkup(<LayoutProvider>{node}</LayoutProvider>);

describe("page sections", () => {
  it("has a component for every schema, under the schema's name", () => {
    for (const type of sectionTypes) {
      const Component = sectionComponents[type] as { name?: string };
      expect(Component.name).toBe(sectionSchemas[type].component);
    }
  });

  it("describes itself as plain data", () => {
    expect(JSON.parse(JSON.stringify(sectionSchemas))).toEqual(sectionSchemas);
  });

  it("offers each section's layouts as its layout field, default first", () => {
    for (const type of sectionTypes) {
      const schema = sectionSchemas[type];
      const layout = schema.fields.find((field) => field.key === "layout");
      expect(layout?.options).toEqual(schema.layouts);
    }
  });

  it.each(sectionTypes)("renders %s from its sample in every layout", (type) => {
    const { component, layouts, sample } = sectionSchemas[type];
    for (const layout of layouts) {
      const out = html(<Sections items={[{ type, props: { ...sample, layout } }]} />);
      expect(out, `${component} ${layout}`).toContain("<section");
    }
  });

  it("renders nothing it was not given and survives mistyped props", () => {
    const out = html(
      <HeroSection
        title={42 as unknown as string}
        layout="nope"
        width={["l"] as unknown as string}
      />,
    );
    expect(out).not.toContain("<h1");
    expect(out).not.toContain("Get started");
  });

  it("drops a plan without a name and a button without a link", () => {
    const out = html(
      <PricingSection items={[{ price: "€9" }, { name: "Pro", ctaLabel: "Buy" }]} />,
    );
    expect(out).not.toContain("€9");
    expect(out).toContain("Pro");
    expect(out).not.toContain("Buy");
  });

  it("runs every link through resolveHref", () => {
    const out = html(
      <Sections
        resolveHref={(href) => `/de${href}`}
        items={[
          { type: "hero", props: { title: "Hi", primaryLabel: "Go", primaryHref: "/start" } },
          { type: "pricing", props: { items: [{ name: "A", ctaLabel: "Buy", ctaHref: "/buy" }] } },
        ]}
      />,
    );
    expect(out).toContain('href="/de/start"');
    expect(out).toContain('href="/de/buy"');
  });

  it("hands an unknown type to renderCustom and skips it otherwise", () => {
    const items = [{ type: "menu", props: { title: "Lunch" } }];
    expect(html(<Sections items={items} />)).toBe("");
    expect(
      html(<Sections items={items} renderCustom={(item) => <p>{String(item.props?.title)}</p>} />),
    ).toBe("<p>Lunch</p>");
  });
});

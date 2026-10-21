# @once-ui-system/blocks

Compositions built from Once UI's primitives: `Banner`, `Book`, `LogoCloud`,
`ScrollToTop`, `StylePanel` (with `useStylePanel`) and `StyleOverlay`. Until 3.0
they were part of `@once-ui-system/core`; they are built on it and take it as a
peer.

```sh
npm install @once-ui-system/core @once-ui-system/blocks
```

```tsx
import { StylePanel } from "@once-ui-system/blocks";
```

## Page sections

Eleven sections for site builders and landing pages: `HeroSection`,
`FeaturesSection`, `AboutSection`, `StatsSection`, `TestimonialsSection`,
`TeamSection`, `PricingSection`, `FaqSection`, `LogosSection`, `CtaSection` and
`ContactSection`. Each takes a `layout`, a `width` and its own fields, and
reads them defensively, so content an editor or a model stored renders as
written or not at all.

```tsx
import { Sections, sectionSchemas } from "@once-ui-system/blocks";

<Sections
  items={page.sections} // [{ id, type: "hero", props: { title, primaryLabel, primaryHref } }]
  resolveHref={(href) => `/de${href}`}
  renderCustom={(section) => section.type === "menu" && <Menu {...section.props} />}
/>;
```

`sectionSchemas` lists every section's fields, layouts and a sample as plain
JSON: draw an editor panel from it, or give it to a model to fill a page. Put
a site's colours and fonts around the sections with core's `StyleScope`.

Documentation: [docs.once-ui.com](https://docs.once-ui.com). Migrating from 2.x:
[MIGRATING.md](https://github.com/once-ui-system/core/blob/main/MIGRATING.md).

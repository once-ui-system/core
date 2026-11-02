"use client";

import { Column, Row } from "@once-ui-system/core";
import type { ReactNode } from "react";
import { useEditorContext } from "../context.js";

/**
 * A section drawn as the shape it makes on the page.
 *
 * A name asks people to remember what "Testimonials, spotlight" looks like; a
 * drawing does not. The same drawing is used on the tile of a section on the
 * page and on the tile of one you could add, so the list and the picker are
 * visibly one family. Everything is Once UI boxes with token sizes and
 * colours: nothing to ship, and it follows the theme into dark mode.
 *
 * Drawings are keyed `type` (the section) and `type.layout` (one of its
 * layouts). A product adds its own through `SiteEditor`'s `glyphs`.
 */

/** A line of text. `strong` is a heading. */
const Bar = ({ width, strong }: { width: `${number}%`; strong?: boolean }) => (
  <Row
    width={width}
    height={strong ? "4" : "2"}
    radius="full"
    background={strong ? "neutral-alpha-strong" : "neutral-alpha-medium"}
  />
);

/** A picture, a card, a map: anything with a surface rather than a line. */
const Block = ({ width }: { width?: `${number}%` }) => (
  <Row
    fillWidth={!width}
    width={width}
    flex={width ? undefined : 1}
    radius="xs"
    background="neutral-alpha-medium"
  />
);

/** A button. */
const Pill = ({ width = "30%" }: { width?: `${number}%` }) => (
  <Row width={width} height="4" radius="full" background="brand-alpha-strong" />
);

/** A card with a line or two in it. */
const Card = ({ lines = 2 }: { lines?: number }) => (
  <Column flex={1} fillHeight gap="2" padding="2" radius="xs" border="neutral-alpha-medium">
    <Bar width="70%" strong />
    {lines > 1 && <Bar width="90%" />}
  </Column>
);

/** A round photo. */
const Dot = () => <Row width="8" height="8" radius="full" background="neutral-alpha-medium" />;

const LINE_KEYS = ["first", "second", "third", "fourth"] as const;

const Lines = ({ count = 3 }: { count?: number }) => (
  <>
    {LINE_KEYS.slice(0, count).map((key, i) => (
      <Bar key={key} width={i === count - 1 ? "60%" : "90%"} />
    ))}
  </>
);

const Heading = () => (
  <Column fillWidth gap="2" horizontal="center">
    <Bar width="50%" strong />
  </Column>
);

const split = (left: ReactNode, right: ReactNode) => (
  <Row fillWidth flex={1} gap="4">
    <Column flex={1} gap="4" vertical="center">
      {left}
    </Column>
    <Column flex={1}>{right}</Column>
  </Row>
);

const GLYPHS: Record<string, ReactNode> = {
  hero: (
    <>
      <Block />
      <Bar width="70%" strong />
      <Pill />
    </>
  ),
  "hero.split": split(
    <>
      <Bar width="90%" strong />
      <Bar width="70%" />
      <Pill width="50%" />
    </>,
    <Block />,
  ),
  "hero.centered": (
    <Column fillWidth flex={1} gap="4" horizontal="center" vertical="center">
      <Bar width="70%" strong />
      <Bar width="50%" />
      <Pill />
    </Column>
  ),
  "hero.cover": (
    <Column
      fillWidth
      flex={1}
      gap="4"
      padding="4"
      vertical="center"
      horizontal="center"
      radius="xs"
      background="neutral-alpha-medium"
    >
      <Bar width="60%" strong />
      <Pill />
    </Column>
  ),
  "hero.boxed": (
    <Column fillWidth flex={1} paddingX="8">
      <Column
        fill
        gap="4"
        padding="4"
        vertical="end"
        radius="xs"
        border="neutral-alpha-medium"
        background="neutral-alpha-weak"
      >
        <Bar width="60%" strong />
        <Pill />
      </Column>
    </Column>
  ),
  features: (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        <Card />
        <Card />
        <Card />
      </Row>
    </>
  ),
  "features.list": (
    <>
      <Bar width="50%" strong />
      <Column fillWidth flex={1} gap="4">
        {[0, 1, 2].map((i) => (
          <Row key={i} fillWidth gap="4" vertical="center">
            <Dot />
            <Bar width="70%" />
          </Row>
        ))}
      </Column>
    </>
  ),
  "features.split": split(
    <>
      <Bar width="80%" strong />
      <Bar width="60%" />
    </>,
    <Column fill gap="4">
      <Card lines={1} />
      <Card lines={1} />
    </Column>,
  ),
  about: split(
    <>
      <Bar width="70%" strong />
      <Lines />
    </>,
    <Block />,
  ),
  "about.stacked": (
    <>
      <Bar width="50%" strong />
      <Lines />
      <Block />
    </>
  ),
  stats: (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="8" vertical="center">
        {[0, 1, 2].map((i) => (
          <Column key={i} flex={1} gap="2" horizontal="center">
            <Bar width="60%" strong />
            <Bar width="80%" />
          </Column>
        ))}
      </Row>
    </>
  ),
  "stats.cards": (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        <Card />
        <Card />
        <Card />
      </Row>
    </>
  ),
  testimonials: (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        {[0, 1].map((i) => (
          <Column key={i} flex={1} gap="2" padding="2" radius="xs" border="neutral-alpha-medium">
            <Lines count={2} />
            <Row gap="2" vertical="center">
              <Dot />
              <Bar width="40%" />
            </Row>
          </Column>
        ))}
      </Row>
    </>
  ),
  "testimonials.spotlight": (
    <Column fillWidth flex={1} gap="4" horizontal="center" vertical="center">
      <Bar width="80%" strong />
      <Bar width="60%" strong />
      <Row gap="2" vertical="center">
        <Dot />
        <Bar width="30%" />
      </Row>
    </Column>
  ),
  "testimonials.plain": (
    <>
      <Bar width="50%" strong />
      <Column fillWidth flex={1} gap="4">
        <Lines count={2} />
        <Lines count={2} />
      </Column>
    </>
  ),
  team: (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4" horizontal="center">
        {[0, 1, 2, 3].map((i) => (
          <Column key={i} flex={1} gap="2" horizontal="center">
            <Dot />
            <Bar width="70%" />
          </Column>
        ))}
      </Row>
    </>
  ),
  "team.list": (
    <>
      <Bar width="40%" strong />
      <Column fillWidth flex={1} gap="4">
        {[0, 1, 2].map((i) => (
          <Row key={i} fillWidth gap="4" vertical="center">
            <Dot />
            <Column flex={1} gap="2">
              <Bar width="40%" strong />
              <Bar width="80%" />
            </Column>
          </Row>
        ))}
      </Column>
    </>
  ),
  pricing: (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        {[0, 1, 2].map((i) => (
          <Column
            key={i}
            flex={1}
            gap="2"
            padding="2"
            radius="xs"
            border={i === 1 ? "brand-alpha-strong" : "neutral-alpha-medium"}
          >
            <Bar width="50%" strong />
            <Bar width="80%" />
            <Pill width="80%" />
          </Column>
        ))}
      </Row>
    </>
  ),
  "pricing.list": (
    <>
      <Bar width="40%" strong />
      <Column fillWidth flex={1} gap="4">
        {[0, 1].map((i) => (
          <Row key={i} fillWidth gap="4" vertical="center" horizontal="between">
            <Bar width="50%" />
            <Pill width="20%" />
          </Row>
        ))}
      </Column>
    </>
  ),
  faq: (
    <>
      <Heading />
      <Column fillWidth flex={1} gap="4">
        {[0, 1, 2].map((i) => (
          <Row key={i} fillWidth vertical="center" horizontal="between">
            <Bar width="70%" />
            <Bar width="5%" strong />
          </Row>
        ))}
      </Column>
    </>
  ),
  "faq.split": split(
    <Bar width="80%" strong />,
    <Column fill gap="4">
      <Bar width="90%" />
      <Bar width="90%" />
      <Bar width="90%" />
    </Column>,
  ),
  "faq.grid": (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        <Card />
        <Card />
      </Row>
    </>
  ),
  logos: (
    <Column fillWidth flex={1} gap="4" vertical="center">
      <Heading />
      <Row fillWidth gap="4" vertical="center">
        {[0, 1, 2, 3].map((i) => (
          <Row key={i} flex={1} height="4" radius="xs" background="neutral-alpha-medium" />
        ))}
      </Row>
    </Column>
  ),
  "logos.grid": (
    <>
      <Heading />
      <Column fillWidth flex={1} gap="4">
        {[0, 1].map((row) => (
          <Row key={row} fillWidth flex={1} gap="4">
            {[0, 1, 2].map((i) => (
              <Block key={i} />
            ))}
          </Row>
        ))}
      </Column>
    </>
  ),
  cta: (
    <Column
      fillWidth
      flex={1}
      gap="4"
      padding="4"
      horizontal="center"
      vertical="center"
      radius="xs"
      background="brand-alpha-weak"
    >
      <Bar width="60%" strong />
      <Pill />
    </Column>
  ),
  "cta.split": (
    <Row
      fillWidth
      flex={1}
      gap="4"
      padding="4"
      vertical="center"
      radius="xs"
      background="brand-alpha-weak"
    >
      <Column flex={1} gap="2">
        <Bar width="80%" strong />
        <Bar width="60%" />
      </Column>
      <Pill width="25%" />
    </Row>
  ),
  "cta.minimal": (
    <Column fillWidth flex={1} gap="4" horizontal="center" vertical="center">
      <Bar width="60%" strong />
      <Pill />
    </Column>
  ),
  contact: split(
    <>
      <Bar width="70%" strong />
      <Lines />
    </>,
    <Block />,
  ),
  "contact.cards": (
    <>
      <Heading />
      <Row fillWidth flex={1} gap="4">
        <Card />
        <Card />
        <Card />
      </Row>
    </>
  ),
  "contact.centered": (
    <Column fillWidth flex={1} gap="4" horizontal="center" vertical="center">
      <Bar width="50%" strong />
      <Bar width="40%" />
      <Bar width="40%" />
      <Pill />
    </Column>
  ),
  header: (
    <Column fillWidth flex={1} gap="4">
      <Row
        fillWidth
        gap="4"
        padding="2"
        vertical="center"
        horizontal="between"
        radius="xs"
        background="neutral-alpha-medium"
      >
        <Bar width="20%" strong />
        <Pill width="20%" />
      </Row>
      <Column flex={1} />
    </Column>
  ),
  footer: (
    <Column fillWidth flex={1} gap="4" vertical="end">
      <Column fillWidth gap="2" padding="2" radius="xs" background="neutral-alpha-medium">
        <Bar width="30%" strong />
        <Bar width="60%" />
      </Column>
    </Column>
  ),
};

/** The fallback for a type with no drawing: a heading over some lines. */
const FALLBACK = (
  <>
    <Bar width="50%" strong />
    <Lines />
  </>
);

/**
 * The drawing for a section type, or one of its layouts. A layout with no
 * drawing of its own uses its type's; the type's first layout is the type's
 * own drawing, so `hero` and `hero.split` look alike.
 */
export function SectionGlyph({ type, layout }: { type: string; layout?: string }) {
  const { glyphs, definitions } = useEditorContext();
  const first = definitions[type]?.layouts?.[0];
  const key = layout && layout !== first ? `${type}.${layout}` : type;
  const drawing =
    glyphs[key] ?? GLYPHS[key] ?? glyphs[type] ?? GLYPHS[`${type}.${first}`] ?? GLYPHS[type];
  return (
    <Column
      fillWidth
      aspectRatio="16 / 10"
      gap="4"
      padding="4"
      radius="s"
      background="surface"
      border="neutral-alpha-weak"
      overflow="hidden"
      aria-hidden="true"
    >
      {drawing ?? FALLBACK}
    </Column>
  );
}

/** Whether a drawing exists for this layout, so a layout choice can be tiles. */
export const hasGlyph = (glyphs: Record<string, ReactNode>, type: string, layout: string) =>
  `${type}.${layout}` in glyphs || `${type}.${layout}` in GLYPHS || type in GLYPHS;

import { Button, Column, Heading, Icon, type IconName, Row, Text } from "@once-ui-system/core";
import type { ComponentProps, ReactNode } from "react";
import { SECTION_WIDTHS, type SectionWidth } from "./layouts.js";
import { action, choice, text } from "./props.js";

// The pieces every page section is built from, so the rhythm (the
// eyebrow-headline-lead stack, the pair of buttons, the icon tile) is the
// same across sections and a page assembled from them reads as one design.

/** The props every section takes besides its own. */
export interface SectionBaseProps {
  /** One of the section's layouts (`heroLayouts`, `featuresLayouts`, …); unknown values use the first. */
  layout?: string;
  /** How wide the content runs: `"s"`, `"m"` or `"l"` (default). The band itself spans the page. */
  width?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  /**
   * Rewrites every link the section renders, for a site that lives under a
   * base path or a language prefix: `(href) => \`/de${href}\``.
   */
  resolveHref?: (href: string) => string;
}

/** The section's content width, read defensively from its `width` prop. */
export const sectionWidth = (value: unknown): SectionWidth => choice(value, SECTION_WIDTHS, "l");

/**
 * The outer band: full width, with a content column capped at the section's
 * width. It adds no outer padding: the page sets the gutter and the room
 * between sections.
 */
export function SectionShell({
  width,
  children,
  gap = "40",
  ...content
}: {
  width: SectionWidth;
  children: ReactNode;
  gap?: ComponentProps<typeof Column>["gap"];
} & Omit<ComponentProps<typeof Column>, "children" | "maxWidth" | "gap">) {
  return (
    <Column as="section" fillWidth horizontal="center">
      <Column fillWidth maxWidth={width} gap={gap} {...content}>
        {children}
      </Column>
    </Column>
  );
}

/**
 * Eyebrow, headline and lead. The hero's headline is the page's `h1` in
 * display size; every other section's is an `h2`.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
  hero = false,
  maxWidth = "40rem",
}: {
  eyebrow?: unknown;
  title?: unknown;
  description?: unknown;
  center?: boolean;
  hero?: boolean;
  maxWidth?: ComponentProps<typeof Column>["maxWidth"];
}) {
  const e = text(eyebrow);
  const t = text(title);
  const d = text(description);
  if (!e && !t && !d) return null;
  return (
    <Column
      gap={hero ? "20" : "12"}
      maxWidth={maxWidth}
      horizontal={center ? "center" : "start"}
      align={center ? "center" : "start"}
    >
      {e && (
        <Text textVariant="label-default-s" onBackground="brand-medium">
          {e}
        </Text>
      )}
      {t && (
        <Heading
          as={hero ? "h1" : "h2"}
          textVariant={hero ? "display-strong-l" : "display-strong-xs"}
        >
          {t}
        </Heading>
      )}
      {d && (
        <Text as="p" textVariant="body-default-l" onBackground="neutral-weak" wrap="pretty">
          {d}
        </Text>
      )}
    </Column>
  );
}

/** A primary and a secondary button; either is left out unless it has both a label and a link. */
export function SectionActions({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  resolveHref,
  center = false,
  size = "m",
}: {
  primaryLabel?: unknown;
  primaryHref?: unknown;
  secondaryLabel?: unknown;
  secondaryHref?: unknown;
  resolveHref?: (href: string) => string;
  center?: boolean;
  size?: "m" | "l";
}) {
  const primary = action(primaryLabel, primaryHref, resolveHref);
  const secondary = action(secondaryLabel, secondaryHref, resolveHref);
  if (!primary && !secondary) return null;
  return (
    <Row gap="12" wrap horizontal={center ? "center" : "start"}>
      {primary && (
        <Button href={primary.href} size={size} arrowIcon>
          {primary.label}
        </Button>
      )}
      {secondary && (
        <Button href={secondary.href} size={size} variant="secondary">
          {secondary.label}
        </Button>
      )}
    </Row>
  );
}

/**
 * An icon in a soft brand tile, the same in every section that has one. The
 * name comes from stored content, so it is any string; an unknown one draws
 * nothing, as Icon does.
 */
export function SectionIcon({ name }: { name: string }) {
  return (
    <Row
      center
      width="40"
      height="40"
      radius="m"
      background="brand-alpha-weak"
      border="brand-alpha-medium"
    >
      <Icon name={name as IconName} size="s" onBackground="brand-medium" />
    </Row>
  );
}

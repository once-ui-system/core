// The shape every editor built on the kit works on. A site is pages; a page is
// an ordered list of sections; a section is a type and its props. The header
// and the footer are on every page, so they are not sections: they live in the
// site's style as plain props a product draws however it likes.

import type { SectionField } from "@once-ui-system/blocks";
import type { StyleScopeConfig, StyleScopeFonts } from "@once-ui-system/core";

/** One section on a page. The id stays when the list is reordered. */
export interface Section {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

/** A page's content. */
export interface Page {
  sections: Section[];
}

/** A page in the site's index: what the page picker and the Pages panel list. */
export interface PageEntry {
  id: string;
  title: string;
  /** The path without the leading slash; `""` is the home page. */
  slug: string;
  /** The home page cannot be removed or renamed to another slug. */
  home?: boolean;
}

/** The site's look: Once UI style settings, fonts, and the header and footer. */
export interface SiteStyle {
  config: StyleScopeConfig;
  fonts?: StyleScopeFonts;
  /** The header's props, edited like a section's. */
  header?: Record<string, unknown>;
  /** The footer's props, edited like a section's. */
  footer?: Record<string, unknown>;
}

/** What can be selected: a section by id, the header, the footer, or nothing. */
export type Selection = string | null;

export const HEADER_ID = "@header";
export const FOOTER_ID = "@footer";

export const isChrome = (id: Selection): id is typeof HEADER_ID | typeof FOOTER_ID =>
  id === HEADER_ID || id === FOOTER_ID;

/**
 * A section type the editor offers. `@once-ui-system/blocks`' `sectionSchemas`
 * fit as they are; a product adds its own (a menu, a booking form, listings)
 * in the same shape.
 */
export interface SectionDefinition {
  type: string;
  label: string;
  /** One line on what the section is for, shown in the picker. */
  description: string;
  /** The `layout` values, first = default; drawn as tiles when glyphs exist. */
  layouts?: readonly string[];
  fields: readonly EditorField[];
  /** The props a new section starts with. */
  sample?: Record<string, unknown>;
  /** At most this many of the type on one page; unset = no limit. */
  maxPerPage?: number;
}

/**
 * A field in a section's panel. The kit draws the kinds of `SectionField`;
 * any other `kind` goes to a renderer the product registers.
 */
export type EditorField =
  | SectionField
  | (Omit<SectionField, "kind"> & {
      kind: string;
    });

/** The header's and footer's own fields, edited in the panel like a section's. */
export interface ChromeDefinition {
  label: string;
  description?: string;
  fields: readonly EditorField[];
}

let counter = 0;

/** A section id that is unique in this page and stable across reorders. */
export const newSectionId = (): string => {
  counter += 1;
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `s-${random}${counter.toString(36)}`;
};

/** A fresh section of a type: its sample copy and its default layout. */
export const createSection = (definition: SectionDefinition): Section => {
  const props: Record<string, unknown> = structuredClone(definition.sample ?? {});
  if (definition.layouts?.length && props.layout === undefined)
    props.layout = definition.layouts[0];
  return { id: newSectionId(), type: definition.type, props };
};

/** The section's own first words, so two tiles of one type are not the same tile. */
export const summarize = (section: Section): string => {
  const words = (props: Record<string, unknown>, keys: string[]) => {
    for (const key of keys) {
      const value = props[key];
      if (typeof value === "string" && value.trim()) return value.trim().split("\n")[0] ?? "";
    }
    return "";
  };
  const own = words(section.props, ["title", "eyebrow", "description", "body", "quote"]);
  if (own) return own;
  // A section with no heading of its own (stats, logos) is known by its rows.
  const items = section.props.items;
  if (!Array.isArray(items)) return "";
  return items
    .map((item) =>
      item && typeof item === "object"
        ? words(item as Record<string, unknown>, ["title", "name", "label", "question", "value"])
        : "",
    )
    .filter(Boolean)
    .join(" · ");
};

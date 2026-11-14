import type { ReactNode } from "react";

/**
 * One product of a family of products, as the family row of `FamilyFooter`
 * shows it: a mark, the name and a line of four to six words.
 */
export interface FamilyProduct {
  /** A stable key, also what `current` and the `ref` parameter name. */
  id: string;
  name: string;
  /** Four to six words on what it is for. */
  line: string;
  href: string;
  /**
   * The product's mark: an image path, or a node drawn at 32 × 32. Without one
   * the tile draws the name's first letter on `color`.
   */
  mark?: string | ReactNode;
  /** The product's own colour (any CSS colour) behind the letter mark. */
  color?: string;
  /** `false` keeps a product out of the row until it is public. Defaults to `true`. */
  live?: boolean;
}

/** Who stands behind the family: named in the co-brand bar and the row's title. */
export interface FamilyParent {
  name: string;
  href: string;
  /** The parent's mark, drawn at 20 × 20; without one, the first letter. */
  mark?: string | ReactNode;
  /**
   * The family's shared legal page (terms and privacy that apply to every
   * product), linked from the co-brand bar of every footer.
   */
  legalHref?: string;
}

/** The company behind the products this family footer ships with. */
export const familyParent: FamilyParent = {
  name: "Dopler",
  href: "https://dopler.app",
  legalHref: "https://dopler.app/legal",
};

/**
 * Every Dopler product, in the order the row shows them. A new product added
 * here reaches every app's footer on its next blocks bump. Apps give the
 * marks themselves (`products={familyProducts.map(…)}`), so this list carries
 * no artwork.
 */
export const familyProducts: FamilyProduct[] = [
  {
    id: "once-ui",
    name: "Once UI",
    line: "The design system agents follow",
    href: "https://once-ui.com",
  },
  {
    id: "stack",
    name: "Stack",
    line: "Your whole app, composed in one go",
    href: "https://once-ui.com/stack",
  },
  {
    id: "chirio",
    name: "Chirio",
    line: "Understand your users, agents do the chores",
    href: "https://chirio.dev",
  },
  {
    id: "aveiro",
    name: "Aveiro",
    line: "Your presence, run by agents",
    href: "https://www.aveiro.app",
  },
  {
    id: "frametic",
    name: "Frametic",
    line: "Product videos, directed by an agent",
    href: "https://frametic.app",
  },
  {
    id: "tavilio",
    name: "Tavilio",
    line: "Websites and bookings for venues",
    href: "https://tavilio.app",
  },
  {
    id: "sigilio",
    name: "Sigilio",
    line: "Clients, contracts and payments in one place",
    href: "https://sigilio.app",
    live: false,
  },
];

/**
 * The link a sibling tile points at: `href` with `ref=<from>-footer` added,
 * so the sibling's analytics can tell which product sent the visit. A link
 * that already has a `ref` keeps it; one that cannot be parsed is left alone.
 */
export function familyHref(href: string, from?: string): string {
  if (!from) return href;
  try {
    const url = new URL(href);
    if (!url.searchParams.has("ref")) url.searchParams.set("ref", `${from}-footer`);
    return url.toString();
  } catch {
    return href;
  }
}

/** The siblings to show: live ones, without the product the footer is on. */
export function familySiblings(products: FamilyProduct[], current?: string): FamilyProduct[] {
  return products.filter((product) => product.live !== false && product.id !== current);
}

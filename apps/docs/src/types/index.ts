/**
 * The shape of the blocks catalogue in `resources/blocks.js`.
 *
 * That file is plain JavaScript, so these are the types the surface reads it
 * through rather than types the data is checked against. Ported alongside the
 * blocks themselves; the landing site had them in a much larger `resources.ts`
 * covering products, pricing and plans, none of which the docs site has any
 * use for.
 */
export interface BlockExample {
  title: string;
  description: string;
  created?: string;
  updated?: string;
  creators?: string[];
}

export interface BlockImage {
  light: string;
  dark: string;
}

export interface BlockItem {
  tag?: string;
  label: string;
  href: string;
  keywords?: string;
  description?: string;
  image?: BlockImage;
  examples?: BlockExample[];
}

export interface BlockSection {
  title: string;
  icon: string;
  /** Sections are authored either as a list or as a keyed map. */
  items: BlockItem[] | Record<string, BlockItem>;
}

export type Blocks = Record<string, BlockSection>;

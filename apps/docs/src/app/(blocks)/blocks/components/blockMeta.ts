import { blocks } from "@/resources";
import type { BlockItem, BlockSection } from "@/types";

/** Sections are authored either as a list or as a keyed map. */
export const itemsOf = (section: BlockSection): BlockItem[] =>
  Array.isArray(section.items) ? section.items : Object.values(section.items);

/** The catalogue entry for a `/blocks/{category}` route. */
export function findCategoryMeta(category: string): BlockItem | undefined {
  const href = `/blocks/${category}`;
  for (const section of Object.values(blocks) as BlockSection[]) {
    const match = itemsOf(section).find((item) => item.href === href);
    if (match) return match;
  }
  return undefined;
}

/** The top-level group key (landingPage, application, sections, ...) a category belongs to. */
export function findCategoryGroup(category: string): string | undefined {
  const href = `/blocks/${category}`;
  for (const [groupKey, section] of Object.entries(blocks) as Array<[string, BlockSection]>) {
    if (itemsOf(section).some((item) => item.href === href)) return groupKey;
  }
  return undefined;
}

/** The display title of the group a category belongs to, e.g. "Sections". */
export function findCategoryGroupTitle(category: string): string | undefined {
  const group = findCategoryGroup(category);
  return group ? (blocks as Record<string, BlockSection>)[group]?.title : undefined;
}

/** `/blocks/hero` → `hero`; anything outside the blocks surface → undefined. */
export function categoryFromPathname(pathname: string | null): string | undefined {
  const match = pathname?.match(/\/blocks\/([^/?#]+)/);
  return match?.[1];
}

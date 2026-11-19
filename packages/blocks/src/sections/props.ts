// Section props arrive from MDX, JSON or a model, written by a person, an
// editor or an AI, so every read is defensive: a missing, misspelled or
// mistyped prop renders as nothing rather than throwing, and never as sample
// copy. A page only ever says what was written on it.

export type SectionRow = Record<string, unknown>;

/** A string prop, trimmed; anything else reads as empty. */
export const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** One of a fixed set of values; an unknown value reads as the fallback. */
export function choice<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/** A boolean prop that MDX may also spell as the string "true". */
export const flag = (value: unknown): boolean => value === true || value === "true";

/** The object rows of a list prop; anything that is not an object is dropped. */
export function rows(value: unknown): SectionRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is SectionRow => !!row && typeof row === "object" && !Array.isArray(row),
  );
}

/** Non-empty lines of a multi-line text prop (a plan's features, opening hours). */
export const lines = (value: unknown): string[] =>
  text(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** Paragraphs of a long text prop, split at blank lines. */
export const paragraphs = (value: unknown): string[] =>
  text(value)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** A link given as a label and an address; null unless both are there. */
export function action(
  label: unknown,
  href: unknown,
  resolveHref?: (href: string) => string,
): { label: string; href: string } | null {
  const l = text(label);
  const h = text(href);
  if (!l || !h) return null;
  return { label: l, href: resolveHref ? resolveHref(h) : h };
}

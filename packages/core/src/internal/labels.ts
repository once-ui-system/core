import { isValidElement } from "react";

/** A nested group of labels rather than a label: not a string, function or element. */
const isGroup = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) && !isValidElement(value);

/**
 * Labels over their defaults, at any depth, skipping any given as `undefined`.
 *
 * A host that translates half of a nested group (`{ groups: { page: { title } } }`)
 * keeps the English for the rest of it, and a wrapper that forwards
 * `{ dark: labels?.dark }` does not blank the default and leave a control
 * with no name. Only a key the defaults hold as a group is merged into; a
 * string, a function or a React element replaces what was there.
 */
export function mergeLabels<L extends object>(defaults: L, labels?: object): L {
  if (!labels) return defaults;
  const merged = { ...(defaults as Record<string, unknown>) };
  for (const [key, value] of Object.entries(labels)) {
    if (value === undefined) continue;
    const base = merged[key];
    merged[key] = isGroup(base) && isGroup(value) ? mergeLabels(base, value) : value;
  }
  return merged as L;
}

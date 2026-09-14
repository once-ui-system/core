import type { ReactNode } from "react";
import spec from "@once-ui-system/core/ai/spec.json";
import { PropsTableView, type PropData, type PropType } from "./PropsTableView";

/**
 * The props table for a component.
 *
 * Pass `component` and the names, types, defaults and required flags come
 * from `ai/spec.json`, which the package generates from the source on every
 * build. A hand-written table drifts the moment a prop is renamed — and it
 * drifts silently, because nothing fails. This one cannot: if a prop is gone
 * from the code it is gone from the table, and a component that is not in the
 * spec at all throws at build time rather than rendering an empty table.
 *
 * What the spec cannot supply is what a prop is *for*, so `describe` still
 * takes hand-written prose, keyed by prop name. Types stay correct on their
 * own; descriptions stay worth reading because a person wrote them.
 *
 * `content` still works unchanged, for the rows the spec does not model —
 * the shape of a nested object, say, or a sub-component documented on the
 * same page.
 */
interface PropsTableProps {
  /** Resolve rows from the generated spec. */
  component?: string;
  /**
   * Resolve rows from a shared mixin instead — `SpacingProps`, `StyleProps`,
   * `FlexProps`. Flex mixes in 83 props across six of these, so the layout
   * primitives document them a group at a time rather than as one wall, and
   * every other page keeps the short `...flex` row.
   */
  mixin?: string;
  /** Prose per prop, keyed by name. Only meaningful with `component`. */
  describe?: Record<string, ReactNode>;
  /** Show only these props, in this order. */
  only?: string[];
  /** Drop these props — for ones a page documents in its own section. */
  exclude?: string[];
  /** Extra hand-written rows, appended after the resolved ones. */
  content?: PropData[];
  /** Column heading for the first column. Defaults to "Prop". */
  label?: string;
}

/**
 * Which spread row stands in for each inherited type. Nearly every component
 * mixes in the same six style props and extends Flex; spelling all seven out
 * on every page would bury the props that are actually the component's own,
 * so they collapse to the one row the docs already use.
 */
const MIXIN_SPREAD: Record<string, string> = {
  CommonProps: "flex",
  DisplayProps: "flex",
  FlexProps: "flex",
  SizeProps: "flex",
  SpacingProps: "flex",
  StyleProps: "flex",
  GridProps: "grid",
  TextProps: "text",
  ChartProps: "chart",
};

const EXTENDS_SPREAD: Record<string, string> = {
  Flex: "flex",
  Grid: "grid",
  Text: "text",
  Card: "card",
  Scroller: "scroller",
  Input: "input",
  DropdownWrapper: "dropdownWrapper",
  User: "user",
};

/**
 * Alias names resolved to their members, from the same generated spec. A prop
 * typed `TShirtSizes` is correct but unhelpful; the reader wants the sizes.
 */
const ALIASES = (spec as { types?: Record<string, string[]> }).types ?? {};

/**
 * Past this many members an expansion stops helping and starts burying the
 * row — `IconName` alone has 76. Those print as the alias name, which is
 * short, searchable, and has a page of its own.
 */
const MAX_EXPANDED_MEMBERS = 12;

/**
 * Split a union on its top-level `|` only.
 *
 * `rest.split(" | ")` was close enough while the rule only fired on unions of
 * bare string literals, but it cuts straight through `Record<string, A | B>`
 * and `{ a: 1 } | { b: 2 }`. This tracks bracket depth and quotes instead.
 */
function splitUnion(type: string): string[] {
  const members: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;

  for (let i = 0; i < type.length; i++) {
    const ch = type[i];
    if (quote) {
      if (ch === quote && type[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("<{([".includes(ch)) depth++;
    else if (">})]".includes(ch)) depth--;
    else if (ch === "|" && depth === 0) {
      members.push(type.slice(start, i).trim());
      start = i + 1;
    }
  }
  members.push(type.slice(start).trim());
  return members.filter(Boolean);
}

/** `"a" | "b" = a` and `!Type` into the parts the table renders. */
function parseProp(raw: string): { type: PropType; defaultValue?: string; required: boolean } {
  let rest = raw;

  const required = rest.startsWith("!");
  if (required) rest = rest.slice(1);

  let defaultValue: string | undefined;
  const split = rest.lastIndexOf(" = ");
  if (split !== -1) {
    defaultValue = rest.slice(split + 3).trim();
    rest = rest.slice(0, split);
  }

  // Any union renders as separate values, which is how the hand-written tables
  // have always shown a choice. This used to require *every* member to be a
  // quoted literal, so a union that mixed one in with a real type —
  // `"none" | "percentage" | string[]`, `Colors | "surface" | boolean` — fell
  // through and printed as one unreadable blob. Quotes come off the literals;
  // everything else prints as written.
  const members = splitUnion(rest);
  if (members.length > 1) {
    return {
      type: members.map((m) => (/^(".*"|'.*')$/.test(m) ? m.slice(1, -1) : m)),
      defaultValue,
      required,
    };
  }

  // A bare alias expands to its members; anything else prints as written.
  const alias = ALIASES[rest];
  const expandable = alias && alias.length <= MAX_EXPANDED_MEMBERS;
  return { type: expandable ? [...alias] : rest, defaultValue, required };
}

const MIXINS = (spec as { mixins?: Record<string, Record<string, string>> }).mixins ?? {};

function resolveMixin(
  name: string,
  describe: Record<string, ReactNode>,
  only?: string[],
  exclude?: string[],
): PropData[] {
  const entry = MIXINS[name];
  if (!entry) {
    throw new Error(
      `PropsTable: "${name}" is not a mixin in ai/spec.json. Known mixins: ${Object.keys(MIXINS).join(", ")}.`,
    );
  }
  const skip = new Set(exclude ?? []);
  const names = (only ?? Object.keys(entry)).filter((p) => !skip.has(p));
  return names.map((prop) => {
    const raw = entry[prop];
    if (raw === undefined) {
      throw new Error(`PropsTable: mixin "${name}" has no prop "${prop}" in ai/spec.json.`);
    }
    const { type, defaultValue, required } = parseProp(raw);
    return [prop, type, defaultValue, describe[prop], required];
  });
}

type SpecComponent = {
  props?: Record<string, string>;
  mixins?: string[];
  extends?: string | string[];
};

function resolve(
  name: string,
  describe: Record<string, ReactNode>,
  only?: string[],
  exclude?: string[],
): PropData[] {
  const entry = (spec.components as Record<string, SpecComponent>)[name];
  if (!entry) {
    throw new Error(
      `PropsTable: "${name}" is not in ai/spec.json. Check the spelling, or pass \`content\` if it is not an exported component.`,
    );
  }

  const skip = new Set(exclude ?? []);
  const names = (only ?? Object.keys(entry.props ?? {})).filter((p) => !skip.has(p));

  const rows: PropData[] = names.map((prop) => {
    const raw = entry.props?.[prop];
    if (raw === undefined) {
      throw new Error(`PropsTable: "${name}" has no prop "${prop}" in ai/spec.json.`);
    }
    const { type, defaultValue, required } = parseProp(raw);
    return [prop, type, defaultValue, describe[prop], required];
  });

  // Inherited props, deduped, in the order they are declared.
  const inherited: string[] = [];
  const record = (token?: string) => {
    if (token && !inherited.includes(token)) inherited.push(token);
  };
  for (const mixin of entry.mixins ?? []) record(MIXIN_SPREAD[mixin]);
  const ext = entry.extends;
  for (const base of Array.isArray(ext) ? ext : ext ? [ext] : []) record(EXTENDS_SPREAD[base]);

  // `Flex` listing `...flex` among its own props says nothing.
  const self = EXTENDS_SPREAD[name];

  return [
    ...rows,
    ...inherited.filter((token) => token !== self).map((token) => [`...${token}`] as PropData),
  ];
}

function PropsTable({ component, mixin, describe, only, exclude, content, label }: PropsTableProps) {
  if (component && mixin) {
    throw new Error("PropsTable: pass either `component` or `mixin`, not both.");
  }
  const resolved = mixin
    ? resolveMixin(mixin, describe ?? {}, only, exclude)
    : component
      ? resolve(component, describe ?? {}, only, exclude)
      : [];

  // A hand-written row wins over the generated one with the same name, in the
  // generated row's position. That keeps a page's own wording for a prop the
  // spec describes poorly, and means a page listing `children` or `...input`
  // by hand cannot print it twice.
  const overrides = new Map((content ?? []).map((row) => [row[0], row]));
  const used = new Set<string>();
  const rows: PropData[] = resolved.map(([name, ...rest]) => {
    const override = overrides.get(name);
    if (!override) return [name, ...rest] as PropData;
    used.add(name);
    return override;
  });
  for (const row of content ?? []) if (!used.has(row[0])) rows.push(row);

  return <PropsTableView content={rows} label={label} />;
}

export { PropsTable };

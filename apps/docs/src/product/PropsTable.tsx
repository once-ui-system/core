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

  // A union of string literals renders as separate values, which is how the
  // hand-written tables have always shown an enum.
  const members = rest.split(" | ");
  const literals = members.length > 1 && members.every((m) => /^".*"$/.test(m));
  if (literals) return { type: members.map((m) => m.slice(1, -1)), defaultValue, required };

  // A bare alias expands to its members; anything else prints as written.
  const alias = ALIASES[rest];
  const expandable = alias && alias.length <= MAX_EXPANDED_MEMBERS;
  return { type: expandable ? [...alias] : rest, defaultValue, required };
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

  return [...rows, ...inherited.map((token) => [`...${token}`] as PropData)];
}

function PropsTable({ component, describe, only, exclude, content, label }: PropsTableProps) {
  const resolved = component ? resolve(component, describe ?? {}, only, exclude) : [];
  return <PropsTableView content={[...resolved, ...(content ?? [])]} label={label} />;
}

export { PropsTable };

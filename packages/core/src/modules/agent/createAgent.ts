import { flushSync } from "react-dom";
import {
  type AgentChoice,
  type AgentControl,
  type AgentControlSpec,
  accessibleName,
  agentControls,
} from "../../internal/agentRegistry.js";
import { withChangeSource } from "../../internal/changeDetails.js";
import { pageSections } from "../workspace/elementPicker.js";

/** One control or section as an agent reads it. */
export interface AgentEntry {
  /** `c3` for a control, `s2` for a page section. Steps can name it instead of the label. */
  ref: string;
  /** `input`, `select`, `switch`, `tabs`, `button`, `theme`, `section`… */
  component: string;
  /** Its accessible name: what a step names it by. */
  label: string | null;
  /** What it takes now. */
  actions: string[];
  disabled?: true;
  /** Marked `data-agent-confirm`: a step on it runs only after `allow` says yes. The mark's text, when it has one. */
  confirm?: string | true;
  /** Marked `data-agent-secret`: its values read as `[redacted]`. */
  secret?: true;
  /** A section's place on the page, 1-based, and how many there are. */
  index?: number;
  total?: number;
  /** The rest of its state: `value`, `checked`, `open`, `theme`… */
  [key: string]: unknown;
}

/** One action an agent asks for. */
export interface AgentStep {
  /** A `ref` from the snapshot, or the control's label. */
  ref: string;
  action: string;
  args?: unknown[];
}

/** What `allow` is asked about, before a step changes anything. */
export interface AgentStepRequest {
  ref: string;
  component: string;
  label: string | null;
  action: string;
  args: unknown[];
  /**
   * Set when the control or a parent is marked `data-agent-confirm`: ask a
   * person before saying yes. It holds the mark's text, such as "Deletes the
   * project", or `true` when the mark has none.
   */
  confirm?: string | true;
}

export interface AgentStepResult {
  ref: string;
  label: string | null;
  action: string;
  /** The state keys the step changed, from what to what. */
  changed: Record<string, { from: unknown; to: unknown }>;
}

export interface AgentActResult {
  ok: boolean;
  steps: AgentStepResult[];
  /** Which step failed and why. Earlier steps stay applied. */
  error?: { step: number; message: string };
}

export interface AgentQueryResult {
  ref: string;
  component: string;
  label: string | null;
  /** Up to 50 matching choices. */
  items: AgentChoice[];
  /** How many more matched beyond those. */
  more: number;
}

export interface CreateAgentOptions {
  /**
   * Decide each step before it runs: return `true` to let it run, `false`
   * to refuse it, or a promise for a person's answer. Without it every
   * listed action runs.
   */
  allow?: (step: AgentStepRequest) => boolean | Promise<boolean>;
  /** Where page sections are read from. Defaults to `document`. */
  document?: () => Document | null;
}

export interface Agent {
  /** Every control and page section, with its state and what it takes now. */
  snapshot: () => AgentEntry[];
  /** Run steps in order; stops at the first that fails. */
  act: (input: { steps: AgentStep[] }) => Promise<AgentActResult>;
  /** Find a list's choices (`within`), or the controls whose name or choices match `text`. */
  query: (input: {
    text?: string;
    within?: string;
    kind?: string;
    from?: number;
  }) => AgentQueryResult[] | { error: string };
}

const LIMIT = 100;
const PAGE = 50;

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Whether `name` holds `wanted` as whole words, ignoring case and accents. */
function namedBy(name: string | null, wanted: string): boolean {
  if (!name) return false;
  const have = ` ${fold(name)} `;
  return have.includes(` ${fold(wanted)} `);
}

function shown(el: HTMLElement | null): boolean {
  if (!el?.isConnected) return false;
  return !el.closest("[hidden], [aria-hidden='true'], [inert], [data-agent-hidden]");
}

/**
 * The `data-agent-*` mark on `el` or the nearest parent that has it:
 * `undefined` when there is none, the mark's text (maybe empty) when there is.
 */
function mark(el: HTMLElement | null | undefined, name: "confirm" | "secret"): string | undefined {
  const marked = el?.closest(`[data-agent-${name}]`);
  return marked ? (marked.getAttribute(`data-agent-${name}`) ?? "") : undefined;
}

const REDACTED = "[redacted]";

/** A secret control's state: whether it is on or open still reads, what it holds does not. */
function redact(state: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    out[key] = typeof value === "boolean" || value == null || value === "" ? value : REDACTED;
  }
  return out;
}

interface Live {
  ref: string;
  control?: AgentControl;
  spec?: AgentControlSpec;
  section?: HTMLElement;
  label: string | null;
  confirm?: string | true;
  secret: boolean;
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * The agent bridge: reads the Once UI controls on the page and calls their
 * actions through the same paths a person's input takes, so every
 * `onXChange` runs and hears `details.source === "agent"`, and can cancel.
 *
 * Create it once, on the client. It finds the controls already mounted and
 * every one mounted later. Hand `agentTools` to your model, and route each
 * call to the method of the same name.
 */
export function createAgent(options: CreateAgentOptions = {}): Agent {
  const getDocument =
    options.document ?? (() => (typeof document === "undefined" ? null : document));

  const live = (): Live[] => {
    const found: Live[] = [];
    for (const control of agentControls()) {
      const spec = control.spec();
      const el = spec.element();
      if (spec.kind === "theme" ? el?.closest("[data-agent-hidden]") : !shown(el)) continue;
      const confirm = mark(el, "confirm");
      found.push({
        ref: `c${control.id}`,
        control,
        spec,
        label: spec.label?.() ?? accessibleName(el),
        confirm: confirm === undefined ? undefined : confirm.trim() || true,
        secret: mark(el, "secret") !== undefined,
      });
    }
    const doc = getDocument();
    if (doc) {
      pageSections(doc).forEach((section, i) => {
        if (!shown(section)) return;
        const heading = section.querySelector("h1, h2, h3");
        const text = (heading?.textContent || section.getAttribute("aria-label") || "")
          .replace(/\s+/g, " ")
          .trim();
        found.push({ ref: `s${i + 1}`, section, label: text || null, secret: false });
      });
    }
    return found;
  };

  const stateOf = (item: Live) => {
    const state = (item.control as AgentControl).spec().state();
    return item.secret ? redact(state) : state;
  };

  const describe = (item: Live, all: Live[]): AgentEntry => {
    if (item.section) {
      const sections = all.filter((entry) => entry.section);
      return {
        ref: item.ref,
        component: "section",
        label: item.label,
        index: sections.indexOf(item) + 1,
        total: sections.length,
        actions: ["scrollIntoView"],
      };
    }
    const spec = item.spec as AgentControlSpec;
    const disabled = spec.disabled?.() ?? false;
    return {
      ref: item.ref,
      component: spec.kind,
      label: item.label,
      ...stateOf(item),
      actions: disabled ? [] : Object.keys(spec.actions),
      ...(disabled ? { disabled: true as const } : {}),
      ...(item.confirm ? { confirm: item.confirm } : {}),
      ...(item.secret ? { secret: true as const } : {}),
    };
  };

  const snapshot = (): AgentEntry[] => {
    const all = live();
    const entries = all.slice(0, LIMIT).map((item) => describe(item, all));
    if (all.length > LIMIT) {
      entries.push({
        ref: "more",
        component: "more",
        label: `${all.length - LIMIT} more; use query to find them`,
        actions: [],
      });
    }
    return entries;
  };

  const find = (ref: string, all: Live[]): Live | string => {
    const byRef = all.find((item) => item.ref === ref);
    if (byRef) return byRef;
    const exact = all.filter((item) => item.label && fold(item.label) === fold(ref));
    const matches = exact.length ? exact : all.filter((item) => namedBy(item.label, ref));
    if (matches.length === 1) return matches[0];
    if (!matches.length) return `Nothing on the page is named "${ref}".`;
    return `"${ref}" names ${matches.length} things: ${matches
      .map((item) => `${item.ref} (${item.label})`)
      .join(", ")}. Use a ref.`;
  };

  /** A list step may name a choice by its label; the control takes its value. */
  const resolveArgs = (spec: AgentControlSpec, action: string, args: unknown[]): unknown[] => {
    const choices = spec.choices?.();
    if (!choices?.length || !action.startsWith("set") || typeof args[0] !== "string") return args;
    const wanted = args[0];
    if (choices.some((choice) => choice.value === wanted)) return args;
    const named = choices.find((choice) => fold(choice.label) === fold(wanted));
    return named ? [named.value, ...args.slice(1)] : args;
  };

  const act = async ({ steps }: { steps: AgentStep[] }): Promise<AgentActResult> => {
    const results: AgentStepResult[] = [];
    for (const [index, step] of steps.entries()) {
      const fail = (message: string): AgentActResult => ({
        ok: false,
        steps: results,
        error: { step: index, message },
      });
      const all = live();
      const item = find(step.ref, all);
      if (typeof item === "string") return fail(item);
      const component = item.section ? "section" : (item.spec as AgentControlSpec).kind;
      const offered = describe(item, all).actions;
      if (!offered.includes(step.action)) {
        return fail(
          `${component} ${item.ref} takes no ${step.action} now. It takes: ${offered.join(", ") || "nothing"}.`,
        );
      }
      const args = item.spec
        ? resolveArgs(item.spec, step.action, step.args ?? [])
        : (step.args ?? []);
      if (item.confirm && !options.allow) {
        return fail(
          `${item.label ?? item.ref} needs a person's yes before ${step.action}, and this app has no way to ask. Ask the person to do it.`,
        );
      }
      if (options.allow) {
        const allowed = await options.allow({
          ref: item.ref,
          component,
          label: item.label,
          action: step.action,
          args,
          ...(item.confirm ? { confirm: item.confirm } : {}),
        });
        if (!allowed) return fail(`The app refused ${step.action} on ${item.label ?? item.ref}.`);
      }

      if (item.section) {
        item.section.scrollIntoView({ block: "start", behavior: "smooth" });
        results.push({ ref: item.ref, label: item.label, action: step.action, changed: {} });
        continue;
      }

      const spec = item.spec as AgentControlSpec;
      const before = spec.state();
      const shownValue = (value: unknown) => (item.secret ? redact({ value }).value : value);
      try {
        // Synchronous, so the state read below is the one the change left.
        let pending: unknown;
        flushSync(() => {
          pending = withChangeSource("agent", () => spec.actions[step.action](...args));
        });
        await pending;
      } catch (error) {
        return fail(error instanceof Error ? error.message : String(error));
      }
      await settle();
      const after = (item.control as AgentControl).spec().state();
      const changed: AgentStepResult["changed"] = {};
      for (const key of Object.keys(after)) {
        if (
          !Object.is(before[key], after[key]) &&
          JSON.stringify(before[key]) !== JSON.stringify(after[key])
        ) {
          changed[key] = { from: shownValue(before[key]), to: shownValue(after[key]) };
        }
      }
      results.push({ ref: item.ref, label: item.label, action: step.action, changed });
      // A set that changed nothing, though it asked for something new, was refused.
      const key = step.action.startsWith("set") ? lowerFirst(step.action.slice(3)) : null;
      if (key && key in after && !Object.keys(changed).length && !sameValue(before[key], args[0])) {
        const kept = item.secret ? "its value" : `${key} ${JSON.stringify(before[key])}`;
        return fail(`${item.label ?? item.ref} kept ${kept}: the app declined the change.`);
      }
    }
    return { ok: true, steps: results };
  };

  const query: Agent["query"] = ({ text, within, kind, from = 0 }) => {
    const all = live().filter((item) => !kind || (item.spec?.kind ?? "section") === kind);
    const pick = (item: Live): AgentQueryResult => {
      const choices = item.secret ? [] : (item.spec?.choices?.() ?? []);
      const matching = text
        ? choices.filter((c) => namedBy(c.label, text) || c.value === text)
        : choices;
      return {
        ref: item.ref,
        component: item.spec?.kind ?? "section",
        label: item.label,
        items: matching.slice(from, from + PAGE),
        more: Math.max(0, matching.length - from - PAGE),
      };
    };
    if (within) {
      const item = find(within, all);
      if (typeof item === "string") return { error: item };
      return [pick(item)];
    }
    if (!text) return all.map(pick);
    return all
      .filter(
        (item) =>
          namedBy(item.label, text) ||
          (!item.secret && (item.spec?.choices?.() ?? []).some((c) => namedBy(c.label, text))),
      )
      .map(pick);
  };

  return { snapshot, act, query };
}

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const sameValue = (a: unknown, b: unknown) =>
  Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b);

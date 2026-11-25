"use client";

import { createContext, type Ref, useCallback, useContext, useEffect, useRef } from "react";

/**
 * What a mounted control offers an agent: its kind, what it holds and what
 * it can be asked to do. Components register one with `useAgentControl`;
 * `createAgent` from `@once-ui-system/core/agent` reads them. Nothing here
 * runs an action: the bridge does, inside `withChangeSource("agent")`.
 */
export interface AgentChoice {
  value: string;
  label: string;
}

export interface AgentControlSpec {
  /** `input`, `select`, `switch`, `tabs`, `button`, `theme`… */
  kind: string;
  /** The element people see as the control: its name, visibility and marks come from here. */
  element: () => HTMLElement | null;
  /** A name when the element's accessible name is not the right one (the theme, a dialog). */
  label?: () => string | null | undefined;
  /** What the control holds now, such as `{ value: "Apollo" }` or `{ checked: true }`. */
  state: () => Record<string, unknown>;
  /** What an agent may ask for. Arguments arrive as the agent sent them. */
  actions: Record<string, (...args: unknown[]) => unknown>;
  /** The choices of a list (Select, Tabs, SegmentedControl, RadioGroup), so a step can name one. */
  choices?: () => AgentChoice[];
  /** Whether the control takes no action now. */
  disabled?: () => boolean;
}

export interface AgentControl {
  id: number;
  spec: () => AgentControlSpec;
}

type Listener = (control: AgentControl, change: "added" | "removed") => void;

const controls = new Map<number, AgentControl>();
const listeners = new Set<Listener>();
let nextId = 1;

/** Every control on the page, in registration order. */
export function agentControls(): AgentControl[] {
  return Array.from(controls.values());
}

/** Hear controls arrive and leave. */
export function onAgentControls(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function registerAgentControl(spec: () => AgentControlSpec): () => void {
  const control: AgentControl = { id: nextId++, spec };
  controls.set(control.id, control);
  for (const listener of listeners) listener(control, "added");
  return () => {
    controls.delete(control.id);
    for (const listener of listeners) listener(control, "removed");
  };
}

/**
 * Inside a control that speaks for its parts (a Select's field, a
 * Combobox's search), the parts stay out of the snapshot.
 */
export const AgentOwnedContext = createContext(false);

/**
 * Register this control for agents while it is mounted. The spec is read
 * fresh on every bridge call, so it can close over the latest props and
 * state without registering again.
 */
export function useAgentControl(spec: AgentControlSpec | null): void {
  const owned = useContext(AgentOwnedContext);
  const latest = useRef(spec);
  latest.current = spec;
  const active = spec !== null && !owned;
  useEffect(() => {
    if (!active) return;
    return registerAgentControl(() => latest.current as AgentControlSpec);
  }, [active]);
}

const clean = (text: string | null | undefined) => text?.replace(/\s+/g, " ").trim() || null;

/**
 * The name a screen reader would read for `el`, in the order the ARIA spec
 * gives: `aria-labelledby`, `aria-label`, a `<label>`, then its own text for
 * a button, tab or option. Enough for the controls core renders, not a full
 * implementation of accname.
 */
export function accessibleName(el: HTMLElement | null): string | null {
  if (!el) return null;
  const doc = el.ownerDocument;
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent ?? "")
      .join(" ");
    if (clean(text)) return clean(text);
  }
  const aria = clean(el.getAttribute("aria-label"));
  if (aria) return aria;
  if (el.id) {
    const label = doc.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label && clean(label.textContent)) return clean(label.textContent);
  }
  const wrapping = el.closest("label");
  if (wrapping && clean(wrapping.textContent)) return clean(wrapping.textContent);
  const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
  if (/^(button|tab|option|menuitem|link|a|radio)$/.test(role)) {
    return clean(el.textContent) ?? clean(el.getAttribute("title"));
  }
  return clean(el.getAttribute("title")) ?? clean(el.getAttribute("placeholder"));
}

/**
 * Put `value` into a native field the way typing does: through the
 * prototype's setter, so React sees a change, then an `input` event, so the
 * field's own `onChange` runs with it.
 */
export function typeInto(el: HTMLInputElement | HTMLTextAreaElement | null, value: string): void {
  if (!el) throw new Error("The field is not on the page.");
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/** A ref of the component's own beside the one it forwards. */
export function useOwnRef<T>(forwarded: Ref<T> | undefined) {
  const own = useRef<T | null>(null);
  const setRef = useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof forwarded === "function") forwarded(node);
      else if (forwarded) (forwarded as { current: T | null }).current = node;
    },
    [forwarded],
  );
  return [own, setRef] as const;
}

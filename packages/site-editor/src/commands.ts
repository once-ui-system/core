// Every change to a page is one of these commands. The panel, the shortcuts,
// an assistant and an MCP tool all go through `applyCommand`, so a change
// undoes, saves and previews the same way whoever made it.

import { newSectionId, type Page, type Section } from "./model.js";

export type PageCommand =
  /** Insert a section at `index` (the position it takes); the end when unset. */
  | { type: "add"; section: Section; index?: number }
  | { type: "remove"; id: string }
  /** Move a section to `to`, its index once moved. */
  | { type: "move"; id: string; to: number }
  /** Copy a section to just below it, with a new id. */
  | { type: "duplicate"; id: string; newId?: string }
  /** Set one prop. `undefined` removes it. */
  | { type: "setProp"; id: string; key: string; value: unknown }
  /** Merge several props at once (an assistant filling a section). */
  | { type: "setProps"; id: string; props: Record<string, unknown> }
  /** Replace the whole list (import, template, an agent's rewrite). */
  | { type: "replace"; sections: Section[] };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** The page after the command. Pure: the page given is never changed. */
export function applyCommand(page: Page, command: PageCommand): Page {
  const sections = page.sections;
  const at = (id: string) => sections.findIndex((section) => section.id === id);

  switch (command.type) {
    case "add": {
      const index = clamp(command.index ?? sections.length, 0, sections.length);
      const next = sections.slice();
      next.splice(index, 0, command.section);
      return { ...page, sections: next };
    }
    case "remove": {
      if (at(command.id) < 0) return page;
      return { ...page, sections: sections.filter((section) => section.id !== command.id) };
    }
    case "move": {
      const from = at(command.id);
      if (from < 0) return page;
      const to = clamp(command.to, 0, sections.length - 1);
      if (from === to) return page;
      const next = sections.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved as Section);
      return { ...page, sections: next };
    }
    case "duplicate": {
      const index = at(command.id);
      if (index < 0) return page;
      const source = sections[index] as Section;
      const copy: Section = {
        id: command.newId ?? newSectionId(),
        type: source.type,
        props: structuredClone(source.props),
      };
      const next = sections.slice();
      next.splice(index + 1, 0, copy);
      return { ...page, sections: next };
    }
    case "setProp": {
      const index = at(command.id);
      if (index < 0) return page;
      const source = sections[index] as Section;
      if (Object.is(source.props[command.key], command.value)) return page;
      const props = { ...source.props };
      if (command.value === undefined) delete props[command.key];
      else props[command.key] = command.value;
      const next = sections.slice();
      next[index] = { ...source, props };
      return { ...page, sections: next };
    }
    case "setProps": {
      const index = at(command.id);
      if (index < 0) return page;
      const source = sections[index] as Section;
      const next = sections.slice();
      next[index] = { ...source, props: { ...source.props, ...command.props } };
      return { ...page, sections: next };
    }
    case "replace":
      return { ...page, sections: command.sections };
  }
}

/**
 * Whether two commands in a row are one step of history: typing into one field
 * is one undo per pause, not one per letter.
 */
export const coalesces = (previous: PageCommand | undefined, next: PageCommand): boolean =>
  previous?.type === "setProp" &&
  next.type === "setProp" &&
  previous.id === next.id &&
  previous.key === next.key &&
  (typeof next.value === "string" || typeof next.value === "number");

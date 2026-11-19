"use client";

import { useEffect, useRef } from "react";

export interface ShortcutHandlers {
  undo?: () => void;
  redo?: () => void;
  duplicate?: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
  remove?: () => void;
  back?: () => void;
  help?: () => void;
}

/** Whether focus is somewhere typing goes, where ⌫ and ? are letters, not commands. */
const typing = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  const type = (target as HTMLInputElement).type;
  return !["checkbox", "radio", "button", "submit", "range", "color"].includes(type);
};

/**
 * The editor's keyboard shortcuts (see the README's table). Undo and redo work
 * everywhere except inside a text field, where the browser's own undo of the
 * text is what people expect.
 */
export function useEditorShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const h = latest.current;
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const inText = typing(event.target);
      const run = (handler?: () => void) => {
        if (!handler) return;
        event.preventDefault();
        handler();
      };

      if (mod && key === "z" && !inText) return run(event.shiftKey ? h.redo : h.undo);
      if (mod && key === "y" && !inText) return run(h.redo);
      if (mod && key === "d") return run(h.duplicate);
      if (mod && event.key === "ArrowUp" && !inText) return run(h.moveUp);
      if (mod && event.key === "ArrowDown" && !inText) return run(h.moveDown);
      if (mod || event.altKey) return;
      if ((event.key === "Backspace" || event.key === "Delete") && !inText) return run(h.remove);
      if (event.key === "Escape") {
        // An open dialog or menu closes first; it handles Escape itself.
        if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) return;
        return run(h.back);
      }
      if (event.key === "?" && !inText) return run(h.help);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}

/** The table the shortcut sheet shows, as label keys and key caps. */
export const SHORTCUTS = [
  { keys: ["⌘", "Z"], label: "shortcutUndo" },
  { keys: ["⌘", "⇧", "Z"], label: "shortcutRedo" },
  { keys: ["⌘", "D"], label: "shortcutDuplicate" },
  { keys: ["⌘", "↑ ↓"], label: "shortcutMove" },
  { keys: ["⌫"], label: "shortcutRemove" },
  { keys: ["Esc"], label: "shortcutBack" },
  { keys: ["?"], label: "shortcutHelp" },
] as const;

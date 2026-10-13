/**
 * The hotkey syntax `useHotkeys` listens for and `KeyTip` draws, so one string
 * can drive both: `"mod+k"`, `"shift+?"`, `"escape"`, and sequences of steps
 * separated by a space, `"g i"`.
 *
 * - Modifiers: `mod` (⌘ on Apple platforms, Ctrl elsewhere), `meta`/`cmd`,
 *   `ctrl`, `alt`/`option`, `shift`, joined to the key with `+`.
 * - Keys: a character (`k`, `1`, `?`, `/`), or a name: `escape`/`esc`,
 *   `enter`, `space`, `tab`, `backspace`, `delete`, `up`/`down`/`left`/`right`
 *   (or `arrowup`…), `home`, `end`, `pageup`, `pagedown`, `f1`–`f12`. The `+`
 *   key itself is `plus`.
 */

export interface HotkeyCombo {
  /** The key, lowercased as `KeyboardEvent.key` reports it (`" "` for space). */
  key: string;
  mod: boolean;
  meta: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

/** One hotkey: a single combo, or several pressed one after another. */
export type HotkeySequence = HotkeyCombo[];

const MODIFIERS: Record<string, "mod" | "meta" | "ctrl" | "alt" | "shift"> = {
  mod: "mod",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  super: "meta",
  win: "meta",
  ctrl: "ctrl",
  control: "ctrl",
  alt: "alt",
  option: "alt",
  opt: "alt",
  shift: "shift",
};

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  spacebar: " ",
  plus: "+",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  del: "delete",
  pgup: "pageup",
  pgdn: "pagedown",
};

const MODIFIER_KEYS = new Set(["meta", "control", "alt", "shift", "altgraph", "capslock", "os"]);

/** Split `mod+shift+k` into its modifier names and its key. `ctrl++` is Ctrl and the plus key. */
function splitCombo(source: string): { modifiers: string[]; key: string } {
  const text = source.trim().toLowerCase();
  if (text === "+") return { modifiers: [], key: "+" };
  if (text.endsWith("++")) {
    return { modifiers: text.slice(0, -2).split("+").filter(Boolean), key: "+" };
  }
  const parts = text.split("+");
  const key = parts.pop() ?? "";
  return { modifiers: parts.filter(Boolean), key: KEY_ALIASES[key] ?? key };
}

/** Parse one combo, such as `mod+shift+k`. */
export function parseCombo(source: string): HotkeyCombo {
  const { modifiers, key } = splitCombo(source);
  const combo: HotkeyCombo = {
    key,
    mod: false,
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
  };
  for (const name of modifiers) {
    const modifier = MODIFIERS[name];
    if (modifier) combo[modifier] = true;
  }
  return combo;
}

/** Parse a hotkey into its steps: `"g i"` is two, `"mod+k"` is one. */
export function parseHotkey(source: string): HotkeySequence {
  return source.trim().split(/\s+/).filter(Boolean).map(parseCombo);
}

/** True on macOS and iOS, where `mod` means ⌘. False on the server. */
export function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/** A modifier pressed on its own: never a hotkey, and never breaks a sequence. */
export function isModifierKey(key: string | undefined): boolean {
  return key !== undefined && MODIFIER_KEYS.has(key.toLowerCase());
}

const isLetter = (key: string) => /^[a-z]$/.test(key);
const isDigit = (key: string) => /^[0-9]$/.test(key);

/** Whether a keydown is this combo, with exactly its modifiers. */
export function matchesCombo(event: KeyboardEvent, combo: HotkeyCombo, apple: boolean): boolean {
  const wantMeta = combo.meta || (combo.mod && apple);
  const wantCtrl = combo.ctrl || (combo.mod && !apple);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== combo.alt) {
    return false;
  }

  // A character like "?" needs Shift on most layouts, so "?" matches with or
  // without it held; letters, digits and named keys match Shift exactly.
  const punctuation =
    combo.key.length === 1 && !isLetter(combo.key) && !isDigit(combo.key) && combo.key !== " ";
  if (punctuation ? combo.shift && !event.shiftKey : event.shiftKey !== combo.shift) {
    return false;
  }

  const key = (event.key ?? "").toLowerCase();
  if (key === combo.key) return true;

  // Option on macOS and non-Latin layouts change `key` (⌥K is "˚"), so letters
  // and digits fall back to the physical key, but only when `key` is not a
  // Latin letter or digit already: on AZERTY the A key reports code "KeyQ".
  if (/^[a-z0-9]$/.test(key)) return false;
  if (isLetter(combo.key)) return event.code === `Key${combo.key.toUpperCase()}`;
  if (isDigit(combo.key)) return event.code === `Digit${combo.key}`;
  return false;
}

const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

/**
 * Whether an event target is somewhere the user types: a text input, a
 * textarea, a select, an editable region, or an element with a text-entry
 * role. Keys pressed there are text, not shortcuts.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).closest !== "function") return false;
  const element = target as HTMLElement;
  const tag = element.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return !NON_TEXT_INPUTS.has((element as HTMLInputElement).type);
  if (element.isContentEditable) return true;
  if (element.closest('[contenteditable]:not([contenteditable="false"])')) return true;
  const role = element.getAttribute("role");
  return role === "textbox" || role === "searchbox" || role === "combobox";
}

interface KeyLabel {
  /** What the keycap shows. */
  cap: string;
  /** What a screen reader says. */
  spoken: string;
}

const MODIFIER_LABELS: Record<
  "mod" | "meta" | "ctrl" | "alt" | "shift",
  { apple: KeyLabel; other: KeyLabel }
> = {
  mod: { apple: { cap: "⌘", spoken: "Command" }, other: { cap: "Ctrl", spoken: "Control" } },
  meta: { apple: { cap: "⌘", spoken: "Command" }, other: { cap: "Meta", spoken: "Meta" } },
  ctrl: { apple: { cap: "⌃", spoken: "Control" }, other: { cap: "Ctrl", spoken: "Control" } },
  alt: { apple: { cap: "⌥", spoken: "Option" }, other: { cap: "Alt", spoken: "Alt" } },
  shift: { apple: { cap: "⇧", spoken: "Shift" }, other: { cap: "Shift", spoken: "Shift" } },
};

const NAMED_KEYS: Record<string, { apple?: KeyLabel; other: KeyLabel }> = {
  escape: { other: { cap: "Esc", spoken: "Escape" } },
  enter: { apple: { cap: "↵", spoken: "Return" }, other: { cap: "Enter", spoken: "Enter" } },
  " ": { other: { cap: "Space", spoken: "Space" } },
  tab: { other: { cap: "Tab", spoken: "Tab" } },
  backspace: {
    apple: { cap: "⌫", spoken: "Delete" },
    other: { cap: "Backspace", spoken: "Backspace" },
  },
  delete: {
    apple: { cap: "⌦", spoken: "Forward Delete" },
    other: { cap: "Del", spoken: "Delete" },
  },
  arrowup: { other: { cap: "↑", spoken: "Up Arrow" } },
  arrowdown: { other: { cap: "↓", spoken: "Down Arrow" } },
  arrowleft: { other: { cap: "←", spoken: "Left Arrow" } },
  arrowright: { other: { cap: "→", spoken: "Right Arrow" } },
  home: { other: { cap: "Home", spoken: "Home" } },
  end: { other: { cap: "End", spoken: "End" } },
  pageup: { other: { cap: "PgUp", spoken: "Page Up" } },
  pagedown: { other: { cap: "PgDn", spoken: "Page Down" } },
  "+": { other: { cap: "+", spoken: "Plus" } },
};

/** The keycaps for one combo, modifiers first in the order written. */
export function labelCombo(source: string, apple: boolean): KeyLabel[] {
  const { modifiers, key } = splitCombo(source);
  const labels: KeyLabel[] = [];
  for (const name of modifiers) {
    const modifier = MODIFIERS[name];
    if (modifier) labels.push(MODIFIER_LABELS[modifier][apple ? "apple" : "other"]);
  }
  const named = NAMED_KEYS[key];
  if (named) {
    labels.push((apple && named.apple) || named.other);
  } else if (/^f\d{1,2}$/.test(key)) {
    labels.push({ cap: key.toUpperCase(), spoken: key.toUpperCase() });
  } else if (key) {
    const cap = key.length === 1 ? key.toUpperCase() : key;
    labels.push({ cap, spoken: cap });
  }
  return labels;
}

/** The keycaps for each step of a hotkey. */
export function labelHotkey(source: string, apple: boolean): KeyLabel[][] {
  return source
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((step) => labelCombo(step, apple));
}

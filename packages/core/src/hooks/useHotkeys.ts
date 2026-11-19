"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";
import {
  isApplePlatform,
  isModifierKey,
  isTypingTarget,
  matchesCombo,
  parseHotkey,
} from "../internal/hotkeys.js";

// Layout effects warn during a server render; this one only keeps a ref current.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface UseHotkeysOptions {
  /** Listen at all. Turn it off while a dialog that owns the same keys is open. */
  enabled?: boolean;
  /**
   * Fire while focus is in a text input, textarea, select or editable region.
   * Off by default, so a shortcut on `c` or `space` does not fire while the
   * user types a word with a c in it. Turn it on for keys that never type,
   * such as `mod+s` or `escape`.
   */
  allowWhileTyping?: boolean;
  /**
   * Listen on this element instead of the window, so the keys only work while
   * focus is inside it: a timeline's arrow keys, say.
   */
  target?: RefObject<HTMLElement | null>;
  /** Cancel the browser's own action for a matched key, such as saving the page on `mod+s`. */
  preventDefault?: boolean;
  /** How long, in milliseconds, a sequence such as `g i` waits for its next key. */
  sequenceTimeout?: number;
}

/**
 * Call `callback` when a key combination is pressed.
 *
 * ```tsx
 * useHotkeys("mod+k", () => setPaletteOpen(true));
 * useHotkeys(["j", "down"], next);
 * useHotkeys("g i", () => router.push("/inbox"));
 * ```
 *
 * `mod` is ⌘ on Apple platforms and Ctrl elsewhere. Modifiers must match
 * exactly: `mod+z` does not fire on `mod+shift+z`. Characters that need Shift
 * on most layouts, such as `?`, match with or without it. An array registers
 * alternatives, and a space separates the steps of a sequence. See `KeyTip` to
 * show the same string as keycaps.
 *
 * Keys pressed while the user is typing are ignored unless `allowWhileTyping`
 * is set. The listener is bound once per set of keys and options; the latest
 * `callback` is always the one called, so it need not be memoised. Safe to
 * render on the server: nothing is bound until the component mounts.
 */
export function useHotkeys(
  keys: string | readonly string[],
  callback: (event: KeyboardEvent, hotkey: string) => void,
  {
    enabled = true,
    allowWhileTyping = false,
    target,
    preventDefault = true,
    sequenceTimeout = 1000,
  }: UseHotkeysOptions = {},
): void {
  const callbackRef = useRef(callback);
  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // An inline array is a new value every render; the joined string is not.
  const signature = (typeof keys === "string" ? [keys] : keys).join("\n");

  useEffect(() => {
    if (!enabled) return;
    const element: HTMLElement | Window | null = target ? target.current : window;
    if (!element) return;

    const hotkeys = signature
      .split("\n")
      .map((source) => source.trim())
      .filter(Boolean)
      .map((source) => ({ source, steps: parseHotkey(source) }))
      .filter(({ steps }) => steps.length > 0);
    const apple = isApplePlatform();
    // How far into each sequence the user is.
    const progress = new Map<string, number>();
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const onKeyDown = (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      // Mid-composition keys belong to the input method, not to the page.
      if (event.isComposing || event.keyCode === 229) return;
      if (isModifierKey(event.key)) return;
      const origin = event.composedPath?.()[0] ?? event.target;
      if (!allowWhileTyping && isTypingTarget(origin)) return;

      for (const { source, steps } of hotkeys) {
        const step = progress.get(source) ?? 0;
        if (matchesCombo(event, steps[step], apple)) {
          if (step + 1 < steps.length) {
            progress.set(source, step + 1);
            continue;
          }
          progress.clear();
          clearTimeout(resetTimer);
          if (preventDefault) event.preventDefault();
          callbackRef.current(event, source);
          return;
        }
        // A wrong key ends the sequence, and may start it again.
        progress.delete(source);
        if (step > 0 && steps.length > 1 && matchesCombo(event, steps[0], apple)) {
          progress.set(source, 1);
        }
      }

      clearTimeout(resetTimer);
      if (progress.size > 0) {
        resetTimer = setTimeout(() => progress.clear(), sequenceTimeout);
      }
    };

    element.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("keydown", onKeyDown);
      clearTimeout(resetTimer);
    };
  }, [signature, enabled, allowWhileTyping, target, preventDefault, sequenceTimeout]);
}

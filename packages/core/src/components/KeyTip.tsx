"use client";

import type React from "react";
import { forwardRef, type ReactNode, useSyncExternalStore } from "react";
import { isApplePlatform, labelHotkey } from "../internal/hotkeys";
import { Kbd } from "./Kbd";
import { Row } from "./Row";
import { Text } from "./Text";
import { VisuallyHidden } from "./VisuallyHidden";

const subscribe = () => () => {};

/**
 * The platform never changes while the page is open. The server snapshot is
 * "not Apple", so the server HTML and the first client render agree and React
 * swaps in ⌘ right after hydration instead of reporting a mismatch.
 */
const useApplePlatform = () => useSyncExternalStore(subscribe, isApplePlatform, () => false);

interface KeyTipProps extends Omit<React.ComponentProps<typeof Row>, "children"> {
  /**
   * The shortcut, in the syntax `useHotkeys` takes: `"mod+k"`, `"shift+?"`,
   * `"g i"` for a sequence. An array lists alternatives. Pass the same constant
   * to both, and the hint cannot drift from the binding.
   */
  keys: string | readonly string[];
  /** The action, shown before the keys: "Undo", "Search". */
  label?: ReactNode;
}

/**
 * A keyboard shortcut drawn as keycaps, with the action it performs. `mod`
 * shows as ⌘ on Apple platforms and Ctrl elsewhere; other modifiers and named
 * keys get their platform's symbols (⇧, ⌥, ↵ on a Mac).
 *
 * The keycaps are hidden from screen readers, which hear the spelled-out
 * combination instead ("Command+Shift+Z"), because a symbol such as ⌘ is read
 * inconsistently or not at all. Fits a sentence, a menu row, or a Tooltip.
 */
const KeyTip = forwardRef<HTMLDivElement, KeyTipProps>(({ keys, label, ...flex }, ref) => {
  const apple = useApplePlatform();
  const alternatives = (typeof keys === "string" ? [keys] : [...keys])
    .map((source) => source.trim())
    .filter(Boolean)
    .map((source) => ({
      source,
      steps: labelHotkey(source, apple).map((caps, step) => ({
        step,
        caps: caps.map((cap, position) => ({ ...cap, position })),
      })),
    }));

  const spoken = alternatives
    .map(({ steps }) =>
      steps.map(({ caps }) => caps.map((cap) => cap.spoken).join("+")).join(" then "),
    )
    .join(" or ");

  const word = (text: string) => (
    <Text as="span" textVariant="label-default-s" onBackground="neutral-weak">
      {text}
    </Text>
  );

  return (
    <Row ref={ref} as="span" inline gap="8" vertical="center" data-keytip="" {...flex}>
      {label}
      <Row as="span" gap="4" vertical="center" aria-hidden="true">
        {alternatives.map(({ source, steps }, alternative) => (
          <Row as="span" key={source} gap="4" vertical="center">
            {alternative > 0 && word("or")}
            {steps.map(({ step, caps }) => (
              <Row as="span" key={step} gap="4" vertical="center">
                {step > 0 && word("then")}
                <Row as="span" gap="2">
                  {caps.map((cap) => (
                    <Kbd key={cap.position}>{cap.cap}</Kbd>
                  ))}
                </Row>
              </Row>
            ))}
          </Row>
        ))}
      </Row>
      {/* Keeps "Undo" and "Command+Z" two words in the accessible name; a flex
          container does not draw a whitespace-only text node. */}
      {label !== undefined && " "}
      <VisuallyHidden>{spoken}</VisuallyHidden>
    </Row>
  );
});

KeyTip.displayName = "KeyTip";

export type { KeyTipProps };
export { KeyTip };

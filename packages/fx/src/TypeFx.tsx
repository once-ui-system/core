"use client";

import { Text } from "@once-ui-system/core";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { type FadeState, fadingLetters } from "./internal/FadingLetters.js";

export interface TypeFxProps extends Omit<React.ComponentProps<typeof Text>, "children" | "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
  words: string | string[];
  /**
   * `"type"` (the default) types each word out and erases it. `"fade"` (2.x's
   * FadingLettersFx) fades the letters of `words` in one after another, as
   * `state` says, and holds them.
   */
  mode?: "type" | "fade";
  /**
   * Fade mode: `"entering"` (the default) fades the letters in, `"visible"`
   * shows them still, `"exiting"` fades them out. Was FadingLettersFx's
   * `animationState`.
   */
  state?: FadeState;
  /**
   * Milliseconds each character takes to type (higher is slower); erasing
   * runs at half of it. Was `speed` until 3.0. In fade mode, the gap between
   * two letters' entries, default 40.
   */
  charDuration?: number;
  /**
   * Milliseconds before typing starts; in fade mode, before the first letter
   * enters (FadingLettersFx's `messageIdx` was `delay={messageIdx * 2500}`).
   */
  delay?: number;
  /** Milliseconds a finished word stays before it is erased. */
  hold?: number;
  trigger?: "instant" | "custom";
  onTrigger?: (triggerFn: () => void) => void;
  loop?: boolean;
  children?: React.ReactNode;
}

const TypeFx = ({ ref, ...props }: TypeFxProps) =>
  props.mode === "fade" ? <FadeFx {...props} ref={ref} /> : <TypingFx {...props} ref={ref} />;

const FadeFx = ({
  ref,
  words,
  mode: _mode,
  state = "entering",
  charDuration = 40,
  delay = 0,
  hold: _hold,
  trigger: _trigger,
  onTrigger: _onTrigger,
  loop: _loop,
  children,
  ...text
}: TypeFxProps) => (
  <Text {...text} ref={ref} style={{ display: "contents", ...text.style }}>
    {children}
    {fadingLetters(Array.isArray(words) ? words.join(" ") : words, state, delay, charDuration)}
  </Text>
);

FadeFx.displayName = "FadeFx";

const TypingFx = ({
  ref,
  words,
  mode: _mode,
  state: _state,
  charDuration = 100,
  delay = 0,
  hold = 2000,
  trigger = "instant",
  onTrigger,
  loop = true,
  children,
  ...text
}: TypeFxProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [triggered, setTriggered] = useState(trigger === "instant");
  const timeoutRef = useRef<number | null>(null);

  const wordsHash = JSON.stringify(Array.isArray(words) ? words : [words]);

  useEffect(() => {
    if (trigger === "instant") setTriggered(true);
  }, [trigger]);

  useEffect(() => {
    if (trigger === "custom" && onTrigger) {
      onTrigger(() => setTriggered(true));
    }
  }, [trigger, onTrigger]);

  useEffect(() => {
    if (!triggered) return;

    let active = true;
    let pendingResolve: (() => void) | null = null;

    setDisplayText("");
    setIsComplete(false);

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        pendingResolve = resolve;
        timeoutRef.current = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      const wordsArray: string[] = JSON.parse(wordsHash);
      const isSingleWord = wordsArray.length === 1;

      if (delay > 0) {
        await sleep(delay);
        if (!active) return;
      }

      let currentIndex = 0;

      while (active) {
        const currentWord = wordsArray[currentIndex];

        for (let i = 0; i <= currentWord.length; i++) {
          if (!active) return;
          setDisplayText(currentWord.substring(0, i));
          await sleep(charDuration);
        }

        if (isSingleWord) {
          if (active) setIsComplete(true);
          return;
        }

        if (!active) return;
        await sleep(hold);

        for (let i = currentWord.length; i >= 0; i--) {
          if (!active) return;
          setDisplayText(currentWord.substring(0, i));
          await sleep(charDuration / 2);
        }

        currentIndex = (currentIndex + 1) % wordsArray.length;

        if (!loop && currentIndex === 0) return;

        if (!active) return;
        await sleep(charDuration);
      }
    };

    run();

    return () => {
      active = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      if (pendingResolve) pendingResolve();
    };
  }, [triggered, wordsHash, charDuration, delay, hold, loop]);

  return (
    <Text {...text} ref={ref}>
      {children}
      {displayText}
      {!isComplete && <span style={{ opacity: 0.5 }}>|</span>}
    </Text>
  );
};

TypingFx.displayName = "TypingFx";
TypeFx.displayName = "TypeFx";

export { TypeFx };
